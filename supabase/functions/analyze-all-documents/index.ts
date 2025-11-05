import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getCorsHeaders } from "../_shared/cors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch documents: ${fetchError.message}`);
    }

    if (!documents || documents.length === 0) {
      throw new Error('No documents found to analyze');
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log(`Analyzing ${documents.length} documents globally`);

    // Prepare document summaries for analysis
    const documentSummaries = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.document_type,
      content: doc.content?.data || JSON.stringify(doc.content),
    }));

    const systemPrompt = `Tu es un expert en analyse stratégique et business. 
Analyse l'ensemble des documents business fournis (business plans, business model canvas, études de marché) 
pour identifier:
1. Les forces communes et les opportunités
2. Les faiblesses récurrentes et problèmes systémiques
3. Les synergies possibles entre les documents
4. Les contradictions et incohérences entre les documents
5. Une vision globale de la qualité stratégique

IMPORTANT: Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte additionnel avant ou après.
Assure-toi que toutes les chaînes de caractères sont correctement échappées et que le JSON est complet et valide.`;

    const analysisPrompt = `
Nombre de documents à analyser: ${documents.length}

Documents:
${documentSummaries.map((doc, idx) => `
Document ${idx + 1}:
Type: ${doc.type}
Titre: ${doc.title}
Contenu: ${doc.content.substring(0, 2500)}...
`).join('\n\n')}

Réponds UNIQUEMENT avec cet objet JSON (pas de texte avant ou après):
{
  "summary": "Résumé global en 2-3 paragraphes maximum",
  "overallQuality": 75,
  "commonIssues": [
    "Problème 1",
    "Problème 2",
    "Problème 3"
  ],
  "strengths": [
    "Force 1",
    "Force 2",
    "Force 3"
  ],
  "recommendations": [
    "Recommandation 1",
    "Recommandation 2",
    "Recommandation 3"
  ],
  "documentComparison": [
    {
      "documentId": "${documentSummaries[0]?.id || ''}",
      "documentTitle": "Titre du document",
      "documentType": "type",
      "score": 75,
      "mainFindings": ["Constat 1", "Constat 2"]
    }
  ],
  "synergies": [
    "Synergie 1",
    "Synergie 2"
  ],
  "contradictions": [
    "Contradiction 1"
  ]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${analysisPrompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              "category": "HARM_CATEGORY_HARASSMENT",
              "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              "category": "HARM_CATEGORY_HATE_SPEECH",
              "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const geminiData = await response.json();
    console.log("Gemini response received");

    if (!geminiData.candidates || !geminiData.candidates[0]) {
      throw new Error('No content generated by Gemini');
    }

    let generatedText = geminiData.candidates[0].content.parts[0].text;
    console.log("Raw response length:", generatedText.length);
    
    let analysisResult: GlobalAnalysisResult;
    try {
      // Remove markdown code blocks if present
      generatedText = generatedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Extract JSON object more carefully
      const jsonStart = generatedText.indexOf('{');
      const jsonEnd = generatedText.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No JSON object found in response');
      }
      
      let jsonText = generatedText.substring(jsonStart, jsonEnd + 1);
      
      // Try to parse
      try {
        analysisResult = JSON.parse(jsonText);
      } catch (parseError) {
        console.error("Initial parse failed, attempting repair...");
        
        // Basic JSON repair: ensure arrays are properly closed
        const openBrackets = (jsonText.match(/\[/g) || []).length;
        const closeBrackets = (jsonText.match(/\]/g) || []).length;
        if (openBrackets > closeBrackets) {
          jsonText += ']'.repeat(openBrackets - closeBrackets);
        }
        
        // Ensure object is properly closed
        const openBraces = (jsonText.match(/\{/g) || []).length;
        const closeBraces = (jsonText.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
          jsonText += '}'.repeat(openBraces - closeBraces);
        }
        
        analysisResult = JSON.parse(jsonText);
      }
      
      // Validate required fields
      if (!analysisResult.summary || !analysisResult.documentComparison) {
        throw new Error('Missing required fields in analysis result');
      }
      
      console.log("✓ Successfully parsed analysis result");
      
    } catch (parseError) {
      console.error("Failed to parse JSON, creating fallback analysis");
      console.error("Parse error details:", parseError);
      console.error("Text sample:", generatedText.substring(0, 500));
      
      analysisResult = {
        summary: "L'analyse complète n'a pas pu être générée correctement. Veuillez réessayer.",
        overallQuality: 70,
        commonIssues: ["Erreur lors de l'analyse automatique"],
        strengths: ["Analyse manuelle recommandée"],
        recommendations: ["Réessayer l'analyse globale"],
        documentComparison: documents.map(doc => ({
          documentId: doc.id,
          documentTitle: doc.title,
          documentType: doc.document_type,
          score: 70,
          mainFindings: ["Analyse individuelle disponible"]
        })),
        synergies: [],
        contradictions: []
      };
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
