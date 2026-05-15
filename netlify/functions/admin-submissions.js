import { getSupabaseWithAuth, getSupabaseAdmin } from './utils/supabase.js';
import { verifyAdmin, jsonResponse, errorResponse } from './utils/auth.js';
import { notifySubmitterApproved } from './utils/email.js';

export async function handler(event) {
  const auth = await verifyAdmin(event);
  if (auth.error) return errorResponse(auth.status, auth.error);

  const supabase = getSupabaseWithAuth(auth.token);
  const admin = getSupabaseAdmin();
  const params = event.queryStringParameters || {};

  // GET — list submissions
  if (event.httpMethod === 'GET') {
    let query = supabase.from('submissions').select('*').order('submitted_at', { ascending: false });

    if (params.status) query = query.eq('status', params.status);
    if (params.type) query = query.eq('type', params.type);

    const { data, error } = await query;
    if (error) return errorResponse(500, error.message);
    return jsonResponse(data);
  }

  // PUT — approve/reject submission
  if (event.httpMethod === 'PUT') {
    const body = JSON.parse(event.body);
    const id = params.id || body.id;
    if (!id) return errorResponse(400, 'Missing submission id');

    const update = {
      status: body.status,
      admin_notes: body.admin_notes || '',
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.user.id
    };

    const { data: submission, error } = await admin
      .from('submissions')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) return errorResponse(500, error.message);

    // If approving a listing submission, create the listing
    if (body.status === 'approved' && submission.type === 'listing') {
      const newListing = {
        name: submission.business_name,
        category: submission.category,
        subcategory: submission.subcategory || '',
        address: submission.address || '',
        description: submission.description || '',
        website: submission.website || '',
        phone: submission.phone || '',
        lat: body.lat || 29.7165, // Default to Rice Village center
        lng: body.lng || -95.4115,
        is_active: true
      };

      const { error: listingError } = await admin.from('listings').insert(newListing);
      if (listingError) {
        console.error('Failed to create listing from submission:', listingError);
      }

      // Notify submitter
      notifySubmitterApproved(submission).catch(console.error);
    }

    return jsonResponse(submission);
  }

  // DELETE
  if (event.httpMethod === 'DELETE') {
    const id = params.id;
    if (!id) return errorResponse(400, 'Missing submission id');

    const { error } = await admin.from('submissions').delete().eq('id', id);
    if (error) return errorResponse(500, error.message);
    return jsonResponse({ success: true });
  }

  return errorResponse(405, 'Method not allowed');
}
