export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCustomerSession } from '@/lib/session';
import { sendOrderConfirmationEmail } from '@/lib/mailer';
import { sendOrderConfirmationPhoneMessage } from '@/lib/messaging';

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPincode(pin: string) {
  return /^[0-9]{5,6}$/.test(pin);
}

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const customerName = String(body?.customerName || '').trim();
    const customerEmail = String(body?.customerEmail || '').trim();
    const addressLine = String(body?.addressLine || '').trim();
    const city = String(body?.city || '').trim();
    const state = String(body?.state || '').trim();
    const pincode = String(body?.pincode || '').trim();

    if (!customerName || !customerEmail || !addressLine || !city || !state || !pincode) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (!isEmail(customerEmail)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (!isPincode(pincode)) {
      return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const unavailable = cart.items.find((i) => !i.product.isAvailable);
    if (unavailable) {
      return NextResponse.json({ error: 'One or more products are not available' }, { status: 400 });
    }

    let totalAmount = 0;
    const items = cart.items.map((it) => {
      totalAmount += it.quantity * it.product.price;
      return {
        productId: it.productId,
        quantity: it.quantity,
        priceAtTime: it.product.price,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId: session.userId,
        customerName,
        customerEmail,
        customerMobile: null,
        addressLine,
        city,
        state,
        pincode,
        totalAmount,
        status: 'Pending',
        orderItems: { create: items },
      },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    sendOrderConfirmationEmail({
      to: customerEmail,
      orderId: order.id,
      customerName,
    }).catch((err) => console.error('Order confirmation email failed:', err));

    // If you later store phone in user profile, you can pass it here.
    sendOrderConfirmationPhoneMessage({
      toPhone: null,
      orderId: order.id,
    }).catch((err) => console.error('Order phone confirmation failed:', err));

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Cart checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

