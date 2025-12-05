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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Build the prompt for document finalization
    const prompt = buildFinalizationPrompt(
      documentType,
      currentContent,
      selectedRecommendations,
      selectedIssues,
      additionalContext
    );

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No response from Gemini");
    }

    // Parse the generated content
    const finalDocument = parseGeneratedDocument(generatedText, documentType, currentContent);

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

function buildFinalizationPrompt(
  documentType: string,
  currentContent: any,
  recommendations: string[],
  issues: AnalysisIssue[],
  additionalContext: string
): string {
  const documentTypeLabels: Record<string, string> = {
    business_plan: "Business Plan",
    business_model_canvas: "Business Model Canvas",
    market_study: "Étude de Marché",
  };

  const typeLabel = documentTypeLabels[documentType] || documentType;

  return `Tu es un expert en stratégie d'entreprise et en rédaction de documents business. 
Ta mission est de finaliser un ${typeLabel} en appliquant les recommandations et corrections sélectionnées.

## DOCUMENT ACTUEL
${JSON.stringify(currentContent, null, 2)}

## RECOMMANDATIONS À APPLIQUER
${recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

## PROBLÈMES À CORRIGER
${issues.map((issue, i) => `
${i + 1}. **${issue.title}** (${issue.severity})
   - Description: ${issue.description}
   - Localisation: ${issue.location}
   - Correction suggérée: ${issue.recommendation}
`).join("\n")}

## CONTEXTE ADDITIONNEL
${additionalContext || "Aucun contexte additionnel fourni."}

## INSTRUCTIONS
1. Analyse le document actuel et les modifications demandées
2. Applique chaque recommandation de manière cohérente
3. Corrige chaque problème identifié
4. Intègre le contexte additionnel si pertinent
5. Assure la cohérence globale du document
6. Maintiens le format et la structure du document original

## FORMAT DE RÉPONSE
Retourne un JSON valide avec la structure suivante:
{
  "updatedContent": {
    // Le contenu mis à jour du document, avec la même structure que l'original
  },
  "appliedChanges": [
    // Liste des modifications appliquées (description textuelle)
  ],
  "coherenceScore": number, // Score de cohérence de 0 à 100
  "summary": "Résumé des modifications apportées"
}

Assure-toi que le JSON est valide et complet.`;
}

function parseGeneratedDocument(
  generatedText: string,
  documentType: string,
  currentContent: any
): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...currentContent,
        ...parsed.updatedContent,
        appliedChanges: parsed.appliedChanges || [],
        coherenceScore: parsed.coherenceScore || 0,
        finalizationSummary: parsed.summary || "",
        lastFinalized: new Date().toISOString(),
      };
    }

    // If JSON parsing fails, return a structured response with the text
    return {
      ...currentContent,
      appliedChanges: ["Document mis à jour avec les recommandations"],
      generatedNarrative: generatedText,
      lastFinalized: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error parsing generated document:", error);
    return {
      ...currentContent,
      appliedChanges: ["Document traité - vérification manuelle recommandée"],
      rawGeneration: generatedText,
      parseError: true,
      lastFinalized: new Date().toISOString(),
    };
  }
}
