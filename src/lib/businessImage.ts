/** Resolve business image fields (base64, data URI, /uploads path, or https URL). */
export function resolveBusinessImageSrc(image: string | null | undefined): string | null {
  if (!image) return null;
  const value = image.trim();
  if (!value) return null;
  if (value.startsWith('data:')) return value;
  if (value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  return `data:image/jpeg;base64,${value}`;
}

export type BusinessImageRecord = {
  id: string;
  imageData: string;
  sortOrder: number;
};

export type BusinessImageSource = {
  name?: string;
  logo?: string | null;
  coverImage?: string | null;
  images?: BusinessImageRecord[];
};

/** Ordered product photo URLs for carousels (cover → gallery → logo). */
export function businessProductImageSources(business: BusinessImageSource): string[] {
  const imgs: string[] = [];
  if (business.coverImage) imgs.push(business.coverImage);
  if (business.images?.length) {
    imgs.push(...business.images.map((img) => img.imageData));
  }
  if (business.logo && !imgs.includes(business.logo)) {
    imgs.push(business.logo);
  }
  return imgs;
}
