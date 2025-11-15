
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Using a more reliable LiveKit import
const LIVEKIT_SDK_URL = 'https://esm.sh/livekit-server-sdk@2.0.5';


import { getCorsHeaders } from '../_shared/cors.ts'

interface TokenRequest {
  roomId: string;
  participantIdentity: string;
  participantName: string;
}

serve(async (req: Request) => {
  const requestOrigin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { roomId, participantIdentity, participantName } = await req.json() as TokenRequest;

    const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY');
    const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET');
    const LIVEKIT_URL = Deno.env.get('LIVEKIT_URL');


    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      throw new Error('LiveKit credentials not configured');
    }

    // Import AccessToken dynamically
    const { AccessToken } = await import(LIVEKIT_SDK_URL);

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantIdentity,
      name: participantName,
    });

    token.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    return new Response(JSON.stringify({ token: jwt, livekitUrl: LIVEKIT_URL }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
