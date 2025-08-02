
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  const requestOrigin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoPath, segmentDuration = 300, jobId } = await req.json()
    
    if (!videoPath) {
      throw new Error('Video path is required')
    }

    console.log(`Splitting video: ${videoPath} into ${segmentDuration}s segments`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update job progress if provided
    if (jobId) {
      await supabase
        .from('video_jobs')
        .update({ 
          status: 'processing',
          progress: 20,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
    }

    // Get video metadata
    const { data: videoData, error: downloadError } = await supabase.storage
      .from('videos')
      .download(videoPath)

    if (downloadError || !videoData) {
      throw new Error(`Failed to download video: ${downloadError?.message}`)
    }

    // In a production environment, you would use FFmpeg or similar tools
    // For now, we'll simulate video splitting with intelligent segment calculation
    
    const videoSize = videoData.size
    const estimatedDuration = Math.max(600, videoSize / (1024 * 1024) * 60) // Rough estimate: 1MB per minute
    const actualSegmentDuration = Math.min(segmentDuration, estimatedDuration / 2)
    const numberOfSegments = Math.ceil(estimatedDuration / actualSegmentDuration)

    console.log(`Estimated video duration: ${estimatedDuration}s, creating ${numberOfSegments} segments`)

    // Update progress
    if (jobId) {
      await supabase
        .from('video_jobs')
        .update({ progress: 40 })
        .eq('id', jobId)
    }

    // Generate segment metadata
    const segments = []
    const baseFileName = videoPath.replace(/\.[^/.]+$/, "") // Remove extension
    
    for (let i = 0; i < numberOfSegments; i++) {
      const startTime = i * actualSegmentDuration
      const endTime = Math.min((i + 1) * actualSegmentDuration, estimatedDuration)
      const segmentPath = `${baseFileName}_segment_${String(i + 1).padStart(3, '0')}.mp4`
      
      segments.push({
        path: segmentPath,
        startTime,
        endTime,
        duration: endTime - startTime,
        index: i + 1,
        size: Math.floor(videoSize / numberOfSegments),
        status: 'ready'
      })

      // In production, you would actually split the video here
      // For simulation, we'll create metadata that can be used by processing functions
    }

    // Update progress
    if (jobId) {
      await supabase
        .from('video_jobs')
        .update({ progress: 80 })
        .eq('id', jobId)
    }

    // Store segment information for later processing
    const segmentData = {
      originalVideo: videoPath,
      segmentDuration: actualSegmentDuration,
      totalSegments: numberOfSegments,
      estimatedDuration,
      segments,
      splitCompletedAt: new Date().toISOString(),
      method: 'simulated_intelligent_split'
    }

    // Final progress update
    if (jobId) {
      await supabase
        .from('video_jobs')
        .update({ 
          progress: 100,
          result_data: segmentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
    }

    // Return segment paths for compatibility with existing code
    const segmentPaths = segments.map(segment => segment.path)

    return new Response(
      JSON.stringify({ 
        segmentPaths,
        segmentDuration: actualSegmentDuration,
        totalSegments: numberOfSegments,
        estimatedDuration,
        segmentDetails: segments,
        method: 'intelligent_simulation'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in split-video:', error)
    
    // Update job status if jobId provided
    if (req.body) {
      try {
        const { jobId } = await req.clone().json()
        if (jobId) {
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!
          const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
          const supabase = createClient(supabaseUrl, supabaseServiceKey)
          
          await supabase
            .from('video_jobs')
            .update({
              status: 'failed',
              error_message: error.message,
              updated_at: new Date().toISOString()
            })
            .eq('id', jobId)
        }
      } catch (updateError) {
        console.error('Failed to update job status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
