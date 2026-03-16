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

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        orderItems: true
      }
    });

    const totalRevenue = orders
      .filter((o: any) => o.status === 'Confirmed')
      .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

    const statusCounts = orders.reduce((acc: Record<string, number>, order: any) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ 
      success: true, 
      report: {
        totalOrders: orders.length,
        totalRevenue,
        ...statusCounts
      }
    });
  } catch (error) {
    console.error('Fetch reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
