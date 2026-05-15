import { getSupabaseAdmin } from './supabase.js';

// Verify admin JWT from Authorization header
export async function verifyAdmin(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing authorization header', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseAdmin();

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { error: 'Invalid token', status: 401 };
  }

  const role = user.app_metadata?.role;
  if (role !== 'admin') {
    return { error: 'Forbidden — admin access required', status: 403 };
  }

  return { user, token };
}

// Standard JSON error response
export function errorResponse(status, message) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: message })
  };
}

// Standard JSON success response
export function jsonResponse(data, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
}
