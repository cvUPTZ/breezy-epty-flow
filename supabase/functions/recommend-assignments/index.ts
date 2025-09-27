import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('Recommend Assignments function with placeholder logic booting up...');

// The Supabase client is initialized with the service role key for admin-level access.
// These environment variables are expected to be set in the Supabase project settings.
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { matchId } = await req.json();
    if (!matchId) {
      throw new Error('Match ID is required.');
    }

    // 1. Fetch available trackers
    const { data: trackers, error: trackersError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'tracker');

    if (trackersError) throw trackersError;
    if (!trackers || trackers.length === 0) {
      throw new Error('No available trackers found.');
    }

    // 2. Fetch the match to get opponent players
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('away_team_players')
      .eq('id', matchId)
      .single();

    if (matchError) throw matchError;
    if (!match || !match.away_team_players || match.away_team_players.length === 0) {
      throw new Error('Could not find opponent players for the specified match.');
    }

    // 3. Create a simple, hardcoded recommendation using the fetched data
    const firstAvailableTracker = trackers[0];
    // Assuming the players are stored as an array of objects with a 'name' property
    const targetPlayer = match.away_team_players[0];

    const recommendation = {
      message: `Placeholder recommendation for match ${matchId}.`,
      suggestion: `Assign tracker ${firstAvailableTracker.full_name || firstAvailableTracker.id} to opponent player ${targetPlayer.name || 'N/A'}.`,
      reason: 'This is a placeholder. In a real scenario, this would be based on analyzing player threat levels and tracker specialties.',
    };

    return new Response(
      JSON.stringify({ recommendation }),
      { headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      },
    );
  } catch (error) {
    console.error('Error in recommend-assignments function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }
});