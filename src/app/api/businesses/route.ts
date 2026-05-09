import { NextResponse, after } from 'next/server';
import { unstable_cache, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  getLocaleFromRequest,
  localizedCategoryFields,
  type AppLocale,
} from '@/lib/categoryLocale';

export const dynamic = 'force-dynamic';

function toBigIntOrUndefined(value: unknown) {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (typeof value === 'string') return BigInt(value);
  return undefined;
}

function jsonSafe<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
}

const BUSINESSES_PUBLIC_LIST_REVALIDATE = 120;

const fetchPublicBusinessList = unstable_cache(
  async (page: number, limit: number, locale: AppLocale) => {
    const skip = (page - 1) * limit;
    const where: Prisma.BusinessWhereInput = {};
    const businessListArgs = {
      skip,
      take: limit,
      where,
      orderBy: {
        createdAt: 'desc' as const,
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
          },
        },
        owner: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        region: {
          select: {
            name: true,
          },
        },
        district: {
          select: {
            name: true,
          },
        },
        ward: {
          select: {
            name: true,
          },
        },
        bundle: {
          select: {
            name: true,
            price: true,
            duration: true,
          },
        },
      },
    };

    const [businesses, total] = await Promise.all([
      prisma.business.findMany(businessListArgs),
      prisma.business.count({ where }),
    ]);

    const businessesOut = businesses.map((b) => ({
      ...b,
      category: {
        icon: b.category.icon,
        name: localizedCategoryFields(b.category, locale).name,
      },
    }));

    return jsonSafe({
      businesses: businessesOut,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  },
  ['businesses-public-list', 'v1'],
  { revalidate: BUSINESSES_PUBLIC_LIST_REVALIDATE, tags: ['businesses'] },
);

