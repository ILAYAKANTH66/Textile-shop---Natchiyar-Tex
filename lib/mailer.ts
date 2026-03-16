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

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderId: string;
  customerName: string;
}) {
  if (!params.to) return;

  const from = process.env.SMTP_FROM || 'no-reply@natchiyartex.com';

  const subject = 'Your NATCHIYAR TEX order request';
  const text = `Dear ${params.customerName || 'Customer'},

Your order request with NATCHIYAR TEX has been received.
Order ID: ${params.orderId}
Order Status: Pending

We will contact you after review.

Warm regards,
NATCHIYAR TEX`;

  const html = `<p>Dear ${params.customerName || 'Customer'},</p>
<p>Your order request with <strong>NATCHIYAR TEX</strong> has been received.</p>
<p><strong>Order ID:</strong> ${params.orderId}<br/>
<strong>Order Status:</strong> Pending</p>
<p>We will contact you after review.</p>
<p>Warm regards,<br/>NATCHIYAR TEX</p>`;

  try {
    await transporter.sendMail({
      from,
      to: params.to,
      subject,
      text,
      html,
    });
  } catch (err) {
    // Fail silently so checkout never breaks because of email issues
    console.error('Nodemailer error:', err);
  }
}

