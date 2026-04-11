"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";

type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type SfvofProfileImageCropModalProps = {
  image: string;
  onCancel: () => void;
  onSave: (file: File) => Promise<void> | void;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImageFile(imageSrc: string, crop: Area): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 500;

  canvas.width = size;
  canvas.height = size;

  if (!ctx) {
    throw new Error("Kunde inte skapa canvas-kontext.");
  }

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.9);
  });

  if (!blob) {
    throw new Error("Kunde inte skapa beskuren bild.");
  }

  return new File([blob], "sfvof-profile.jpg", { type: "image/jpeg" });
}

export default function SfvofProfileImageCropModal({
  image,
  onCancel,
  onSave,
}: SfvofProfileImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCropComplete = useCallback((_: Area, croppedAreaPixelsValue: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  async function handleSave() {
    if (!croppedAreaPixels) {
      return;
    }

    try {
      setSaving(true);
      const croppedFile = await getCroppedImageFile(image, croppedAreaPixels);
      await onSave(croppedFile);
    } catch (error) {
      console.error(error);
      alert("Kunde inte beskära bilden.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-[28px] border border-[#d8d2c7] bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-[#1f2937]">Justera profilbild</h3>
          <p className="mt-1 text-sm text-[#6b7280]">
            Flytta och zooma bilden tills den ser bra ut i den runda previewn.
          </p>
        </div>

        <div className="relative h-[340px] w-full overflow-hidden rounded-[24px] bg-[#1f2937]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            objectFit="cover"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-[#4b5563]">
            <span>Zoom</span>
            <span>{zoom.toFixed(1)}x</span>
          </div>

          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-[#324b2f]"
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-full border border-[#d8d2c7] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3] disabled:opacity-60"
          >
            Avbryt
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-[#324b2f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:opacity-60"
          >
            {saving ? "Sparar..." : "Spara profilbild"}
          </button>
        </div>
      </div>
    </div>
  );
}
