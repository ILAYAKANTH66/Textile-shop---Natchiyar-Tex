import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/signup-mailer';

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json({ error: 'Email or mobile number is required' }, { status: 400 });
    }

    const _identifier = String(identifier).trim();
    const isMail = isEmail(_identifier);
    let normalized = _identifier;

    if (!isMail) {
      normalized = _identifier.replace(/\D/g, '');
      if (normalized.length < 10) {
        return NextResponse.json({ error: 'Valid email or 10-digit mobile number is required' }, { status: 400 });
      }
      normalized = normalized.slice(-10); // Standardize to 10 digits
    } else {
      normalized = _identifier.toLowerCase();
    }

    // For the current demo, we use a fixed OTP so it matches the UI hint ("Use 123456 for demo").
    // We can also generate a random OTP if we are truly sending an email. Let's still use 123456 for simplicity.
    const otp = '123456';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTPVerification.create({
      data: {
        mobile: normalized, // We store either the mobile number or email in this column
        otp,
        expiresAt,
      },
    });

    if (isMail) {
      // Send email asynchronously
      sendOtpEmail({ to: normalized, otp }).catch((err) => console.error('OTP email failed:', err));
      console.log(`[SIMULATED EMAIL] OTP for ${normalized} is ${otp}`);
    } else {
      console.log(`[SIMULATED SMS] OTP for ${normalized} is ${otp}`);
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
