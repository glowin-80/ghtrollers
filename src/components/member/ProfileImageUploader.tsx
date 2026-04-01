"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProfileImageCropModal from "@/components/member/ProfileImageCropModal";

type ProfileImageUploaderProps = {
  memberEmail?: string | null;
  currentImageUrl?: string | null;
  onUploaded: (imageUrl: string) => void;
};

export default function ProfileImageUploader({
  memberEmail,
  currentImageUrl,
  onUploaded,
}: ProfileImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);

  async function compressImage(file: File): Promise<File> {
    const imageBitmap = await createImageBitmap(file);

    const maxWidth = 800;
    const maxHeight = 800;
    const { width, height } = imageBitmap;

    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Kunde inte skapa canvas-kontext.");
    }

    ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.86);
    });

    if (!blob) {
      throw new Error("Kunde inte komprimera bilden.");
    }

    return new File([blob], "profile.jpg", {
      type: "image/jpeg",
    });
  }

  function handlePickFile(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      setRawImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async function uploadProfileImage(file: File) {
    if (!memberEmail) {
      alert("Kunde inte koppla bilden till medlemmen.");
      return;
    }

    try {
      setUploading(true);

      const compressedFile = await compressImage(file);

      const safeEmail = memberEmail.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const filePath = `profiles/${safeEmail}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, compressedFile, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      const imageUrl = `${data.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("members")
        .update({
          profile_image_url: imageUrl,
        })
        .eq("email", memberEmail);

      if (updateError) {
        throw updateError;
      }

      onUploaded(imageUrl);
      window.dispatchEvent(
        new CustomEvent("profile-image-updated", {
          detail: { imageUrl },
        })
      );

      alert("Profilbild uppdaterad.");
    } catch (error) {
      console.error(error);
      alert("Kunde inte ladda upp profilbilden.");
    } finally {
      setUploading(false);
      setRawImage(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-full border border-[#d8d2c7] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading
            ? "Laddar upp..."
            : currentImageUrl
              ? "Byt profilbild"
              : "Ladda upp profilbild"}
        </button>

        {currentImageUrl ? (
          <a
            href={currentImageUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-[#5c4d3f] underline underline-offset-2"
          >
            Visa nuvarande bild
          </a>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handlePickFile(file);
            }
          }}
          className="hidden"
        />
      </div>

      {rawImage ? (
        <ProfileImageCropModal
          image={rawImage}
          onCancel={() => {
            setRawImage(null);

            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }}
          onSave={uploadProfileImage}
        />
      ) : null}
    </>
  );
}