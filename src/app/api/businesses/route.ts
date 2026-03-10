import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET all businesses with pagination and search
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const categoryId = url.searchParams.get('category') || undefined;
    const regionId = url.searchParams.get('region') || undefined;
    
    const skip = (page - 1) * limit;
    
    // Build the where condition
    const where: Prisma.BusinessWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
      
      // Track category search
      await trackCategorySearch(categoryId);
    }
    
    if (regionId) {
      where.regionId = regionId;
      
      // Track location search
      await trackLocationSearch(regionId);
    }
    
    console.log('📋 Fetching businesses with params:', { page, limit, search, categoryId, regionId });
    
    // Get businesses with pagination
    const businesses = await prisma.business.findMany({
      skip,
      take: limit,
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true
          }
        },
        owner: {
          select: {
            name: true, 
            email: true,
            image: true
          }
        },
        region: {
          select: {
            name: true
          }
        },
        district: {
          select: {
            name: true
          }
        },
        ward: {
          select: {
            name: true
          }
        },
        bundle: {
          select: {
            name: true,
            price: true,
            duration: true
          }
        }
      }
    });

    console.log(`✅ Found ${businesses.length} businesses`);
    
    // Log first business to check logo field
    if (businesses.length > 0) {
      console.log('🔍 First business sample:', {
        id: businesses[0].id,
        name: businesses[0].name,
        hasLogo: !!businesses[0].logo,
        logoLength: businesses[0].logo?.length || 0,
        logoPreview: businesses[0].logo ? businesses[0].logo.substring(0, 50) + '...' : null
      });
    }

    // Get total count for pagination
    const total = await prisma.business.count({ where });
    
    console.log(`📊 Total businesses: ${total}, Pages: ${Math.ceil(total / limit)}`);

    // Track this search query
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Create search query record using raw SQL
    let searchQueryId: string | null = null;
    
    if (search || categoryId || regionId) {
      try {
        // Create a UUID for the search query
        const uuid = crypto.randomUUID();
        
        // Insert the search query
        await prisma.$executeRaw`
          INSERT INTO search_queries 
          (id, queryText, userId, categoryId, regionId, resultCount, createdAt) 
          VALUES 
          (${uuid}, ${search || ''}, ${userId || null}, ${categoryId || null}, ${regionId || null}, ${total}, NOW())
        `;
        
        searchQueryId = uuid;
        
        // Track search results if we have a valid search query ID
        if (searchQueryId && businesses.length > 0) {
          // For each business, create a search result record
          for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            const position = i + 1;
            const resultUuid = crypto.randomUUID();
            
            await prisma.$executeRaw`
              INSERT INTO search_result_businesses 
              (id, searchQueryId, businessId, position, wasClicked, createdAt) 
              VALUES 
              (${resultUuid}, ${searchQueryId}, ${business.id}, ${position}, FALSE, NOW())
            `;
          }
          
          // Update business view counts
          await Promise.all(
            businesses.map(business => 
              prisma.business.update({
                where: { id: business.id },
                data: { viewCount: { increment: 1 } }
              })
            )
          );
        }
      } catch (error) {
        console.error("Error tracking search query:", error);
        // Continue without tracking if there's an error
      }
    }

    return NextResponse.json({
      businesses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
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
      SELECT id FROM category_searches WHERE categoryId = ${categoryId} LIMIT 1
    ` as Array<{ id: string }>;
    
    if (existingRecords.length > 0) {
      // Update existing record
      await prisma.$executeRaw`
        UPDATE category_searches 
        SET searchCount = searchCount + 1, lastSearched = NOW() 
        WHERE id = ${existingRecords[0].id}
      `;
    } else {
      // Create new record
      const uuid = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO category_searches (id, categoryId, searchCount, lastSearched) 
        VALUES (${uuid}, ${categoryId}, 1, NOW())
      `;
    }
  } catch (error) {
    console.error('Error tracking category search:', error);
    // Don't throw error to prevent blocking the main API functionality
  }
}

// Helper function to track location searches
async function trackLocationSearch(regionId: string) {
  try {
    // Check if record exists using raw SQL
    const existingRecords = await prisma.$queryRaw`
      SELECT id FROM location_searches WHERE regionId = ${regionId} LIMIT 1
    ` as Array<{ id: string }>;
    
    if (existingRecords.length > 0) {
      // Update existing record
      await prisma.$executeRaw`
        UPDATE location_searches 
        SET searchCount = searchCount + 1, lastSearched = NOW() 
        WHERE id = ${existingRecords[0].id}
      `;
    } else {
      // Create new record
      const uuid = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO location_searches (id, regionId, searchCount, lastSearched) 
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
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the current user to check role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isAdmin = currentUser.role === 'ADMIN';
    const body = await request.json();

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
    } = body;

    // Admin creation: ownerId required, transactionId optional
    // Normal creation: transactionId required
    if (isAdmin) {
      if (!name || !bundleId || !categoryId || !ownerId) {
        return NextResponse.json(
          { error: 'Missing required fields (name, bundleId, categoryId, ownerId)' },
          { status: 400 }
        );
      }
    } else {
      if (!name || !description || !email || !phone || !street || !regionId || !districtId || !wardId || !bundleId || !categoryId || !transactionId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
    }

    // Get the bundle to verify it exists and get its duration
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId }
    });

    if (!bundle) {
      return NextResponse.json(
        { error: 'Invalid bundle selected' },
        { status: 400 }
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
      regionId: regionId || undefined,
      districtId: districtId || undefined,
      wardId: wardId || undefined,
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
            INSERT INTO business_images (id, businessId, imageData, sortOrder, createdAt)
            VALUES (${imgId}, ${id}, ${images[i]}, ${i}, NOW())
          `;
        }
      }

      const createdBiz = await prisma.business.findUnique({
        where: { id },
        include: {
          category: { select: { name: true, icon: true } },
          owner: { select: { name: true, email: true } },
          bundle: true,
        }
      });

      return NextResponse.json(createdBiz, { status: 201 });
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
          INSERT INTO business_images (id, businessId, imageData, sortOrder, createdAt)
          VALUES (${imgId}, ${business.id}, ${images[i]}, ${i}, NOW())
        `;
      }
    }

    // Create payment record only for non-admin (user-initiated) creation
    if (!isAdmin && transactionId) {
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

    return NextResponse.json(business, { status: 201 });
  } catch (err) {
    console.error('Error creating business:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to create business';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}