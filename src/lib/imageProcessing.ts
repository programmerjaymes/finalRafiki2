import sharp from 'sharp';

// Target dimensions for carousel cards (4:3 aspect ratio works well)
const TARGET_WIDTH = 800;
const TARGET_HEIGHT = 600;
const MAX_FILE_SIZE_MB = 2;

/**
 * Process and resize a base64 image to fit carousel dimensions
 * - Resizes to 4:3 aspect ratio (800x600)
 * - Covers the area (crops if needed) to fill completely
 * - Compresses to reduce file size
 * - Returns base64 string
 */
export async function processProductImage(base64Image: string): Promise<string> {
  try {
    // Extract the base64 data (remove data:image/... prefix if present)
    const base64Data = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;
    
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Check file size
    const sizeInMB = buffer.length / (1024 * 1024);
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      console.warn(`Image size ${sizeInMB.toFixed(2)}MB exceeds ${MAX_FILE_SIZE_MB}MB, compressing...`);
    }
    
    // Process with sharp
    const processedBuffer = await sharp(buffer)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',      // Crop to fill the dimensions
        position: 'center',  // Crop from center
      })
      .jpeg({
        quality: 85,       // Good quality but smaller file size
        progressive: true,
        mozjpeg: true,     // Better compression
      })
      .toBuffer();
    
    // Return just the base64 data (components will add data:image/jpeg;base64, prefix)
    return processedBuffer.toString('base64');
  } catch (error) {
    console.error('Error processing image:', error);
    // Return original base64 without data URI prefix if processing fails
    return base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  }
}

/**
 * Process multiple images in parallel
 */
export async function processProductImages(images: string[]): Promise<string[]> {
  return Promise.all(images.map(img => processProductImage(img)));
}

/**
 * Process logo image (smaller, square)
 */
export async function processLogoImage(base64Image: string): Promise<string> {
  try {
    const base64Data = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;
    
    const buffer = Buffer.from(base64Data, 'base64');
    
    const processedBuffer = await sharp(buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toBuffer();
    
    return processedBuffer.toString('base64');
  } catch (error) {
    console.error('Error processing logo:', error);
    // Return original base64 without data URI prefix if processing fails
    return base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  }
}
