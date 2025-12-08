import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  const requestOrigin = req.headers.get('Origin');
  const cors = getCorsHeaders(requestOrigin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const { references, documents } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    if (!references?.length || !documents?.length) {
      return new Response(
        JSON.stringify({ success: true, issues: [] }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const prompt = `Analyse ces documents business et compare-les aux données de référence pour détecter les incohérences.

DONNÉES DE RÉFÉRENCE:
${JSON.stringify(references.slice(0, 20), null, 2)}

DOCUMENTS À ANALYSER:
${documents.slice(0, 5).map((d: any) => `
Document: ${d.title} (${d.document_type})
Contenu: ${JSON.stringify(d.content).substring(0, 1500)}
`).join('\n')}

Utilise la fonction detect_issues pour retourner les écarts trouvés.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Tu es un expert en analyse de cohérence documentaire. Détecte les écarts entre les documents et les données de référence." },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "detect_issues",
            description: "Report discrepancies found between documents and reference data",
            parameters: {
              type: "object",
              properties: {
                issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      document_id: { type: "string" },
                      key_name: { type: "string" },
                      issue_type: { type: "string", enum: ["value_mismatch", "missing_reference", "methodology_conflict"] },
                      severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                      expected_value: { type: "string" },
                      found_value: { type: "string" },
                      document_location: { type: "string" },
                      description: { type: "string" }
                    },
                    required: ["document_id", "key_name", "issue_type", "severity", "description"]
                  }
                }
              },
              required: ["issues"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "detect_issues" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ success: false, error: "Rate limit" }), { status: 429, headers: { ...cors, "Content-Type": "application/json" } });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    const issues = toolCall ? JSON.parse(toolCall.function.arguments).issues : [];

    return new Response(
      JSON.stringify({ success: true, issues }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
