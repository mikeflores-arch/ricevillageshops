import { getSupabase } from './utils/supabase.js';
import { jsonResponse, errorResponse } from './utils/auth.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return errorResponse(405, 'Method not allowed');
  }

  const supabase = getSupabase();
  const params = event.queryStringParameters || {};

  // Single post by slug
  if (params.slug) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      return errorResponse(404, 'Post not found');
    }
    return jsonResponse(data);
  }

  // List posts (without full content for performance)
  let query = supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, tags, image, author, read_time, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category);
  }

  if (params.limit) {
    query = query.limit(parseInt(params.limit));
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse(500, error.message);
  }

  return jsonResponse(data);
}
