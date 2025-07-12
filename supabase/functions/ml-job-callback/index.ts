
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
    const { jobId, status, progress, results, error: jobError } = await req.json()
    
    if (!jobId) {
      throw new Error('Job ID is required')
    }

    console.log(`Received callback for job ${jobId}: status=${status}, progress=${progress}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update job based on callback data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status) updateData.status = status
    if (progress !== undefined) updateData.progress = progress
    if (results) updateData.result_data = results
    if (jobError) updateData.error_message = jobError

    const { error: updateError } = await supabase
      .from('video_jobs')
      .update(updateData)
      .eq('id', jobId)

    if (updateError) {
      throw new Error(`Failed to update job: ${updateError.message}`)
    }

    console.log(`Successfully updated job ${jobId}`)

    return new Response(
      JSON.stringify({ success: true, message: `Job ${jobId} updated successfully` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in ml-job-callback:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
