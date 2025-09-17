import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

// TypeScript interfaces
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

// Demo data generator
const generateDemoData = (): CodebaseData => {
  const nodes: CodebaseNode[] = [];
  const links: CodebaseLink[] = [];

  // Sample files with realistic code structure
  const sampleFiles = [
    {
      name: 'index.js',
      size: 45,
      classes: ['App'],
      functions: ['main', 'init', 'handleError'],
      variables: ['config', 'state'],
      issues: ['todo-comment', 'long-line']
    },
    {
      name: 'api.js',
      size: 120,
      classes: ['ApiClient'],
      functions: ['fetchData', 'postData', 'handleAuth'],
      variables: ['baseUrl', 'token'],
      issues: ['hardcoded-secret', 'potential-null-pointer']
    },
    {
      name: 'utils.js',
      size: 80,
      classes: [],
      functions: ['formatDate', 'validateEmail', 'sanitize'],
      variables: ['regex', 'constants'],
      issues: ['xss-risk']
    },
    {
      name: 'components/Header.jsx',
      size: 65,
      classes: ['Header'],
      functions: ['render', 'handleClick'],
      variables: ['props', 'state'],
      issues: []
    },
    {
      name: 'components/Footer.jsx',
      size: 30,
      classes: ['Footer'],
      functions: ['render'],
      variables: ['props'],
      issues: ['missing-return']
    },
    {
      name: 'auth/login.py',
      size: 150,
      classes: ['LoginManager'],
      functions: ['authenticate', 'validate', 'logout'],
      variables: ['session', 'credentials'],
      issues: ['unsafe-eval', 'division-by-zero']
    },
    {
      name: 'database/models.py',
      size: 200,
      classes: ['User', 'Product', 'Order'],
      functions: ['save', 'find', 'delete', 'validate'],
      variables: ['connection', 'schema'],
      issues: ['performance-issue', 'memory-leak']
    }
  ];

  // Generate nodes
  sampleFiles.forEach(file => {
    // File node
    const fileNode: CodebaseNode = {
      id: file.name,
      type: 'file',
      name: file.name.split('/').pop() || file.name,
      size: file.size,
      issues: file.issues,
      bugCount: file.issues.length,
      filePath: file.name
    };
    nodes.push(fileNode);

    // Class nodes
    file.classes.forEach(className => {
      const classNode: CodebaseNode = {
        id: `${file.name}::${className}`,
        type: 'class',
        name: className,
        parent: file.name,
        size: Math.floor(file.size / (file.classes.length + 1)),
        issues: Math.random() > 0.7 ? ['naming-convention'] : [],
        bugCount: 0,
        startLine: Math.floor(Math.random() * 50) + 1
      };
      classNode.bugCount = classNode.issues.length;
      nodes.push(classNode);
      links.push({ source: file.name, target: classNode.id, type: 'contains' });

      // Methods for classes
      const methodCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < methodCount; i++) {
        const methodName = `method${i + 1}`;
        const methodNode: CodebaseNode = {
          id: `${classNode.id}::${methodName}`,
          type: 'function',
          name: `${methodName}()`,
          parent: classNode.id,
          size: Math.floor(Math.random() * 20) + 5,
          issues: Math.random() > 0.8 ? ['large-function'] : [],
          bugCount: 0,
          startLine: Math.floor(Math.random() * 100) + 1
        };
        methodNode.bugCount = methodNode.issues.length;
        nodes.push(methodNode);
        links.push({ source: classNode.id, target: methodNode.id, type: 'contains' });
      }
    });

    // Function nodes
    file.functions.forEach(funcName => {
      const parentId = file.classes.length > 0 && Math.random() > 0.5 
        ? `${file.name}::${file.classes[0]}` 
        : file.name;
      
      const funcNode: CodebaseNode = {
        id: `${parentId}::${funcName}`,
        type: 'function',
        name: `${funcName}()`,
        parent: parentId,
        size: Math.floor(Math.random() * 25) + 5,
        issues: Math.random() > 0.6 ? ['todo-comment', 'performance-issue'].slice(0, Math.floor(Math.random() * 2) + 1) : [],
        bugCount: 0,
        startLine: Math.floor(Math.random() * 100) + 1
      };
      funcNode.bugCount = funcNode.issues.length;
      nodes.push(funcNode);
      links.push({ source: parentId, target: funcNode.id, type: 'contains' });
    });

    // Variable nodes
    file.variables.forEach(varName => {
      const parentId = file.classes.length > 0 && Math.random() > 0.3 
        ? `${file.name}::${file.classes[0]}` 
        : file.name;
      
      const varNode: CodebaseNode = {
        id: `${parentId}::${varName}`,
        type: 'variable',
        name: varName,
        parent: parentId,
        size: 1,
        issues: Math.random() > 0.8 ? ['naming-convention'] : [],
        bugCount: 0,
        startLine: Math.floor(Math.random() * 50) + 1
      };
      varNode.bugCount = varNode.issues.length;
      nodes.push(varNode);
      links.push({ source: parentId, target: varNode.id, type: 'contains' });
    });
  });

  // Add cross-dependencies
  const functionNodes = nodes.filter(n => n.type === 'function');
  for (let i = 0; i < Math.min(8, functionNodes.length); i++) {
    const source = functionNodes[Math.floor(Math.random() * functionNodes.length)];
    const target = functionNodes[Math.floor(Math.random() * functionNodes.length)];
    if (source.id !== target.id) {
      links.push({ source: source.id, target: target.id, type: 'call' });
    }
  }

  // Add some error links
  const errorNodes = nodes.filter(n => n.bugCount > 1);
  errorNodes.forEach(node => {
    if (Math.random() > 0.7) {
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      if (randomNode.id !== node.id) {
        links.push({ source: node.id, target: randomNode.id, type: 'error' });
      }
    }
  });

  return { nodes, links };
};

