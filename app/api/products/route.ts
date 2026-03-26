export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// Helper to check admin status
async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export async function GET(request: Request) {
  try {
    const admin = await isAdmin();
    const where = admin ? {} : { isAvailable: true };

    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Math.min(Number(url.searchParams.get('limit') || '12'), 50);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { legacyImages: true, category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, price, imageUrl, images, categoryId, isAvailable } = await request.json();
    
    if (!images || !Array.isArray(images) || images.length < 3) {
      return NextResponse.json({ error: 'A minimum of 3 images must be provided.' }, { status: 400 });
    }

    const firstImage = images.length > 0 ? images[0] : imageUrl;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        imageUrl: firstImage,
        categoryId: categoryId || null,
        isAvailable: isAvailable ?? true,
        images,
        legacyImages: {
          create: images.map((url: string, index: number) => ({
            imageUrl: url,
            order: index
          }))
        }
      },
      include: { category: true, legacyImages: true }
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
