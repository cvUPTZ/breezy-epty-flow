// supabase/functions/analyze-codebase/index.ts
// This function now acts as a lightweight request handler.
// It creates a job record and triggers the background processing function.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

console.log("Request Code Analysis function booted");

serve(async (req) => {
  const requestOrigin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // 2. Get the user from the token
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. Get the payload from the request
    const payload = await req.json();
    if (!payload.githubUrl && !payload.filePaths) {
      return new Response(JSON.stringify({ error: "Missing githubUrl or filePaths in payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 4. Insert a new job into the database
    const { data: job, error: insertError } = await supabaseClient
      .from('code_analysis_jobs')
      .insert({
        user_id: user.id,
        status: 'pending',
        payload: payload,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 5. Asynchronously invoke the processing function
    // We use the service_role key for this internal invocation
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Note: We don't `await` this call. This is "fire-and-forget".
    supabaseAdmin.functions.invoke('process-code-analysis-job', {
      body: { jobId: job.id },
    });

    console.log(`Successfully created and invoked job ${job.id}`);

    // 6. Return the job ID to the client immediately
    return new Response(
      JSON.stringify({ jobId: job.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error creating analysis job:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
