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

// Code Analysis Engine
class CodeAnalyzer {
  static analyzeFile(fileName: string, content: string): { nodes: CodebaseNode[], links: CodebaseLink[] } {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const nodes: CodebaseNode[] = [];
    const links: CodebaseLink[] = [];
    
    // Create file node
    const fileId = fileName;
    const fileNode: CodebaseNode = {
      id: fileId,
      type: 'file',
      name: fileName,
      size: content.split('\n').length,
      issues: [],
      bugCount: 0,
      filePath: fileName,
      content: content
    };
    
    // Language-specific analysis
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return this.analyzeJavaScript(fileNode, content, nodes, links);
      case 'py':
        return this.analyzePython(fileNode, content, nodes, links);
      case 'java':
        return this.analyzeJava(fileNode, content, nodes, links);
      case 'cpp':
      case 'c':
        return this.analyzeCpp(fileNode, content, nodes, links);
      case 'cs':
        return this.analyzeCSharp(fileNode, content, nodes, links);
      case 'php':
        return this.analyzePhp(fileNode, content, nodes, links);
      case 'rb':
        return this.analyzeRuby(fileNode, content, nodes, links);
      default:
        return this.analyzeGeneric(fileNode, content, nodes, links);
    }
  }

  static analyzeJavaScript(fileNode: CodebaseNode, content: string, nodes: CodebaseNode[], links: CodebaseLink[]): { nodes: CodebaseNode[], links: CodebaseLink[] } {
    nodes.push(fileNode);
    const lines = content.split('\n');
    let currentClass: string | null = null;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Class detection
      const classMatch = trimmed.match(/^(?:export\s+)?class\s+(\w+)/);
      if (classMatch) {
        currentClass = classMatch[1];
        const classNode: CodebaseNode = {
          id: `${fileNode.id}::${currentClass}`,
          type: 'class',
          name: currentClass,
          parent: fileNode.id,
          size: this.estimateBlockSize(lines, index),
          issues: this.detectIssues(trimmed, 'class'),
          bugCount: 0,
          startLine: index + 1
        };
        classNode.bugCount = classNode.issues.length;
        nodes.push(classNode);
        links.push({ source: fileNode.id, target: classNode.id, type: 'contains' });
      }
      
      // Function detection
      const funcMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?(?:function\s+)?(\w+)\s*\([^)]*\)\s*(?:=>|{)/);
      const arrowMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/);
      const methodMatch = trimmed.match(/^\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/);
      
      const funcName = funcMatch?.[1] || arrowMatch?.[1] || methodMatch?.[1];
      
      if (funcName && !['if', 'for', 'while', 'switch', 'catch', 'try'].includes(funcName)) {
        const parentId = currentClass ? `${fileNode.id}::${currentClass}` : fileNode.id;
        const funcNode: CodebaseNode = {
          id: `${parentId}::${funcName}`,
          type: 'function',
          name: `${funcName}()`,
          parent: parentId,
          size: this.estimateBlockSize(lines, index),
          issues: this.detectIssues(line, 'function'),
          bugCount: 0,
          startLine: index + 1
        };
        funcNode.bugCount = funcNode.issues.length;
        nodes.push(funcNode);
        links.push({ source: parentId, target: funcNode.id, type: 'contains' });
        
        // Variable detection within functions
        this.detectVariables(lines, index, funcNode, nodes, links);
      }
      
      // Global variable detection
      const varMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)/);
      if (varMatch && !currentClass) {
        const varName = varMatch[1];
        const varNode: CodebaseNode = {
          id: `${fileNode.id}::${varName}`,
          type: 'variable',
          name: varName,
          parent: fileNode.id,
          size: 1,
          issues: this.detectIssues(trimmed, 'variable'),
          bugCount: 0,
          startLine: index + 1
        };
        varNode.bugCount = varNode.issues.length;
        nodes.push(varNode);
        links.push({ source: fileNode.id, target: varNode.id, type: 'contains' });
      }
    });
    
    // Update file bug count
    fileNode.bugCount = nodes.filter(n => n.parent === fileNode.id).reduce((sum, n) => sum + n.bugCount, 0);
    fileNode.issues = Array.from(new Set(nodes.filter(n => n.parent === fileNode.id).flatMap(n => n.issues)));
    
    return { nodes, links };
  }

  static analyzePython(fileNode: CodebaseNode, content: string, nodes: CodebaseNode[], links: CodebaseLink[]): { nodes: CodebaseNode[], links: CodebaseLink[] } {
    nodes.push(fileNode);
    const lines = content.split('\n');
    let currentClass: string | null = null;
    let currentIndent = 0;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const indent = line.length - line.trimLeft().length;
      
      // Class detection
      const classMatch = trimmed.match(/^class\s+(\w+)/);
      if (classMatch) {
        currentClass = classMatch[1];
        currentIndent = indent;
        const classNode: CodebaseNode = {
          id: `${fileNode.id}::${currentClass}`,
          type: 'class',
          name: currentClass,
          parent: fileNode.id,
          size: this.estimateBlockSize(lines, index),
          issues: this.detectIssues(trimmed, 'class'),
          bugCount: 0,
          startLine: index + 1
        };
        classNode.bugCount = classNode.issues.length;
        nodes.push(classNode);
        links.push({ source: fileNode.id, target: classNode.id, type: 'contains' });
      }
      
      // Function detection
      const funcMatch = trimmed.match(/^def\s+(\w+)\s*\(/);
      if (funcMatch) {
        const funcName = funcMatch[1];
        const isMethod = currentClass && indent > currentIndent;
        const parentId = isMethod ? `${fileNode.id}::${currentClass}` : fileNode.id;
        
        const funcNode: CodebaseNode = {
          id: `${parentId}::${funcName}`,
          type: 'function',
          name: `${funcName}()`,
          parent: parentId,
          size: this.estimateBlockSize(lines, index),
          issues: this.detectIssues(line, 'function'),
          bugCount: 0,
          startLine: index + 1
        };
        funcNode.bugCount = funcNode.issues.length;
        nodes.push(funcNode);
        links.push({ source: parentId, target: funcNode.id, type: 'contains' });
      }
      
      // Variable detection
      const varMatch = trimmed.match(/^(\w+)\s*=/);
      if (varMatch && !trimmed.startsWith('def ') && !trimmed.startsWith('class ')) {
        const varName = varMatch[1];
        const parentId = currentClass && indent > currentIndent ? `${fileNode.id}::${currentClass}` : fileNode.id;
        const varNode: CodebaseNode = {
          id: `${parentId}::${varName}`,
          type: 'variable',
          name: varName,
          parent: parentId,
          size: 1,
          issues: this.detectIssues(trimmed, 'variable'),
          bugCount: 0,
          startLine: index + 1
        };
        varNode.bugCount = varNode.issues.length;
        nodes.push(varNode);
        links.push({ source: parentId, target: varNode.id, type: 'contains' });
      }
    });
    
    fileNode.bugCount = nodes.filter(n => n.parent === fileNode.id).reduce((sum, n) => sum + n.bugCount, 0);
    fileNode.issues = Array.from(new Set(nodes.filter(n => n.parent === fileNode.id).flatMap(n => n.issues)));
    
    return { nodes, links };
  }

  static analyzeJava(fileNode: CodebaseNode, content: string, nodes: CodebaseNode[], links: CodebaseLink[]): { nodes: CodebaseNode[], links: CodebaseLink[] } {
    nodes.push(fileNode);
    const lines = content.split('\n');
    let currentClass: string | null = null;
    let braceDepth = 0;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Track brace depth
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;
      
      // Class detection
      const classMatch = trimmed.match(/(?:public\s+)?(?:abstract\s+)?class\s+(\w+)/);
      if (classMatch) {
        currentClass = classMatch[1];
        const classNode: CodebaseNode = {
          id: `${fileNode.id}::${currentClass}`,
          type: 'class',
          name: currentClass,
          parent: fileNode.id,
          size: this.estimateBlockSize(lines, index),
          issues: this.detectIssues(trimmed, 'class'),
          bugCount: 0,
          startLine: index + 1
        };
        classNode.bugCount = classNode.issues.length;
        nodes.push(classNode);
        links.push({ source: fileNode.id, target: classNode.id, type: 'contains' });
      }
      
      // Method detection
      const methodMatch = trimmed.match(/(?:public|private|protected)\s+(?:static\s+)?(?:\w+\s+)?(\w+)\s*\([^)]*\)\s*{?/);
      if (methodMatch && currentClass && braceDepth > 0) {
        const methodName = methodMatch[1];
        const parentId = `${fileNode.id}::${currentClass}`;
        const methodNode: CodebaseNode = {
          id: `${parentId}::${methodName}`,
          type: 'function',
          name: `${methodName}()`,
          parent: parentId,
          size: this.estimateBlockSize(lines, index),
          issues: this.detectIssues(line, 'function'),
          bugCount: 0,
          startLine: index + 1
        };
        methodNode.bugCount = methodNode.issues.length;
        nodes.push(methodNode);
        links.push({ source: parentId, target: methodNode.id, type: 'contains' });
      }
      
      // Field detection
      const fieldMatch = trimmed.match(/(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?\w+\s+(\w+)/);
      if (fieldMatch && currentClass && braceDepth === 1) {
        const fieldName = fieldMatch[1];
        const parentId = `${fileNode.id}::${currentClass}`;
        const fieldNode: CodebaseNode = {
          id: `${parentId}::${fieldName}`,
          type: 'variable',
          name: fieldName,
          parent: parentId,
          size: 1,
          issues: this.detectIssues(trimmed, 'variable'),
          bugCount: 0,
          startLine: index + 1
        };
        fieldNode.bugCount = fieldNode.issues.length;
        nodes.push(fieldNode);
        links.push({ source: parentId, target: fieldNode.id, type: 'contains' });
      }
    });
    
    fileNode.bugCount = nodes.filter(n => n.parent === fileNode.id).reduce((sum, n) => sum + n.bugCount, 0);
    fileNode.issues = Array.from(new Set(nodes.filter(n => n.parent === fileNode.id).flatMap(n => n.issues)));
    
    return { nodes, links };
  }

  static analyzeCpp(fileNode: CodebaseNode, content: string, nodes: CodebaseNode[], links: CodebaseLink[]): { nodes: CodebaseNode[], links: CodebaseLink[] } {
    return this.analyzeGeneric(fileNode, content, nodes, links);
  }

  static analyzeCSharp(fileNode: CodebaseNode, content: string, nodes: CodebaseNode[], links: CodebaseLink[]): { nodes: CodebaseNode[], links: CodebaseLink[] } {
    return this.analyzeGeneric(fileNode, content, nodes, links);
  }

  static analyzePhp(fileNode: CodebaseNode, content: string, nodes: CodebaseNode[], links: CodebaseLink[]): { nodes: CodebaseNode[], links: CodebaseLink[] } {
    return this.analyzeGeneric(fileNode, content, nodes, links);
  }

  static analyzeRuby(fileNode: CodebaseNode, content: string, nodes: CodebaseNode[], links: CodebaseLink[]): { nodes: CodebaseNode[], links: CodebaseLink[] } {
    return this.analyzeGeneric(fileNode, content, nodes, links);
  }

  static analyzeGeneric(fileNode: CodebaseNode, content: string, nodes: CodebaseNode[], links: CodebaseLink[]): { nodes: CodebaseNode[], links: CodebaseLink[] } {
    nodes.push(fileNode);
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Generic function detection
      const funcPatterns = [
        /function\s+(\w+)/,
        /def\s+(\w+)/,
        /(\w+)\s*\([^)]*\)\s*{/,
        /(\w+)\s*:\s*function/
      ];
      
      for (const pattern of funcPatterns) {
        const match = trimmed.match(pattern);
        if (match) {
          const funcName = match[1];
          const funcNode: CodebaseNode = {
            id: `${fileNode.id}::${funcName}`,
            type: 'function',
            name: `${funcName}()`,
            parent: fileNode.id,
            size: this.estimateBlockSize(lines, index),
            issues: this.detectIssues(line, 'function'),
            bugCount: 0,
            startLine: index + 1
          };
          funcNode.bugCount = funcNode.issues.length;
          nodes.push(funcNode);
          links.push({ source: fileNode.id, target: funcNode.id, type: 'contains' });
          break;
        }
      }
    });
    
    fileNode.bugCount = nodes.filter(n => n.parent === fileNode.id).reduce((sum, n) => sum + n.bugCount, 0);
    fileNode.issues = Array.from(new Set(nodes.filter(n => n.parent === fileNode.id).flatMap(n => n.issues)));
    
    return { nodes, links };
  }

  static detectIssues(code: string, type: string): string[] {
    const issues: string[] = [];
    
    // Common issues
    if (code.includes('null') && !code.includes('!= null') && !code.includes('!== null')) {
      issues.push('potential-null-pointer');
    }
    
    if (code.includes('eval(')) {
      issues.push('unsafe-eval');
    }
    
    if (code.includes('innerHTML')) {
      issues.push('xss-risk');
    }
    
    if (code.match(/\bdivision\s*\/\s*0\b/) || code.includes('/ 0')) {
      issues.push('division-by-zero');
    }
    
    if (code.includes('TODO') || code.includes('FIXME') || code.includes('HACK')) {
      issues.push('todo-comment');
    }
    
    if (code.match(/password|token|secret|key/i) && code.includes('=')) {
      issues.push('hardcoded-secret');
    }
    
    if (code.length > 100) {
      issues.push('long-line');
    }
    
    // Type-specific issues
    if (type === 'function') {
      if (code.split('\n').length > 50) {
        issues.push('large-function');
      }
      
      if (!code.includes('return') && !code.includes('void')) {
        issues.push('missing-return');
      }
    }
    
    if (type === 'variable') {
      if (code.match(/^[A-Z]/)) {
        issues.push('naming-convention');
      }
    }
    
    return issues;
  }

  static estimateBlockSize(lines: string[], startIndex: number): number {
    let braceCount = 0;
    let size = 1;
    
    for (let i = startIndex; i < lines.length && i < startIndex + 100; i++) {
      const line = lines[i];
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      size++;
      
      if (braceCount === 0 && i > startIndex) {
        break;
      }
    }
    
    return Math.min(size, 50);
  }

  static detectVariables(lines: string[], funcStart: number, funcNode: CodebaseNode, nodes: CodebaseNode[], links: CodebaseLink[]) {
    let braceCount = 0;
    const variables = new Set<string>();
    
    for (let i = funcStart; i < lines.length; i++) {
      const line = lines[i];
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      const varMatches = line.match(/(?:const|let|var)\s+(\w+)/g);
      if (varMatches) {
        varMatches.forEach(match => {
          const varName = match.split(/\s+/)[1];
          if (varName && !variables.has(varName)) {
            variables.add(varName);
            const varNode: CodebaseNode = {
              id: `${funcNode.id}::${varName}`,
              type: 'variable',
              name: varName,
              parent: funcNode.id,
              size: 1,
              issues: this.detectIssues(line, 'variable'),
              bugCount: 0,
              startLine: i + 1
            };
            varNode.bugCount = varNode.issues.length;
            nodes.push(varNode);
            links.push({ source: funcNode.id, target: varNode.id, type: 'contains' });
          }
        });
      }
      
      if (braceCount === 0 && i > funcStart) {
        break;
      }
    }
  }

  static detectCrossDependencies(allNodes: CodebaseNode[], allLinks: CodebaseLink[]): CodebaseLink[] {
    const newLinks: CodebaseLink[] = [];
    
    // Detect function calls
    allNodes.forEach(node => {
      if (node.type === 'function' && node.content) {
        allNodes.forEach(otherNode => {
          if (otherNode.type === 'function' && node.id !== otherNode.id) {
            const funcName = otherNode.name.replace('()', '');
            if (node.content!.includes(funcName + '(')) {
              newLinks.push({ source: node.id, target: otherNode.id, type: 'call' });
            }
          }
        });
      }
    });
    
    return newLinks;
  }
}

