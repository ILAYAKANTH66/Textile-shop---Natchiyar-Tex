import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const admin = await isAdmin();

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, category: true },
    });

    if (!product || (!admin && !product.isAvailable)) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, price, imageUrl, images, categoryId, isAvailable } = await request.json();
    
    if (!images || !Array.isArray(images) || images.length < 3) {
      return NextResponse.json({ error: 'A minimum of 3 images must be provided.' }, { status: 400 });
    }

    const firstImage = images.length > 0 ? images[0] : imageUrl;

    // Delete existing images
    await prisma.productImage.deleteMany({
      where: { productId: id }
    });

    // Update product and create new images
    const product = await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        imageUrl: firstImage,
        categoryId: categoryId === '' ? null : categoryId,
        isAvailable,
        images: {
          create: images.map((url: string, index: number) => ({
            imageUrl: url,
            order: index
          }))
        }
      },
      include: { images: true }
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Usually we don't hard delete if it's tied to orders, but for this simple version:
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    // If foreign key constraint fails
    return NextResponse.json({ error: 'Cannot delete product currently in use. Set to unavailable instead.' }, { status: 400 });
  }
}