// Main Component
const RealCodebaseVisualizer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<CodebaseData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<CodebaseNode | null>(null);
  const [stats, setStats] = useState<StatsData>({ errors: 0, warnings: 0, nodes: 0, links: 0, bugDensity: 0 });
  const simulationRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
  const forceSimulationRef = useRef<d3.Simulation<CodebaseNode, undefined>>();
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'demo' | 'github'>('demo');
  const [repoUrl, setRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      return {
        owner: match[1],
        repo: match[2].replace('.git', '')
      };
    }
    return null;
  };

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
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const demoData = generateDemoData();
    const newStats = calculateStats(demoData.nodes, demoData.links);
    setStats(newStats);
    setData(demoData);
    setDataSource('demo');
    setIsLoading(false);
  };

  useEffect(() => {
    loadDemoData();
  }, []);

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

  const handleResetLayout = useCallback(() => {
    if (forceSimulationRef.current) {
      forceSimulationRef.current.alpha(1).restart();
    }
  }, []);

  const handleCenterView = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const transform = d3.zoomIdentity.translate(width / 2, height / 2).scale(1);
    svg.transition().duration(750).call(d3.zoom<SVGSVGElement, unknown>().transform, transform);
  }, []);

  const handleRunBugScan = useCallback(() => {
    setData(prevData => {
      const newNodes = prevData.nodes.map(node => {
        // Simulate finding new issues
        if (Math.random() < 0.15) {
          const newIssues = ['memory-leak', 'performance-issue', 'security-vulnerability'];
          const randomIssue = newIssues[Math.floor(Math.random() * newIssues.length)];
          return {
            ...node,
            bugCount: node.bugCount + 1,
            issues: [...node.issues, randomIssue]
          };
        }
        return node;
      });
      
      const newStats = {
        errors: newNodes.filter(n => n.bugCount > 2).length,
        warnings: newNodes.filter(n => n.bugCount > 0 && n.bugCount <= 2).length,
        nodes: newNodes.length,
        links: prevData.links.length,
        bugDensity: newNodes.length > 0 ? Math.round((newNodes.filter(n => n.bugCount > 0).length / newNodes.length) * 100) : 0
      };
      setStats(newStats);
      
      return { ...prevData, nodes: newNodes };
    });
  }, []);

  const handleToggleNodeType = useCallback((type: string) => {
    if (!simulationRef.current) return;
    const nodes = simulationRef.current.selectAll<SVGGElement, CodebaseNode>(".node").filter((d: CodebaseNode) => d.type === type);
    const isVisible = nodes.style("opacity") !== "0";
    nodes.style("opacity", isVisible ? 0 : 1);
  }, []);

  const handleHighlightErrors = useCallback(() => {
    if (!simulationRef.current) return;
    const allNodes = simulationRef.current.selectAll<SVGGElement, CodebaseNode>(".node");
    const allLinks = simulationRef.current.parent()?.selectAll<SVGLineElement, CodebaseLink>(".link");
    
    allNodes.style("opacity", 0.2);
    allLinks?.style("opacity", 0.1);
    
    allNodes.filter((d: CodebaseNode) => d.bugCount > 2).style("opacity", 1);
    allLinks?.filter((d: CodebaseLink) => d.type === "error").style("opacity", 1);
  }, []);

  const handleHighlightWarnings = useCallback(() => {
    if (!simulationRef.current) return;
    const allNodes = simulationRef.current.selectAll<SVGGElement, CodebaseNode>(".node");
    const allLinks = simulationRef.current.parent()?.selectAll<SVGLineElement, CodebaseLink>(".link");
    
    allNodes.style("opacity", 0.2);
    allLinks?.style("opacity", 0.2);
    
    allNodes.filter((d: CodebaseNode) => d.bugCount > 0 && d.bugCount <= 2).style("opacity", 1);
  }, []);

  const handleClearHighlights = useCallback(() => {
    if (!simulationRef.current) return;
    const allNodes = simulationRef.current.selectAll(".node");
    const allLinks = simulationRef.current.parent()?.selectAll(".link");
    
    allNodes.style("opacity", 1);
    allLinks?.style("opacity", 0.7);
  }, []);

  const handleGenerateNewData = useCallback(() => {
    loadDemoData();
  }, []);

  const handleLoadRepository = useCallback(() => {
    if (repoUrl.trim()) {
      loadGitHubRepository(repoUrl.trim(), githubToken.trim() || undefined);
      setShowRepoInput(false);
    }
  }, [repoUrl, githubToken]);

  const RepositoryInputModal: React.FC = () => {
    if (!showRepoInput) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 w-96 max-w-90vw">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Load GitHub Repository</h3>
            <button 
              onClick={() => setShowRepoInput(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Repository URL*
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                GitHub Token (Optional)
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Optional: Provide for private repos or higher rate limits
              </p>
            </div>
            
            <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded p-3">
              <p className="text-blue-200 text-sm">
                <strong>Note:</strong> Analysis is limited to 20 code files to respect API rate limits. 
                Supported languages: JS, TS, Python, Java, C/C++, C#, PHP, Ruby, Go.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={handleLoadRepository}
                disabled={!repoUrl.trim() || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                {isLoading ? 'Loading...' : 'Load Repository'}
              </button>
              <button
                onClick={() => setShowRepoInput(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const NodeDetailsPanel: React.FC<{ node: CodebaseNode | null; onClose: () => void }> = ({ node, onClose }) => {
    if (!node) return null;

    const getIssueDescription = (issue: string): string => {
      const descriptions: { [key: string]: string } = {
        'potential-null-pointer': 'Potential null pointer dereference',
        'unsafe-eval': 'Use of unsafe eval() function',
        'xss-risk': 'Cross-site scripting vulnerability risk',
        'division-by-zero': 'Potential division by zero',
        'todo-comment': 'TODO/FIXME comment found',
        'hardcoded-secret': 'Hardcoded credentials detected',
        'long-line': 'Line length exceeds recommended limit',
        'large-function': 'Function is too complex/large',
        'missing-return': 'Function may be missing return statement',
        'naming-convention': 'Naming convention violation',
        'memory-leak': 'Potential memory leak',
        'performance-issue': 'Performance optimization needed',
        'security-vulnerability': 'Security vulnerability detected'
      };
      return descriptions[issue] || issue.replace('-', ' ');
    };

    return (
      <div className="fixed top-4 right-4 w-96 bg-gray-900 bg-opacity-95 backdrop-blur-lg border border-gray-600 rounded-lg p-6 text-white shadow-2xl z-50 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-green-400">{node.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <p><span className="font-semibold text-blue-300">Type:</span> {node.type}</p>
            <p><span className="font-semibold text-blue-300">Size:</span> {node.size} LOC</p>
            <p><span className="font-semibold text-blue-300">Bugs:</span> 
              <span className={`ml-1 px-2 py-1 rounded text-xs font-bold ${
                node.bugCount > 2 ? "bg-red-600" : 
                node.bugCount > 0 ? "bg-yellow-600" : "bg-green-600"
              }`}>
                {node.bugCount}
              </span>
            </p>
            <p><span className="font-semibold text-blue-300">Line:</span> {node.startLine || 'N/A'}</p>
          </div>
          
          {node.parent && (
            <p><span className="font-semibold text-blue-300">Parent:</span> 
              <span className="text-yellow-300 ml-1">{node.parent.split('::').pop()}</span>
            </p>
          )}
          
          {node.filePath && (
            <p><span className="font-semibold text-blue-300">File:</span> 
              <span className="text-gray-300 ml-1 font-mono text-xs">{node.filePath}</span>
            </p>
          )}
          
          {node.issues.length > 0 && (
            <div className="mt-4 p-4 bg-red-900 bg-opacity-30 border-l-4 border-red-500 rounded">
              <p className="font-semibold text-red-300 mb-3 flex items-center">
                🚨 Issues Found ({node.issues.length})
              </p>
              <div className="space-y-2">
                {node.issues.map((issue, index) => (
                  <div key={index} className="bg-red-800 bg-opacity-20 rounded p-2">
                    <p className="text-red-200 text-xs font-semibold">{issue}</p>
                    <p className="text-red-100 text-xs opacity-75 mt-1">
                      {getIssueDescription(issue)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {node.issues.length === 0 && (
            <div className="mt-4 p-3 bg-green-900 bg-opacity-30 border-l-4 border-green-500 rounded">
              <p className="text-green-300 text-sm">✅ No issues detected</p>
            </div>
          )}
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
    return (
      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-80 backdrop-blur-lg rounded-lg p-4 text-white z-30">
        <h3 className="text-lg font-bold mb-3 text-center text-green-400">Code Analysis</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="flex items-center">🚨 Critical:</span>
            <span className={`font-bold px-2 py-1 rounded text-xs ${
              stats.errors > 0 ? "bg-red-600 text-white" : "bg-gray-600 text-gray-300"
            }`}>{stats.errors}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center">⚠️ Warnings:</span>
            <span className={`font-bold px-2 py-1 rounded text-xs ${
              stats.warnings > 0 ? "bg-yellow-600 text-white" : "bg-gray-600 text-gray-300"
            }`}>{stats.warnings}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center">📊 Components:</span>
            <span className="font-bold text-blue-400">{stats.nodes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center">🔗 Connections:</span>
            <span className="font-bold text-purple-400">{stats.links}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center">🔥 Bug Density:</span>
            <span className={`font-bold px-2 py-1 rounded text-xs ${
              stats.bugDensity > 20 ? "bg-red-600" :
              stats.bugDensity > 10 ? "bg-yellow-600" : "bg-green-600"
            } text-white`}>{stats.bugDensity}%</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-600">
          <p className="text-xs text-gray-400 text-center">
            {dataSource === 'demo' ? '🎭 Demo Data' : `📂 GitHub: ${parseGitHubUrl(repoUrl)?.repo || 'Repository'}`}
          </p>
        </div>
      </div>
    );
  };

  const Legend: React.FC = () => {
    const legendItems = [
      { color: 'bg-blue-500', label: 'Files', icon: '📁' },
      { color: 'bg-green-500', label: 'Classes', icon: '🏛️' },
      { color: 'bg-orange-500', label: 'Functions', icon: '⚙️' },
      { color: 'bg-purple-500', label: 'Variables', icon: '💜' },
      { color: 'bg-red-500 animate-pulse', label: 'Critical Issues', icon: '🚨' },
      { color: 'bg-yellow-500', label: 'Warnings', icon: '⚠️' },
    ];

    return (
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 backdrop-blur-lg rounded-lg p-4 text-white z-30">
        <h4 className="font-bold mb-2 text-green-400">Legend</h4>
        <div className="space-y-2">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-lg">{item.icon}</span>
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-600">
          <h5 className="text-xs font-semibold text-gray-300 mb-1">Connections</h5>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-blue-400"></div>
              <span>Contains</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-orange-400"></div>
              <span>Function Call</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-green-400" style={{borderTop: '1px dashed'}}></div>
              <span>Dependency</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-red-500"></div>
              <span>Error Link</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
      
      <svg 
        ref={svgRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
      
      <ControlPanel />
      <StatsPanel />
      <Legend />
      <RepositoryInputModal />
      
      <NodeDetailsPanel 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />
      
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-center">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <h2 className="text-xl font-bold mb-2">Loading Codebase...</h2>
            <p className="text-gray-300">Analyzing structure and detecting issues</p>
          </div>
        </div>
      )}
      
      {!isLoading && data.nodes.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2">No Data Available</h2>
            <p className="text-gray-300">Click "New Demo" to generate sample data</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealCodebaseVisualizer;
