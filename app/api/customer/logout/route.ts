export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('customer_token');
    return response;
  } catch (error) {
    console.error('Customer logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
