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

const RealCodebaseVisualizer: React.FC = () => {
  // Core state
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<CodebaseData>({ nodes: [], links: [], metadata: { totalFiles: 0, totalLines: 0, languages: {}, lastAnalyzed: new Date(), analysisVersion: '2.0.0' } });
  const [selectedNode, setSelectedNode] = useState<CodebaseNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<CodebaseNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Advanced UI state
  const [filters, setFilters] = useState<FilterState>({
    nodeTypes: new Set(['file', 'component', 'function', 'hook', 'interface']),
    linkTypes: new Set(['imports', 'uses', 'calls']),
    complexityRange: [0, 100],
    sizeRange: [0, 1000],
    issueTypes: new Set(['error', 'warning', 'suggestion']),
    showTestFiles: true,
    hideNodeModules: false
  });

  const [viewState, setViewState] = useState<ViewState>({
    mode: '2d',
    colorBy: 'type',
    clustering: true,
    showLabels: true,
    showMetrics: false,
    animationSpeed: 1
  });

  const [showSidebar, setShowSidebar] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Simulation refs
  const simulationRef = useRef<d3.Simulation<CodebaseNode, CodebaseLink>>();
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();

  // Filtered data based on current filters and search
  const filteredData = useMemo(() => {
    let filteredNodes = data.nodes.filter(node => {
      // Search filter
      if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      // Type filter
      if (!filters.nodeTypes.has(node.type)) return false;
      
      // Complexity filter
      if (node.complexity < filters.complexityRange[0] || node.complexity > filters.complexityRange[1]) return false;
      
      // Size filter
      if (node.size < filters.sizeRange[0] || node.size > filters.sizeRange[1]) return false;
      
      // Test files filter
      if (!filters.showTestFiles && (node.name.includes('.test.') || node.name.includes('.spec.'))) return false;
      
      // Node modules filter
      if (filters.hideNodeModules && node.filePath?.includes('node_modules')) return false;
      
      return true;
    });

    let filteredLinks = data.links.filter(link => {
      const sourceNode = typeof link.source === 'string' 
        ? filteredNodes.find(n => n.id === link.source)
        : filteredNodes.includes(link.source);
      const targetNode = typeof link.target === 'string' 
        ? filteredNodes.find(n => n.id === link.target)
        : filteredNodes.includes(link.target);
      
      return sourceNode && targetNode && filters.linkTypes.has(link.type);
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }, [data, filters, searchTerm]);

  // Advanced color schemes
  const getNodeColor = useCallback((node: CodebaseNode): string => {
    switch (viewState.colorBy) {
      case 'type':
        return {
          'file': '#3b82f6', 'component': '#10b981', 'function': '#f59e0b',
          'hook': '#8b5cf6', 'interface': '#06b6d4', 'class': '#84cc16',
          'variable': '#f97316', 'import': '#6366f1'
        }[node.type] || '#6b7280';
      
      case 'complexity':
        const complexity = node.complexity;
        if (complexity <= 5) return '#10b981';
        if (complexity <= 10) return '#f59e0b';
        if (complexity <= 20) return '#f97316';
        return '#ef4444';
      
      case 'issues':
        if (node.issues.some(i => i.type === 'error')) return '#ef4444';
        if (node.issues.some(i => i.type === 'warning')) return '#f59e0b';
        if (node.issues.length > 0) return '#06b6d4';
        return '#10b981';
      
      case 'maintainability':
        const maintainability = node.maintainability;
        if (maintainability >= 85) return '#10b981';
        if (maintainability >= 70) return '#f59e0b';
        if (maintainability >= 50) return '#f97316';
        return '#ef4444';
      
      case 'size':
        const size = node.size;
        if (size <= 50) return '#10b981';
        if (size <= 100) return '#f59e0b';
        if (size <= 200) return '#f97316';
        return '#ef4444';
      
      default:
        return '#6b7280';
    }
  }, [viewState.colorBy]);

  const getNodeSize = useCallback((node: CodebaseNode): number => {
    const baseSize = Math.max(8, Math.min(30, Math.sqrt(node.size) * 2));
    const complexityBonus = node.complexity * 0.5;
    return Math.min(40, baseSize + complexityBonus);
  }, []);

  // Enhanced D3 visualization with modern patterns
  const initializeVisualization = useCallback(() => {
    if (!svgRef.current || filteredData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = window.innerWidth - (showSidebar ? 350 : 0);
    const height = window.innerHeight;
    
    svg.selectAll("*").remove();
    
    const g = svg.append("g");
    gRef.current = g;

    // Advanced zoom with smooth transitions
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoom(event.transform.k);
      });
    
    svg.call(zoomBehavior);

    // Create force simulation with enhanced forces
    const simulation = d3.forceSimulation(filteredData.nodes)
      .force("link", d3.forceLink<CodebaseNode, CodebaseLink>(filteredData.links)
        .id((d: any) => d.id)
        .distance(d => {
          const baseDistance = 100;
          const strengthMultiplier = 1 - d.strength * 0.5;
          return baseDistance * strengthMultiplier;
        })
        .strength(d => d.strength))
      .force("charge", d3.forceManyBody()
        .strength(d => -300 - (d.complexity * 10)))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide()
        .radius(d => getNodeSize(d) + 5));

    if (viewState.clustering) {
      // Add clustering force based on node type
      simulation.force("cluster", d3.forceX()
        .x(d => {
          const typeIndex = Array.from(new Set(filteredData.nodes.map(n => n.type))).indexOf(d.type);
          return (width / 6) * (typeIndex + 1);
        })
        .strength(0.1));
    }

    simulationRef.current = simulation;

    // Enhanced gradient definitions
    const defs = svg.append("defs");
    
    // Create gradients for different node types
    const gradients = ['file', 'component', 'function', 'hook', 'interface'];
    gradients.forEach(type => {
      const gradient = defs.append("radialGradient")
        .attr("id", `gradient-${type}`)
        .attr("cx", "30%")
        .attr("cy", "30%");
      
      const color = getNodeColor({ type, complexity: 1, maintainability: 85, size: 50 } as CodebaseNode);
      gradient.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.9);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", d3.color(color)?.darker(0.5) || color).attr("stop-opacity", 0.7);
    });

    // Enhanced link rendering with animated flow
    const linkGroup = g.append("g").attr("class", "links");
    
    const link = linkGroup.selectAll("line")
      .data(filteredData.links)
      .join("line")
      .attr("class", "link")
      .style("stroke", d => ({
        'imports': '#3b82f6',
        'uses': '#10b981', 
        'calls': '#f59e0b',
        'extends': '#8b5cf6',
        'implements': '#06b6d4',
        'tests': '#ef4444'
      }[d.type] || '#6b7280'))
      .style("stroke-width", d => Math.max(1, d.count * 2))
      .style("stroke-opacity", d => 0.3 + (d.strength * 0.4))
      .style("stroke-dasharray", d => d.type === 'uses' ? "5,5" : "none");

    // Animated particles along links for active connections
    if (isPlaying) {
      const particles = linkGroup.selectAll("circle.particle")
        .data(filteredData.links.filter(d => d.strength > 0.5))
        .join("circle")
        .attr("class", "particle")
        .attr("r", 2)
        .style("fill", "#fff")
        .style("opacity", 0.8);

      particles.each(function(d) {
        const particle = d3.select(this);
        particle.transition()
          .duration(2000 / viewState.animationSpeed)
          .ease(d3.easeLinear)
          .attrTween("transform", () => {
            return (t: number) => {
              const source = d.source as CodebaseNode;
              const target = d.target as CodebaseNode;
              const x = source.x! + (target.x! - source.x!) * t;
              const y = source.y! + (target.y! - source.y!) * t;
              return `translate(${x},${y})`;
            };
          })
          .on("end", () => particle.remove());
      });
    }

    // Enhanced node rendering
    const nodeGroup = g.append("g").attr("class", "nodes");
    
    const node = nodeGroup.selectAll(".node")
      .data(filteredData.nodes)
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

    // Main node circle with gradient fill
    node.append("circle")
      .attr("r", getNodeSize)
      .style("fill", d => `url(#gradient-${d.type})`)
      .style("stroke", "#ffffff")
      .style("stroke-width", 2)
      .style("filter", d => d.issues.some(i => i.type === 'error') ? "drop-shadow(0 0 6px #ef4444)" : "none");

    // Node icons
    node.append("text")
      .text(d => ({
        'file': '📄', 'component': '🧩', 'function': '⚙️', 
        'hook': '🪝', 'interface': '📋', 'class': '🏛️',
        'variable': '📊', 'import': '📦'
      }[d.type] || '❓'))
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", d => `${getNodeSize(d) * 0.6}px`)
      .style("pointer-events", "none");

    // Issue indicators
    node.filter(d => d.issues.length > 0)
      .append("circle")
      .attr("cx", d => getNodeSize(d) * 0.7)
      .attr("cy", d => -getNodeSize(d) * 0.7)
      .attr("r", 4)
      .style("fill", d => d.issues.some(i => i.type === 'error') ? '#ef4444' : '#f59e0b')
      .style("stroke", "#ffffff")
      .style("stroke-width", 1);

    // Node labels
    if (viewState.showLabels) {
      node.append("text")
        .text(d => d.name.length > 15 ? d.name.substring(0, 12) + "..." : d.name)
        .attr("dy", d => getNodeSize(d) + 15)
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "#e5e7eb")
        .style("font-weight", "500")
        .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
        .style("pointer-events", "none");
    }

    // Metrics overlay
    if (viewState.showMetrics) {
      node.append("text")
        .text(d => `${d.complexity}`)
        .attr("dy", d => getNodeSize(d) + (viewState.showLabels ? 30 : 15))
        .style("text-anchor", "middle")
        .style("font-size", "9px")
        .style("fill", "#94a3b8")
        .style("pointer-events", "none");
    }

    // Enhanced interactions
    node
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNode(selectedNode?.id === d.id ? null : d);
      })
      .on("mouseenter", (event, d) => {
        setHoveredNode(d);
        
        // Highlight connected nodes
        const connectedNodeIds = new Set<string>();
        filteredData.links.forEach(link => {
          if ((link.source as CodebaseNode).id === d.id) {
            connectedNodeIds.add((link.target as CodebaseNode).id);
          }
          if ((link.target as CodebaseNode).id === d.id) {
            connectedNodeIds.add((link.source as CodebaseNode).id);
          }
        });

        node.style("opacity", n => n.id === d.id || connectedNodeIds.has(n.id) ? 1 : 0.3);
        link.style("opacity", l => 
          (l.source as CodebaseNode).id === d.id || (l.target as CodebaseNode).id === d.id ? 0.8 : 0.1
        );
      })
      .on("mouseleave", () => {
        setHoveredNode(null);
        node.style("opacity", 1);
        link.style("opacity", d => 0.3 + (d.strength * 0.4));
      });

    // Simulation tick with smooth animations
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as CodebaseNode).x!)
        .attr("y1", d => (d.source as CodebaseNode).y!)
        .attr("x2", d => (d.target as CodebaseNode).x!)
        .attr("y2", d => (d.target as CodebaseNode).y!);

      node.attr("transform", d => `translate(${d.x!},${d.y!})`);
    });

    // Click to deselect
    svg.on("click", () => setSelectedNode(null));

  }, [filteredData, viewState, showSidebar, isPlaying, getNodeColor, getNodeSize, selectedNode]);

  // Initialize with demo data
  useEffect(() => {
    const demoData = generateSOTADemoData();
    setData(demoData);
    setIsLoading(false);
  }, []);

  // Update visualization when data or settings change
  useEffect(() => {
    if (filteredData.nodes.length > 0) {
      initializeVisualization();
    }
  }, [initializeVisualization]);

  // Stats computation
  const stats = useMemo(() => {
    const nodes = filteredData.nodes;
    const totalIssues = nodes.reduce((sum, n) => sum + n.issues.length, 0);
    const criticalIssues = nodes.reduce((sum, n) => sum + n.issues.filter(i => i.severity === 'critical').length, 0);
    const avgComplexity = nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.complexity, 0) / nodes.length : 0;
    const avgMaintainability = nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.maintainability, 0) / nodes.length : 0;
    const avgTestCoverage = nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.testCoverage, 0) / nodes.length : 0;

    return {
      totalNodes: nodes.length,
      totalLinks: filteredData.links.length,
      totalIssues,
      criticalIssues,
      avgComplexity: Math.round(avgComplexity * 10) / 10,
      avgMaintainability: Math.round(avgMaintainability),
      avgTestCoverage: Math.round(avgTestCoverage)
    };
  }, [filteredData]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden font-sans text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:20px_20px]"></div>
      </div>

      {/* Main SVG Canvas */}
      <svg 
        ref={svgRef} 
        className={`transition-all duration-300 ${showSidebar ? 'w-[calc(100%-350px)]' : 'w-full'} h-full`}
        style={{ background: 'transparent' }}
      />

      {/* Top Control Bar */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg p-2 hover:bg-gray-700/80 transition-colors"
          >
            <Layers className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg border transition-colors ${
              isPlaying 
                ? 'bg-cyan-600 border-cyan-500 text-white' 
                : 'bg-gray-800/80 border-gray-600 hover:bg-gray-700/80'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg p-2 hover:bg-gray-700/80 transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 z-40 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Stats Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Analysis Overview
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400">Nodes</div>
                  <div className="text-xl font-bold text-white">{stats.totalNodes}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400">Links</div>
                  <div className="text-xl font-bold text-white">{stats.totalLinks}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400">Issues</div>
                  <div className="text-xl font-bold text-red-400">{stats.totalIssues}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400">Critical</div>
                  <div className="text-xl font-bold text-red-500">{stats.criticalIssues}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Avg Complexity</span>
                  <span className="font-mono text-cyan-400">{stats.avgComplexity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Maintainability</span>
                  <span className="font-mono text-green-400">{stats.avgMaintainability}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Test Coverage</span>
                  <span className="font-mono text-blue-400">{stats.avgTestCoverage}%</span>
                </div>
              </div>
            </div>

            {/* View Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                View Settings
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Color By</label>
                  <select 
                    value={viewState.colorBy}
                    onChange={(e) => setViewState(prev => ({ ...prev, colorBy: e.target.value as any }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
                  >
                    <option value="type">Type</option>
                    <option value="complexity">Complexity</option>
                    <option value="issues">Issues</option>
                    <option value="maintainability">Maintainability</option>
                    <option value="size">Size</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Show Labels</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={viewState.showLabels}
                      onChange={(e) => setViewState(prev => ({ ...prev, showLabels: e.target.checked }))}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Show Metrics</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={viewState.showMetrics}
                      onChange={(e) => setViewState(prev => ({ ...prev, showMetrics: e.target.checked }))}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Clustering</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={viewState.clustering}
                      onChange={(e) => setViewState(prev => ({ ...prev, clustering: e.target.checked }))}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Animation Speed</label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="3" 
                    step="0.1"
                    value={viewState.animationSpeed}
                    onChange={(e) => setViewState(prev => ({ ...prev, animationSpeed: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">{viewState.animationSpeed}x</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Node Types</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {['file', 'component', 'function', 'hook', 'interface', 'class', 'variable', 'import'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.nodeTypes.has(type)}
                          onChange={(e) => {
                            const newTypes = new Set(filters.nodeTypes);
                            if (e.target.checked) {
                              newTypes.add(type);
                            } else {
                              newTypes.delete(type);
                            }
                            setFilters(prev => ({ ...prev, nodeTypes: newTypes }));
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Complexity Range ({filters.complexityRange[0]} - {filters.complexityRange[1]})
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={filters.complexityRange[1]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      complexityRange: [0, parseInt(e.target.value)] 
                    }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Hide Test Files</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={!filters.showTestFiles}
                      onChange={(e) => setFilters(prev => ({ ...prev, showTestFiles: !e.target.checked }))}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Data Source Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center">
                <GitBranch className="w-5 h-5 mr-2" />
                Data Sources
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    const newData = generateSOTADemoData();
                    setData(newData);
                  }}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg"
                >
                  🎲 New Demo
                </button>
                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg">
                  <Github className="w-3 h-3 inline mr-1" />
                  GitHub
                </button>
                <button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg">
                  <Upload className="w-3 h-3 inline mr-1" />
                  Upload
                </button>
                <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg">
                  ⚡ AI Scan
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400">Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>Files</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Components</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                  <span>Functions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span>Hooks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
                  <span>Interfaces</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="fixed bottom-6 left-6 right-6 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-6 z-50 max-w-4xl mx-auto shadow-2xl">
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: getNodeColor(selectedNode) }}
                >
                  {{
                    'file': '📄', 'component': '🧩', 'function': '⚙️', 
                    'hook': '🪝', 'interface': '📋', 'class': '🏛️',
                    'variable': '📊', 'import': '📦'
                  }[selectedNode.type] || '❓'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedNode.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">{selectedNode.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="ml-2 font-mono text-cyan-400">{selectedNode.size} LOC</span>
                </div>
                <div>
                  <span className="text-gray-400">Complexity:</span>
                  <span className="ml-2 font-mono text-amber-400">{selectedNode.complexity}</span>
                </div>
                <div>
                  <span className="text-gray-400">Maintainability:</span>
                  <span className="ml-2 font-mono text-green-400">{selectedNode.maintainability}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Test Coverage:</span>
                  <span className="ml-2 font-mono text-blue-400">{selectedNode.testCoverage}%</span>
                </div>
              </div>

              {selectedNode.filePath && (
                <div className="text-sm">
                  <span className="text-gray-400">Path:</span>
                  <span className="ml-2 font-mono text-gray-300 break-all">{selectedNode.filePath}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Issues */}
              {selectedNode.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-400 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Issues ({selectedNode.issues.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedNode.issues.map((issue, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded text-xs border-l-4 ${
                          issue.type === 'error' ? 'bg-red-900/20 border-red-500' :
                          issue.type === 'warning' ? 'bg-amber-900/20 border-amber-500' :
                          'bg-blue-900/20 border-blue-500'
                        }`}
                      >
                        <div className="font-medium">{issue.message}</div>
                        <div className="text-gray-400 mt-1">
                          {issue.rule} {issue.line && `(Line ${issue.line})`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Detailed Metrics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-gray-400">Cyclomatic</div>
                    <div className="font-mono text-white">{selectedNode.metrics.cyclomaticComplexity}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-gray-400">Cognitive</div>
                    <div className="font-mono text-white">{selectedNode.metrics.cognitiveComplexity}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-gray-400">Tech Debt</div>
                    <div className="font-mono text-white">{selectedNode.metrics.technicalDebt}h</div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-gray-400">Duplicates</div>
                    <div className="font-mono text-white">{selectedNode.metrics.duplicateLines}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredNode && (
        <div className="fixed z-60 pointer-events-none bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg p-3 text-sm shadow-lg">
          <div className="font-semibold">{hoveredNode.name}</div>
          <div className="text-gray-400 capitalize">{hoveredNode.type}</div>
          <div className="text-xs text-cyan-400 mt-1">
            Complexity: {hoveredNode.complexity} • Size: {hoveredNode.size} LOC
          </div>
          {hoveredNode.issues.length > 0 && (
            <div className="text-xs text-red-400 mt-1">
              {hoveredNode.issues.length} issue{hoveredNode.issues.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <h2 className="text-xl font-bold mb-2">Analyzing Codebase</h2>
            <p className="text-gray-400">Please wait while we process your code...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white p-4 rounded-lg z-50 shadow-lg">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Zoom Indicator */}
      <div className="fixed bottom-6 right-6 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg px-3 py-1 text-xs z-30">
        Zoom: {Math.round(zoom * 100)}%
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #06b6d4;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #06b6d4;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default RealCodebaseVisualizer;
