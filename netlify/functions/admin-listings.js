import { getSupabaseWithAuth } from './utils/supabase.js';
import { verifyAdmin, jsonResponse, errorResponse } from './utils/auth.js';

export async function handler(event) {
  const auth = await verifyAdmin(event);
  if (auth.error) return errorResponse(auth.status, auth.error);

  const supabase = getSupabaseWithAuth(auth.token);
  const params = event.queryStringParameters || {};

  // GET — list all listings (including inactive)
  if (event.httpMethod === 'GET') {
    let query = supabase.from('listings').select('*').order('sort_order', { ascending: true });

    if (params.category) query = query.eq('category', params.category);
    if (params.search) {
      const term = `%${params.search}%`;
      query = query.or(`name.ilike.${term},description.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) return errorResponse(500, error.message);
    return jsonResponse(data);
  }

  // POST — create listing
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    const { data, error } = await supabase.from('listings').insert(body).select().single();
    if (error) return errorResponse(500, error.message);
    return jsonResponse(data, 201);
  }

  // PUT — update listing
  if (event.httpMethod === 'PUT') {
    const body = JSON.parse(event.body);
    const id = params.id || body.id;
    if (!id) return errorResponse(400, 'Missing listing id');

    delete body.id;
    const { data, error } = await supabase.from('listings').update(body).eq('id', id).select().single();
    if (error) return errorResponse(500, error.message);
    return jsonResponse(data);
  }

  // DELETE — soft delete (set is_active = false)
  if (event.httpMethod === 'DELETE') {
    const id = params.id;
    if (!id) return errorResponse(400, 'Missing listing id');

    const { error } = await supabase.from('listings').update({ is_active: false }).eq('id', id);
    if (error) return errorResponse(500, error.message);
    return jsonResponse({ success: true });
  }

  return errorResponse(405, 'Method not allowed');
}
