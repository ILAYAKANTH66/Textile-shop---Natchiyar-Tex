export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();
    
    // Auto-generate WhatsApp message if confirmed
    let formattedWhatsAppMsg = null;
    if (status === 'Confirmed') {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { user: true }
      });
      
      if (order) {
        const text = `Hello ${order.customerName},\n\nYour order from NATCHIYAR TEX (Order ID: ${order.id}) has been confirmed! Total amount: ₹${order.totalAmount}.\n\nThank you for shopping with us!`;
        const encodedText = encodeURIComponent(text);
        formattedWhatsAppMsg = `https://wa.me/91${order.user.mobileNumber}?text=${encodedText}`;
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status,
        ...(formattedWhatsAppMsg ? { formattedWhatsAppMsg } : {})
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