// Main Component
const RealCodebaseVisualizer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<CodebaseData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<CodebaseNode | null>(null);
  const [stats, setStats] = useState<StatsData>({ errors: 0, warnings: 0, nodes: 0, links: 0, bugDensity: 0 });
  const simulationRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
  const forceSimulationRef = useRef<d3.Simulation<CodebaseNode, undefined>>();

  useEffect(() => {
    const fetchAndProcessFiles = async () => {
      try {
        const repoOwner = 'cvUPTZ';
        const repoName = 'breezy-epty-flow';
        const branch = 'main';

        interface GitHubBranchResponse {
          commit: {
            sha: string;
          }
        }
        interface GitHubTreeNode {
          path: string;
          type: 'blob' | 'tree' | 'commit';
        }
        interface GitHubTreeResponse {
          tree: GitHubTreeNode[];
        }

        // 1. Get the latest commit SHA for the main branch
        const branchResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/branches/${branch}`);
        const branchData: GitHubBranchResponse = await branchResponse.json();
        const commitSha = branchData.commit.sha;

        // 2. Fetch the file tree recursively
        const treeResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${commitSha}?recursive=1`);
        const treeData: GitHubTreeResponse = await treeResponse.json();

        const filepaths = treeData.tree
          .filter((node) => node.type === 'blob')
          .map((node) => node.path);

        const allNodes: CodebaseNode[] = [];
        const allLinks: CodebaseLink[] = [];

        // 3. Fetch and process each file
        await Promise.all(filepaths.map(async (filepath: string) => {
          try {
            const contentResponse = await fetch(`https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${filepath}`);
            if (contentResponse.ok) {
              const content = await contentResponse.text();
              const { nodes, links } = CodeAnalyzer.analyzeFile(filepath, content);
              allNodes.push(...nodes);
              allLinks.push(...links);
            }
          } catch (fileError) {
            console.error(`Error fetching file ${filepath}:`, fileError);
          }
        }));

        const crossLinks = CodeAnalyzer.detectCrossDependencies(allNodes, allLinks);
        allLinks.push(...crossLinks);

        const newStats = calculateStats(allNodes, allLinks);
        setStats(newStats);
        setData({ nodes: allNodes, links: allLinks });
      } catch (error) {
        console.error('Error fetching or processing repository files from GitHub:', error);
      }
    };

    const calculateStats = (nodes: CodebaseNode[], links: CodebaseLink[]) => {
      const errors = nodes.filter(n => n.bugCount > 2).length;
      const warnings = nodes.filter(n => n.bugCount > 0 && n.bugCount <= 2).length;
      const buggyNodes = nodes.filter(n => n.bugCount > 0).length;
      const bugDensity = nodes.length > 0 ? Math.round((buggyNodes / nodes.length) * 100) : 0;
      return { errors, warnings, nodes: nodes.length, links: links.length, bugDensity };
    };

    fetchAndProcessFiles();
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
      
      <NodeDetailsPanel 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />
      
      {data.nodes.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold mb-2">Loading repository...</h2>
            <p className="text-gray-300">Analyzing files, please wait.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealCodebaseVisualizer;
