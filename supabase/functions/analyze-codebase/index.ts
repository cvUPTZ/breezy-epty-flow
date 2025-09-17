// supabase/functions/analyze-codebase/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

// Type definitions (ported from the client-side code)
interface CodeIssue {
  type: 'error' | 'warning' | 'info' | 'suggestion';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  rule: string;
  line?: number;
}

interface CodeMetrics {
  cyclomaticComplexity: number;
  linesOfCode: number;
}

interface CodebaseNode {
  id: string;
  type: string;
  name: string;
  parent?: string;
  size: number;
  complexity: number;
  maintainability: number;
  issues: CodeIssue[];
  dependencies: string[];
  metrics: CodeMetrics;
  filePath?: string;
}

interface CodebaseLink {
  source: string;
  target: string;
  type: string;
  strength: number;
  count: number;
}

interface CodebaseData {
  nodes: CodebaseNode[];
  links: CodebaseLink[];
  metadata: {
    totalFiles: number;
    totalLines: number;
    languages: Record<string, number>;
    lastAnalyzed: Date;
    analysisVersion: string;
  };
}

// Analysis logic (ported from the web worker)
const getFileType = (fileName: string): string => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) return 'component';
    if (fileName.endsWith('.ts') || fileName.endsWith('.js')) return 'file';
    if (fileName.endsWith('.css') || fileName.endsWith('.scss')) return 'file';
    return 'file';
};

const getLanguage = (fileName: string): string => {
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return 'TypeScript';
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return 'JavaScript';
    if (fileName.endsWith('.py')) return 'Python';
    if (fileName.endsWith('.java')) return 'Java';
    if (fileName.endsWith('.go')) return 'Go';
    if (fileName.endsWith('.rs')) return 'Rust';
    return 'Unknown';
};

const calculateComplexity = (content: string): number => {
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', '&&', '||', '??', '?.'];
    let complexity = 1;
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      let match;
      while ((match = regex.exec(content)) !== null) {
        complexity++;
      }
    });
    return Math.min(complexity, 50);
};

const calculateCyclomaticComplexity = (content: string): number => {
    const decisionPoints = ['if', 'for', 'while', 'switch', 'case', 'catch', '&&', '||', '?', '??', '?.'];
    let complexity = 1;
    decisionPoints.forEach(point => {
      const regex = new RegExp(`\\b${point}\\b`, 'g');
      let match;
      while ((match = regex.exec(content)) !== null) {
        complexity++;
      }
    });
    return complexity;
};

