import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { UserRole, PaymentStatus, PaymentMethod } from '@prisma/client';

// Helper to generate random dates within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate a random phone number
function generateRandomPhone(): string {
  const prefixes = ['0742', '0754', '0713', '0787', '0621', '0715'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += Math.floor(Math.random() * 10);
  }
  return `${prefix}${suffix}`;
}

// Generate a random TZ street address
function generateRandomStreet(): string {
  const streets = [
    'Uhuru Street', 'Mkwepu Road', 'Jacaranda Avenue', 'Kilimanjaro Drive',
    'Nyerere Road', 'Samora Avenue', 'Sokoine Drive', 'Biashara Street',
    'Msasani Road', 'Kenyatta Drive', 'Bagamoyo Road', 'Makumbusho Street',
    'Kawawa Road', 'Old Bagamoyo Road', 'Ali Hassan Mwinyi Road'
  ];
  return streets[Math.floor(Math.random() * streets.length)];
}

// Generate a random business name
function generateBusinessName(category: string): string {
  const prefixes = [
    'Tanzania', 'Dar', 'Kilimanjaro', 'Zanzibar', 'Serengeti', 'Mwanza',
    'Safari', 'Savanna', 'Bahari', 'Swahili', 'Arusha', 'Taifa', 'Rafiki',
    'Jambo', 'Karibu', 'Simba', 'Nyota', 'Malaika', 'Furaha', 'Baraka'
  ];

  const categorySpecificSuffixes: Record<string, string[]> = {
    'Restaurants': [
      'Restaurant', 'Eatery', 'Bistro', 'Café', 'Kitchen', 'Grill',
      'Diner', 'Steakhouse', 'Pizzeria', 'BBQ', 'Buffet', 'Seafood'
    ],
    'Hotels': [
      'Hotel', 'Inn', 'Resort', 'Lodge', 'Suites', 'Motel',
      'Residency', 'Accommodation', 'Place', 'Getaway', 'Retreat'
    ],
    'Shopping': [
      'Mall', 'Market', 'Shop', 'Store', 'Emporium', 'Mart',
      'Boutique', 'Supermarket', 'Center', 'Outlet', 'Bazaar'
    ],
    'Health': [
      'Hospital', 'Clinic', 'Pharmacy', 'MediCare', 'Health Center', 'Wellness',
      'Medical', 'Care', 'Health Services', 'Dispensary', 'Health Hub'
    ],
    'Education': [
      'School', 'Academy', 'College', 'Institute', 'University', 'Learning Center',
      'Educational Center', 'Training Center', 'Knowledge Hub'
    ],
    'Professional Services': [
      'Consultants', 'Services', 'Advisors', 'Solutions', 'Associates',
      'Partners', 'Group', 'Firm', 'Agency', 'Corporation'
    ],
    'Tourism': [
      'Tours', 'Safaris', 'Adventures', 'Travel', 'Expeditions', 'Journeys',
      'Excursions', 'Experiences', 'Explorations', 'Vacations'
    ],
    'Transportation': [
      'Transport', 'Logistics', 'Movers', 'Taxi', 'Transporters', 'Express',
      'Couriers', 'Delivery', 'Shipping', 'Fleet Services'
    ],
    'Entertainment': [
      'Cinema', 'Theater', 'Club', 'Bar', 'Lounge', 'Entertainment',
      'Gaming', 'Arcade', 'Karaoke', 'Events', 'Productions'
    ],
    'Beauty': [
      'Salon', 'Spa', 'Beauty', 'Barber Shop', 'Hair Studio', 'Stylists',
      'Nail Studio', 'Cosmetics', 'Aesthetics', 'Makeover'
    ]
  };

  const defaultSuffixes = ['Services', 'Center', 'Hub', 'Place', 'Spot'];
  const suffixes = categorySpecificSuffixes[category] || defaultSuffixes;
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${suffix}`;
}

// Generate random business description
function generateBusinessDescription(category: string, name: string): string {
  const categoryIntros: Record<string, string[]> = {
    'Restaurants': [
      `${name} offers delicious local and international cuisine in a relaxed atmosphere.`,
      `Enjoy authentic Tanzanian flavors at ${name}, where every meal tells a story.`,
      `${name} is known for its exceptional dining experience and friendly service.`
    ],
    'Hotels': [
      `${name} provides comfortable accommodation with stunning views and modern amenities.`,
      `Experience luxury and comfort at ${name}, your home away from home.`,
      `${name} offers a peaceful retreat with exceptional service and beautiful surroundings.`
    ],
    'Shopping': [
      `${name} is your one-stop destination for all shopping needs with a wide range of products.`,
      `Browse through an extensive collection of high-quality goods at ${name}.`,
      `${name} brings you the best shopping experience with competitive prices and great selection.`
    ],
    'Health': [
      `${name} is committed to providing quality healthcare services with a focus on patient comfort.`,
      `Trust your health to the experienced professionals at ${name}.`,
      `${name} combines modern medical technology with compassionate care for better health outcomes.`
    ],
    'Education': [
      `${name} is dedicated to providing quality education and fostering academic excellence.`,
      `Empower your future at ${name} with our comprehensive educational programs.`,
      `${name} creates a nurturing learning environment where students can thrive and grow.`
    ],
    'Professional Services': [
      `${name} delivers expert solutions tailored to your business needs with professionalism and integrity.`,
      `Count on ${name} for reliable professional services that drive success.`,
      `${name} brings years of experience and expertise to solve your most complex business challenges.`
    ],
    'Tourism': [
      `${name} offers unforgettable adventures and authentic experiences across Tanzania.`,
      `Explore the beauty of Tanzania with ${name}, your trusted travel companion.`,
      `${name} creates memorable journeys through Tanzania's most stunning landscapes and wildlife areas.`
    ],
    'Transportation': [
      `${name} provides reliable and safe transportation services throughout Tanzania.`,
      `Travel with confidence with ${name}, offering punctual and comfortable transportation solutions.`,
      `${name} connects you to your destination with efficiency and comfort.`
    ],
    'Entertainment': [
      `${name} brings you the best in entertainment with state-of-the-art facilities.`,
      `Experience fun and excitement at ${name}, where every visit is a special occasion.`,
      `${name} is your gateway to exceptional entertainment experiences in a vibrant atmosphere.`
    ],
    'Beauty': [
      `${name} helps you look and feel your best with professional beauty services.`,
      `Pamper yourself at ${name} with our range of relaxing and rejuvenating treatments.`,
      `${name} combines skill and creativity to enhance your natural beauty.`
    ]
  };
  
  const defaultIntros = [
    `${name} provides high-quality services to meet all your needs.`,
    `Discover the best of what ${name} has to offer for your satisfaction.`,
    `${name} is committed to excellence in everything we do.`
  ];
  
  const intros = categoryIntros[category] || defaultIntros;
  const intro = intros[Math.floor(Math.random() * intros.length)];
  
  const features = [
    "We are conveniently located and easy to find.",
    "Our friendly and professional staff is ready to assist you.",
    "We take pride in our customer satisfaction record.",
    "We offer competitive rates without compromising on quality.",
    "Our services are available seven days a week for your convenience.",
    "We maintain the highest standards of quality and service excellence.",
    "We are committed to continuous improvement to serve you better.",
    "Our experienced team ensures that all your needs are met efficiently."
  ];
  
  // Select 2-3 random features
  const selectedFeatures = [];
  const numFeatures = Math.floor(Math.random() * 2) + 2; // 2-3 features
  const featuresCopy = [...features];
  
  for (let i = 0; i < numFeatures; i++) {
    if (featuresCopy.length === 0) break;
    const index = Math.floor(Math.random() * featuresCopy.length);
    selectedFeatures.push(featuresCopy[index]);
    featuresCopy.splice(index, 1);
  }
  
  return `${intro} ${selectedFeatures.join(' ')}`;
}

