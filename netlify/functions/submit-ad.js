import { getSupabaseAdmin } from './utils/supabase.js';
import { jsonResponse, errorResponse } from './utils/auth.js';
import { notifyAdminNewSubmission } from './utils/email.js';

const STRIPE_PRICES = {
  sidebar: { amount: 9900, label: 'Sidebar Ad — $99/mo' },
  banner: { amount: 14900, label: 'Banner Ad — $149/mo' },
  premium: { amount: 19900, label: 'Premium Bundle — $199/mo' }
};

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'Method not allowed');
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return errorResponse(400, 'Invalid JSON');
  }

  const { company, email, ad_package, website } = body;

  if (!company || !email || !ad_package) {
    return errorResponse(400, 'Missing required fields');
  }

  if (!STRIPE_PRICES[ad_package]) {
    return errorResponse(400, 'Invalid ad package');
  }

  const supabase = getSupabaseAdmin();

  // Create submission record
  const submission = {
    type: 'ad',
    business_name: company,
    contact_name: body.name || '',
    contact_email: email,
    contact_phone: body.phone || '',
    ad_package,
    ad_link_url: website || '',
    message: body.message || '',
    status: 'pending'
  };

  const { data, error } = await supabase
    .from('submissions')
    .insert(submission)
    .select()
    .single();

  if (error) {
    return errorResponse(500, error.message);
  }

  // Create Stripe Checkout Session
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey) {
    try {
      const price = STRIPE_PRICES[ad_package];
      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'success_url': `https://ricevillageshops.com/?payment_success=true&submission_id=${data.id}`,
          'cancel_url': 'https://ricevillageshops.com/?payment_cancelled=true',
          'customer_email': email,
          'client_reference_id': data.id,
          'line_items[0][price_data][currency]': 'usd',
          'line_items[0][price_data][product_data][name]': price.label,
          'line_items[0][price_data][unit_amount]': price.amount.toString(),
          'line_items[0][quantity]': '1'
        })
      });

      const session = await stripeRes.json();

      // Record payment
      await supabase.from('ad_payments').insert({
        submission_id: data.id,
        stripe_session_id: session.id,
        amount_cents: price.amount,
        status: 'pending'
      });

      // Notify admin
      notifyAdminNewSubmission(submission).catch(console.error);

      return jsonResponse({ success: true, id: data.id, checkout_url: session.url }, 201);
    } catch (err) {
      console.error('Stripe error:', err);
      return errorResponse(500, 'Payment setup failed');
    }
  }

  // No Stripe key — just save submission
  notifyAdminNewSubmission(submission).catch(console.error);
  return jsonResponse({ success: true, id: data.id }, 201);
}
