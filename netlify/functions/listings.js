import { getSupabase } from './utils/supabase.js';
import { jsonResponse, errorResponse } from './utils/auth.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return errorResponse(405, 'Method not allowed');
  }

  const supabase = getSupabase();
  const params = event.queryStringParameters || {};

  let query = supabase
    .from('listings')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.search) {
    const term = `%${params.search}%`;
    query = query.or(`name.ilike.${term},description.ilike.${term},subcategory.ilike.${term},address.ilike.${term}`);
  }

  if (params.limit) {
    query = query.limit(parseInt(params.limit));
  }

  if (params.offset) {
    query = query.range(parseInt(params.offset), parseInt(params.offset) + (parseInt(params.limit) || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse(500, error.message);
  }

  return jsonResponse(data);
}
