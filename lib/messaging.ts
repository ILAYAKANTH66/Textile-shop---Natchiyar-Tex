export async function sendOrderConfirmationPhoneMessage(params: {
  toPhone: string | null | undefined;
  orderId: string;
}) {
  // Provider integration is optional. If not configured, silently skip.
  const provider = process.env.MESSAGING_PROVIDER; // e.g. "twilio"
  if (!provider) return;
  if (!params.toPhone) return;

  // Placeholder for production provider (Twilio / WhatsApp Cloud API).
  // This keeps the system stable without requiring credentials in dev.
  console.log(`[MESSAGING:${provider}] Order ${params.orderId} confirmation -> ${params.toPhone}`);
}

