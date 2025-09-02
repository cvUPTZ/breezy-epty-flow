import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  const requestOrigin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } }
      }
    )

    // Validate the current session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid session',
          auth_uid: null
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user exists in profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Profile not found',
          auth_uid: user.id
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log session validation
    await supabaseClient
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        action: 'session_validation',
        resource_type: 'auth_session',
        resource_id: user.id,
        details: { 
          validated_at: new Date().toISOString(),
          user_agent: req.headers.get('user-agent') || 'unknown'
        }
      })

    return new Response(
      JSON.stringify({ 
        valid: true,
        auth_uid: user.id,
        role: profile.role,
        session_expires_at: user.session?.expires_at || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Session validation error:', error)
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Session validation failed',
        auth_uid: null
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})