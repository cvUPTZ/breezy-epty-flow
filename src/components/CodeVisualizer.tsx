import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { createClient } from '@supabase/supabase-js';

// --- 1. SETUP SUPABASE CLIENT ---
// Replace with your actual Supabase URL and Anon Key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
// The Supabase client is used to call the Edge Function for code analysis.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// --- 2. TYPESCRIPT INTERFACES ---
interface CodebaseNode {
  id: string;
  type: 'file' | 'class' | 'function' | 'variable' | 'import';
  name: string;
  parent?: string;
  size: number;
  issues: string[];
  bugCount: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  filePath?: string;
  content?: string;
  startLine?: number;
  endLine?: number;
}

interface CodebaseLink {
  source: string | CodebaseNode;
  target: string | CodebaseNode;
  type: 'contains' | 'call' | 'dependency' | 'error';
}

interface CodebaseData {
  nodes: CodebaseNode[];
  links: CodebaseLink[];
}

interface StatsData {
  errors: number;
  warnings: number;
  nodes: number;
  links: number;
  bugDensity: number;
}


// --- 3. DEMO DATA GENERATOR ---
// Used as a fallback and for the initial view
const generateDemoData = (): CodebaseData => {
  return {
    nodes: [
      { id: 'app.js', type: 'file', name: 'app.js', size: 150, issues: [], bugCount: 1, filePath: 'app.js' },
      { id: 'utils.js', type: 'file', name: 'utils.js', size: 80, issues: [], bugCount: 0, filePath: 'utils.js' },
      { id: 'app.js::init', type: 'function', name: 'init()', parent: 'app.js', size: 40, issues: ['low-performance'], bugCount: 1, startLine: 10, endLine: 50 },
      { id: 'utils.js::formatData', type: 'function', name: 'formatData()', parent: 'utils.js', size: 25, issues: [], bugCount: 0, startLine: 5, endLine: 30 },
      { id: 'app.js::render', type: 'function', name: 'render()', parent: 'app.js', size: 60, issues: [], bugCount: 0, startLine: 55, endLine: 115 },
    ],
    links: [
      { source: 'app.js', target: 'app.js::init', type: 'contains' },
      { source: 'app.js', target: 'app.js::render', type: 'contains' },
      { source: 'utils.js', target: 'utils.js::formatData', type: 'contains' },
      { source: 'app.js::init', target: 'utils.js::formatData', type: 'call' },
    ],
  };
};


