
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoPath, startTime, endTime, focus } = await req.json()
    
    if (!videoPath || startTime === undefined || endTime === undefined) {
      throw new Error('Video path, start time, and end time are required')
    }

    console.log(`Processing video segment: ${videoPath} from ${startTime}s to ${endTime}s with focus: ${focus || 'events'}`)

    // Mock segment analysis based on focus
    let analysisResult = {
      events: [],
      statistics: {},
      heatmapData: [],
      trackingData: []
    }

    switch (focus) {
      case 'tracking':
        analysisResult.trackingData = [
          {
            timestamp: startTime,
            players: [
              { id: 'p1', x: 40, y: 25, team: 'home' },
              { id: 'p2', x: 60, y: 45, team: 'away' }
            ],
            ball: { x: 50, y: 35 }
          }
        ]
        break
      
      case 'statistics':
        analysisResult.statistics = {
          ballPossession: { home: 65, away: 35 },
          passes: { successful: 45, attempted: 52 },
          shots: 3,
          fouls: 2
        }
        break
      
      default: // events
        analysisResult.events = [
          {
            type: 'pass',
            timestamp: startTime + 5,
            confidence: 0.88,
            player: 'Player 7',
            team: 'home',
            coordinates: { x: 35, y: 40 }
          }
        ]
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
