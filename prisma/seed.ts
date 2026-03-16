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

  // Seed wholesale saree products (always ensure at least 10 exist)
  const existing = await prisma.product.count({
    where: { title: { startsWith: 'Wholesale Saree' } },
  });

  if (existing < 10) {
    const toCreate = 10 - existing;
    const base = [
      {
        title: 'Wholesale Saree 01 — Premium Cotton Weave (Cream)',
        description: 'Wholesale premium cotton saree material with a soft handfeel and clean, even weave. Ideal for bulk supply and repeat ordering.',
        price: 999.0,
        imageUrl: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1200&auto=format&fit=crop',
      },
      {
        title: 'Wholesale Saree 02 — Muted Gold Border Cotton',
        description: 'Wholesale cotton saree material featuring a muted gold-toned border effect and smooth drape. Consistent batch quality.',
        price: 1199.0,
        imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1200&auto=format&fit=crop',
      },
      {
        title: 'Wholesale Saree 03 — Soft Brown Heritage Cotton',
        description: 'Wholesale premium cotton saree material with heritage-inspired texture and a warm soft-brown tone. Crafted for reliable bulk supply.',
        price: 1099.0,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
      },
      {
        title: 'Wholesale Saree 04 — Beige Loom Cotton (Fine)',
        description: 'Wholesale fine-count cotton saree material with a breathable weave and clean beige shade. Suitable for large-volume orders.',
        price: 899.0,
        imageUrl: 'https://images.unsplash.com/photo-1520975682031-a8a2f83b3a42?q=80&w=1200&auto=format&fit=crop',
      },
      {
        title: 'Wholesale Saree 05 — Cream Cotton (Soft Finish)',
        description: 'Wholesale cotton saree material with a soft finish and balanced weight. Works well for consistent, repeat wholesale fulfillment.',
        price: 949.0,
        imageUrl: 'https://images.unsplash.com/photo-1520975869010-0b1f0bb7cf5a?q=80&w=1200&auto=format&fit=crop',
      },
      {
        title: 'Wholesale Saree 06 — Classic Cotton (Muted Olive)',
        description: 'Wholesale cotton saree material in a muted olive tone with subtle texture. Designed for dependable bulk supply.',
        price: 1049.0,
        imageUrl: 'https://images.unsplash.com/photo-1534081333815-ae5019106622?q=80&w=1200&auto=format&fit=crop',
      },
      {
        title: 'Wholesale Saree 07 — Warm Sand Cotton (Textured)',
        description: 'Wholesale premium cotton saree material with a lightly textured weave and warm sand colour. Made for wholesale consistency.',
        price: 999.0,
        imageUrl: 'https://images.unsplash.com/photo-1520975930439-3ef5a13f6b71?q=80&w=1200&auto=format&fit=crop',
      },
      {
        title: 'Wholesale Saree 08 — Natural Cotton (Ivory)',
        description: 'Wholesale natural cotton saree material with an ivory tone and clean finishing. Suitable for bulk catalog supply.',
        price: 879.0,
        imageUrl: 'https://images.unsplash.com/photo-1620799140856-9a5d3c35c2c5?q=80&w=1200&auto=format&fit=crop',
      },
      {
        title: 'Wholesale Saree 09 — Heritage Cotton (Dusk Brown)',
        description: 'Wholesale heritage cotton saree material in a dusk brown shade, offering a rich cotton texture and reliable batch output.',
        price: 1149.0,
        imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop',
      },
      {
        title: 'Wholesale Saree 10 — Premium Cotton (Muted Rose)',
        description: 'Wholesale premium cotton saree material in a muted rose tone with smooth drape and consistent weave.',
        price: 1249.0,
        imageUrl: 'https://images.unsplash.com/photo-1520975695116-07f7d1fbdcdd?q=80&w=1200&auto=format&fit=crop',
      },
    ];

    const data = base.slice(0, toCreate).map((p) => ({
      ...p,
      isAvailable: true,
    }));

    for (const p of data) {
      const created = await prisma.product.create({
        data: {
          title: p.title,
          description: p.description,
          price: p.price,
          imageUrl: p.imageUrl,
          isAvailable: p.isAvailable,
          images: {
            create: [
              { imageUrl: p.imageUrl },
              { imageUrl: p.imageUrl },
            ],
          },
        },
      });
      console.log('Created product:', created.title);
    }
  } else {
    console.log('Wholesale saree products already seeded.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
