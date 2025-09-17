import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Search, Upload, Github, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Filter, Settings, AlertTriangle, CheckCircle, XCircle, Activity, Layers, GitBranch } from 'lucide-react';

// Enhanced interfaces with modern TypeScript patterns
interface CodebaseNode {
  id: string;
  type: 'file' | 'class' | 'function' | 'variable' | 'import' | 'component' | 'hook' | 'interface' | 'type';
  name: string;
  parent?: string;
  size: number;
  complexity: number;
  maintainability: number;
  issues: CodeIssue[];
  bugCount: number;
  testCoverage: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  filePath?: string;
  content?: string;
  startLine?: number;
  endLine?: number;
  dependencies: string[];
  metrics: CodeMetrics;
  lastModified?: Date;
}

interface CodeIssue {
  type: 'error' | 'warning' | 'info' | 'suggestion';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  rule: string;
  line?: number;
  column?: number;
}

interface CodeMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  linesOfCode: number;
  maintainabilityIndex: number;
  technicalDebt: number;
  duplicateLines: number;
}

interface CodebaseLink {
  source: string | CodebaseNode;
  target: string | CodebaseNode;
  type: 'contains' | 'calls' | 'imports' | 'extends' | 'implements' | 'uses' | 'tests';
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

interface FilterState {
  nodeTypes: Set<string>;
  linkTypes: Set<string>;
  complexityRange: [number, number];
  sizeRange: [number, number];
  issueTypes: Set<string>;
  showTestFiles: boolean;
  hideNodeModules: boolean;
}

interface ViewState {
  mode: '2d' | '3d' | 'hierarchical' | 'circular';
  colorBy: 'type' | 'complexity' | 'issues' | 'size' | 'maintainability';
  clustering: boolean;
  showLabels: boolean;
  showMetrics: boolean;
  animationSpeed: number;
}

// Advanced demo data generator with realistic metrics
const generateSOTADemoData = (): CodebaseData => {
  const nodes: CodebaseNode[] = [
    {
      id: 'src/App.tsx', type: 'file', name: 'App.tsx', size: 180, complexity: 12, maintainability: 85,
      issues: [{ type: 'warning', severity: 'medium', message: 'Component too large', rule: 'max-component-size', line: 1 }],
      bugCount: 1, testCoverage: 78, dependencies: ['react', 'react-router'], filePath: 'src/App.tsx',
      metrics: { cyclomaticComplexity: 8, cognitiveComplexity: 12, linesOfCode: 180, maintainabilityIndex: 85, technicalDebt: 2.5, duplicateLines: 3 },
      lastModified: new Date('2024-12-15')
    },
    {
      id: 'src/components/Header.tsx', type: 'component', name: 'Header', parent: 'src/components/', size: 45, complexity: 3, maintainability: 95,
      issues: [], bugCount: 0, testCoverage: 100, dependencies: ['react'], filePath: 'src/components/Header.tsx',
      metrics: { cyclomaticComplexity: 2, cognitiveComplexity: 3, linesOfCode: 45, maintainabilityIndex: 95, technicalDebt: 0, duplicateLines: 0 },
      lastModified: new Date('2024-12-10')
    },
    {
      id: 'src/hooks/useData.ts', type: 'hook', name: 'useData', parent: 'src/hooks/', size: 67, complexity: 8, maintainability: 82,
      issues: [{ type: 'suggestion', severity: 'low', message: 'Consider memoization', rule: 'performance-optimization', line: 15 }],
      bugCount: 0, testCoverage: 92, dependencies: ['react', 'swr'], filePath: 'src/hooks/useData.ts',
      metrics: { cyclomaticComplexity: 5, cognitiveComplexity: 8, linesOfCode: 67, maintainabilityIndex: 82, technicalDebt: 1.2, duplicateLines: 0 },
      lastModified: new Date('2024-12-14')
    },
    {
      id: 'src/utils/analytics.ts', type: 'function', name: 'trackEvent', parent: 'src/utils/', size: 120, complexity: 15, maintainability: 65,
      issues: [
        { type: 'error', severity: 'high', message: 'Potential memory leak', rule: 'memory-management', line: 45 },
        { type: 'warning', severity: 'medium', message: 'High cyclomatic complexity', rule: 'complexity', line: 1 }
      ],
      bugCount: 3, testCoverage: 45, dependencies: ['lodash'], filePath: 'src/utils/analytics.ts',
      metrics: { cyclomaticComplexity: 15, cognitiveComplexity: 18, linesOfCode: 120, maintainabilityIndex: 65, technicalDebt: 8.5, duplicateLines: 12 },
      lastModified: new Date('2024-12-13')
    },
    {
      id: 'src/types/index.ts', type: 'interface', name: 'UserInterface', parent: 'src/types/', size: 25, complexity: 1, maintainability: 100,
      issues: [], bugCount: 0, testCoverage: 100, dependencies: [], filePath: 'src/types/index.ts',
      metrics: { cyclomaticComplexity: 1, cognitiveComplexity: 1, linesOfCode: 25, maintainabilityIndex: 100, technicalDebt: 0, duplicateLines: 0 },
      lastModified: new Date('2024-12-12')
    }
  ];

  const links: CodebaseLink[] = [
    { source: 'src/App.tsx', target: 'src/components/Header.tsx', type: 'imports', strength: 1, count: 1 },
    { source: 'src/App.tsx', target: 'src/hooks/useData.ts', type: 'uses', strength: 0.8, count: 3 },
    { source: 'src/hooks/useData.ts', target: 'src/utils/analytics.ts', type: 'calls', strength: 0.6, count: 2 },
    { source: 'src/components/Header.tsx', target: 'src/types/index.ts', type: 'uses', strength: 0.4, count: 1 }
  ];

  return {
    nodes,
    links,
    metadata: {
      totalFiles: 5,
      totalLines: 437,
      languages: { 'TypeScript': 80, 'JavaScript': 15, 'CSS': 5 },
      lastAnalyzed: new Date(),
      analysisVersion: '2.0.0'
    }
  };
};

const SOTACodebaseVisualizer: React.FC = () => {
  // Core state
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input
  const [data, setData] = useState<CodebaseData>({ nodes: [], links: [], metadata: { totalFiles: 0, totalLines: 0, languages: {}, lastAnalyzed: new Date(), analysisVersion: '2.0.0' } });
  const [selectedNode, setSelectedNode] = useState<CodebaseNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<CodebaseNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 }); // State for tooltip position
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Advanced UI state
  const [filters, setFilters] = useState<FilterState>({
    nodeTypes: new Set(['file', 'component', 'function', 'hook', 'interface', 'class', 'variable', 'import']),
    linkTypes: new Set(['imports', 'uses', 'calls', 'extends', 'implements']),
    complexityRange: [0, 100],
    sizeRange: [0, 1000],
    issueTypes: new Set(['error', 'warning', 'suggestion']),
    showTestFiles: true,
    hideNodeModules: false
  });

  const [viewState, setViewState] = useState<ViewState>({
    mode: '2d', colorBy: 'type', clustering: true, showLabels: true,
    showMetrics: false, animationSpeed: 1
  });

  const [showSidebar, setShowSidebar] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Simulation refs
  const simulationRef = useRef<d3.Simulation<CodebaseNode, CodebaseLink>>();
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(); // Ref for zoom behavior

  // Filtered data based on current filters and search
  const filteredData = useMemo(() => {
    let filteredNodes = data.nodes.filter(node => {
      if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (!filters.nodeTypes.has(node.type)) return false;
      if (node.complexity < filters.complexityRange[0] || node.complexity > filters.complexityRange[1]) return false;
      if (node.size < filters.sizeRange[0] || node.size > filters.sizeRange[1]) return false;
      if (!filters.showTestFiles && (node.name.includes('.test.') || node.name.includes('.spec.'))) return false;
      if (filters.hideNodeModules && node.filePath?.includes('node_modules')) return false;
      return true;
    });

    let filteredLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as CodebaseNode).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as CodebaseNode).id;
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      return nodeIds.has(sourceId) && nodeIds.has(targetId) && filters.linkTypes.has(link.type);
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }, [data, filters, searchTerm]);

  const getNodeColor = useCallback((node: CodebaseNode): string => {
    switch (viewState.colorBy) {
      case 'type':
        return {'file':'#3b82f6','component':'#10b981','function':'#f59e0b','hook':'#8b5cf6','interface':'#06b6d4','class':'#84cc16','variable':'#f97316','import':'#6366f1'}[node.type] || '#6b7280';
      case 'complexity':
        const complexity = node.complexity; if (complexity <= 5) return '#10b981'; if (complexity <= 10) return '#f59e0b'; if (complexity <= 20) return '#f97316'; return '#ef4444';
      case 'issues':
        if (node.issues.some(i => i.severity === 'critical' || i.severity === 'high')) return '#ef4444'; if (node.issues.some(i => i.severity === 'medium')) return '#f59e0b'; if (node.issues.length > 0) return '#06b6d4'; return '#10b981';
      case 'maintainability':
        const maintainability = node.maintainability; if (maintainability >= 85) return '#10b981'; if (maintainability >= 70) return '#f59e0b'; if (maintainability >= 50) return '#f97316'; return '#ef4444';
      case 'size':
        const size = node.size; if (size <= 50) return '#10b981'; if (size <= 100) return '#f59e0b'; if (size <= 200) return '#f97316'; return '#ef4444';
      default: return '#6b7280';
    }
  }, [viewState.colorBy]);

  const getNodeSize = useCallback((node: CodebaseNode): number => {
    const baseSize = Math.max(8, Math.min(30, Math.sqrt(node.size) * 2));
    const complexityBonus = node.complexity * 0.5;
    return Math.min(40, baseSize + complexityBonus);
  }, []);
    
  // --- START: Implemented Handler Functions ---
  const handleResetView = () => {
    if (svgRef.current && zoomRef.current) {
        const svg = d3.select(svgRef.current);
        svg.transition().duration(750)
           .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result as string;
              const jsonData = JSON.parse(text) as CodebaseData;
              if (!jsonData.nodes || !jsonData.links) {
                  throw new Error("Invalid JSON structure. Missing 'nodes' or 'links'.");
              }
              setData(jsonData);
          } catch (err: any) {
              setError(err.message || "Failed to parse file. Please upload a valid JSON.");
          } finally {
              setIsLoading(false);
          }
      };
      reader.onerror = () => {
          setError("Failed to read the file.");
          setIsLoading(false);
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const handleGitHubClick = async () => {
      const repoUrl = prompt("Enter a public GitHub repository URL (e.g., https://github.com/facebook/react)");
      if (!repoUrl) return;

      const urlParts = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
      if (!urlParts || !urlParts[1]) {
          setError("Invalid GitHub repository URL.");
          return;
      }
      const repoName = urlParts[1];

      setIsLoading(true);
      setError(null);
      try {
          // This is a simplified client-side demo that only fetches the root directory.
          // A real implementation would need a backend to clone and analyze the full repo.
          const response = await fetch(`https://api.github.com/repos/${repoName}/contents`);
          if (!response.ok) {
              throw new Error(`Failed to fetch repo (Status: ${response.status}). Is it public?`);
          }
          const files = await response.json();

          const nodes: CodebaseNode[] = files.map((file: any) => ({
              id: file.path,
              name: file.name,
              type: 'file', // Simplified type
              size: file.size || 1, // GitHub API returns 0 for directories
              complexity: 1, // Placeholder
              maintainability: 100, // Placeholder
              issues: [],
              bugCount: 0,
              testCoverage: 0,
              filePath: file.path,
              dependencies: [],
              metrics: { cyclomaticComplexity: 1, cognitiveComplexity: 1, linesOfCode: file.size || 1, maintainabilityIndex: 100, technicalDebt: 0, duplicateLines: 0 },
          }));
          
          setData({
              nodes,
              links: [], // Links cannot be determined without deeper analysis
              metadata: {
                  totalFiles: nodes.length,
                  totalLines: nodes.reduce((sum, n) => sum + n.size, 0),
                  languages: {},
                  lastAnalyzed: new Date(),
                  analysisVersion: '2.0.0'
              }
          });
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleAiScan = () => {
      alert("AI Scan requires a dedicated backend service to securely interact with a large language model API (like Google's Gemini). This feature is a placeholder to demonstrate where a real implementation would be triggered.");
  };
  // --- END: Implemented Handler Functions ---


  const initializeVisualization = useCallback(() => {
    if (!svgRef.current || filteredData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node()!.getBoundingClientRect().width;
    const height = svg.node()!.getBoundingClientRect().height;
    
    svg.selectAll("*").remove();
    
    const g = svg.append("g");
    gRef.current = g;

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoom(event.transform.k);
      });
    zoomRef.current = zoomBehavior; // Store zoom instance in ref
    svg.call(zoomBehavior);

    const simulation = d3.forceSimulation(filteredData.nodes)
      .force("link", d3.forceLink<CodebaseNode, CodebaseLink>(filteredData.links)
        .id((d: any) => d.id)
        .distance(d => 100 * (1.2 - d.strength * 0.5))
        .strength(d => d.strength * 0.8))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => getNodeSize(d as CodebaseNode) + 5));

    if (viewState.clustering) {
      simulation.force("cluster", d3.forceX()
        .x(d => (width / 8) * (Array.from(filters.nodeTypes).indexOf((d as CodebaseNode).type) + 1))
        .strength(0.1));
    }

    simulationRef.current = simulation;

    const defs = svg.append("defs");
    Array.from(filters.nodeTypes).forEach(type => {
      const gradient = defs.append("radialGradient").attr("id", `gradient-${type}`).attr("cx", "30%").attr("cy", "30%");
      const color = getNodeColor({ type } as CodebaseNode);
      gradient.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.9);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", d3.color(color)?.darker(0.5) || color).attr("stop-opacity", 0.7);
    });

    const link = g.append("g").selectAll("line").data(filteredData.links).join("line")
      .style("stroke", d => ({'imports':'#3b82f6','uses':'#10b981','calls':'#f59e0b','extends':'#8b5cf6','implements':'#06b6d4','tests':'#ef4444'}[d.type]||'#6b7280'))
      .style("stroke-width", d => Math.max(1, d.count * 2)).style("stroke-opacity", d => 0.3 + (d.strength * 0.4));

    const node = g.append("g").selectAll(".node").data(filteredData.nodes).join("g").attr("class", "node").style("cursor", "pointer")
      .call(d3.drag<SVGGElement, CodebaseNode>()
        .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append("circle").attr("r", getNodeSize).style("fill", d => `url(#gradient-${d.type})`).style("stroke", "#ffffff").style("stroke-width", 2)
      .style("filter", d => d.issues.some(i => i.severity === 'critical' || i.severity === 'high') ? "drop-shadow(0 0 6px #ef4444)" : "none");

    node.append("text").text(d => ({'file':'📄','component':'🧩','function':'⚙️','hook':'🪝','interface':'📋','class':'🏛️','variable':'📊','import':'📦'}[d.type]||'❓'))
      .attr("text-anchor", "middle").attr("dy", "0.35em").style("font-size", d => `${getNodeSize(d) * 0.6}px`).style("pointer-events", "none");

    if (viewState.showLabels) {
      node.append("text").text(d => d.name.length > 15 ? d.name.substring(0, 12) + "..." : d.name)
        .attr("dy", d => getNodeSize(d) + 15).style("text-anchor", "middle").style("font-size", "11px")
        .style("fill", "#e5e7eb").style("font-weight", "500").style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)").style("pointer-events", "none");
    }

    node.on("click", (event, d) => { event.stopPropagation(); setSelectedNode(selectedNode?.id === d.id ? null : d); })
      .on("mouseenter", (event, d) => {
        setHoveredNode(d);
        setTooltipPos({ x: event.clientX + 15, y: event.clientY + 15 }); // Update tooltip position
      })
      .on("mouseleave", () => setHoveredNode(null));

    simulation.on("tick", () => {
      link.attr("x1", d=>(d.source as CodebaseNode).x!).attr("y1", d=>(d.source as CodebaseNode).y!)
          .attr("x2", d=>(d.target as CodebaseNode).x!).attr("y2", d=>(d.target as CodebaseNode).y!);
      node.attr("transform", d => `translate(${d.x!},${d.y!})`);
    });

    svg.on("click", () => setSelectedNode(null));
  }, [filteredData, viewState, showSidebar, isPlaying, getNodeColor, getNodeSize, selectedNode, filters.nodeTypes]);

  useEffect(() => {
    setData(generateSOTADemoData());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
        initializeVisualization();
    }
    window.addEventListener('resize', initializeVisualization);
    return () => window.removeEventListener('resize', initializeVisualization);
  }, [initializeVisualization, isLoading]);

  const stats = useMemo(() => {
    const nodes = filteredData.nodes;
    if (nodes.length === 0) return { totalNodes: 0, totalLinks: 0, totalIssues: 0, criticalIssues: 0, avgComplexity: 0, avgMaintainability: 0, avgTestCoverage: 0 };
    const totalIssues = nodes.reduce((sum, n) => sum + n.issues.length, 0);
    const criticalIssues = nodes.reduce((sum, n) => sum + n.issues.filter(i => i.severity === 'critical').length, 0);
    const avgComplexity = nodes.reduce((sum, n) => sum + n.complexity, 0) / nodes.length;
    const avgMaintainability = nodes.reduce((sum, n) => sum + n.maintainability, 0) / nodes.length;
    const avgTestCoverage = nodes.reduce((sum, n) => sum + n.testCoverage, 0) / nodes.length;
    return {
      totalNodes: nodes.length, totalLinks: filteredData.links.length, totalIssues, criticalIssues,
      avgComplexity: Math.round(avgComplexity * 10) / 10,
      avgMaintainability: Math.round(avgMaintainability),
      avgTestCoverage: Math.round(avgTestCoverage)
    };
  }, [filteredData]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden font-sans text-white">
      <div className="absolute inset-0 opacity-5"><div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:20px_20px]"></div></div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }}/>

      <svg ref={svgRef} className={`transition-all duration-300 ${showSidebar ? 'w-[calc(100%-350px)]' : 'w-full'} h-full`} style={{ background: 'transparent' }}/>

      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowSidebar(!showSidebar)} className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg p-2 hover:bg-gray-700/80 transition-colors"><Layers className="w-5 h-5" /></button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search nodes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"/>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className={`p-2 rounded-lg border transition-colors ${isPlaying ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-gray-800/80 border-gray-600 hover:bg-gray-700/80'}`}>{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
          <button onClick={handleResetView} className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg p-2 hover:bg-gray-700/80 transition-colors"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>

      {showSidebar && (
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 z-40 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center"><Activity className="w-5 h-5 mr-2" />Analysis Overview</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-400">Nodes</div><div className="text-xl font-bold text-white">{stats.totalNodes}</div></div>
                <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-400">Links</div><div className="text-xl font-bold text-white">{stats.totalLinks}</div></div>
                <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-400">Issues</div><div className="text-xl font-bold text-red-400">{stats.totalIssues}</div></div>
                <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-400">Critical</div><div className="text-xl font-bold text-red-500">{stats.criticalIssues}</div></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Avg Complexity</span><span className="font-mono text-cyan-400">{stats.avgComplexity}</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Maintainability</span><span className="font-mono text-green-400">{stats.avgMaintainability}%</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Test Coverage</span><span className="font-mono text-blue-400">{stats.avgTestCoverage}%</span></div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center"><Settings className="w-5 h-5 mr-2" />View Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Color By</label>
                  <select value={viewState.colorBy} onChange={(e) => setViewState(prev => ({ ...prev, colorBy: e.target.value as any }))} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"><option value="type">Type</option><option value="complexity">Complexity</option><option value="issues">Issues</option><option value="maintainability">Maintainability</option><option value="size">Size</option></select>
                </div>
                {['showLabels', 'showMetrics', 'clustering'].map(key => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 capitalize">{key.replace('show', 'Show ')}</span>
                    <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={viewState[key as keyof ViewState] as boolean} onChange={(e) => setViewState(prev => ({ ...prev, [key]: e.target.checked }))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div></label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center"><Filter className="w-5 h-5 mr-2" />Filters</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Node Types</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">{['file','component','function','hook','interface','class','variable','import'].map(type => (<label key={type} className="flex items-center"><input type="checkbox" checked={filters.nodeTypes.has(type)} onChange={e => {const newTypes = new Set(filters.nodeTypes); if (e.target.checked) newTypes.add(type); else newTypes.delete(type); setFilters(prev => ({ ...prev, nodeTypes: newTypes }));}} className="mr-2" /><span className="text-sm capitalize">{type}</span></label>))}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center"><GitBranch className="w-5 h-5 mr-2" />Data Sources</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setData(generateSOTADemoData())} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-3 py-2 rounded-lg text-xs font-medium">🎲 New Demo</button>
                <button onClick={handleGitHubClick} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-3 py-2 rounded-lg text-xs font-medium"><Github className="w-3 h-3 inline mr-1" />GitHub</button>
                <button onClick={handleUploadClick} className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-3 py-2 rounded-lg text-xs font-medium"><Upload className="w-3 h-3 inline mr-1" />Upload</button>
                <button onClick={handleAiScan} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-3 py-2 rounded-lg text-xs font-medium">⚡ AI Scan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedNode && (
        <div className="fixed bottom-6 left-6 right-6 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-6 z-50 max-w-4xl mx-auto shadow-2xl">
          <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">×</button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: getNodeColor(selectedNode) }}>
                        {{'file':'📄','component':'🧩','function':'⚙️','hook':'🪝','interface':'📋','class':'🏛️','variable':'📊','import':'📦'}[selectedNode.type] || '❓'}
                    </div>
                    <div><h3 className="text-xl font-bold text-white">{selectedNode.name}</h3><p className="text-sm text-gray-400 capitalize">{selectedNode.type}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-400">Size:</span><span className="ml-2 font-mono text-cyan-400">{selectedNode.size} LOC</span></div>
                    <div><span className="text-gray-400">Complexity:</span><span className="ml-2 font-mono text-amber-400">{selectedNode.complexity}</span></div>
                    <div><span className="text-gray-400">Maintainability:</span><span className="ml-2 font-mono text-green-400">{selectedNode.maintainability}%</span></div>
                    <div><span className="text-gray-400">Test Coverage:</span><span className="ml-2 font-mono text-blue-400">{selectedNode.testCoverage}%</span></div>
                </div>
            </div>
            <div className="space-y-4">
                {selectedNode.issues.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-red-400 mb-2 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" />Issues ({selectedNode.issues.length})</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">{selectedNode.issues.map((issue, index) => (
                            <div key={index} className={`p-2 rounded text-xs border-l-4 ${issue.type === 'error' ? 'bg-red-900/20 border-red-500' : 'bg-amber-900/20 border-amber-500'}`}><div className="font-medium">{issue.message}</div></div>
                        ))}</div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {hoveredNode && (
        <div className="fixed z-60 pointer-events-none bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg p-3 text-sm shadow-lg" style={{ top: tooltipPos.y, left: tooltipPos.x }}>
          <div className="font-semibold">{hoveredNode.name}</div>
          <div className="text-gray-400 capitalize">{hoveredNode.type}</div>
          <div className="text-xs text-cyan-400 mt-1">Complexity: {hoveredNode.complexity} • Size: {hoveredNode.size} LOC</div>
          {hoveredNode.issues.length > 0 && <div className="text-xs text-red-400 mt-1">{hoveredNode.issues.length} issue{hoveredNode.issues.length !== 1 ? 's' : ''}</div>}
        </div>
      )}

      {isLoading && <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[100]"><div className="bg-gray-800 rounded-lg p-6 text-center"><div className="animate-spin text-4xl mb-4">🔄</div><h2 className="text-xl font-bold mb-2">Analyzing Codebase</h2><p className="text-gray-400">Please wait...</p></div></div>}
      {error && <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white p-4 rounded-lg z-[100] shadow-lg flex items-center"><XCircle className="w-5 h-5 mr-2" /><span className="font-medium">Error: {error}</span><button onClick={() => setError(null)} className="ml-4 text-xl font-bold">&times;</button></div>}

      <div className="fixed bottom-6 right-6 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg px-3 py-1 text-xs z-30">Zoom: {Math.round(zoom * 100)}%</div>

      <style jsx>{`
        .slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: #06b6d4; border-radius: 50%; cursor: pointer; }
        .slider::-moz-range-thumb { width: 16px; height: 16px; background: #06b6d4; border-radius: 50%; cursor: pointer; border: none; }
      `}</style>
    </div>
  );
};

export default RealCodebaseVisualizer;
