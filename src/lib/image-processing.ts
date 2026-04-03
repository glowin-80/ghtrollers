export type CompressImageOptions = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  outputType?: string;
  outputName?: string;
};

function getFileNameWithoutExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "");
}

export async function compressImageFile(
  file: File,
  options: CompressImageOptions
): Promise<File> {
  const imageBitmap = await createImageBitmap(file);

  try {
    const outputType = options.outputType ?? "image/jpeg";
    const maxWidth = Math.max(1, options.maxWidth);
    const maxHeight = Math.max(1, options.maxHeight);
    const scale = Math.min(maxWidth / imageBitmap.width, maxHeight / imageBitmap.height, 1);
    const targetWidth = Math.max(1, Math.round(imageBitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(imageBitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Kunde inte skapa canvas-kontext.");
    }

    ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputType, options.quality);
    });

    canvas.width = 0;
    canvas.height = 0;

    if (!blob) {
      throw new Error("Kunde inte komprimera bilden.");
    }

    const fallbackBaseName = getFileNameWithoutExtension(file.name) || "image";
    const outputName = options.outputName ?? `${fallbackBaseName}.jpg`;

    return new File([blob], outputName, {
      type: outputType,
    });
  } finally {
    imageBitmap.close();
  }
}
