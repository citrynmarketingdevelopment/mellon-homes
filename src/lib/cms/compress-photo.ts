"use client";

import { MAX_PHOTO_EDGE, MAX_SOURCE_PHOTO_BYTES, MAX_UPLOAD_PHOTO_BYTES } from "./limits";

export function validateSourcePhoto(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error(`${file.name}: choose a JPG, PNG, or WebP photo.`);
  if (file.size > MAX_SOURCE_PHOTO_BYTES) throw new Error(`${file.name}: choose a photo up to 20 MB.`);
  if (!file.size) throw new Error(`${file.name}: this photo is empty.`);
}

// The original stays in browser memory. Only this newly encoded file is uploaded.
export async function compressPhoto(file: File): Promise<File> {
  validateSourcePhoto(file);
  const url = URL.createObjectURL(file);
  const image = document.createElement("img");
  const canvas = document.createElement("canvas");
  try {
    image.src = url;
    try { await image.decode(); }
    catch { throw new Error(`${file.name}: this image could not be read. Try another photo.`); }
    const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
    if (!longestEdge) throw new Error(`${file.name}: this image has no usable dimensions.`);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the photo. Please try another browser.");
    let edge = Math.min(MAX_PHOTO_EDGE, longestEdge);
    while (true) {
      const scale = edge / longestEdge;
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [.85, .75, .65]) {
        const encode = (type: string) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality));
        let blob = await encode("image/webp");
        // Older browsers may return PNG when WebP encoding is unavailable.
        if (blob?.type !== "image/webp") blob = await encode("image/jpeg");
        if (blob && ['image/webp', 'image/jpeg'].includes(blob.type) && blob.size <= MAX_UPLOAD_PHOTO_BYTES) {
          return new File([blob], `listing-photo.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`, { type: blob.type });
        }
      }
      if (edge <= 960) throw new Error(`${file.name}: this photo could not be compressed. Try another image.`);
      edge = Math.max(960, Math.floor(edge * .8));
    }
  } finally {
    URL.revokeObjectURL(url);
    image.removeAttribute("src");
    canvas.width = canvas.height = 0;
  }
}
