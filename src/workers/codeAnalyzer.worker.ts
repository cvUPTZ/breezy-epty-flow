// src/workers/codeAnalyzer.worker.ts

// Since this is a worker, we can't import types from the main app directly
// without special configuration. For simplicity, we'll redefine the necessary types here.
// In a real-world scenario, you'd configure your bundler (Vite) to handle worker type sharing.

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
  dependencies: string[];
  metrics: CodeMetrics;
  filePath?: string;
  content?: string;
  lastModified?: Date;
}

interface CodebaseLink {
  source: string;
  target: string;
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

// Helper functions for code analysis (copied from CodeVisualizer.tsx)
const getFileType = (fileName: string): 'file' | 'component' | 'class' | 'function' | 'hook' | 'interface' | 'variable' | 'import' => {
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
      issues.push({
        type: 'warning',
        severity: 'low',
        message: 'Avoid using console.log in production code',
        rule: 'no-console',
        line: content.substring(0, match.index).split('\n').length
      });
    }
    const todoRegex = /\/\/\s*TODO:/gi;
    while ((match = todoRegex.exec(content)) !== null) {
      issues.push({
        type: 'info',
        severity: 'low',
        message: 'TODO comment found',
        rule: 'todo-comment',
        line: content.substring(0, match.index).split('\n').length
      });
    }
    const debuggerRegex = /\bdebugger\b/gi;
    while ((match = debuggerRegex.exec(content)) !== null) {
      issues.push({
        type: 'error',
        severity: 'high',
        message: 'Remove debugger statement before deployment',
        rule: 'no-debugger',
        line: content.substring(0, match.index).split('\n').length
      });
    }
    return issues;
};

const analyzeCodeContent = (content: string, fileName: string): CodebaseData => {
    const lines = content.split('\n');
    const loc = lines.length;
    const nodes: CodebaseNode[] = [];
    const links: CodebaseLink[] = [];
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const fileNode: CodebaseNode = {
      id: fileId,
      type: getFileType(fileName),
      name: fileName,
      size: loc,
      complexity: calculateComplexity(content),
      maintainability: 80,
      issues: detectIssues(content),
      bugCount: 0,
      testCoverage: 0,
      dependencies: [],
      metrics: {
        cyclomaticComplexity: calculateCyclomaticComplexity(content),
        cognitiveComplexity: 0,
        linesOfCode: loc,
        maintainabilityIndex: 80,
        technicalDebt: 0,
        duplicateLines: 0
      },
      filePath: fileName,
      content: content,
      lastModified: new Date()
    };
    nodes.push(fileNode);

    const functionRegex = /function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/g;
    let funcMatch;
    let funcIndex = 0;
    while ((funcMatch = functionRegex.exec(content)) !== null) {
      const funcName = funcMatch[1];
      const funcId = `${fileId}_func_${funcIndex++}`;
      const funcNode: CodebaseNode = {
        id: funcId,
        type: 'function',
        name: funcName,
        parent: fileId,
        size: 10, complexity: 5, maintainability: 75, issues: [], bugCount: 0, testCoverage: 0, dependencies: [],
        metrics: { cyclomaticComplexity: 3, cognitiveComplexity: 0, linesOfCode: 10, maintainabilityIndex: 75, technicalDebt: 0, duplicateLines: 0 },
        filePath: fileName
      };
      nodes.push(funcNode);
      links.push({ source: fileId, target: funcId, type: 'contains', strength: 1, count: 1 });
    }

    const classRegex = /class\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(?:extends\s+[a-zA-Z_$][0-9a-zA-Z_$]*\s*)?\{/g;
    let classMatch;
    let classIndex = 0;
    while ((classMatch = classRegex.exec(content)) !== null) {
      const className = classMatch[1];
      const classId = `${fileId}_class_${classIndex++}`;
      const classNode: CodebaseNode = {
        id: classId, type: 'class', name: className, parent: fileId, size: 15, complexity: 7, maintainability: 70, issues: [],
        bugCount: 0, testCoverage: 0, dependencies: [],
        metrics: { cyclomaticComplexity: 5, cognitiveComplexity: 0, linesOfCode: 15, maintainabilityIndex: 70, technicalDebt: 0, duplicateLines: 0 },
        filePath: fileName
      };
      nodes.push(classNode);
      links.push({ source: fileId, target: classId, type: 'contains', strength: 1, count: 1 });
    }

    const importRegex = /import\s+(?:{[^}]*}|\*|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    let importMatch;
    while ((importMatch = importRegex.exec(content)) !== null) {
      const importedPath = importMatch[1];
      const importId = `import_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const importNode: CodebaseNode = {
        id: importId, type: 'import', name: importedPath, parent: fileId, size: 1, complexity: 1, maintainability: 100,
        issues: [], bugCount: 0, testCoverage: 0, dependencies: [],
        metrics: { cyclomaticComplexity: 1, cognitiveComplexity: 0, linesOfCode: 1, maintainabilityIndex: 100, technicalDebt: 0, duplicateLines: 0 },
        filePath: importedPath
      };
      nodes.push(importNode);
      links.push({ source: fileId, target: importId, type: 'imports', strength: 0.8, count: 1 });
    }

    return {
      nodes, links,
      metadata: {
        totalFiles: 1, totalLines: loc, languages: { [getLanguage(fileName)]: 100 },
        lastAnalyzed: new Date(), analysisVersion: '1.0.0-worker'
      }
    };
};

// Main worker logic
self.onmessage = (event: MessageEvent<{ files: Array<{ name: string, content: string }> }>) => {
  const { files } = event.data;
  const allNodes: CodebaseNode[] = [];
  const allLinks: CodebaseLink[] = [];
  let totalLines = 0;
  const languageCounts: Record<string, number> = {};
  let filesProcessed = 0;

  files.forEach(file => {
    try {
      const analyzedData = analyzeCodeContent(file.content, file.name);
      allNodes.push(...analyzedData.nodes);
      allLinks.push(...analyzedData.links);
      totalLines += analyzedData.metadata.totalLines;
      for (const lang in analyzedData.metadata.languages) {
        if (languageCounts[lang]) {
          languageCounts[lang] += analyzedData.metadata.languages[lang];
        } else {
          languageCounts[lang] = analyzedData.metadata.languages[lang];
        }
      }
    } catch (error) {
      // Post an error message for the specific file
      self.postMessage({ type: 'error', message: `Failed to process ${file.name}` });
    }

    filesProcessed++;
    // Post progress update
    self.postMessage({
      type: 'progress',
      progress: Math.round((filesProcessed / files.length) * 100),
      file: file.name,
    });
  });

  const combinedData: CodebaseData = {
    nodes: allNodes,
    links: allLinks,
    metadata: {
      totalFiles: files.length,
      totalLines,
      languages: languageCounts,
      lastAnalyzed: new Date(),
      analysisVersion: '2.0.0-worker'
    }
  };

  // Post final result
  self.postMessage({ type: 'result', data: combinedData });
};
