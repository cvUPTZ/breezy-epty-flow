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

    const { errorDetails } = await req.json()

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
    }

    // Log error using the database function
    const { data, error } = await supabaseClient.rpc('log_error', {
      p_error_type: errorDetails.errorType,
      p_error_category: errorDetails.errorCategory,
      p_error_code: errorDetails.errorCode,
      p_error_message: errorDetails.errorMessage,
      p_stack_trace: errorDetails.stackTrace,
      p_component_name: errorDetails.componentName,
      p_function_name: errorDetails.functionName,
      p_url: errorDetails.url,
      p_user_agent: errorDetails.userAgent,
      p_session_id: errorDetails.sessionId,
      p_request_id: errorDetails.requestId,
      p_metadata: errorDetails.metadata || {},
      p_severity: errorDetails.severity || 'error'
    })

    if (error) {
      console.error('Error logging to database:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to log error',
          details: error.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        errorId: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})