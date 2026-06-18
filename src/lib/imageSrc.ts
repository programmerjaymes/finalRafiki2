/** Normalize stored image paths, URLs, or raw base64 into a browser-usable src. */
export function toImageSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  if (
    src.startsWith('data:') ||
    src.startsWith('/') ||
    src.startsWith('http')
  ) {
    return src;
  }
  return `data:image/jpeg;base64,${src}`;
}
