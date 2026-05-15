import { getSupabase } from './utils/supabase.js';
import { jsonResponse, errorResponse } from './utils/auth.js';

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

  const supabase = getSupabase();

  if (body.action === 'login') {
    const { email, password } = body;
    if (!email || !password) {
      return errorResponse(400, 'Email and password required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return errorResponse(401, 'Invalid credentials');
    }

    // Check admin role
    const role = data.user?.app_metadata?.role;
    if (role !== 'admin') {
      return errorResponse(403, 'Not an admin account');
    }

    return jsonResponse({
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  }

  if (body.action === 'refresh') {
    const { refresh_token } = body;
    if (!refresh_token) {
      return errorResponse(400, 'Refresh token required');
    }

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) {
      return errorResponse(401, 'Invalid refresh token');
    }

    return jsonResponse({
      token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
  }

  return errorResponse(400, 'Invalid action');
}
