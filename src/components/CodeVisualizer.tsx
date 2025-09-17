import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { supabase } from '../supabaseClient'; // Import the Supabase client

// --- TypeScript interfaces (no changes) ---
interface CodebaseNode {
  id: string;
  type: 'file' | 'class' | 'function' | 'variable';
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


// --- Demo data generator (no changes, assuming it's needed as a fallback) ---
const generateDemoData = (): CodebaseData => {
    // ... (Your original generateDemoData function is unchanged)
    return { nodes: [], links: [] }; // Replace with your actual implementation
};


// --- Main Component ---
const RealCodebaseVisualizer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<CodebaseData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<CodebaseNode | null>(null);
  const [stats, setStats] = useState<StatsData>({ errors: 0, warnings: 0, nodes: 0, links: 0, bugDensity: 0 });
  const simulationRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
  const forceSimulationRef = useRef<d3.Simulation<CodebaseNode, undefined>>();
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'demo' | 'github' | 'local'>('demo');
  const [repoUrl, setRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [showLocalUploadModal, setShowLocalUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateStats = (nodes: CodebaseNode[], links: CodebaseLink[]) => {
    const errors = nodes.filter(n => n.bugCount > 2).length;
    const warnings = nodes.filter(n => n.bugCount > 0 && n.bugCount <= 2).length;
    const buggyNodes = nodes.filter(n => n.bugCount > 0).length;
    const bugDensity = nodes.length > 0 ? Math.round((buggyNodes / nodes.length) * 100) : 0;
    return { errors, warnings, nodes: nodes.length, links: links.length, bugDensity };
  };

  const parseGitHubUrl = (url: string) => {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
    return null;
  };

  // --- Data Loading Functions ---
  
  const loadGitHubRepository = async (url: string, token?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const repoInfo = parseGitHubUrl(url);
      if (!repoInfo) {
        throw new Error('Invalid GitHub URL format. Use: https://github.com/owner/repo');
      }

      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      const { owner, repo } = repoInfo;

      // Get the default branch
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!repoResponse.ok) {
        if (repoResponse.status === 404) {
          throw new Error('Repository not found or not accessible');
        } else if (repoResponse.status === 403) {
          throw new Error('Rate limit exceeded or repository requires authentication');
        }
        throw new Error(`GitHub API error: ${repoResponse.status}`);
      }
      
      const repoData = await repoResponse.json();
      const defaultBranch = repoData.default_branch || 'main';

      // Get the file tree
      const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
      if (!treeResponse.ok) {
        throw new Error(`Failed to fetch repository tree: ${treeResponse.status}`);
      }
      
      const treeData = await treeResponse.json();
      
      const codeFiles = treeData.tree.filter((item: any) => 
        item.type === 'blob' && 
        /\.(js|jsx|ts|tsx|py|java|cpp|c|cs|php|rb|go)$/.test(item.path)
      );

      if (codeFiles.length === 0) {
        throw new Error('No supported code files found in repository');
      }

      const allNodes: CodebaseNode[] = [];
      const allLinks: CodebaseLink[] = [];
      
      // Limit to first 20 files to avoid API rate limits
      const filesToProcess = codeFiles.slice(0, 20);
      
      await Promise.all(filesToProcess.map(async (file: any) => {
        try {
          const contentResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`, { headers });
          if (contentResponse.ok) {
            const contentData = await contentResponse.json();
            if (contentData.encoding === 'base64') {
              const content = atob(contentData.content);
              const { nodes, links } = CodeAnalyzer.analyzeFile(file.path, content);
              allNodes.push(...nodes);
              allLinks.push(...links);
            }
          }
        } catch (fileError) {
          console.warn(`Failed to process file ${file.path}:`, fileError);
        }
      }));

      if (allNodes.length === 0) {
        throw new Error('No code structure could be analyzed from the repository');
      }

      // Add cross-dependencies
      const crossLinks = CodeAnalyzer.detectCrossDependencies(allNodes, allLinks);
      allLinks.push(...crossLinks);

      const newStats = calculateStats(allNodes, allLinks);
      setStats(newStats);
      setData({ nodes: allNodes, links: allLinks });
      setDataSource('github');
      
    } catch (error) {
      console.error('Error loading GitHub repository:', error);
      setError(error instanceof Error ? error.message : 'Failed to load repository');
      // Fall back to demo data
      const demoData = generateDemoData();
      const newStats = calculateStats(demoData.nodes, demoData.links);
      setStats(newStats);
      setData(demoData);
      setDataSource('demo');
    } finally {
      setIsLoading(false);
    }
  };



  const loadDemoData = async () => {
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));
    const demoData = generateDemoData(); // Make sure this function exists
    const newStats = calculateStats(demoData.nodes, demoData.links);
    setStats(newStats);
    setData(demoData);
    setDataSource('demo');
    setIsLoading(false);
  };

  const loadLocalRepository = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError(null);
    setShowLocalUploadModal(false);

    try {
      const filePromises: Promise<{ path: string; content: string }>[] = [];
      const supportedFileRegex = /\.(js|jsx|ts|tsx|py|java|cpp|c|cs|php|rb|go)$/;

      for (const file of Array.from(files)) {
        if (supportedFileRegex.test(file.name)) {
          const promise = new Promise<{ path: string; content: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({
                path: (file as any).webkitRelativePath || file.name,
                content: event.target?.result as string,
              });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
          });
          filePromises.push(promise);
        }
      }

      const fileData = await Promise.all(filePromises);
      if (fileData.length === 0) {
        throw new Error("No supported code files found in the selected directory.");
      }

      const { data: result, error: functionError } = await supabase.functions.invoke('analyze-codebase', {
        body: fileData,
      });

      if (functionError) throw new Error(functionError.message);
      if (result.error) throw new Error(result.error);

      const newStats = calculateStats(result.nodes, result.links);
      setStats(newStats);
      setData({ nodes: result.nodes, links: result.links });
      setDataSource('local');

    } catch (error) {
      console.error("Error loading local repository:", error);
      setError(error instanceof Error ? error.message : "Failed to process local folder");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    loadDemoData();
  }, []);

  // --- D3 Visualization Logic ---
  const initializeVisualization = useCallback(() => {
    if (!svgRef.current || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;

    svg.selectAll("*").remove();

    const g = svg.append("g");
    simulationRef.current = g;

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink<CodebaseNode, CodebaseLink>(data.links).id((d) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: CodebaseNode) => Math.max(12, Math.sqrt(d.size) * 2) + 5));

    forceSimulationRef.current = simulation;

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("class", "link")
      .style("stroke-width", (d: CodebaseLink) => {
        switch(d.type) {
          case "error": return 4;
          case "call": return 3;
          case "dependency": return 2;
          default: return 1;
        }
      })
      .style("stroke", (d: CodebaseLink) => {
        switch(d.type) {
          case "contains": return "#64B5F6";
          case "call": return "#FFB74D";
          case "dependency": return "#81C784";
          case "error": return "#F44336";
          default: return "#999";
        }
      })
      .style("stroke-dasharray", (d: CodebaseLink) => d.type === "dependency" ? "5,5" : "none")
      .style("opacity", 0.7);

    // Create nodes
    const node = g.append("g")
      .selectAll(".node")
      .data(data.nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(d3.drag<SVGGElement, CodebaseNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add circles
    node.append("circle")
      .attr("r", (d: CodebaseNode) => Math.max(12, Math.sqrt(d.size) * 2))
      .style("fill", (d: CodebaseNode) => {
        if (d.bugCount > 2) return "#F44336";
        if (d.bugCount > 0) return "#FF9800";
        
        switch(d.type) {
          case "file": return "#2196F3";
          case "class": return "#4CAF50";
          case "function": return "#FF9800";
          case "variable": return "#9C27B0";
          default: return "#999";
        }
      })
      .style("stroke", (d: CodebaseNode) => {
        if (d.bugCount > 2) return "#D32F2F";
        if (d.bugCount > 0) return "#F57C00";
        
        switch(d.type) {
          case "file": return "#1976D2";
          case "class": return "#388E3C";
          case "function": return "#F57C00";
          case "variable": return "#7B1FA2";
          default: return "#666";
        }
      })
      .style("stroke-width", 3)
      .style("filter", (d: CodebaseNode) => d.bugCount > 0 ? "drop-shadow(0 0 8px rgba(244, 67, 54, 0.6))" : "none");

    // Add labels
    node.append("text")
      .text((d: CodebaseNode) => d.name.length > 15 ? d.name.substring(0, 12) + "..." : d.name)
      .attr("dy", (d: CodebaseNode) => Math.max(12, Math.sqrt(d.size) * 2) + 18)
      .style("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "white")
      .style("text-shadow", "2px 2px 4px rgba(0,0,0,0.8)")
      .style("pointer-events", "none");

    // Add type indicators
    node.append("text")
      .text((d: CodebaseNode) => {
        switch(d.type) {
          case "file": return "📁";
          case "class": return "🏛️";
          case "function": return "⚙️";
          case "variable": return "💜";
          default: return "❓";
        }
      })
      .attr("dy", 5)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("pointer-events", "none");

    // Add bug indicators
    node.filter((d: CodebaseNode) => d.bugCount > 0)
      .append("text")
      .text((d: CodebaseNode) => {
        if (d.bugCount > 5) return "🔥";
        if (d.bugCount > 2) return "🚨";
        return "⚠️";
      })
      .attr("dy", (d: CodebaseNode) => -Math.max(12, Math.sqrt(d.size) * 2) - 8)
      .style("text-anchor", "middle")
      .style("font-size", "18px")
      .style("pointer-events", "none")
      .style("animation", (d: CodebaseNode) => d.bugCount > 2 ? "pulse 2s infinite" : "none");

    // Add size indicators for files
    node.filter((d: CodebaseNode) => d.type === "file")
      .append("text")
      .text((d: CodebaseNode) => `${d.size} LOC`)
      .attr("dy", (d: CodebaseNode) => Math.max(12, Math.sqrt(d.size) * 2) + 35)
      .style("text-anchor", "middle")
      .style("font-size", "9px")
      .style("fill", "#ccc")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .style("pointer-events", "none");

    // Event handlers
    node.on("click", (event: MouseEvent, d: CodebaseNode) => {
      event.stopPropagation();
      setSelectedNode(d);
    })
    .on("mouseover", function(event: MouseEvent, d: CodebaseNode) {
      // Highlight connected nodes
      const connectedNodeIds = new Set();
      data.links.forEach(link => {
        if ((link.source as CodebaseNode).id === d.id) connectedNodeIds.add((link.target as CodebaseNode).id);
        if ((link.target as CodebaseNode).id === d.id) connectedNodeIds.add((link.source as CodebaseNode).id);
      });
      
      // Dim other nodes
      node.style("opacity", (otherNode: CodebaseNode) => 
        otherNode.id === d.id || connectedNodeIds.has(otherNode.id) ? 1 : 0.3
      );
      
      // Highlight connected links
      link.style("opacity", (linkData: CodebaseLink) =>
        (linkData.source as CodebaseNode).id === d.id || (linkData.target as CodebaseNode).id === d.id ? 1 : 0.1
      );
      
      // Scale up current node
      d3.select(this).select("circle")
        .style("stroke-width", 5)
        .style("filter", "brightness(1.3) drop-shadow(0 0 12px rgba(255,255,255,0.8))");
    })
    .on("mouseout", function() {
      // Reset all styles
      node.style("opacity", 1);
      link.style("opacity", 0.7);
      
      d3.select(this).select("circle")
        .style("stroke-width", 3)
        .style("filter", (d: CodebaseNode) => d.bugCount > 0 ? "drop-shadow(0 0 8px rgba(244, 67, 54, 0.6))" : "none");
    });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as CodebaseNode).x!)
        .attr("y1", (d) => (d.source as CodebaseNode).y!)
        .attr("x2", (d) => (d.target as CodebaseNode).x!)
        .attr("y2", (d) => (d.target as CodebaseNode).y!);

      node.attr("transform", (d: CodebaseNode) => `translate(${d.x!},${d.y!})`);
    });

    // Click on SVG to deselect
    svg.on("click", () => setSelectedNode(null));
  }, [data]);
  useEffect(() => {
    if (data.nodes.length > 0) {
      initializeVisualization();
    }
  }, [data, initializeVisualization]);


  // --- UI Handlers ---
  const handleResetLayout = useCallback(() => { /* ... */ }, []);
  const handleCenterView = useCallback(() => { /* ... */ }, []);
  const handleRunBugScan = useCallback(() => { /* ... */ }, []);
  const handleToggleNodeType = useCallback((type: string) => { /* ... */ }, []);
  const handleHighlightErrors = useCallback(() => { /* ... */ }, []);
  const handleHighlightWarnings = useCallback(() => { /* ... */ }, []);
  const handleClearHighlights = useCallback(() => { /* ... */ }, []);
  const handleGenerateNewData = useCallback(() => { loadDemoData(); }, []);
  const handleLoadRepository = useCallback(() => {
    if (repoUrl.trim()) {
      loadGitHubRepository(repoUrl.trim(), githubToken.trim() || undefined);
      setShowRepoInput(false);
    }
  }, [repoUrl, githubToken]);


  // --- React Components for UI ---

  const RepositoryInputModal: React.FC = () => { /* ... (Unchanged) */ return null; };
  const NodeDetailsPanel: React.FC<{ node: CodebaseNode | null; onClose: () => void }> = ({ node, onClose }) => { /* ... (Unchanged) */ return null; };
  const Legend: React.FC = () => { /* ... (Unchanged) */ return null; };

  const LocalUploadModal: React.FC = () => {
    if (!showLocalUploadModal) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => loadLocalRepository(e.target.files)}
          multiple
          directory=""
          webkitdirectory=""
          style={{ display: 'none' }}
        />
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 w-96 max-w-90vw text-center">
          <h3 className="text-xl font-bold text-white mb-4">Upload Local Repository</h3>
          <p className="text-gray-300 mb-6">
            Select your project's root folder. Your code will be sent to a secure function for analysis. No code is stored.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded transition-colors font-bold"
          >
            Select Folder
          </button>
          <button
            onClick={() => setShowLocalUploadModal(false)}
            className="mt-3 text-gray-400 hover:text-white text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

 const ControlPanel: React.FC = () => {
    return (
      <div className="fixed top-4 left-4 bg-black bg-opacity-80 backdrop-blur-lg rounded-lg p-4 text-white z-40">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-300 mb-2">Visualization Controls</label>
            <div className="space-x-2">
              <button 
                onClick={handleResetLayout}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs transition-all transform hover:-translate-y-0.5"
              >
                🔄 Reset
              </button>
              <button 
                onClick={handleCenterView}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs transition-all transform hover:-translate-y-0.5"
              >
                🎯 Center
              </button>
              <button 
                onClick={handleRunBugScan}
                className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs transition-all transform hover:-translate-y-0.5"
              >
                🔍 Scan
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-300 mb-2">Data Source</label>
            <div className="space-x-2">
              <button 
                onClick={handleGenerateNewData}
                disabled={isLoading}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 px-3 py-1 rounded text-xs transition-all transform hover:-translate-y-0.5 disabled:transform-none"
              >
                🎲 New Demo
              </button>
              <button 
                onClick={() => setShowRepoInput(true)}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-3 py-1 rounded text-xs transition-all transform hover:-translate-y-0.5 disabled:transform-none"
              >
                📂 GitHub Repo
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-300 mb-2">Filter Nodes</label>
            <div className="grid grid-cols-2 gap-1">
              <button 
                onClick={() => handleToggleNodeType('file')}
                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-all"
              >
                📁 Files
              </button>
              <button 
                onClick={() => handleToggleNodeType('class')}
                className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs transition-all"
              >
                🏛️ Classes
              </button>
              <button 
                onClick={() => handleToggleNodeType('function')}
                className="bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded text-xs transition-all"
              >
                ⚙️ Functions
              </button>
              <button 
                onClick={() => handleToggleNodeType('variable')}
                className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs transition-all"
              >
                💜 Variables
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-300 mb-2">Highlight Issues</label>
            <div className="space-x-1">
              <button 
                onClick={handleHighlightErrors}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-all"
              >
                🚨 Errors
              </button>
              <button 
                onClick={handleHighlightWarnings}
                className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs transition-all"
              >
                ⚠️ Warnings
              </button>
              <button 
                onClick={handleClearHighlights}
                className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-xs transition-all"
              >
                ✨ Clear
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const StatsPanel: React.FC = () => {
    const getDataSourceText = () => {
      switch(dataSource) {
        case 'demo': return '🎭 Demo Data';
        case 'github': return `📂 GitHub: ${parseGitHubUrl(repoUrl)?.repo || 'Repo'}`;
        case 'local': return '🖥️ Local Repository';
        default: return '';
      }
    };
    return (
      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-80 backdrop-blur-lg rounded-lg p-4 text-white z-30 w-52">
          <h3 className="text-lg font-bold mb-3 text-center text-green-400">Code Analysis</h3>
          {/* ... (Stats details are unchanged) */}
          <div className="mt-4 pt-3 border-t border-gray-600">
              <p className="text-xs text-gray-400 text-center">{getDataSourceText()}</p>
          </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      <ControlPanel />
      <StatsPanel />
      <Legend />
      <RepositoryInputModal />
      <LocalUploadModal />
      
      <NodeDetailsPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-center">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <h2 className="text-xl font-bold">Loading Codebase...</h2>
          </div>
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
