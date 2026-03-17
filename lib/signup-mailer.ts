import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

export async function sendSignupConfirmationEmail(params: { to: string; name: string }) {
  if (!params.to) return;
  const from = process.env.SMTP_FROM || 'no-reply@natchiyartex.com';
  const subject = 'Welcome to NATCHIYAR TEX';
  const text = `Dear ${params.name || 'Customer'},

Your registration with NATCHIYAR TEX is confirmed.

You can now sign in and place wholesale order requests.

Warm regards,
NATCHIYAR TEX`;

  await transporter.sendMail({
    from,
    to: params.to,
    subject,
    text,
  });
}

export async function sendOtpEmail(params: { to: string; otp: string }) {
  if (!params.to) return;
  const from = process.env.SMTP_FROM || 'no-reply@natchiyartex.com';
  const subject = 'Your NATCHIYAR TEX Login OTP';
  const text = `Your login One Time Password (OTP) is: ${params.otp}\n\nThis OTP is valid for 5 minutes.`;

  await transporter.sendMail({
    from,
    to: params.to,
    subject,
    text,
  });
}
