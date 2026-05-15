import { getSupabaseWithAuth } from './utils/supabase.js';
import { verifyAdmin, jsonResponse, errorResponse } from './utils/auth.js';

export async function handler(event) {
  const auth = await verifyAdmin(event);
  if (auth.error) return errorResponse(auth.status, auth.error);

  const supabase = getSupabaseWithAuth(auth.token);
  const params = event.queryStringParameters || {};

  // GET — list all posts (including drafts)
  if (event.httpMethod === 'GET') {
    if (params.slug) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', params.slug)
        .single();
      if (error) return errorResponse(404, 'Post not found');
      return jsonResponse(data);
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return errorResponse(500, error.message);
    return jsonResponse(data);
  }

  // POST — create post
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);

    if (body.is_published && !body.published_at) {
      body.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase.from('blog_posts').insert(body).select().single();
    if (error) return errorResponse(500, error.message);
    return jsonResponse(data, 201);
  }

  // PUT — update post
  if (event.httpMethod === 'PUT') {
    const body = JSON.parse(event.body);
    const id = params.id || body.id;
    if (!id) return errorResponse(400, 'Missing post id');

    delete body.id;

    // Set published_at if publishing for the first time
    if (body.is_published && !body.published_at) {
      body.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase.from('blog_posts').update(body).eq('id', id).select().single();
    if (error) return errorResponse(500, error.message);
    return jsonResponse(data);
  }

  // DELETE
  if (event.httpMethod === 'DELETE') {
    const id = params.id;
    if (!id) return errorResponse(400, 'Missing post id');

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) return errorResponse(500, error.message);
    return jsonResponse({ success: true });
  }

  return errorResponse(405, 'Method not allowed');
}
