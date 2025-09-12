import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  try {
    let club_id = null;
    try {
        const body = await req.json();
        club_id = body.club_id;
    } catch (e) {
        // Ignore errors if no body is provided
    }

    let query = supabase
      .from('teams')
      .select('*, scouted_players(*)')
      .eq('country', 'Algeria');

    if (club_id) {
      query = query.eq('id', club_id).single();
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
