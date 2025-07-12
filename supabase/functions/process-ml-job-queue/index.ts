
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get next job in queue
    const { data: job, error: fetchError } = await supabaseClient
      .from('ml_detection_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (fetchError || !job) {
      return new Response(
        JSON.stringify({ message: 'No jobs in queue' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark job as processing
    await supabaseClient
      .from('ml_detection_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    // Process the job (this would typically call your ML service)
    try {
      const mlServiceUrl = Deno.env.get('ML_DETECTION_SERVICE_URL') || 'http://localhost:8000'
      
      const response = await fetch(`${mlServiceUrl}/api/detect/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('ML_SERVICE_API_KEY')}`,
        },
        body: JSON.stringify({
          video_url: job.video_url,
          config: job.config,
          callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/ml-job-callback`,
          job_id: job.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`ML service error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      // Update job with external job ID for tracking
      await supabaseClient
        .from('ml_detection_jobs')
        .update({
          external_job_id: result.job_id,
          progress: 5, // Started processing
        })
        .eq('id', job.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          job_id: job.id,
          external_job_id: result.job_id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (processingError) {
      // Mark job as failed
      await supabaseClient
        .from('ml_detection_jobs')
        .update({
          status: 'failed',
          error_message: processingError.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      throw processingError
    }

  } catch (error) {
    console.error('Error processing ML job queue:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
