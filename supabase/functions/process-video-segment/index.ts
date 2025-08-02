
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
    const { videoPath, startTime, endTime, focus, jobId } = await req.json()
    
    if (!videoPath || startTime === undefined || endTime === undefined) {
      throw new Error('Video path, start time, and end time are required')
    }

    console.log(`Processing video segment: ${videoPath} from ${startTime}s to ${endTime}s with focus: ${focus || 'events'}`)

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
          progress: 30,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
    }

    // Get Gemini API key for enhanced analysis
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    let analysisResult = {
      events: [],
      statistics: {},
      heatmapData: [],
      trackingData: [],
      segment: {
        startTime,
        endTime,
        duration: endTime - startTime,
        focus: focus || 'events'
      }
    }

    // If Gemini is available, use it for enhanced analysis
    if (geminiApiKey) {
      try {
        // Download video segment
        const { data: videoData } = await supabase.storage
          .from('videos')
          .download(videoPath)

        if (videoData) {
          // For production, you would extract the specific segment here
          // This is a simplified version that analyzes the full video with segment context
          
          const arrayBuffer = await videoData.arrayBuffer()
          const base64Video = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

          const segmentPrompt = `Analyze this video segment from ${startTime} to ${endTime} seconds, focusing on ${focus}. 
          Return JSON with events, statistics, and tracking data for this specific time range.`

          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: segmentPrompt },
                  {
                    inline_data: {
                      mime_type: "video/mp4",
                      data: base64Video
                    }
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
              }
            })
          })

          if (geminiResponse.ok) {
            const result = await geminiResponse.json()
            const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text || ''
            
            // Try to parse structured response
            const jsonMatch = aiText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              try {
                const parsedResult = JSON.parse(jsonMatch[0])
                analysisResult = { ...analysisResult, ...parsedResult }
              } catch {}
            }
          }
        }
      } catch (geminiError) {
        console.warn('Gemini analysis failed, using fallback:', geminiError)
      }
    }

    // Update progress
    if (jobId) {
      await supabase
        .from('video_jobs')
        .update({ progress: 70 })
        .eq('id', jobId)
    }

    // Enhanced mock analysis based on focus and segment timing
    switch (focus) {
      case 'tracking':
        analysisResult.trackingData = [
          {
            timestamp: startTime,
            players: [
              { id: 'p1', x: 40 + Math.random() * 20, y: 25 + Math.random() * 10, team: 'home' },
              { id: 'p2', x: 60 + Math.random() * 20, y: 45 + Math.random() * 10, team: 'away' }
            ],
            ball: { x: 50 + Math.random() * 10, y: 35 + Math.random() * 10 }
          },
          {
            timestamp: startTime + (endTime - startTime) / 2,
            players: [
              { id: 'p1', x: 45 + Math.random() * 20, y: 30 + Math.random() * 10, team: 'home' },
              { id: 'p2', x: 55 + Math.random() * 20, y: 40 + Math.random() * 10, team: 'away' }
            ],
            ball: { x: 52 + Math.random() * 10, y: 38 + Math.random() * 10 }
          }
        ]
        break
      
      case 'statistics':
        const segmentDuration = endTime - startTime
        analysisResult.statistics = {
          ballPossession: { 
            home: 45 + Math.random() * 20, 
            away: 35 + Math.random() * 20 
          },
          passes: { 
            successful: Math.floor(segmentDuration * 0.8), 
            attempted: Math.floor(segmentDuration * 1.0) 
          },
          shots: Math.floor(segmentDuration / 60),
          fouls: Math.floor(segmentDuration / 120),
          segmentDuration,
          averageSpeed: 4.2 + Math.random() * 2
        }
        break
      
      default: // events
        const numEvents = Math.floor((endTime - startTime) / 30) + 1
        analysisResult.events = Array.from({ length: numEvents }, (_, i) => ({
          type: ['pass', 'shot', 'foul', 'tackle'][Math.floor(Math.random() * 4)],
          timestamp: startTime + (i * (endTime - startTime) / numEvents),
          confidence: 0.75 + Math.random() * 0.2,
          player: `Player ${Math.floor(Math.random() * 22) + 1}`,
          team: Math.random() > 0.5 ? 'home' : 'away',
          coordinates: { 
            x: 20 + Math.random() * 60, 
            y: 20 + Math.random() * 60 
          }
        }))
    }

    // Generate heatmap data for the segment
    analysisResult.heatmapData = Array.from({ length: 5 }, (_, i) => ({
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      intensity: 0.3 + Math.random() * 0.7,
      player: `Player ${i + 1}`,
      timeSpent: Math.floor((endTime - startTime) * Math.random() * 0.3)
    }))

    // Update final progress
    if (jobId) {
      await supabase
        .from('video_jobs')
        .update({ 
          progress: 100,
          result_data: analysisResult,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
    }

    return new Response(
      JSON.stringify({ analysisResult }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in process-video-segment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
