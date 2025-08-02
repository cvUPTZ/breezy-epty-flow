
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  const requestOrigin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('LiveKit token function called')
    
    // Check required environment variables
    const livekitUrl = Deno.env.get('LIVEKIT_URL')
    const livekitApiKey = Deno.env.get('LIVEKIT_API_KEY')
    const livekitApiSecret = Deno.env.get('LIVEKIT_API_SECRET')
    
    console.log('Environment check:', {
      hasUrl: !!livekitUrl,
      hasApiKey: !!livekitApiKey,
      hasApiSecret: !!livekitApiSecret,
      url: livekitUrl ? livekitUrl.substring(0, 20) + '...' : 'missing'
    })
    
    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
      console.error('Missing LiveKit environment variables')
      throw new Error('LiveKit configuration missing. Please check environment variables.')
    }

    const { roomId, userId, userName, userRole } = await req.json()
    
    console.log('Token request for:', { roomId, userId, userName, userRole })
    
    if (!roomId || !userId) {
      throw new Error('roomId and userId are required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the room exists and user has access
    const { data: room, error: roomError } = await supabase
      .from('voice_rooms')
      .select('*')
      .eq('id', roomId)
      .eq('is_active', true)
      .single()

    if (roomError || !room) {
      console.error('Room verification failed:', roomError)
      throw new Error(`Voice room not found or inactive: ${roomId}`)
    }

    console.log('Room verified:', room.name)

    // Use a simple token generation approach for development
    // In production, you should use the official LiveKit server SDK
    const tokenPayload = {
      iss: livekitApiKey,
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      nbf: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(),
      room: roomId,
      permissions: {
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        hidden: false,
        recorder: false
      },
      metadata: JSON.stringify({
        userId,
        userName: userName || userId,
        userRole: userRole || 'tracker'
      })
    }

    console.log('Generating token with payload:', {
      ...tokenPayload,
      permissions: tokenPayload.permissions
    })

    // Simple base64 encoding for development
    // Note: This is a simplified token generation. In production, use proper JWT signing
    const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }))
    const payload = btoa(JSON.stringify(tokenPayload))
    const signature = btoa(`${livekitApiSecret}-${roomId}-${userId}`) // Simplified signature
    
    const token = `${header}.${payload}.${signature}`
    
    console.log('Token generated successfully')

    return new Response(
      JSON.stringify({
        token,
        serverUrl: livekitUrl,
        roomId,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('LiveKit token generation error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to generate LiveKit token',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
