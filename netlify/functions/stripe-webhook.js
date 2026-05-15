import { getSupabaseAdmin } from './utils/supabase.js';
import { sendEmail } from './utils/email.js';

// Simple HMAC verification for Stripe webhooks
async function verifyStripeSignature(payload, signature, secret) {
  if (!secret) return true; // Skip verification if no secret configured

  const crypto = await import('crypto');
  const elements = signature.split(',');
  const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1];
  const sig = elements.find(e => e.startsWith('v1='))?.split('=')[1];

  if (!timestamp || !sig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const signature = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret && signature) {
    const valid = await verifyStripeSignature(event.body, signature, webhookSecret);
    if (!valid) {
      return { statusCode: 400, body: 'Invalid signature' };
    }
  }

  let stripeEvent;
  try {
    stripeEvent = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const submissionId = session.client_reference_id;

    if (submissionId) {
      const supabase = getSupabaseAdmin();

      // Update payment status
      await supabase
        .from('ad_payments')
        .update({ status: 'completed', stripe_payment_intent: session.payment_intent })
        .eq('stripe_session_id', session.id);

      // Activate the ad
      const { data: submission } = await supabase
        .from('submissions')
        .update({ status: 'active' })
        .eq('id', submissionId)
        .select()
        .single();

      // Send confirmation email
      if (submission?.contact_email) {
        sendEmail({
          to: submission.contact_email,
          subject: 'Your ad is now live on Rice Village Shops!',
          html: `
            <h2>Payment Confirmed — Your Ad is Live!</h2>
            <p>Hi ${submission.contact_name || 'there'},</p>
            <p>Your <strong>${submission.ad_package}</strong> ad for <strong>${submission.business_name}</strong> is now live on Rice Village Shops.</p>
            <p><a href="https://ricevillageshops.com">View the Site</a></p>
            <p>Thank you for advertising with us!</p>
          `
        }).catch(console.error);
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
}
