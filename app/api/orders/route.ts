import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/mailer';
import { sendOrderConfirmationPhoneMessage } from '@/lib/messaging';

async function getUser() {
  const cookieStore = await cookies();

  // Prioritize customer finding so that admins who are also logged in as customers
  // can place orders successfully.
  const customerToken = cookieStore.get('customer_token')?.value;
  if (customerToken) {
    const payload = await verifyToken(customerToken);
    if (payload?.role === 'customer') return { id: payload.sub, role: 'customer' };
  }

  const adminToken = cookieStore.get('admin_token')?.value;
  if (adminToken) {
    const payload = await verifyToken(adminToken);
    if (payload?.role === 'admin') return { id: payload.sub, role: 'admin' };
  }

  return null;
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const where = user.role === 'admin' ? {} : { userId: user.id as string };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { mobileNumber: true } },
        orderItems: {
          include: {
            product: { select: { title: true, imageUrl: true } }
          }
        }
      }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    console.log('[ORDER_DEBUG] User:', user);
    if (!user || user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized. Please login as customer.' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[ORDER_DEBUG] Body:', JSON.stringify(body));
    const { items, customerName, customerMobile, customerEmail, addressLine, city, state, pincode } = body;

    if (
      !items ||
      items.length === 0 ||
      !customerName ||
      !customerEmail ||
      !addressLine ||
      !city ||
      !state ||
      !pincode
    ) {
      console.log('[ORDER_DEBUG] Validation failed: Missing fields');
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customerEmail));
    if (!emailOk) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    const pincodeOk = /^[0-9]{5,6}$/.test(String(pincode));
    if (!pincodeOk) {
      return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 });
    }

    // Verify user exists in DB to avoid P2003
    const userExists = await prisma.user.findUnique({ where: { id: user.id as string } });
    if (!userExists) {
      console.error('[ORDER_ERROR] User not found in DB:', user.id);
      return NextResponse.json({ error: 'User session invalid. Please login again.' }, { status: 401 });
    }

    let totalAmount = 0;
    for (const item of items) {
      // Verify product exists to avoid P2003
      const productExists = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!productExists) {
        console.error('[ORDER_ERROR] Product not found:', item.productId);
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
      if (Number(item.quantity) < 100) {
        return NextResponse.json({ error: `Minimum order quantity for any item is 100 units. Found ${item.quantity} for product ${item.productId}` }, { status: 400 });
      }
      totalAmount += Number(item.quantity) * Number(item.priceAtTime);
    }

    const orderItemsData = items.map((item: any) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      priceAtTime: Number(item.priceAtTime)
    }));

    console.log('[ORDER_DEBUG] Creating order with total:', totalAmount);

    const order = await prisma.order.create({
      data: {
        userId: user.id as string,
        customerName,
        customerMobile: customerMobile ? String(customerMobile) : null,
        customerEmail,
        addressLine,
        city,
        state,
        pincode,
        totalAmount,
        status: 'Pending',
        orderItems: {
          create: orderItemsData
        }
      },
      include: {
        orderItems: true
      }
    });

    console.log('[ORDER_DEBUG] Order created successfully:', order.id);

    if (customerEmail) {
      sendOrderConfirmationEmail({
        to: customerEmail,
        orderId: order.id,
        customerName,
      }).catch((err) => console.error('Order confirmation email failed:', err));
    }

    if (customerMobile) {
      sendOrderConfirmationPhoneMessage({
        toPhone: String(customerMobile),
        orderId: order.id,
      }).catch((err) => console.error('Order phone confirmation failed:', err));
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Create order error details:', error);
    // If it's a Prisma error, return more info
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Database constraint failed. Possibly invalid user or product ID.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
