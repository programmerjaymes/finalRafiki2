import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Makabati', nameEn: 'Hardware Stores', nameSw: 'Makabati', icon: '🏪' },
  { name: 'Mageti', nameEn: 'Vegetable Markets', nameSw: 'Mageti', icon: '🥬' },
  { name: 'Bookshops', nameEn: 'Bookshops', nameSw: 'Maduka ya Vitabu', icon: '📚' },
  { name: 'Mabango', nameEn: 'Perfumes', nameSw: 'Mabango', icon: '🧴' },
  { name: 'Printing T-shirts, Nguo, Kofia, Mabegi', nameEn: 'Printing Services', nameSw: 'Uchapishaji T-shirts, Nguo, Kofia, Mabegi', icon: '👕' },
  { name: 'Commercial Kitchen Equipment', nameEn: 'Kitchen Equipment', nameSw: 'Vifaa vya Jikoni', icon: '🍳' },
  { name: 'Supermarkets', nameEn: 'Supermarkets', nameSw: 'Makubwa ya Maduka', icon: '🛒' },
  { name: 'Cars Electricians', nameEn: 'Auto Electricians', nameSw: 'Wakandishaji Umeme wa Magari', icon: '🔧' },
  { name: 'Abaya', nameEn: 'Abaya', nameSw: 'Abaya', icon: '👗' },
  { name: 'Madela Vijora', icon: '👘', nameEn: 'Traditional Dresses', nameSw: 'Madela Vijora' },
  { name: 'Kumbi za Burudani', nameEn: 'Entertainment Equipment', nameSw: 'Kumbi za Burudani', icon: '🎵' },
  { name: 'Bicycles', nameEn: 'Bicycles', nameSw: 'Baiskeli', icon: '🚲' },
  { name: 'Chicken', nameEn: 'Poultry', nameSw: 'Kuku', icon: '🐔' },
  { name: 'Gravel', nameEn: 'Gravel', nameSw: 'Mawe ya Changarawe', icon: '🪨' },
  { name: 'Lime, limestone', nameEn: 'Lime & Limestone', nameSw: 'Chokaa na Mawe ya Chokaa', icon: '🏗️' },
  { name: 'Primary Schools', nameEn: 'Primary Schools', nameSw: 'Shule za Msingi', icon: '🏫' },
  { name: 'Kindergarten', nameEn: 'Kindergarten', nameSw: 'Shule ya Watoto Wachanga', icon: '🎓' },
  { name: 'Secondary Schools A Level', nameEn: 'A Level Schools', nameSw: 'Shule za Sekondari Daraja la Kwanza', icon: '📖' },
  { name: 'Secondary School O Level', nameEn: 'O Level Schools', nameSw: 'Shule za Sekondari Daraja la Pili', icon: '📚' },
  { name: 'Maua', nameEn: 'Flowers', nameSw: 'Maua', icon: '🌸' },
  { name: 'Advertising vehicle', nameEn: 'Mobile Advertising', nameSw: 'Gari la Matangazo', icon: '🚐' },
  { name: 'Kanzu', nameEn: 'Kanzu', nameSw: 'Kanzu', icon: '👔' },
  { name: 'Canvas', nameEn: 'Canvas Products', nameSw: 'Bidhaa za Canvas', icon: '🖼️' },
  { name: 'Samaki', nameEn: 'Fish', nameSw: 'Samaki', icon: '🐟' },
  { name: 'Fresh Food', nameEn: 'Fresh Food', nameSw: 'Chakula Kipya', icon: '🥬' },
  { name: 'Flowers and Flowers Pots', nameEn: 'Flowers & Pots', nameSw: 'Maua na Vifuniko vya Maua', icon: '🌺' },
  { name: 'Fish feed', nameEn: 'Fish Feed', nameSw: 'Chakula cha Samaki', icon: '🍞' },
  { name: 'Universities', nameEn: 'Universities', nameSw: 'Vyuo Vikuu', icon: '🎓' },
  { name: 'Colleges', nameEn: 'Colleges', nameSw: 'Vyuo', icon: '🏛️' }
];

async function seedCategories() {
  console.log('🌱 Seeding Swahili business categories...');

  try {
    for (const category of categories) {
      // Check if category already exists
      const existing = await prisma.category.findFirst({
        where: { name: category.name }
      });

      if (!existing) {
        await prisma.category.create({
          data: {
            name: category.name,
            nameEn: category.nameEn,
            nameSw: category.nameSw,
            icon: category.icon
          }
        });
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${category.name}`);
      }
    }

    console.log('🎉 Categories seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedCategories()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
