import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'customer') return null;
  return { userId: payload.sub as string };
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return { adminId: payload.sub as string };
}

