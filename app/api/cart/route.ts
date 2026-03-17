export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCustomerSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cart =
      (await prisma.cart.findUnique({
        where: { userId: session.userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: true },
              },
            },
          },
        },
      })) ??
      (await prisma.cart.create({
        data: { userId: session.userId },
        include: { items: { include: { product: { include: { images: true } } } } },
      }));

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Fetch cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const productId = body?.productId as string | undefined;
    const quantity = Number(body?.quantity ?? 1);

    if (!productId || !Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'Invalid product or quantity' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isAvailable) {
      return NextResponse.json({ error: 'Product not available' }, { status: 400 });
    }

    const cart =
      (await prisma.cart.findUnique({ where: { userId: session.userId } })) ??
      (await prisma.cart.create({ data: { userId: session.userId } }));

    const item = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

