import { put, del } from '@vercel/blob';
import sharp from 'sharp';

const PRODUCT_WIDTH = 800;
const PRODUCT_HEIGHT = 600;
const LOGO_SIZE = 200;
const QUALITY = 85;

/** Strip data: URI prefix and return raw base64 payload */
function extractBase64(input: string): string {
  if (input.includes(',')) return input.split(',')[1];
  return input;
}

/** Returns true if the value is already a stored Blob/HTTP URL (not base64) */
export function isStoredPath(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://');
}

/**
 * Save a product image to Vercel Blob (4:3, 800×600 JPEG).
 * Accepts base64 (with or without data: prefix) or an existing URL (returned unchanged).
 * Returns the public Blob URL.
 */
export async function saveProductImage(input: string): Promise<string> {
  if (isStoredPath(input)) return input;

  const base64 = extractBase64(input);
  const buffer = Buffer.from(base64, 'base64');

  const processed = await sharp(buffer)
    .resize(PRODUCT_WIDTH, PRODUCT_HEIGHT, { fit: 'cover', position: 'center' })
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
    .toBuffer();

  const filename = `businesses/${crypto.randomUUID()}.jpg`;
  const { url } = await put(filename, processed, {
    access: 'public',
    contentType: 'image/jpeg',
  });

  return url;
}

/**
 * Save a logo image to Vercel Blob (square, 200×200 JPEG).
 * Returns the public Blob URL.
 */
export async function saveLogoImage(input: string): Promise<string> {
  if (isStoredPath(input)) return input;

  const base64 = extractBase64(input);
  const buffer = Buffer.from(base64, 'base64');

  const processed = await sharp(buffer)
    .resize(LOGO_SIZE, LOGO_SIZE, { fit: 'cover', position: 'center' })
    .jpeg({ quality: QUALITY, progressive: true })
    .toBuffer();

  const filename = `businesses/logos/${crypto.randomUUID()}.jpg`;
  const { url } = await put(filename, processed, {
    access: 'public',
    contentType: 'image/jpeg',
  });

  return url;
}

/**
 * Save multiple product images to Vercel Blob in parallel.
 * Returns array of public Blob URLs.
 */
export async function saveProductImages(inputs: string[]): Promise<string[]> {
  return Promise.all(inputs.map(saveProductImage));
}

/**
 * Delete a stored Blob image by its URL.
 * Safe — silently ignores errors.
 */
export async function deleteStoredImage(blobUrl: string): Promise<void> {
  if (!isStoredPath(blobUrl)) return;
  try {
    await del(blobUrl);
  } catch {
    console.warn(`Failed to delete blob: ${blobUrl}`);
  }
}