// Generate a random email for a business
function generateBusinessEmail(businessName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'business.co.tz', 'example.com', 'hotmail.com', 'company.tz'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  // Convert business name to a suitable email prefix
  const prefix = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
    .substring(0, 10); // Get first 10 chars
  
  return `${prefix}@${domain}`;
}

// Generate random latitude and longitude within Tanzania
function generateTanzaniaCoordinates() {
  // Tanzania approximate boundaries
  const minLat = -11.7; // Southernmost point
  const maxLat = -1.0;  // Northernmost point
  const minLng = 29.3;  // Westernmost point
  const maxLng = 40.4;  // Easternmost point
  
  const lat = minLat + Math.random() * (maxLat - minLat);
  const lng = minLng + Math.random() * (maxLng - minLng);
  
  return { latitude: lat, longitude: lng };
}

export async function GET() {
  try {
    console.log('Starting to seed test data...');
    
    // 1. Get existing categories, regions, districts, wards, and bundles
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
      return NextResponse.json({ 
        error: 'No categories found. Run the basic seed script first.' 
      }, { status: 400 });
    }
    
    const regions = await prisma.region.findMany();
    if (regions.length === 0) {
      return NextResponse.json({ 
        error: 'No regions found. Run the basic seed script first.' 
      }, { status: 400 });
    }
    
    const districts = await prisma.district.findMany();
    if (districts.length === 0) {
      return NextResponse.json({ 
        error: 'No districts found. Run the basic seed script first.' 
      }, { status: 400 });
    }
    
    const wards = await prisma.ward.findMany();
    if (wards.length === 0) {
      return NextResponse.json({ 
        error: 'No wards found. Run the basic seed script first.' 
      }, { status: 400 });
    }
    
    const bundles = await prisma.bundle.findMany();
    if (bundles.length === 0) {
      return NextResponse.json({ 
        error: 'No bundles found. Run the basic seed script first.' 
      }, { status: 400 });
    }
    
    // 2. Create test users (20 business owners)
    console.log('Creating test users...');
    const testUsers = [];
    const userRoles = [UserRole.BUSINESS_OWNER, UserRole.BUSINESS_REGISTRAR, UserRole.ACCOUNTANT];
    
    for (let i = 0; i < 30; i++) {
      // 80% business owners, 20% other roles
      const role = i < 24 ? UserRole.BUSINESS_OWNER : userRoles[Math.floor(Math.random() * userRoles.length)];
      
      const firstName = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Mary', 'James', 'Linda', 
        'Robert', 'Patricia', 'Daniel', 'Elizabeth', 'William', 'Susan', 'Joseph', 'Jessica',
        'Thomas', 'Helen', 'Charles', 'Margaret', 'Christopher', 'Emily', 'Anthony', 'Sarah',
        'Amina', 'Juma', 'Hassan', 'Fatima', 'Ibrahim', 'Aisha', 'Salim', 'Zainab', 'Mohamed',
        'Rehema', 'Said', 'Mwanaidi', 'Ally', 'Taabu', 'Rajab', 'Halima'
      ][Math.floor(Math.random() * 40)];
      
      const lastName = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson',
        'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
        'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Lewis', 'Lee', 'Walker',
        'Juma', 'Hassan', 'Ally', 'Mohamed', 'Said', 'Salim', 'Hamisi', 'Ibrahim', 'Abdallah',
        'Seif', 'Omar', 'Shaban', 'Mwinyi', 'Nyerere', 'Karume', 'Kikwete'
      ][Math.floor(Math.random() * 40)];
      
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`;
      
      // Create a password hash
      const hashedPassword = await hash('Password123', 12);
      
      // Create the user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          hashedPassword,
          role,
          emailVerified: Math.random() > 0.3 ? new Date() : null, // 70% verified
        }
      });
      
      testUsers.push(user);
      console.log(`Created user: ${user.name} (${user.role})`);
    }
    
    // 3. Create businesses (50 businesses)
    console.log('Creating test businesses...');
    const businesses = [];
    
    // Get business owners
    const businessOwners = testUsers.filter(user => user.role === UserRole.BUSINESS_OWNER);
    const registrars = testUsers.filter(user => user.role === UserRole.BUSINESS_REGISTRAR);
    
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Create businesses based on categories
    for (let i = 0; i < 50; i++) {
      // Pick a random owner
      const owner = businessOwners[Math.floor(Math.random() * businessOwners.length)];
      
      // Pick a random registrar (50% chance of having one)
      const registrar = Math.random() > 0.5 
        ? registrars[Math.floor(Math.random() * registrars.length)]
        : null;
      
      // Pick a random category
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Pick a random bundle
      const bundle = bundles[Math.floor(Math.random() * bundles.length)];
      
      // Pick a random region
      const region = regions[Math.floor(Math.random() * regions.length)];
      
      // Pick a random district from that region
      const regionDistricts = districts.filter(d => d.regionId === region.code);
      const district = regionDistricts.length > 0 
        ? regionDistricts[Math.floor(Math.random() * regionDistricts.length)]
        : districts[Math.floor(Math.random() * districts.length)];
      
      // Pick a random ward from that district
      const districtWards = wards.filter(w => w.districtId === district.code);
      const ward = districtWards.length > 0
        ? districtWards[Math.floor(Math.random() * districtWards.length)]
        : wards[Math.floor(Math.random() * wards.length)];
      
      // Generate a business name based on the category
      const name = generateBusinessName(category.name);
      
      // Generate a random creation date (within the last 6 months)
      const createdAt = randomDate(sixMonthsAgo, now);
      
      // Generate bundle expiry date (from creation date + bundle duration)
      const bundleExpiresAt = new Date(createdAt);
      bundleExpiresAt.setDate(bundleExpiresAt.getDate() + bundle.duration);
      
      // Random coordinates around Tanzania
      const coordinates = generateTanzaniaCoordinates();
      
      // Create the business
      const business = await prisma.business.create({
        data: {
          name,
          description: generateBusinessDescription(category.name, name),
          phone: generateRandomPhone(),
          email: generateBusinessEmail(name),
          website: Math.random() > 0.6 ? `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.tz` : null,
          logo: Math.random() > 0.7 ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random` : null,
          coverImage: Math.random() > 0.8 ? `https://picsum.photos/seed/${encodeURIComponent(name)}/800/300` : null,
          
          // Social media (30% chance of having each)
          facebook: Math.random() > 0.7 ? `https://facebook.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : null,
          instagram: Math.random() > 0.7 ? `https://instagram.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : null,
          twitter: Math.random() > 0.7 ? `https://twitter.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : null,
          
          // Business features
          allowsOnlineBooking: Math.random() > 0.5,
          allowsDelivery: Math.random() > 0.5,
          
          // Approval and verification status
          isVerified: Math.random() > 0.3, // 70% verified
          isApproved: Math.random() > 0.2, // 80% approved
          
          // Bundle information
          bundleId: bundle.id,
          bundleExpiresAt,
          
          // Category information
          categoryId: category.id,
          
          // Location information
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          regionId: region.id,
          districtId: district.id,
          wardId: ward.id,
          street: generateRandomStreet(),
          
          // Rating information (based on reviews we'll create later)
          avgRating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
          numReviews: Math.floor(Math.random() * 20), // 0-19 reviews
          
          // View and click counts
          viewCount: Math.floor(Math.random() * 500),
          clickCount: Math.floor(Math.random() * 200),
          inquiryCount: Math.floor(Math.random() * 50),
          
          // Timestamps
          createdAt,
          updatedAt: createdAt,
          
          // Relationships
          ownerId: owner.id,
          registrarId: registrar?.id,
        }
      });
      
      businesses.push(business);
      console.log(`Created business: ${business.name} (${category.name})`);
      
      // Add a secondary category to 50% of businesses
      if (Math.random() > 0.5) {
        // Pick a different random category
        let secondaryCategory = categories[Math.floor(Math.random() * categories.length)];
        while (secondaryCategory.id === category.id) {
          secondaryCategory = categories[Math.floor(Math.random() * categories.length)];
        }
        
        await prisma.categoryOnBusiness.create({
          data: {
            businessId: business.id,
            categoryId: secondaryCategory.id,
          }
        });
        
        console.log(`Added secondary category ${secondaryCategory.name} to ${business.name}`);
      }
      
      // 4. Create payment records for each business
      const paymentMethods = [PaymentMethod.MOBILE_MONEY, PaymentMethod.CREDIT_CARD, PaymentMethod.BANK_TRANSFER, PaymentMethod.PAYPAL];
      const paymentStatuses = [PaymentStatus.COMPLETED, PaymentStatus.PENDING, PaymentStatus.FAILED, PaymentStatus.REFUNDED];
      
      // Create 1-3 payments per business
      const numPayments = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numPayments; j++) {
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        // First payment is always completed, others have random status
        const paymentStatus = j === 0 ? PaymentStatus.COMPLETED : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
        
        const paymentDate = j === 0 ? createdAt : randomDate(createdAt, now);
        
        await prisma.payment.create({
          data: {
            amount: bundle.price,
            currency: "TZS",
            paymentReference: `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            paymentStatus,
            paymentMethod,
            businessId: business.id,
            userId: owner.id,
            bundleId: bundle.id,
            createdAt: paymentDate,
            updatedAt: paymentDate,
          }
        });
        
        console.log(`Created payment for ${business.name}`);
      }
      
      // 5. Create reviews for businesses (50% chance of having reviews)
      if (Math.random() > 0.5) {
        // Create 1-10 reviews
        const numReviews = Math.floor(Math.random() * 10) + 1;
        
        for (let j = 0; j < numReviews; j++) {
          // Random reviewer from users (excluding the owner)
          const reviewers = testUsers.filter(user => user.id !== owner.id);
          const reviewer = reviewers[Math.floor(Math.random() * reviewers.length)];
          
          // Random rating (3-5 stars more common)
          const rating = Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 5) + 1;
          
          // Review comments based on rating
          let comment;
          
          if (rating === 5) {
            const excellentComments = [
              `Excellent service at ${business.name}! Highly recommended.`,
              `${business.name} exceeded all my expectations. Will definitely come back.`,
              `Top-notch quality and service. One of the best ${category.name.toLowerCase()} in Tanzania.`,
              `Outstanding experience from start to finish. Five stars well deserved!`,
              `Absolutely fantastic! ${business.name} is a gem in the ${category.name.toLowerCase()} industry.`
            ];
            comment = excellentComments[Math.floor(Math.random() * excellentComments.length)];
          } else if (rating === 4) {
            const goodComments = [
              `Very good service at ${business.name}. Minor improvements could make it perfect.`,
              `Great experience overall. Would recommend ${business.name} to others.`,
              `Good quality and friendly staff. Will visit again.`,
              `Reliable service and good value for money at ${business.name}.`,
              `Impressed with ${business.name}. Just a few small things could be better.`
            ];
            comment = goodComments[Math.floor(Math.random() * goodComments.length)];
          } else if (rating === 3) {
            const averageComments = [
              `Average experience at ${business.name}. Nothing special but nothing bad either.`,
              `Decent service but room for improvement at ${business.name}.`,
              `Meets expectations but doesn't exceed them. Fair value for money.`,
              `Standard ${category.name.toLowerCase()} experience. Neither impressed nor disappointed.`,
              `OK service at ${business.name}, but I've had better elsewhere.`
            ];
            comment = averageComments[Math.floor(Math.random() * averageComments.length)];
          } else if (rating === 2) {
            const poorComments = [
              `Disappointing experience at ${business.name}. Many areas need improvement.`,
              `Below average service. Wouldn't rush back to ${business.name}.`,
              `Not satisfied with my visit to ${business.name}. Expected much better.`,
              `Poor value for money. ${business.name} needs to step up their game.`,
              `Service was lacking at ${business.name}. Would think twice before returning.`
            ];
            comment = poorComments[Math.floor(Math.random() * poorComments.length)];
          } else {
            const terribleComments = [
              `Terrible experience at ${business.name}. Would not recommend at all.`,
              `Very disappointed with ${business.name}. Will not be returning.`,
              `Worst ${category.name.toLowerCase()} experience I've had. Complete waste of money.`,
              `Avoid ${business.name} at all costs. Extremely poor service and quality.`,
              `Absolutely awful. ${business.name} needs a complete overhaul of their service.`
            ];
            comment = terribleComments[Math.floor(Math.random() * terribleComments.length)];
          }
          
          // Review date (after business creation, before now)
          const reviewDate = randomDate(createdAt, now);
          
          await prisma.review.create({
            data: {
              rating,
              comment,
              businessId: business.id,
              userId: reviewer.id,
              createdAt: reviewDate,
              updatedAt: reviewDate,
            }
          });
        }
        
        console.log(`Created ${numReviews} reviews for ${business.name}`);
        
        // Update business avgRating and numReviews
        const reviews = await prisma.review.findMany({
          where: { businessId: business.id }
        });
        
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          const avgRating = parseFloat((totalRating / reviews.length).toFixed(1));
          
          await prisma.business.update({
            where: { id: business.id },
            data: {
              avgRating,
              numReviews: reviews.length,
            }
          });
          
          console.log(`Updated ratings for ${business.name}: ${avgRating} (${reviews.length} reviews)`);
        }
      }
      
      // 6. Create search queries and search results for each business (30% chance)
      if (Math.random() > 0.7) {
        // Create 1-5 search queries
        const numQueries = Math.floor(Math.random() * 5) + 1;
        
        for (let j = 0; j < numQueries; j++) {
          // Random searcher from users
          const searcher = testUsers[Math.floor(Math.random() * testUsers.length)];
          
          // Random search date (after business creation, before now)
          const searchDate = randomDate(createdAt, now);
          
          // Search terms based on business category or name
          const searchTerms = [
            category.name,
            business.name.split(' ')[0],
            `${category.name} in ${region.name}`,
            region.name,
            district.name,
            `best ${category.name.toLowerCase()}`,
            `${category.name.toLowerCase()} near me`,
            business.name
          ];
          
          const queryText = searchTerms[Math.floor(Math.random() * searchTerms.length)];
          
          try {
            // Create search query using raw SQL
            const searchQueryId = `sq-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const resultCount = Math.floor(Math.random() * 20) + 1;
            
            // Insert search query
            await prisma.$executeRaw`
              INSERT INTO search_queries (
                id, queryText, userId, regionId, categoryId, resultCount, createdAt
              ) VALUES (
                ${searchQueryId}, ${queryText}, ${searcher.id}, 
                ${Math.random() > 0.5 ? region.id : null}, 
                ${Math.random() > 0.5 ? category.id : null}, 
                ${resultCount}, ${searchDate}
              )
            `;
            
            // Insert search result
            const resultId = `sr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const position = Math.floor(Math.random() * 10) + 1;
            const wasClicked = Math.random() > 0.7;
            
            await prisma.$executeRaw`
              INSERT INTO search_result_businesses (
                id, searchQueryId, businessId, position, wasClicked, createdAt
              ) VALUES (
                ${resultId}, ${searchQueryId}, ${business.id}, 
                ${position}, ${wasClicked}, ${searchDate}
              )
            `;
            
            console.log(`Created search query and result for ${business.name}`);
          } catch (error) {
            console.error(`Error creating search data for ${business.name}:`, error);
          }
        }
      }
    }
    
    // 7. Update category search counts
    for (const category of categories) {
      const searchCount = Math.floor(Math.random() * 100) + 1;
      const searchDate = randomDate(sixMonthsAgo, now);
      
      try {
        // Create category search record directly
        await prisma.$executeRaw`
          INSERT INTO category_searches (id, categoryId, searchCount, lastSearched)
          VALUES (${`cs-${category.id}`}, ${category.id}, ${searchCount}, ${searchDate})
          ON DUPLICATE KEY UPDATE 
            searchCount = ${searchCount},
            lastSearched = ${searchDate}
        `;
        
        console.log(`Updated search count for category ${category.name}: ${searchCount}`);
      } catch (error) {
        console.error(`Error updating category search for ${category.name}:`, error);
      }
    }
    
    // 8. Update location search counts
    for (const region of regions) {
      const searchCount = Math.floor(Math.random() * 100) + 1;
      const searchDate = randomDate(sixMonthsAgo, now);
      
      try {
        // Create location search record directly
        await prisma.$executeRaw`
          INSERT INTO location_searches (id, regionId, searchCount, lastSearched)
          VALUES (${`ls-${region.id}`}, ${region.id}, ${searchCount}, ${searchDate})
          ON DUPLICATE KEY UPDATE 
            searchCount = ${searchCount},
            lastSearched = ${searchDate}
        `;
        
        console.log(`Updated search count for region ${region.name}: ${searchCount}`);
      } catch (error) {
        console.error(`Error updating location search for ${region.name}:`, error);
      }
    }
    
    console.log('Seeding test data completed successfully!');
    
    return NextResponse.json({
      message: 'Test data seeded successfully!',
      stats: {
        users: testUsers.length,
        businesses: businesses.length,
      }
    });
  } catch (error) {
    console.error('Error seeding test data:', error);
    return NextResponse.json({ 
      error: 'Failed to seed test data',
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 