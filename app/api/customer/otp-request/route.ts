import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { mobileNumber } = await request.json();

    if (!mobileNumber || mobileNumber.length < 10) {
      return NextResponse.json({ error: 'Valid mobile number is required' }, { status: 400 });
    }

    // For the current demo, we use a fixed OTP so it matches the UI hint ("Use 123456 for demo").
    // The OTP is still stored in the OTPVerification table for proper verification.
    const otp = '123456';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTPVerification.create({
      data: {
        mobile: mobileNumber,
        otp,
        expiresAt,
      },
    });

    console.log(`[SIMULATED SMS] OTP for ${mobileNumber} is ${otp}`);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
