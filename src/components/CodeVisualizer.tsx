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
    // ... (Your original GitHub loading logic is unchanged)
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
    // ... (Your entire original initializeVisualization function is unchanged)
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

  const ControlPanel: React.FC = () => (
    <div className="fixed top-4 left-4 bg-black bg-opacity-80 backdrop-blur-lg rounded-lg p-4 text-white z-40">
      <div className="space-y-4">
        {/* ... (Visualization Controls section is unchanged) */}
        <div>
          <label className="block text-xs text-gray-300 mb-2">Data Source</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleGenerateNewData} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 px-3 py-1 rounded text-xs">🎲 New Demo</button>
            <button onClick={() => setShowRepoInput(true)} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-3 py-1 rounded text-xs">📂 GitHub Repo</button>
            <button onClick={() => setShowLocalUploadModal(true)} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 px-3 py-1 rounded text-xs">🖥️ Local Folder</button>
          </div>
        </div>
        {/* ... (Filter and Highlight sections are unchanged) */}
      </div>
    </div>
  );

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
