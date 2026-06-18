import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

const PRODUCT_WIDTH = 800;
const PRODUCT_HEIGHT = 600;
const LOGO_SIZE = 200;
const QUALITY = 85;

const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Strip data: URI prefix and return raw base64 payload */
function extractBase64(input: string): string {
  if (input.includes(',')) return input.split(',')[1];
  return input;
}

/** Returns true if the value is already a stored path or URL (not raw base64) */
export function isStoredPath(value: string): boolean {
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  );
}

/** Save processed buffer to local public/uploads folder, return public path */
async function saveLocal(buffer: Buffer, subdir: string): Promise<string> {
  const dir = path.join(process.cwd(), 'public', 'uploads', subdir);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${crypto.randomUUID()}.jpg`;
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/uploads/${subdir}/${filename}`;
}

/** Save processed buffer to Vercel Blob, return public URL */
async function saveBlob(buffer: Buffer, blobPath: string): Promise<string> {
  const { put } = await import('@vercel/blob');
  const { url } = await put(blobPath, buffer, {
    access: 'public',
    contentType: 'image/jpeg',
  });
  return url;
}

/**
 * Save a product image (4:3, 800×600 JPEG).
 * Uses Vercel Blob in production (BLOB_READ_WRITE_TOKEN set),
 * local filesystem in development.
 */
export async function saveProductImage(input: string): Promise<string> {
  if (isStoredPath(input)) return input;

  const buffer = Buffer.from(extractBase64(input), 'base64');
  const processed = await sharp(buffer)
    .resize(PRODUCT_WIDTH, PRODUCT_HEIGHT, { fit: 'cover', position: 'center' })
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
    .toBuffer();

  if (USE_BLOB) {
    return saveBlob(processed, `businesses/${crypto.randomUUID()}.jpg`);
  }
  return saveLocal(processed, 'businesses');
}

/**
 * Save a logo image (square, 200×200 JPEG).
 */
export async function saveLogoImage(input: string): Promise<string> {
  if (isStoredPath(input)) return input;

  const buffer = Buffer.from(extractBase64(input), 'base64');
  const processed = await sharp(buffer)
    .resize(LOGO_SIZE, LOGO_SIZE, { fit: 'cover', position: 'center' })
    .jpeg({ quality: QUALITY, progressive: true })
    .toBuffer();

  if (USE_BLOB) {
    return saveBlob(processed, `businesses/logos/${crypto.randomUUID()}.jpg`);
  }
  return saveLocal(processed, 'businesses/logos');
}

/**
 * Save multiple product images in parallel.
 */
export async function saveProductImages(inputs: string[]): Promise<string[]> {
  return Promise.all(inputs.map(saveProductImage));
}

/**
 * Delete a stored image. Safe — silently ignores errors.
 */
export async function deleteStoredImage(storedValue: string): Promise<void> {
  if (!isStoredPath(storedValue)) return;
  try {
    if (storedValue.startsWith('http://') || storedValue.startsWith('https://')) {
      const { del } = await import('@vercel/blob');
      await del(storedValue);
    } else {
      const localPath = path.join(process.cwd(), 'public', storedValue);
      await fs.unlink(localPath);
    }
  } catch {
    console.warn(`Failed to delete image: ${storedValue}`);
  }
}
