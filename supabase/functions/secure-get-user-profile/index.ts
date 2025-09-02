import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'
import { getCorsHeaders } from '../_shared/cors.ts'

interface ProfileData {
  id: string;
  email: string;
  role: string;
  full_name: string;
  custom_permissions?: any;
}

serve(async (req: Request) => {
  const requestOrigin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.log('Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError) {
      console.log('Auth error:', authError.message);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!user) {
      console.log('No user found from token');
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile with security checks
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, role, full_name, custom_permissions')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user roles from user_roles table
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError)
    }

    const roles = userRoles?.map(r => r.role) || []

    // Log security event for profile access
    await supabaseClient
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        action: 'profile_access',
        resource_type: 'user_profile',
        resource_id: user.id,
        details: { accessed_at: new Date().toISOString() }
      })

    const profileData: ProfileData = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
      custom_permissions: profile.custom_permissions
    }

    return new Response(
      JSON.stringify({ 
        profile: profileData,
        roles: roles,
        session_valid: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Profile fetch error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})