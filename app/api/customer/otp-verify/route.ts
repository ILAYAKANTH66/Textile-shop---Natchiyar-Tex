import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { mobileNumber, otp } = await request.json();

    if (!mobileNumber || !otp) {
      return NextResponse.json({ error: 'Mobile number and OTP are required' }, { status: 400 });
    }

    const existing = await prisma.oTPVerification.findFirst({
      where: {
        mobile: mobileNumber,
        otp,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    await prisma.oTPVerification.update({
      where: { id: existing.id },
      data: { verified: true },
    });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { mobileNumber } });
    if (!user) {
      user = await prisma.user.create({ data: { mobileNumber } });
    }

    const token = await signToken({ sub: user.id, role: 'customer' }, '30d');

    const response = NextResponse.json({ success: true, user });
    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
