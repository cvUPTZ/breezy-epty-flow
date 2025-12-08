import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisIssue {
  category: string;
  severity: string;
  title: string;
  description: string;
  location: string;
  recommendation: string;
}

interface RequestBody {
  documentId: string;
  documentType: string;
  currentContent: any;
  selectedRecommendations: string[];
  selectedIssues: AnalysisIssue[];
  additionalContext: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { 
      documentId, 
      documentType, 
      currentContent, 
      selectedRecommendations, 
      selectedIssues,
      additionalContext 
    } = body;

    console.log(`Processing document: ${documentId}, type: ${documentType}`);
    console.log(`Recommendations: ${selectedRecommendations.length}, Issues: ${selectedIssues.length}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build the prompt for document finalization
    const systemPrompt = buildSystemPrompt(documentType);
    const userPrompt = buildUserPrompt(
      documentType,
      currentContent,
      selectedRecommendations,
      selectedIssues,
      additionalContext
    );

    console.log("Calling Lovable AI Gateway...");

    // Call Lovable AI Gateway with tool calling for structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "finalize_document",
              description: "Finalize a business document by applying recommendations and fixes",
              parameters: {
                type: "object",
                properties: {
                  updatedContent: {
                    type: "object",
                    description: "The updated document content with all fixes applied"
                  },
                  appliedChanges: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of changes that were applied"
                  },
                  coherenceScore: {
                    type: "number",
                    description: "Coherence score from 0 to 100"
                  },
                  summary: {
                    type: "string",
                    description: "Summary of all modifications made"
                  }
                },
                required: ["updatedContent", "appliedChanges", "coherenceScore", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "finalize_document" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Rate limit exceeded. Please try again in a few moments.",
            retryAfter: 30
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "AI credits exhausted. Please add funds to your Lovable workspace.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    console.log("AI Gateway response received");

    // Extract tool call result
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "finalize_document") {
      console.error("No valid tool call in response:", JSON.stringify(result));
      throw new Error("Invalid response from AI - no tool call");
    }

    let parsedArgs;
    try {
      parsedArgs = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error("Failed to parse tool arguments:", toolCall.function.arguments);
      throw new Error("Failed to parse AI response");
    }

    const finalDocument = {
      ...currentContent,
      ...parsedArgs.updatedContent,
      appliedChanges: parsedArgs.appliedChanges || [],
      coherenceScore: parsedArgs.coherenceScore || 0,
      finalizationSummary: parsedArgs.summary || "",
      lastFinalized: new Date().toISOString(),
    };

    console.log(`Document finalized with coherence score: ${parsedArgs.coherenceScore}`);

    return new Response(
      JSON.stringify({
        success: true,
        finalDocument,
        appliedRecommendations: selectedRecommendations.length,
        appliedFixes: selectedIssues.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error applying recommendations:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildSystemPrompt(documentType: string): string {
  const documentTypeLabels: Record<string, string> = {
    business_plan: "Business Plan",
    business_model_canvas: "Business Model Canvas",
    market_study: "Étude de Marché",
  };

  const typeLabel = documentTypeLabels[documentType] || documentType;

  return `Tu es un expert en stratégie d'entreprise et en rédaction de documents business professionnels.
Ta mission est de finaliser un ${typeLabel} en appliquant les recommandations et corrections sélectionnées.

Tu dois:
1. Analyser le document actuel et les modifications demandées
2. Appliquer chaque recommandation de manière cohérente
3. Corriger chaque problème identifié
4. Intégrer le contexte additionnel si pertinent
5. Assurer la cohérence globale du document
6. Maintenir le format et la structure du document original
7. Produire un document professionnel et bien structuré`;
}

function buildUserPrompt(
  documentType: string,
  currentContent: any,
  recommendations: string[],
  issues: AnalysisIssue[],
  additionalContext: string
): string {
  const issuesText = issues.length > 0 
    ? issues.map((issue, i) => `${i + 1}. **${issue.title}** (${issue.severity})
   - Description: ${issue.description}
   - Localisation: ${issue.location}
   - Correction suggérée: ${issue.recommendation}`).join("\n")
    : "Aucun problème à corriger.";

  const recommendationsText = recommendations.length > 0
    ? recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "Aucune recommandation spécifique.";

  return `## DOCUMENT ACTUEL
${JSON.stringify(currentContent, null, 2)}

## RECOMMANDATIONS À APPLIQUER
${recommendationsText}

## PROBLÈMES À CORRIGER
${issuesText}

## CONTEXTE ADDITIONNEL
${additionalContext || "Aucun contexte additionnel fourni."}

Utilise la fonction finalize_document pour retourner le document mis à jour avec toutes les corrections appliquées.`;
}