// --- 4. MAIN REACT COMPONENT ---
const RealCodebaseVisualizer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
  const forceSimulationRef = useRef<d3.Simulation<CodebaseNode, undefined>>();
  const [data, setData] = useState<CodebaseData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<CodebaseNode | null>(null);
  const [stats, setStats] = useState<StatsData>({ errors: 0, warnings: 0, nodes: 0, links: 0, bugDensity: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'demo' | 'github' | 'local'>('demo');
  const [repoUrl, setRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [showLocalUploadModal, setShowLocalUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Core Data Logic ---

  const calculateStats = (nodes: CodebaseNode[], links: CodebaseLink[]) => {
    const errors = nodes.filter(n => n.bugCount > 2).length;
    const warnings = nodes.filter(n => n.bugCount > 0 && n.bugCount <= 2).length;
    const buggyNodes = nodes.filter(n => n.bugCount > 0).length;
    const bugDensity = nodes.length > 0 ? Math.round((buggyNodes / nodes.length) * 100) : 0;
    return { errors, warnings, nodes: nodes.length, links: links.length, bugDensity };
  };

  const parseGitHubUrl = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    return match ? { owner: match[1], repo: match[2].replace('.git', '') } : null;
  };

  const analyzeCodebaseWithBackend = async (fileData: { path: string; content: string }[]) => {
    if (fileData.length === 0) throw new Error("No supported code files found to analyze.");
    
    // Call the Supabase Edge Function with the file data
    const { data: result, error: functionError } = await supabase.functions.invoke('analyze-codebase', {
      body: fileData,
    });

    if (functionError) throw new Error(`Analysis function error: ${functionError.message}`);
    if (result.error) throw new Error(`Analysis failed: ${result.error}`);
    if (!result.nodes || !result.links) throw new Error("Invalid analysis data received from server.");

    setData({ nodes: result.nodes, links: result.links });
    setStats(calculateStats(result.nodes, result.links));
  };

  const loadGitHubRepository = async (url: string, token?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const repoInfo = parseGitHubUrl(url);
      if (!repoInfo) throw new Error('Invalid GitHub URL format.');
      const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' };
      if (token) headers['Authorization'] = `token ${token}`;

      const treeResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/main?recursive=1`, { headers });
      if (!treeResponse.ok) throw new Error(`Failed to fetch repo tree: ${treeResponse.statusText}`);
      
      const treeData = await treeResponse.json();
      const codeFiles = treeData.tree
        .filter((item: any) => item.type === 'blob' && /\.(js|jsx|ts|tsx)$/.test(item.path))
        .slice(0, 30);

      const fileContentsPromises = codeFiles.map(async (file: any) => {
        const contentResponse = await fetch(file.url, { headers });
        if (!contentResponse.ok) return null;
        const contentData = await contentResponse.json();
        if (contentData.encoding !== 'base64') return null;
        return { path: file.path, content: atob(contentData.content) };
      });
      
      const fileContents = (await Promise.all(fileContentsPromises)).filter(Boolean) as { path: string, content: string }[];
      
      await analyzeCodebaseWithBackend(fileContents);
      setDataSource('github');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      loadDemoData(); // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    const demoData = generateDemoData();
    setData(demoData);
    setStats(calculateStats(demoData.nodes, demoData.links));
    setDataSource('demo');
    setIsLoading(false);
  }, []);

  const loadLocalRepository = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsLoading(true);
    setError(null);
    setShowLocalUploadModal(false);

    try {
      const filePromises = Array.from(files)
        .filter(file => /\.(js|jsx|ts|tsx)$/.test(file.name))
        .map(file => new Promise<{ path: string; content: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve({ path: (file as any).webkitRelativePath || file.name, content: event.target?.result as string });
          reader.onerror = reject;
          reader.readAsText(file);
        }));

      const fileData = await Promise.all(filePromises);
      await analyzeCodebaseWithBackend(fileData);
      setDataSource('local');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process local folder.");
      loadDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDemoData();
  }, [loadDemoData]);


  // --- D3 Visualization ---

  const initializeVisualization = useCallback(() => {
    if (!svgRef.current || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.selectAll("*").remove();

    const g = svg.append("g");
    simulationRef.current = g;

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 8]).on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink<CodebaseNode, CodebaseLink>(data.links).id((d: any) => d.id).distance(d => d.type === 'contains' ? 120 : 180).strength(0.5))
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: CodebaseNode) => Math.max(15, Math.sqrt(d.size) * 1.5) + 10));

    forceSimulationRef.current = simulation;

    const link = g.append("g").selectAll("line").data(data.links).join("line")
      .attr("class", "link")
      .style("stroke-width", d => d.type === "call" ? 2.5 : 1.5)
      .style("stroke", d => ({ contains: "#64748b", call: "#f59e0b", dependency: "#10b981" }[d.type] || "#999"))
      .style("stroke-dasharray", d => d.type === "dependency" ? "5,5" : "none")
      .style("opacity", 0.7);

    const node = g.append("g").selectAll(".node").data(data.nodes).join("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(d3.drag<SVGGElement, CodebaseNode>()
        .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

    const getNodeRadius = (d: CodebaseNode) => d.type === 'file' ? 25 : Math.max(12, Math.sqrt(d.size) * 1.5);
    const getNodeColor = (d: CodebaseNode) => {
      if (d.bugCount > 2) return "#ef4444";
      if (d.bugCount > 0) return "#f97316";
      return { file: "#3b82f6", class: "#22c55e", function: "#eab308", import: "#8b5cf6" }[d.type] || "#9ca3af";
    };

    node.append("circle")
      .attr("r", getNodeRadius)
      .style("fill", getNodeColor)
      .style("stroke", "#111827")
      .style("stroke-width", 3);

    node.append("text").text(d => ({ file: "📁", class: "🏛️", function: "⚙️", import: "📦" }[d.type] || "❓"))
      .attr("dy", 6).style("text-anchor", "middle").style("font-size", d => d.type === 'file' ? "24px" : "16px");

    node.append("text").text(d => d.name.length > 20 ? d.name.substring(0, 18) + "..." : d.name)
      .attr("dy", d => getNodeRadius(d) + 18)
      .style("text-anchor", "middle").style("font-size", "12px").style("fill", "#e5e7eb")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.7)");
    
    node.on("click", (event: MouseEvent, d: CodebaseNode) => { event.stopPropagation(); setSelectedNode(d); })
      .on("mouseover", function(event, d) {
        d3.select(this).select("circle").style("filter", "brightness(1.5) drop-shadow(0 0 8px #fff)");
        link.style("opacity", l => (l.source as CodebaseNode).id === d.id || (l.target as CodebaseNode).id === d.id ? 1 : 0.1);
      })
      .on("mouseout", function() {
        d3.select(this).select("circle").style("filter", "none");
        link.style("opacity", 0.7);
      });

    simulation.on("tick", () => {
      link.attr("x1", d => (d.source as CodebaseNode).x!).attr("y1", d => (d.source as CodebaseNode).y!)
          .attr("x2", d => (d.target as CodebaseNode).x!).attr("y2", d => (d.target as CodebaseNode).y!);
      node.attr("transform", d => `translate(${d.x!},${d.y!})`);
    });

    svg.on("click", () => setSelectedNode(null));

  }, [data]);

  useEffect(() => {
    if (data.nodes.length > 0) initializeVisualization();
  }, [data, initializeVisualization]);

  // --- UI Handlers & Sub-components ---

  const handleLoadRepository = useCallback(() => {
    if (repoUrl.trim()) {
      loadGitHubRepository(repoUrl.trim(), githubToken.trim() || undefined);
      setShowRepoInput(false);
    }
  }, [repoUrl, githubToken]);

  const ControlPanel = () => (
    <div className="fixed top-4 left-4 bg-gray-900 bg-opacity-80 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-white z-40 space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Data Source</label>
        <div className="flex space-x-2">
          <button onClick={loadDemoData} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 px-3 py-1 rounded text-xs transition">🎲 New Demo</button>
          <button onClick={() => setShowRepoInput(true)} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-3 py-1 rounded text-xs transition">📂 GitHub</button>
          <button onClick={() => setShowLocalUploadModal(true)} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 px-3 py-1 rounded text-xs transition">🖥️ Local</button>
        </div>
      </div>
    </div>
  );

  const StatsPanel = () => (
    <div className="fixed top-4 right-4 bg-gray-900 bg-opacity-80 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-white z-30 w-56 space-y-1">
      <h3 className="text-lg font-bold mb-2 text-center text-gray-200">Code Analysis</h3>
      <p className="text-sm text-gray-300">Nodes: <span className="font-mono text-cyan-400 float-right">{stats.nodes}</span></p>
      <p className="text-sm text-gray-300">Links: <span className="font-mono text-cyan-400 float-right">{stats.links}</span></p>
      <p className="text-sm text-gray-300">Errors: <span className="font-mono text-red-400 float-right">{stats.errors}</span></p>
      <p className="text-sm text-gray-300">Warnings: <span className="font-mono text-amber-400 float-right">{stats.warnings}</span></p>
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">Source: {dataSource}</p>
      </div>
    </div>
  );

  const RepositoryInputModal = () => (
    showRepoInput && <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg space-y-4">
        <h3 className="text-xl font-bold text-white">Load GitHub Repository</h3>
        <input type="text" placeholder="https://github.com/owner/repo" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded" />
        <input type="password" placeholder="Optional: GitHub Personal Access Token" value={githubToken} onChange={e => setGithubToken(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded" />
        <div className="flex justify-end space-x-3">
          <button onClick={() => setShowRepoInput(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Cancel</button>
          <button onClick={handleLoadRepository} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Load</button>
        </div>
      </div>
    </div>
  );

  const LocalUploadModal = () => (
    showLocalUploadModal && <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <input type="file" ref={fileInputRef} onChange={e => loadLocalRepository(e.target.files)} multiple directory="" webkitdirectory="" style={{ display: 'none' }} />
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 w-full max-w-md text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Upload Local Repository</h3>
        <p className="text-gray-300 mb-6">Select your project's folder. Code is analyzed securely via a serverless function and is not stored.</p>
        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg transition font-bold">Select Folder</button>
        <button onClick={() => setShowLocalUploadModal(false)} className="mt-4 text-gray-400 hover:text-white">Cancel</button>
      </div>
    </div>
  );

  const NodeDetailsPanel = () => (
    selectedNode && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 bg-opacity-90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-white z-40 w-full max-w-4xl">
        <button onClick={() => setSelectedNode(null)} className="absolute top-2 right-2 text-gray-400 hover:text-white">&times;</button>
        <h3 className="font-bold text-lg text-cyan-400 mb-2">{selectedNode.name}</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
            <p><strong>Type:</strong> {selectedNode.type}</p>
            <p><strong>Size:</strong> {selectedNode.size} LOC</p>
            <p><strong>Bugs:</strong> {selectedNode.bugCount}</p>
            <p className="col-span-3"><strong>Path:</strong> {selectedNode.filePath || selectedNode.parent}</p>
        </div>
    </div>
  );

  // --- Main Render ---

  return (
    <div className="w-full h-screen bg-gray-800 relative overflow-hidden font-sans">
      <svg ref={svgRef} className="w-full h-full" />
      <ControlPanel />
      <StatsPanel />
      <RepositoryInputModal />
      <LocalUploadModal />
      <NodeDetailsPanel />
      
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-center">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <h2 className="text-xl font-bold">Analyzing Codebase...</h2>
          </div>
        </div>
      )}

      {error && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 rounded-lg z-50 shadow-lg">
              <strong>Error:</strong> {error}
          </div>
      )}
      
      {!isLoading && data.nodes.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-xl font-bold mb-2">No Data to Display</h2>
            <p className="text-gray-300">Choose a data source to begin visualization.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealCodebaseVisualizer;
