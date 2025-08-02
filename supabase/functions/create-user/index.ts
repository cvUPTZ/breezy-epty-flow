
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req)=>{
  const requestOrigin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method Not Allowed'
      }), {
        status: 405,
        headers: corsHeaders
      });
    }
    // Log the request for debugging
    console.log('Request received:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      url: req.url
    });
    const { email, password, fullName, role } = await req.json();
    if (!email || !password || !fullName || !role) {
      return new Response(JSON.stringify({
        error: 'Missing required fields.'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    const allowedRoles = [
      'admin',
      'manager',
      'teacher',
      'user',
      'tracker'
    ];
    if (!allowedRoles.includes(role)) {
      return new Response(JSON.stringify({
        error: 'Invalid role specified.'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase config');
      return new Response(JSON.stringify({
        error: 'Missing Supabase config.'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Missing or invalid Authorization header.'
      }), {
        status: 401,
        headers: corsHeaders
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: callingUser }, error: callingUserError } = await supabaseAdmin.auth.getUser(token);
    if (callingUserError || !callingUser) {
      console.error('Auth error:', callingUserError);
      return new Response(JSON.stringify({
        error: callingUserError?.message || 'Authentication failed for the calling user.'
      }), {
        status: 401,
        headers: corsHeaders
      });
    }
    // Check calling user's role - first check profiles table, then fallback to auth metadata
    const { data: callingUserProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', callingUser.id).single();
    const callingUserRole = callingUserProfile?.role || callingUser.user_metadata?.role || callingUser.raw_user_meta_data?.role;
    if (callingUserRole !== 'admin') {
      return new Response(JSON.stringify({
        error: 'Forbidden: User is not an admin.'
      }), {
        status: 403,
        headers: corsHeaders
      });
    }
    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
        role
      },
      email_confirm: true
    });
    if (authError || !authData?.user) {
      console.error('Auth creation error:', authError);
      throw new Error(`Auth error: ${authError?.message || 'User creation failed.'}`);
    }
    const userId = authData.user.id;
    // Create profile with role and email included
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      email: email,
      full_name: fullName,
      role: role
    });
    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Cleanup: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`Profile error: ${profileError.message}`);
    }
    console.log('User created successfully:', userId);
    return new Response(JSON.stringify({
      message: 'User created successfully',
      userId
    }), {
      status: 201,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Create-user error:', error);
    const message = error?.message || 'Unexpected error.';
    return new Response(JSON.stringify({
      error: message
    }), {
      status: message.startsWith('Auth error:') || message.startsWith('Profile error:') ? 400 : 500,
      headers: corsHeaders
    });
  }
});
