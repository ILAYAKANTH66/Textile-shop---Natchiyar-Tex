import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@natchiyartex.com';
  const adminPassword = 'adminpassword';
  
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
      },
    });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('Admin already exists.');
  }

  // Safely cleanup old products and their associated images/cart items/order items before seeding new ones
  // Note: Only deleting items that start with 'Wholesale Saree' or match our new items to avoid blowing away user-created data unexpectedly
  // but for the sake of a clean slate demo as requested, we will delete all products that don't have orders attached
  
  console.log('Cleaning up old demo products...');
  
  // First, find products that are safe to delete (no orders attached)
  const safeProducts = await prisma.product.findMany({
    where: {
      orderItems: { none: {} }
    },
    select: { id: true }
  });
  
  const safeProductIds = safeProducts.map(p => p.id);
  
  if (safeProductIds.length > 0) {
    await prisma.cartItem.deleteMany({
      where: { productId: { in: safeProductIds } }
    });
    
    await prisma.productImage.deleteMany({
      where: { productId: { in: safeProductIds } }
    });
    
    await prisma.product.deleteMany({
      where: { id: { in: safeProductIds } }
    });
    console.log(`Cleaned up ${safeProductIds.length} old products.`);
  }

  // Create Categories first
  const categoriesData = [
    { name: 'Kanchipuram Silk Sarees', slug: 'kanchipuram-silk', description: 'Authentic handwoven Kanchipuram silk sarees with rich zari work.' },
    { name: 'Banarasi Silk Sarees', slug: 'banarasi-silk', description: 'Intricate Banarasi silk sarees known for their gold and silver brocade.' },
    { name: 'Mysore Silk Sarees', slug: 'mysore-silk', description: 'Lightweight, elegant Mysore silk sarees with a soft feel.' },
    { name: 'Chettinad Cotton Sarees', slug: 'chettinad-cotton', description: 'Traditional Chettinad cotton sarees with bold borders and checks.' },
    { name: 'Handloom Cotton Sarees', slug: 'handloom-cotton', description: 'Breathable and comfortable handloom woven cotton sarees.' },
    { name: 'Cotton Silk Sarees', slug: 'cotton-silk', description: 'A perfect blend of cotton comfort and silk elegance.' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const existingCat = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existingCat) {
      const created = await prisma.category.create({ data: cat });
      categories.push(created);
      console.log('Created category:', created.name);
    } else {
      categories.push(existingCat);
    }
  }

  // Define authentic products with 3-4 distinct images each
  const productsData = [
    {
      title: 'Traditional Magenta Kanchipuram Silk Saree',
      description: 'A stunning magenta Kanchipuram silk saree with intricate gold zari brocade work. Perfect for weddings and grand occasions. Features a rich pallu and contrasting border.',
      price: 15500.0,
      catSlug: 'kanchipuram-silk',
      images: [
        'https://images.unsplash.com/photo-1610189014168-96f7c5d4ef22?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583391733959-f5b2ca80dd0d?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Royal Blue Kanchipuram Bridal Saree',
      description: 'Handwoven royal blue Kanchipuram silk with heavy zari woven motifs across the body. The contrasting pink border adds a traditional touch.',
      price: 18900.0,
      catSlug: 'kanchipuram-silk',
      images: [
        'https://images.unsplash.com/photo-1583391733959-f5b2ca80dd0d?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610189014168-96f7c5d4ef22?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596459427671-550fc9aa2f5f?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Zari Bordered Kanchipuram Gold Saree',
      description: 'Golden hue Kanchipuram silk saree with traditional borders and temple motifs. A timeless classic for south Indian ceremonies.',
      price: 22000.0,
      catSlug: 'kanchipuram-silk',
      images: [
        'https://images.unsplash.com/photo-1596459427671-550fc9aa2f5f?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583391733959-f5b2ca80dd0d?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610189014168-96f7c5d4ef22?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Olive Green Banarasi Brocade Silk Saree',
      description: 'Luxurious Banarasi silk saree in olive green featuring all-over floral jaal work in silver zari. Comes with an opulent matching blouse piece.',
      price: 12400.0,
      catSlug: 'banarasi-silk',
      images: [
        'https://images.unsplash.com/photo-1598263304505-1a3eb5fdecac?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520975695116-07f7d1fbdcdd?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Crimson Red Banarasi Georgette Saree',
      description: 'Flowy Banarasi georgette silk in vibrant crimson red. Lightweight yet exceptionally regal with antique gold zari weaving.',
      price: 14200.0,
      catSlug: 'banarasi-silk',
      images: [
        'https://images.unsplash.com/photo-1543315729-2cd1a403c9ac?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600100787265-d36c53e061dd?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1534081333815-ae5019106622?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Classic Maroon Mysore Silk Saree',
      description: 'Pure Mysore silk saree in a deep maroon shade. Known for its minimalist elegance, butter-soft texture, and pure gold zari borders.',
      price: 9500.0,
      catSlug: 'mysore-silk',
      images: [
        'https://images.unsplash.com/photo-1583391733975-d1ec2a7f5a4a?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520975869010-0b1f0bb7cf5a?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Pastel Pink Mysore Silk Delight',
      description: 'Soft pastel pink Mysore silk saree with signature thin zari border. Perfect for evening functions and office wear.',
      price: 8800.0,
      catSlug: 'mysore-silk',
      images: [
        'https://images.unsplash.com/photo-1520975869010-0b1f0bb7cf5a?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583391733975-d1ec2a7f5a4a?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Mustard Yellow Chettinad Cotton Saree',
      description: 'Authentic Chettinad handloom cotton woven in a brilliant mustard yellow with traditional bold contrast borders and earthy stripes.',
      price: 2400.0,
      catSlug: 'chettinad-cotton',
      images: [
        'https://images.unsplash.com/photo-1610189014674-88aa3a30c5e3?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140856-9a5d3c35c2c5?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Maroon Checkered Chettinad Cotton',
      description: 'Traditional maroon and black checkered cotton saree from Chettinad. Durable, breathable, and culturally rich.',
      price: 2600.0,
      catSlug: 'chettinad-cotton',
      images: [
        'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610189014674-88aa3a30c5e3?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140856-9a5d3c35c2c5?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Earthy Brown Handloom Cotton Saree',
      description: 'Everyday comfort meets heritage charm. This earthy brown handwoven cotton saree features temple borders and a highly breathable weave.',
      price: 1800.0,
      catSlug: 'handloom-cotton',
      images: [
        'https://images.unsplash.com/photo-1601639011158-9cfb5a32279b?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520975682031-a8a2f83b3a42?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520975930439-3ef5a13f6b71?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Indigo Blue Handloom Cotton Saree',
      description: 'Hand-dyed indigo blue cotton saree with handloom geometric patterns. A perfect blend of contemporary and traditional style.',
      price: 2100.0,
      catSlug: 'handloom-cotton',
      images: [
        'https://images.unsplash.com/photo-1520975682031-a8a2f83b3a42?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1601639011158-9cfb5a32279b?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520975930439-3ef5a13f6b71?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Teal Blue Cotton Silk Festive Saree',
      description: 'The perfect blend of easy-to-drape cotton and the sheen of silk. This teal blue saree is ideal for festive parties and intimate gatherings.',
      price: 4500.0,
      catSlug: 'cotton-silk',
      images: [
        'https://images.unsplash.com/photo-1583391734208-bfba5a02e6c5?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583391734005-4c07e05eb3dd?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1605649487212-4d4ce72635bc?q=80&w=1200&auto=format&fit=crop'
      ]
    },
    {
      title: 'Cream and Gold Cotton Silk Elegance',
      description: 'Rich cream cotton silk with subtle gold motifs. A sophisticated choice for morning events and puja ceremonies.',
      price: 5200.0,
      catSlug: 'cotton-silk',
      images: [
        'https://images.unsplash.com/photo-1583391734005-4c07e05eb3dd?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583391734208-bfba5a02e6c5?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1605649487212-4d4ce72635bc?q=80&w=1200&auto=format&fit=crop'
      ]
    }
  ];

  for (const p of productsData) {
    const category = categories.find(c => c.slug === p.catSlug);
    
    // Check if it already exists to avoid dupes on re-runs
    const exists = await prisma.product.findFirst({
      where: { title: p.title }
    });
    
    if (!exists) {
      const created = await prisma.product.create({
        data: {
          title: p.title,
          description: p.description,
          price: p.price,
          imageUrl: p.images[0], // primary image
          isAvailable: true,
          categoryId: category?.id,
          images: {
            create: p.images.map((imgUrl, idx) => ({
              imageUrl: imgUrl,
              order: idx
            }))
          },
        },
      });
      console.log('Created product:', created.title);
    } else {
      console.log('Product already exists:', p.title);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Wait a brief moment to ensure logs flush
    await new Promise(resolve => setTimeout(resolve, 500));
    await prisma.$disconnect();
  });

