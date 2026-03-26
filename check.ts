import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ include: { legacyImages: true } });
  products.forEach(p => {
    console.log(`Product: ${p.title}`);
    console.log(`  Main Image: ${p.imageUrl}`);
    console.log(`  Gallery Images: ${p.images.join(', ')}`);
  });
}
main().finally(() => prisma.$disconnect());
