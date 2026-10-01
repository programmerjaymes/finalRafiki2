import path from 'path';
import fs from 'fs/promises';

const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function saveExpenseEvidence(file: File) {
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    throw new Error('Evidence must be a PDF, JPG, PNG, or WebP file');
  }
  if (file.size <= 0 || file.size > MAX_EVIDENCE_BYTES) {
    throw new Error('Evidence file must be between 1 byte and 10 MB');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${crypto.randomUUID()}.${extension}`;
  if (USE_BLOB) {
    const { put } = await import('@vercel/blob');
    const result = await put(`expense-evidence/${filename}`, buffer, {
      access: 'public',
      contentType: file.type,
    });
    return result.url;
  }

  const directory = path.join(process.cwd(), 'public', 'uploads', 'expense-evidence');
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), buffer);
  return `/uploads/expense-evidence/${filename}`;
}

export async function deleteExpenseEvidence(url: string | null | undefined) {
  if (!url) return;
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const { del } = await import('@vercel/blob');
      await del(url);
      return;
    }
    if (!url.startsWith('/uploads/expense-evidence/')) return;
    await fs.unlink(path.join(process.cwd(), 'public', url));
  } catch (error) {
    console.warn('Unable to delete expense evidence:', error);
  }
}
