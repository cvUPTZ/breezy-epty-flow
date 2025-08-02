// supabase/functions/get-gemini-api-key/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  console.log("Function 'get-gemini-api-key' invoked.");

  const requestOrigin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request.");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (apiKey) {
      console.log("GEMINI_API_KEY found.");
      return new Response(
        JSON.stringify({ apiKey: apiKey }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      console.error("GEMINI_API_KEY not found in environment variables.");
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured in environment variables." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Error retrieving GEMINI_API_KEY:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
