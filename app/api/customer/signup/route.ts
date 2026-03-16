import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSignupConfirmationEmail } from '@/lib/signup-mailer';
import { signToken } from '@/lib/auth';

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const email = body?.email ? String(body.email).trim().toLowerCase() : null;
    const mobileNumber = body?.mobileNumber ? String(body.mobileNumber).trim() : null;

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!email && !mobileNumber) {
      return NextResponse.json({ error: 'Email or mobile number is required' }, { status: 400 });
    }
    if (email && !isEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (mobileNumber && mobileNumber.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(mobileNumber ? [{ mobileNumber }] : []),
        ],
      },
    });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobileNumber,
      },
    });

    if (email) {
      sendSignupConfirmationEmail({ to: email, name }).catch((err) =>
        console.error('Signup email failed:', err),
      );
    }

    const token = await signToken({ sub: user.id, role: 'customer' }, '30d');

    const response = NextResponse.json({ success: true, userId: user.id });
    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

