import { haversineKm } from '@/lib/geo';
import type { BusinessCardData } from '@/components/landing/BusinessListingCard';

export type NearbyBusiness = BusinessCardData & { distanceKm: number };

type RawBusiness = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  logo: string | null;
  coverImage?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isApproved?: boolean;
  images?: BusinessCardData['images'];
  category?: { name: string; icon?: string | null };
  region?: { name: string | null } | null;
  district?: { name: string | null } | null;
  ward?: { name: string | null } | null;
};

export async function fetchBusinessesNearby(options: {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  limit?: number;
  categoryId?: string | null;
}): Promise<NearbyBusiness[]> {
  const { latitude, longitude, radiusKm = 20, limit = 50, categoryId } = options;

  const params = new URLSearchParams({
    page: '1',
    limit: '200',
    lean: 'true',
    _: Date.now().toString(),
  });
  if (categoryId) params.set('category', categoryId);

  const response = await fetch(`/api/businesses?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to load businesses');
  }

  const data = (await response.json()) as { businesses?: RawBusiness[] };
  const raw = data.businesses ?? [];

  const out: NearbyBusiness[] = [];
  for (const b of raw) {
    if (b.isApproved === false) continue;
    const lat =
      typeof b.latitude === 'number'
        ? b.latitude
        : b.latitude != null
          ? Number(b.latitude)
          : null;
    const lng =
      typeof b.longitude === 'number'
        ? b.longitude
        : b.longitude != null
          ? Number(b.longitude)
          : null;
    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue;
    }

    const distanceKm = haversineKm(latitude, longitude, lat, lng);
    if (distanceKm == null || distanceKm > radiusKm) continue;

    out.push({
      id: b.id,
      name: b.name,
      description: b.description,
      phone: b.phone,
      logo: b.logo,
      coverImage: b.coverImage,
      images: b.images,
      category: b.category ?? { name: 'Business', icon: null },
      region: b.region,
      district: b.district,
      ward: b.ward,
      distanceKm,
    });
    if (out.length >= limit) break;
  }

  out.sort((a, b) => a.distanceKm - b.distanceKm);
  return out;
}