// GET all businesses with pagination and search
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const categoryId = url.searchParams.get('category') || undefined;
    const regionId = url.searchParams.get('region') || undefined;
    const districtId = url.searchParams.get('district') || undefined;
    const wardId = url.searchParams.get('ward') || undefined;
    const isApproved = url.searchParams.get('isApproved');
    const isVerified = url.searchParams.get('isVerified');
    const ownerId = url.searchParams.get('ownerId') || undefined;

    const skip = (page - 1) * limit;

    if (!search && !categoryId && !regionId && !districtId && !wardId && isApproved === null && isVerified === null && !url.searchParams.get('ownerId')) {
      const locale = getLocaleFromRequest(request);
      const payload = await fetchPublicBusinessList(page, limit, locale);
      return NextResponse.json(payload, {
        headers: {
          Vary: 'Cookie',
          'Cache-Control': `public, s-maxage=${BUSINESSES_PUBLIC_LIST_REVALIDATE}, stale-while-revalidate=600`,
        },
      });
    }

    // Build the where condition
    const where: Prisma.BusinessWhereInput = {};
    
    // Handle isApproved and isVerified filters with OR logic
    if (isApproved === 'false' && isVerified === 'false') {
      where.OR = [
        { isApproved: false },
        { isVerified: false },
      ];
    } else if (isApproved === 'false') {
      where.isApproved = false;
    } else if (isVerified === 'false') {
      where.isVerified = false;
    }
    
    if (search) {
      const q = search.trim();
      if (q) {
        // If we already have OR for approval/verification, combine with AND
        if (where.OR) {
          where.AND = [
            { OR: where.OR },
            {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            },
          ];
          delete where.OR;
        } else {
          where.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ];
        }
      }
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
      
      // Track category search
      await trackCategorySearch(categoryId);
    }
    
    if (regionId) {
      where.regionId = toBigIntOrUndefined(regionId);

      // Track location search
      await trackLocationSearch(BigInt(regionId));
    }

    if (districtId) {
      where.districtId = toBigIntOrUndefined(districtId);
    }

    if (wardId) {
      where.wardId = toBigIntOrUndefined(wardId);
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const businessListArgs = {
      skip,
      take: limit,
      where,
      orderBy: {
        createdAt: 'desc' as const,
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
          },
        },
        owner: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        region: {
          select: {
            name: true,
          },
        },
        district: {
          select: {
            name: true,
          },
        },
        ward: {
          select: {
            name: true,
          },
        },
        bundle: {
          select: {
            name: true,
            price: true,
            duration: true,
          },
        },
      },
    };

    const [businesses, total] = await Promise.all([
      prisma.business.findMany(businessListArgs),
      prisma.business.count({ where }),
    ]);
    
    // Defer analytics so list results return immediately (admin search was blocking on N+1 inserts).
    if (search || categoryId || regionId || districtId || wardId) {
      const session = await getServerSession(authOptions);
      const userId = session?.user?.id ?? null;
      const businessRows = businesses.map((b) => ({ id: b.id }));
      const queryText = search || '';
      const catId = categoryId || null;
      const regId = regionId || null;
      const resultTotal = total;

      after(async () => {
        try {
          const uuid = crypto.randomUUID();
          await prisma.$executeRaw`
            INSERT INTO search_queries 
            ("id", "queryText", "userId", "categoryId", "regionId", "resultCount", "createdAt") 
            VALUES 
            (${uuid}, ${queryText}, ${userId}, ${catId}, ${regId}, ${resultTotal}, NOW())
          `;

          if (businessRows.length > 0) {
            await Promise.all(
              businessRows.map((business, i) => {
                const resultUuid = crypto.randomUUID();
                return prisma.$executeRaw`
                  INSERT INTO search_result_businesses 
                  ("id", "searchQueryId", "businessId", "position", "wasClicked", "createdAt") 
                  VALUES 
                  (${resultUuid}, ${uuid}, ${business.id}, ${i + 1}, FALSE, NOW())
                `;
              }),
            );
            await Promise.all(
              businessRows.map((b) =>
                prisma.business.update({
                  where: { id: b.id },
                  data: { viewCount: { increment: 1 } },
                }),
              ),
            );
          }
        } catch (error) {
          console.error('Error tracking search query:', error);
        }
      });
    }

    const locale = getLocaleFromRequest(request);
    const businessesOut = businesses.map((b) => ({
      ...b,
      category: {
        icon: b.category.icon,
        name: localizedCategoryFields(b.category, locale).name,
      },
    }));

    return NextResponse.json(
      jsonSafe({
        businesses: businessesOut,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }),
      { headers: { Vary: 'Cookie' } }
    );
  } catch (err) {
    console.error('Error fetching businesses:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch businesses';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to track category searches
async function trackCategorySearch(categoryId: string) {
  try {
    // Check if record exists using raw SQL
    const existingRecords = await prisma.$queryRaw`
      SELECT id FROM category_searches WHERE "categoryId" = ${categoryId} LIMIT 1
    ` as Array<{ id: string }>;
    
    if (existingRecords.length > 0) {
      // Update existing record
      await prisma.$executeRaw`
        UPDATE category_searches 
        SET "searchCount" = "searchCount" + 1, "lastSearched" = NOW() 
        WHERE id = ${existingRecords[0].id}
      `;
    } else {
      // Create new record
      const uuid = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO category_searches (id, "categoryId", "searchCount", "lastSearched") 
        VALUES (${uuid}, ${categoryId}, 1, NOW())
      `;
    }
  } catch (error) {
    console.error('Error tracking category search:', error);
    // Don't throw error to prevent blocking the main API functionality
  }
}

// Helper function to track location searches
async function trackLocationSearch(regionId: bigint) {
  try {
    // Check if record exists using raw SQL
    const existingRecords = await prisma.$queryRaw`
      SELECT id FROM location_searches WHERE "regionId" = ${regionId} LIMIT 1
    ` as Array<{ id: string }>;
    
    if (existingRecords.length > 0) {
      // Update existing record
      await prisma.$executeRaw`
        UPDATE location_searches 
        SET "searchCount" = "searchCount" + 1, "lastSearched" = NOW() 
        WHERE id = ${existingRecords[0].id}
      `;
    } else {
      // Create new record
      const uuid = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO location_searches (id, "regionId", "searchCount", "lastSearched") 
        VALUES (${uuid}, ${regionId}, 1, NOW())
      `;
    }
  } catch (error) {
    console.error('Error tracking location search:', error);
    // Don't throw error to prevent blocking the main API functionality
  }
}

// POST - Create a new business
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = (await request.json()) as Record<string, unknown>;

    const ownerAuthEmail = body.ownerAuthEmail as string | undefined;
    const ownerAuthPassword = body.ownerAuthPassword as string | undefined;
    const ownerAuthPhone = body.ownerAuthPhone as string | undefined;
    delete body.ownerAuthEmail;
    delete body.ownerAuthPassword;
    delete body.ownerAuthPhone;

    let currentUser: Awaited<ReturnType<typeof prisma.user.findUnique>> | null = null;

    if (session?.user?.email) {
      currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!currentUser && ownerAuthEmail && ownerAuthPassword) {
      const u = await prisma.user.findUnique({
        where: { email: ownerAuthEmail },
        select: { id: true, name: true, email: true, phone: true, role: true, image: true, createdAt: true, hashedPassword: true },
      });
      if (u?.hashedPassword && (await bcrypt.compare(ownerAuthPassword, u.hashedPassword))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hashedPassword: _hp, ...safe } = u;
        currentUser = safe as Awaited<ReturnType<typeof prisma.user.findUnique>>;
      }
    }

    if (!currentUser && ownerAuthPhone && ownerAuthPassword) {
      const u = await prisma.user.findUnique({
        where: { phone: ownerAuthPhone },
        select: { id: true, name: true, email: true, phone: true, role: true, image: true, createdAt: true, hashedPassword: true },
      });
      if (u?.hashedPassword && (await bcrypt.compare(ownerAuthPassword, u.hashedPassword))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hashedPassword: _hp, ...safe } = u;
        currentUser = safe as Awaited<ReturnType<typeof prisma.user.findUnique>>;
      }
    }

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = currentUser.role === 'ADMIN';

    const {
      name,
      description,
      email,
      phone,
      street,
      regionId,
      districtId,
      wardId,
      bundleId,
      categoryId,
      categoryId2,
      transactionId,
      ownerId,
      logo,
      latitude,
      longitude,
      images,
    } = body as {
      name?: string;
      description?: string;
      email?: string;
      phone?: string;
      street?: string;
      regionId?: string;
      districtId?: string;
      wardId?: string;
      bundleId?: string;
      categoryId?: string;
      categoryId2?: string;
      transactionId?: string;
      ownerId?: string;
      logo?: string;
      latitude?: string;
      longitude?: string;
      images?: string[];
    };

    // Admin creation: ownerId required, transactionId optional
    if (isAdmin) {
      if (!name || !bundleId || !categoryId || !ownerId) {
        return NextResponse.json(
          { error: 'Missing required fields (name, bundleId, categoryId, ownerId)' },
          { status: 400 },
        );
      }
    } else {
      if (!name || !description || !email || !phone || !street || !regionId || !districtId || !wardId || !bundleId || !categoryId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
    }

    // Get the bundle to verify it exists and get its duration
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId! },
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Invalid bundle selected' }, { status: 400 });
    }

    if (!isAdmin && bundle.price > 0 && !transactionId) {
      return NextResponse.json(
        { error: 'Payment transaction reference is required for this bundle' },
        { status: 400 },
      );
    }

    // Calculate bundle expiry date
    const bundleExpiresAt = new Date();
    bundleExpiresAt.setDate(bundleExpiresAt.getDate() + bundle.duration);

    // Determine the owner
    const finalOwnerId = isAdmin && ownerId ? ownerId : currentUser.id;

    // Build business data
    const businessData: any = {
      name,
      description: description || null,
      email: email || null,
      phone: phone || null,
      street: street || null,
      regionId: toBigIntOrUndefined(regionId),
      districtId: toBigIntOrUndefined(districtId),
      wardId: toBigIntOrUndefined(wardId),
      bundleId,
      categoryId,
      categoryId2: categoryId2 || null,
      bundleExpiresAt,
      ownerId: finalOwnerId,
      logo: logo || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      // Admin-created businesses are auto-approved
      isVerified: isAdmin,
      isApproved: isAdmin,
    };

    // Only include regionId/districtId/wardId if they are provided
    if (!regionId || !districtId || !wardId) {
      // For admin, these are optional - use raw SQL to allow NULL foreign keys
      const id = crypto.randomUUID().replace(/-/g, '').substring(0, 25);
      await prisma.$executeRaw`
        INSERT INTO businesses (id, name, description, phone, email, street, logo, 
          regionId, districtId, wardId, bundleId, categoryId, categoryId2, 
          bundleExpiresAt, ownerId, latitude, longitude, isVerified, isApproved, createdAt, updatedAt)
        VALUES (${id}, ${name}, ${description || null}, ${phone || null}, ${email || null}, ${street || null}, ${logo || null},
          ${regionId || null}, ${districtId || null}, ${wardId || null}, ${bundleId}, ${categoryId}, ${categoryId2 || null},
          ${bundleExpiresAt}, ${finalOwnerId}, ${latitude ? parseFloat(latitude) : null}, ${longitude ? parseFloat(longitude) : null}, 
          ${isAdmin}, ${isAdmin}, NOW(), NOW())
      `;

      // Save product images if provided
      if (images && Array.isArray(images) && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imgId = crypto.randomUUID().replace(/-/g, '').substring(0, 25);
          await prisma.$executeRaw`
            INSERT INTO business_images (id, "businessId", "imageData", "sortOrder", "createdAt")
            VALUES (${imgId}, ${id}, ${images[i]}, ${i}, NOW())
          `;
        }
      }

      const createdBiz = await prisma.business.findUnique({
        where: { id },
        include: {
          category: {
            select: { name: true, icon: true },
          },
          owner: { select: { name: true, email: true } },
          bundle: true,
        },
      });

      const loc = getLocaleFromRequest(request);
      const bizOut =
        createdBiz && createdBiz.category
          ? {
              ...createdBiz,
              category: {
                icon: createdBiz.category.icon,
                name: localizedCategoryFields(createdBiz.category, loc).name,
              },
            }
          : createdBiz;

      revalidateTag('businesses');
      return NextResponse.json(jsonSafe(bizOut), {
        status: 201,
        headers: { Vary: 'Cookie' },
      });
    }

    // Standard creation with all foreign keys present
    const business = await prisma.business.create({
      data: businessData,
      include: {
        bundle: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Save product images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imgId = crypto.randomUUID().replace(/-/g, '').substring(0, 25);
        await prisma.$executeRaw`
          INSERT INTO business_images (id, "businessId", "imageData", "sortOrder", "createdAt")
          VALUES (${imgId}, ${business.id}, ${images[i]}, ${i}, NOW())
        `;
      }
    }

    // Create payment record only for non-admin paid bundles
    if (!isAdmin && transactionId && bundle.price > 0) {
      await prisma.payment.create({
        data: {
          amount: bundle.price,
          paymentReference: transactionId,
          paymentStatus: 'COMPLETED',
          paymentMethod: 'MOBILE_MONEY',
          businessId: business.id,
          userId: currentUser.id,
          bundleId: bundle.id
        }
      });
    }

    revalidateTag('businesses');
    return NextResponse.json(jsonSafe(business), { status: 201 });
  } catch (err) {
    console.error('Error creating business:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to create business';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
