import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { identifier, otp } = await request.json();

    if (!identifier || !otp) {
      return NextResponse.json({ error: 'Email/Mobile number and OTP are required' }, { status: 400 });
    }

    const _identifier = String(identifier).trim();
    const isMail = isEmail(_identifier);
    let normalized = _identifier;

    if (!isMail) {
      normalized = _identifier.replace(/\D/g, '');
      normalized = normalized.slice(-10);
    } else {
      normalized = _identifier.toLowerCase();
    }

    const existing = await prisma.oTPVerification.findFirst({
      where: {
        mobile: normalized, // Stored here regardless if it was an email or mobile
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
    let user;
    if (isMail) {
      user = await prisma.user.findUnique({ where: { email: normalized } });
      if (!user) {
        user = await prisma.user.create({ data: { email: normalized, name: normalized.split('@')[0] } });
      }
    } else {
      user = await prisma.user.findUnique({ where: { mobileNumber: normalized } });
      if (!user) {
        user = await prisma.user.create({ data: { mobileNumber: normalized } });
      }
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
