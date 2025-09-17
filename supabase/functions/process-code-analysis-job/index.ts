// supabase/functions/process-code-analysis-job/index.ts
// This is the long-running background function that does the actual work.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

// --- Analysis Logic (copied from the previous version) ---
// Type definitions
interface CodeIssue { type: 'error' | 'warning' | 'info' | 'suggestion'; severity: 'critical' | 'high' | 'medium' | 'low'; message: string; rule: string; line?: number; }
interface CodeMetrics { cyclomaticComplexity: number; linesOfCode: number; }
interface CodebaseNode { id: string; type: string; name: string; parent?: string; size: number; complexity: number; maintainability: number; issues: CodeIssue[]; dependencies: string[]; metrics: CodeMetrics; filePath?: string; }
interface CodebaseLink { source: string; target: string; type: string; strength: number; count: number; }
interface CodebaseData { nodes: CodebaseNode[]; links: CodebaseLink[]; metadata: { totalFiles: number; totalLines: number; languages: Record<string, number>; lastAnalyzed: Date; analysisVersion: string; }; }

// Helper functions
const getFileType = (fileName: string): string => { if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) return 'component'; return 'file'; };
const getLanguage = (fileName: string): string => { if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return 'TypeScript'; if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return 'JavaScript'; return 'Unknown'; };
const calculateComplexity = (content: string): number => { const keywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', '&&', '||', '??', '?.']; let complexity = 1; keywords.forEach(k => { complexity += (content.match(new RegExp(`\\b${k}\\b`, 'g')) || []).length; }); return Math.min(complexity, 50); };
const calculateCyclomaticComplexity = (content: string): number => { const points = ['if', 'for', 'while', 'switch', 'case', 'catch', '&&', '||', '?', '??', '?.']; let complexity = 1; points.forEach(p => { complexity += (content.match(new RegExp(`\\b${p}\\b`, 'g')) || []).length; }); return complexity; };
const detectIssues = (content: string): CodeIssue[] => { const issues: CodeIssue[] = []; if (content.includes('console.log')) { issues.push({ type: 'warning', severity: 'low', message: 'Avoid console.log', rule: 'no-console' }); } return issues; };

// Main analysis function
const analyzeCodeContent = (content: string, fileName: string): Omit<CodebaseData, 'metadata'> => {
    const lines = content.split('\n');
    const loc = lines.length;
    const nodes: CodebaseNode[] = [];
    const links: CodebaseLink[] = [];
    const fileId = `file_${fileName}`;
    nodes.push({ id: fileId, type: getFileType(fileName), name: fileName, size: loc, complexity: calculateComplexity(content), maintainability: 80, issues: detectIssues(content), dependencies: [], metrics: { cyclomaticComplexity: calculateCyclomaticComplexity(content), linesOfCode: loc, }, filePath: fileName });
    const importRegex = /import\s+(?:{[^}]*}|\*|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const path = match[1];
        const importId = `import_${path}`;
        if (!nodes.some(n => n.id === importId)) {
            nodes.push({ id: importId, type: 'import', name: path, size: 1, complexity: 1, maintainability: 100, issues: [], dependencies: [], metrics: { cyclomaticComplexity: 1, linesOfCode: 1 }, filePath: path });
        }
        links.push({ source: fileId, target: importId, type: 'imports', strength: 0.8, count: 1 });
    }
    return { nodes, links };
};
// --- End of Analysis Logic ---


console.log("Process Code Analysis Job function booted");

serve(async (req) => {
  const { jobId } = await req.json();

  if (!jobId) {
    return new Response(JSON.stringify({ error: "Missing jobId" }), { status: 400 });
  }

  // Use the admin client to bypass RLS and update any job
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // 1. Set job status to 'processing'
    await supabaseAdmin.from('code_analysis_jobs').update({ status: 'processing' }).eq('id', jobId);

    // 2. Get the job payload
    const { data: job, error: fetchError } = await supabaseAdmin.from('code_analysis_jobs').select('payload').eq('id', jobId).single();
    if (fetchError) throw fetchError;

    const { githubUrl, filePaths } = job.payload;
    let analysisResult: Omit<CodebaseData, 'metadata'>;
    let metadataBase: Omit<CodebaseData['metadata'], 'lastAnalyzed' | 'analysisVersion'>;

    // 3. Perform the analysis
    if (githubUrl) {
      // GitHub analysis logic
      const urlParts = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!urlParts) throw new Error('Invalid GitHub URL in job payload');
      const [_, owner, repo] = urlParts;
      const githubToken = Deno.env.get("GITHUB_TOKEN");
      if (!githubToken) throw new Error("Server configuration error: GITHUB_TOKEN is not set.");

      const headers = { Accept: 'application/vnd.github.v3+json', Authorization: `token ${githubToken}` };
      const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, { headers });
      if (!treeResponse.ok) throw new Error(`Failed to fetch repository tree: ${treeResponse.statusText}`);

      const { tree } = await treeResponse.json();
      const filesToFetch = tree.filter((item: any) => item.type === 'blob' && (item.path.endsWith('.js') || item.path.endsWith('.ts')));

      const contents = await Promise.all(filesToFetch.map(async (item: any) => {
          const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${item.sha}`, { headers });
          if (!res.ok) return null;
          const blob = await res.json();
          return { name: item.path, content: atob(blob.content) };
      }));

      const validFiles = contents.filter(Boolean) as { name: string, content: string }[];
      const analysisData = validFiles.map(f => analyzeCodeContent(f.content, f.name));

      analysisResult = {
        nodes: analysisData.flatMap(d => d.nodes),
        links: analysisData.flatMap(d => d.links),
      };
      metadataBase = {
        totalFiles: validFiles.length,
        totalLines: validFiles.reduce((acc, f) => acc + f.content.split('\n').length, 0),
        languages: { TypeScript: validFiles.length }, // Simplified
      };

    } else if (filePaths) {
      // Storage analysis logic
      const contents = await Promise.all(filePaths.map(async (path: string) => {
          const { data, error } = await supabaseAdmin.storage.from('code-analysis-uploads').download(path);
          if (error) return null;
          return { name: path.split('/').pop() || path, content: await data.text() };
      }));

      const validFiles = contents.filter(Boolean) as { name: string, content: string }[];
      const analysisData = validFiles.map(f => analyzeCodeContent(f.content, f.name));

      analysisResult = {
        nodes: analysisData.flatMap(d => d.nodes),
        links: analysisData.flatMap(d => d.links),
      };
      metadataBase = {
        totalFiles: validFiles.length,
        totalLines: validFiles.reduce((acc, f) => acc + f.content.split('\n').length, 0),
        languages: { TypeScript: validFiles.length }, // Simplified
      };

    } else {
      throw new Error("Job payload must contain either 'githubUrl' or 'filePaths'");
    }

    // 4. Update job with 'completed' status and result
    const finalData: CodebaseData = {
        ...analysisResult,
        metadata: {
            ...metadataBase,
            lastAnalyzed: new Date(),
            analysisVersion: '4.0.0-background'
        }
    };
    await supabaseAdmin.from('code_analysis_jobs').update({ status: 'completed', result: finalData }).eq('id', jobId);

    return new Response(JSON.stringify({ success: true, message: `Job ${jobId} completed.` }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    // 5. Update job with 'failed' status and error message
    console.error(`Error processing job ${jobId}:`, error);
    await supabaseAdmin.from('code_analysis_jobs').update({ status: 'failed', error_message: error.message }).eq('id', jobId);

    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
