import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveProductImage, saveLogoImage } from '@/lib/imageStorage';

export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/upload
 * Accepts multipart/form-data with:
 *   - file: the image file
 *   - type: 'product' | 'logo'  (default: 'product')
 *
 * Returns { url: '/uploads/businesses/<filename>.jpg' }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string | null) ?? 'product';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file bytes and convert to base64 for processing
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${base64}`;

    const url =
      type === 'logo'
        ? await saveLogoImage(dataUri)
        : await saveProductImage(dataUri);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
