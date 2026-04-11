"use client";

import { useRef, useState } from "react";
import SfvofProfileImageCropModal from "@sfvof/components/SfvofProfileImageCropModal";

type SfvofProfileImageUploaderProps = {
  currentImageUrl?: string | null;
  onUploaded: (file: File) => Promise<void> | void;
  uploading: boolean;
};

export default function SfvofProfileImageUploader({
  currentImageUrl,
  onUploaded,
  uploading,
}: SfvofProfileImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);

  function handlePickFile(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      setRawImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#d8d2c7] bg-white px-5 py-3 text-lg text-[#374151] transition hover:bg-[#f9f7f3] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Laddar upp..." : currentImageUrl ? "Byt profilbild" : "Ladda upp profilbild"}
        </button>

        {currentImageUrl ? (
          <a
            href={currentImageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-2 py-3 text-lg font-medium text-[#5b4b3a] underline underline-offset-4"
          >
            Visa nuvarande bild
          </a>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              handlePickFile(file);
            }
            event.currentTarget.value = "";
          }}
        />
      </div>

      {rawImage ? (
        <SfvofProfileImageCropModal
          image={rawImage}
          onCancel={() => {
            setRawImage(null);
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }}
          onSave={async (file) => {
            await onUploaded(file);
            setRawImage(null);
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }}
        />
      ) : null}
    </>
  );
}
