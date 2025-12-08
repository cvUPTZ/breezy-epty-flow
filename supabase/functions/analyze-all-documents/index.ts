import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getCorsHeaders } from "../_shared/cors.ts";

interface GlobalAnalysisResult {
  summary: string;
  overallQuality: number;
  commonIssues: string[];
  strengths: string[];
  recommendations: string[];
  documentComparison: {
    documentId: string;
    documentTitle: string;
    documentType: string;
    score: number;
    mainFindings: string[];
  }[];
  synergies: string[];
  contradictions: string[];
}

serve(async (req: Request) => {
  console.log("Function 'analyze-all-documents' invoked.");

  const requestOrigin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Fetch all business documents
    const { data: documents, error: fetchError } = await supabaseClient
      .from('business_documents')
      .select('*')
      .eq('is_supporting_document', false)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch documents: ${fetchError.message}`);
    }

    if (!documents || documents.length === 0) {
      throw new Error('No documents found to analyze');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Analyzing ${documents.length} documents globally`);

    // Prepare document summaries for analysis
    const documentSummaries = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.document_type,
      content: typeof doc.content === 'string' 
        ? doc.content.substring(0, 2000)
        : JSON.stringify(doc.content).substring(0, 2000),
    }));

    const systemPrompt = `Tu es un expert en analyse stratégique et business. 
Analyse l'ensemble des documents business fournis (business plans, business model canvas, études de marché) 
pour identifier:
1. Les forces communes et les opportunités
2. Les faiblesses récurrentes et problèmes systémiques
3. Les synergies possibles entre les documents
4. **INCOHÉRENCES CRITIQUES**: Détecte toutes les contradictions de données entre documents (chiffres, dates, stratégies, hypothèses)
5. **DONNÉES CONFLICTUELLES**: Identifie les valeurs numériques qui ne correspondent pas d'un document à l'autre
6. **HYPOTHÈSES CONTRADICTOIRES**: Signale les hypothèses business incompatibles entre documents
7. Une vision globale de la qualité stratégique et cohérence du portefeuille

FOCUS PRINCIPAL: Identifier et détailler TOUTES les incohérences de données entre les documents.`;

    const userPrompt = `
Nombre de documents à analyser: ${documents.length}

Documents:
${documentSummaries.map((doc, idx) => `
Document ${idx + 1}:
Type: ${doc.type}
Titre: ${doc.title}
Contenu: ${doc.content}...
`).join('\n\n')}

Utilise la fonction analyze_documents pour fournir une analyse globale complète.`;

    console.log("Calling Lovable AI Gateway...");

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
              name: "analyze_documents",
              description: "Provide a comprehensive analysis of all business documents",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "Global summary in 2-3 paragraphs"
                  },
                  overallQuality: {
                    type: "number",
                    description: "Overall quality score from 0 to 100"
                  },
                  commonIssues: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of common issues found across documents"
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of strengths found across documents"
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of recommendations for improvement"
                  },
                  documentComparison: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        documentId: { type: "string" },
                        documentTitle: { type: "string" },
                        documentType: { type: "string" },
                        score: { type: "number" },
                        mainFindings: { type: "array", items: { type: "string" } }
                      },
                      required: ["documentId", "documentTitle", "documentType", "score", "mainFindings"]
                    },
                    description: "Comparison of each document"
                  },
                  synergies: {
                    type: "array",
                    items: { type: "string" },
                    description: "Synergies found between documents"
                  },
                  contradictions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Contradictions and inconsistencies found between documents"
                  }
                },
                required: ["summary", "overallQuality", "commonIssues", "strengths", "recommendations", "documentComparison", "synergies", "contradictions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_documents" } }
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
    if (!toolCall || toolCall.function.name !== "analyze_documents") {
      console.error("No valid tool call in response:", JSON.stringify(result));
      throw new Error("Invalid response from AI - no tool call");
    }

    let analysisResult: GlobalAnalysisResult;
    try {
      analysisResult = JSON.parse(toolCall.function.arguments);
      
      // Ensure documentComparison has correct IDs
      if (analysisResult.documentComparison) {
        analysisResult.documentComparison = analysisResult.documentComparison.map((comp, idx) => ({
          ...comp,
          documentId: documentSummaries[idx]?.id || comp.documentId,
          documentTitle: documentSummaries[idx]?.title || comp.documentTitle,
          documentType: documentSummaries[idx]?.type || comp.documentType,
        }));
      }
      
      console.log("✓ Successfully parsed analysis result");
    } catch (parseError) {
      console.error("Failed to parse tool arguments:", toolCall.function.arguments);
      throw new Error("Failed to parse AI response");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: analysisResult,
        documentsAnalyzed: documents.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in analyze-all-documents:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
