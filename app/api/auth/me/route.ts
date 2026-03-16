import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user (customer or admin).
 * Used by protected client pages to verify session before showing content.
 * Returns 401 if no valid token is present.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();

    // --- Check customer first ---
    const customerToken = cookieStore.get('customer_token')?.value;
    if (customerToken) {
      const payload = await verifyToken(customerToken);
      if (payload && payload.role === 'customer') {
        return NextResponse.json({ authenticated: true, role: 'customer', userId: payload.sub });
      }
    }

    // --- Check admin ---
    const adminToken = cookieStore.get('admin_token')?.value;
    if (adminToken) {
      const payload = await verifyToken(adminToken);
      if (payload && payload.role === 'admin') {
        return NextResponse.json({ authenticated: true, role: 'admin', userId: payload.sub });
      }
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
