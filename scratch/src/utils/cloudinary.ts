// ============================================================
//  Cloudinary Upload Utility — No SDK needed, pure fetch API
//  Setup: https://cloudinary.com → Free account → Dashboard
// ============================================================

// 🔧 REPLACE THESE WITH YOUR CLOUDINARY CREDENTIALS:
export const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';       // e.g. 'dxyz123abc'
export const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET'; // e.g. 'line_free_unsigned'

// ─── Compress image before upload (reduces size by ~70%) ───
async function compressImage(file: File, maxWidthPx = 800): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidthPx / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ─── Main Upload Function ───
export async function uploadToCloudinary(
  file: File,
  folder: string = 'line-free'
): Promise<string> {
  if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
    throw new Error('Cloudinary not configured. Please update CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in src/utils/cloudinary.ts');
  }

  // Compress image first
  const compressed = await compressImage(file);

  const formData = new FormData();
  formData.append('file', compressed);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Upload failed: ${res.status}`);
  }

  const data = await res.json();
  // Return optimized URL with auto quality + format
  return data.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
}
