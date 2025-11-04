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

Fournis une analyse comparative approfondie en français.`;

    const analysisPrompt = `
Nombre de documents à analyser: ${documents.length}

Documents:
${documentSummaries.map((doc, idx) => `
Document ${idx + 1}:
Type: ${doc.type}
Titre: ${doc.title}
Contenu: ${doc.content.substring(0, 3000)}...
`).join('\n\n')}

Analyse ces documents de manière globale et fournis ton analyse au format JSON suivant:
{
  "summary": "Résumé global de l'ensemble des documents et leur cohérence stratégique (3-4 paragraphes)",
  "overallQuality": 75,
  "commonIssues": [
    "Problème récurrent 1",
    "Problème récurrent 2",
    "Problème récurrent 3"
  ],
  "strengths": [
    "Force commune 1",
    "Force commune 2",
    "Force commune 3"
  ],
  "recommendations": [
    "Recommandation prioritaire 1",
    "Recommandation prioritaire 2",
    "Recommandation prioritaire 3"
  ],
  "documentComparison": [
    {
      "documentId": "id-du-document",
      "documentTitle": "Titre",
      "documentType": "type",
      "score": 75,
      "mainFindings": ["Constat 1", "Constat 2"]
    }
  ],
  "synergies": [
    "Synergie identifiée 1",
    "Synergie identifiée 2"
  ],
  "contradictions": [
    "Contradiction entre documents 1",
    "Contradiction entre documents 2"
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

    const generatedText = geminiData.candidates[0].content.parts[0].text;
    
    let analysisResult: GlobalAnalysisResult;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.warn("Failed to parse JSON, creating fallback analysis");
      
      analysisResult = {
        summary: generatedText.substring(0, 800),
        overallQuality: 70,
        commonIssues: ["Analyse détaillée requise"],
        strengths: ["Analyse en cours..."],
        recommendations: ["Vérifier l'analyse complète"],
        documentComparison: documents.map(doc => ({
          documentId: doc.id,
          documentTitle: doc.title,
          documentType: doc.document_type,
          score: 70,
          mainFindings: ["Analyse en cours"]
        })),
        synergies: ["Analyse en cours..."],
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
