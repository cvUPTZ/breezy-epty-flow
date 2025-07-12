
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { job_id, status, progress, results, error_message } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const updateData: any = {
      progress: progress || 0,
    }

    if (status === 'completed') {
      updateData.status = 'completed'
      updateData.results = results
      updateData.completed_at = new Date().toISOString()
      updateData.progress = 100
    } else if (status === 'failed') {
      updateData.status = 'failed'
      updateData.error_message = error_message
      updateData.completed_at = new Date().toISOString()
    } else if (status === 'processing') {
      updateData.progress = Math.min(progress, 99) // Don't set to 100 until completed
    }

    const { error } = await supabaseClient
      .from('ml_detection_jobs')
      .update(updateData)
      .eq('id', job_id)

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`)
    }

    // If completed, trigger any post-processing
    if (status === 'completed' && results) {
      // Store results in a separate table for better querying
      await supabaseClient
        .from('ml_detection_results')
        .insert({
          job_id,
          results,
          created_at: new Date().toISOString(),
        })
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error handling ML job callback:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
