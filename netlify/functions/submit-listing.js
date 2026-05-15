import { getSupabaseAdmin } from './utils/supabase.js';
import { jsonResponse, errorResponse } from './utils/auth.js';
import { notifyAdminNewSubmission } from './utils/email.js';

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

  const { business_name, category, address, description, contact_name, contact_email } = body;

  if (!business_name || !category || !address || !description || !contact_name || !contact_email) {
    return errorResponse(400, 'Missing required fields');
  }

  const supabase = getSupabaseAdmin();

  const submission = {
    type: 'listing',
    business_name,
    contact_name,
    contact_email,
    contact_phone: body.contact_phone || '',
    category,
    subcategory: body.subcategory || '',
    address,
    website: body.website || '',
    phone: body.phone || '',
    description,
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

  // Send email notification (non-blocking)
  notifyAdminNewSubmission(submission).catch(err =>
    console.error('Email notification failed:', err)
  );

  return jsonResponse({ success: true, id: data.id }, 201);
}
