export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();

    // --- Check customer first ---
    const customerToken = cookieStore.get('customer_token')?.value;
    if (customerToken) {
      const payload = await verifyToken(customerToken);
      if (payload && payload.role === 'customer') {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub as string },
          select: { name: true, mobileNumber: true }
        });
        return NextResponse.json({
          authenticated: true,
          role: 'customer',
          userId: payload.sub,
          name: user?.name || user?.mobileNumber || 'Customer'
        });
      }
    }

    // --- Check admin ---
    const adminToken = cookieStore.get('admin_token')?.value;
    if (adminToken) {
      const payload = await verifyToken(adminToken);
      if (payload && payload.role === 'admin') {
        const admin = await prisma.admin.findUnique({
          where: { id: payload.sub as string },
          select: { email: true }
        });
        return NextResponse.json({
          authenticated: true,
          role: 'admin',
          userId: payload.sub,
          name: admin?.email?.split('@')[0] || 'Admin'
        });
      }
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
