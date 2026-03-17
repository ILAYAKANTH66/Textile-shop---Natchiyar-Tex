export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please fill in all fields' }, { status: 400 });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
    if (!emailOk) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // In production, use Nodemailer here.
    console.log(`[CONTACT FORM] Message from ${name} (${email}): ${message}`);

    return NextResponse.json({ success: true, message: 'Message received' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