const detectIssues = (content: string): CodeIssue[] => {
    const issues: CodeIssue[] = [];
    const consoleLogRegex = /console\.log\s*\(/g;
    let match;
    while ((match = consoleLogRegex.exec(content)) !== null) {
      issues.push({ type: 'warning', severity: 'low', message: 'Avoid console.log', rule: 'no-console', line: content.substring(0, match.index).split('\n').length });
    }
    return issues;
};

const analyzeCodeContent = (content: string, fileName: string): Omit<CodebaseData, 'metadata'> => {
    const lines = content.split('\n');
    const loc = lines.length;
    const nodes: CodebaseNode[] = [];
    const links: CodebaseLink[] = [];
    const fileId = `file_${fileName}`;

    nodes.push({
      id: fileId,
      type: getFileType(fileName),
      name: fileName,
      size: loc,
      complexity: calculateComplexity(content),
      maintainability: 80,
      issues: detectIssues(content),
      dependencies: [],
      metrics: {
        cyclomaticComplexity: calculateCyclomaticComplexity(content),
        linesOfCode: loc,
      },
      filePath: fileName,
    });

    const importRegex = /import\s+(?:{[^}]*}|\*|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    let importMatch;
    while ((importMatch = importRegex.exec(content)) !== null) {
      const importedPath = importMatch[1];
      const importId = `import_${importedPath}`;
      if (!nodes.some(n => n.id === importId)) {
        nodes.push({
          id: importId, type: 'import', name: importedPath, size: 1, complexity: 1, maintainability: 100,
          issues: [], dependencies: [], metrics: { cyclomaticComplexity: 1, linesOfCode: 1 }, filePath: importedPath
        });
      }
      links.push({ source: fileId, target: importId, type: 'imports', strength: 0.8, count: 1 });
    }

    return { nodes, links };
};


console.log("Analyze Codebase function booted");

serve(async (req) => {
  const requestOrigin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { githubUrl, files } = await req.json();

    if (!githubUrl && !files) {
      return new Response(
        JSON.stringify({ error: "Missing githubUrl or files parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let analysisResult;

    if (githubUrl) {
      // Logic to analyze a GitHub repository
      console.log(`Analyzing GitHub URL: ${githubUrl}`);
      const urlParts = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!urlParts) {
        throw new Error('Invalid GitHub repository URL.');
      }
      const owner = urlParts[1];
      const repo = urlParts[2];
      const githubToken = Deno.env.get("GITHUB_TOKEN");

      const headers = {
        Accept: 'application/vnd.github.v3+json',
        ...(githubToken && { Authorization: `token ${githubToken}` }),
      };

      // Fetch the entire tree recursively
      const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, { headers });
      if (!treeResponse.ok) {
        throw new Error(`Failed to fetch repository tree: ${treeResponse.statusText}`);
      }
      const { tree } = await treeResponse.json();

      const supportedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.css', '.html', '.py', '.go', '.java', '.rs'];
      const filesToFetch = tree.filter((item: any) =>
        item.type === 'blob' && supportedExtensions.some((ext: string) => item.path.endsWith(ext))
      );

      // Fetch file contents in batches
      const batchSize = 20;
      const allFileContents: { name: string, content: string }[] = [];
      for (let i = 0; i < filesToFetch.length; i += batchSize) {
        const batch = filesToFetch.slice(i, i + batchSize);
        const batchPromises = batch.map(async (item: any) => {
          const contentResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${item.sha}`, { headers });
          if (!contentResponse.ok) return null;
          const blob = await contentResponse.json();
          // Assuming base64 encoding for blob content
          const content = atob(blob.content);
          return { name: item.path, content };
        });
        const resolvedBatch = (await Promise.all(batchPromises)).filter(Boolean);
        allFileContents.push(...resolvedBatch as { name: string, content: string }[]);
      }

      // Analyze the fetched files
      const allNodes: CodebaseNode[] = [];
      const allLinks: CodebaseLink[] = [];
      let totalLines = 0;
      const languageCounts: Record<string, number> = {};

      allFileContents.forEach((file) => {
        const { nodes, links } = analyzeCodeContent(file.content, file.name);
        allNodes.push(...nodes);
        allLinks.push(...links);
        totalLines += file.content.split('\n').length;
        const lang = getLanguage(file.name);
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      });

      analysisResult = {
        nodes: allNodes,
        links: allLinks,
        metadata: {
          totalFiles: allFileContents.length,
          totalLines,
          languages: languageCounts,
          lastAnalyzed: new Date(),
          analysisVersion: '3.0.0-server-github',
        },
      };

    } else if (files) {
      // Logic to analyze a batch of files
      const allNodes: CodebaseNode[] = [];
      const allLinks: CodebaseLink[] = [];
      let totalLines = 0;
      const languageCounts: Record<string, number> = {};

      files.forEach((file: { name: string, content: string }) => {
        const { nodes, links } = analyzeCodeContent(file.content, file.name);
        allNodes.push(...nodes);
        allLinks.push(...links);
        totalLines += file.content.split('\n').length;
        const lang = getLanguage(file.name);
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      });

      analysisResult = {
        nodes: allNodes,
        links: allLinks,
        metadata: {
          totalFiles: files.length,
          totalLines,
          languages: languageCounts,
          lastAnalyzed: new Date(),
          analysisVersion: '3.0.0-server',
        },
      };
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
