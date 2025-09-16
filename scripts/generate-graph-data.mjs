import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';
import { execSync } from 'child_process';

// --- CONFIGURATION ---
const SRC_DIRECTORY = 'src';
const OUTPUT_DIRECTORY = 'public/data';
const REPO_ROOT = '.';
const IGNORED_PATTERNS = [
    /node_modules/,
    /dist/,
    /build/,
    /\.d\.ts$/,
    /vite-env\.d\.ts/,
];

// --- MAIN EXECUTION ---
async function main() {
    console.log('Starting repository analysis... 🤠');

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIRECTORY)) {
        fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
    }

    // 1. Analyze source code for nodes and edges
    const { nodes, edges } = analyzeSourceCode(SRC_DIRECTORY);
    console.log(`Found ${nodes.length} nodes and ${edges.length} edges.`);

    // 2. Get git history for events
    const gitEvents = getGitHistory(REPO_ROOT);
    console.log(`Found ${gitEvents.length} commit events.`);

    // 3. Scan for TODOs/FIXMEs
    const todoEvents = scanForTodos(SRC_DIRECTORY);
    console.log(`Found ${todoEvents.length} TODO/FIXME events.`);

    // Combine events
    const allEvents = [...gitEvents, ...todoEvents].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // 4. Generate and write data files
    const graphData = { nodes, edges };
    const metadata = generateMetadata(nodes);

    fs.writeFileSync(path.join(OUTPUT_DIRECTORY, 'graph.json'), JSON.stringify(graphData, null, 2));
    fs.writeFileSync(path.join(OUTPUT_DIRECTORY, 'events.json'), JSON.stringify(allEvents, null, 2));
    fs.writeFileSync(path.join(OUTPUT_DIRECTORY, 'metadata.json'), JSON.stringify(metadata, null, 2));

    console.log('✅ Analysis complete! Data files generated in', OUTPUT_DIRECTORY);
    console.log("Don't forget to tell the humans how to open the viz. 😉");
}

// --- DATA EXTRACTION FUNCTIONS ---

function analyzeSourceCode(directory) {
    const nodes = [];
    const edges = [];
    const files = getProjectFiles(directory);
    const program = ts.createProgram(files, {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        allowJs: true
    });
    const checker = program.getTypeChecker();
    const functionDeclarations = new Map();

    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile && !IGNORED_PATTERNS.some(p => p.test(sourceFile.fileName))) {
            ts.forEachChild(sourceFile, function(node) {
                if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isClassDeclaration(node) || ts.isVariableStatement(node)) {
                    let declaration = node;
                    if (ts.isVariableStatement(node)) {
                        const varDecl = node.declarationList.declarations[0];
                        if (varDecl && varDecl.initializer && (ts.isArrowFunction(varDecl.initializer) || ts.isFunctionExpression(varDecl.initializer))) {
                            declaration = varDecl;
                        } else {
                            return;
                        }
                    }
                    if(declaration.name) {
                        const symbolName = declaration.name.getText(sourceFile);
                        const relativePath = path.relative(process.cwd(), sourceFile.fileName);
                        let nodeType = ts.isClassDeclaration(node) ? 'class' : 'function';
                        const isTestFile = /\.test\.tsx?$/.test(relativePath) || /\.spec\.tsx?$/.test(relativePath);
                        if (isTestFile && nodeType === 'function') {
                            nodeType = 'test';
                        }
                        const nodeId = `${nodeType}:${relativePath}:${symbolName}`;
                        functionDeclarations.set(declaration, nodeId);
                    }
                }
            });
        }
    }


    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile && !IGNORED_PATTERNS.some(p => p.test(sourceFile.fileName))) {
            const relativePath = path.relative(process.cwd(), sourceFile.fileName);
            const fileId = `file:${relativePath}`;
            const isTestFile = /\.test\.tsx?$/.test(relativePath) || /\.spec\.tsx?$/.test(relativePath);

            // Add file node
            nodes.push({
                id: fileId,
                name: path.basename(relativePath),
                type: isTestFile ? 'test_file' : 'file',
                path: relativePath,
                startLine: 1,
                endLine: sourceFile.getLineAndCharacterOfPosition(sourceFile.end).line + 1,
                size: sourceFile.end,
                docstring: 'File node',
                lastModified: fs.statSync(sourceFile.fileName).mtime.toISOString(),
            });

            ts.forEachChild(sourceFile, visit);

            function visit(node) {
                let declaration = null;
                if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isClassDeclaration(node)) {
                    declaration = node;
                } else if (ts.isVariableStatement(node)) {
                    const varDecl = node.declarationList.declarations[0];
                    if (varDecl && varDecl.initializer && (ts.isArrowFunction(varDecl.initializer) || ts.isFunctionExpression(varDecl.initializer))) {
                        declaration = varDecl;
                    }
                }

                if (declaration && declaration.name) {
                    const symbolName = declaration.name.getText(sourceFile);
                    const symbol = checker.getSymbolAtLocation(declaration.name);
                    if (!symbol) {
                        ts.forEachChild(node, visit);
                        return;
                    };

                    const docstring = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
                    const { line: startLine, character: startChar } = sourceFile.getLineAndCharacterOfPosition(declaration.getStart(sourceFile));
                    const { line: endLine, character: endChar } = sourceFile.getLineAndCharacterOfPosition(declaration.getEnd());
                    let nodeType = ts.isClassDeclaration(node) ? 'class' : 'function';

                    if (isTestFile && nodeType === 'function') {
                        nodeType = 'test';
                    }

                    const nodeId = `${nodeType}:${relativePath}:${symbolName}`;

                    nodes.push({
                        id: nodeId,
                        name: symbolName,
                        type: nodeType,
                        path: relativePath,
                        startLine: startLine + 1,
                        endLine: endLine + 1,
                        docstring: docstring || `A ${nodeType} named ${symbolName}`,
                        size: declaration.getEnd() - declaration.getStart(sourceFile),
                        lastModified: fs.statSync(sourceFile.fileName).mtime.toISOString(),
                    });

                    // "contains" edge from file to this node
                    edges.push({
                        id: `contains:${fileId}:${nodeId}`,
                        source: fileId,
                        target: nodeId,
                        type: 'contains',
                    });
                }

                // Handle imports for file-to-file dependencies
                if (ts.isImportDeclaration(node)) {
                    const moduleSpecifier = node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, '');
                    const resolvedModule = ts.resolveModuleName(moduleSpecifier, sourceFile.fileName, program.getCompilerOptions(), ts.sys);
                    if (resolvedModule.resolvedModule) {
                        const targetPath = path.relative(process.cwd(), resolvedModule.resolvedModule.resolvedFileName);
                        const targetFileId = `file:${targetPath}`;
                        if (nodes.some(n => n.id === targetFileId)) {
                             edges.push({
                                id: `imports:${fileId}:${targetFileId}`,
                                source: fileId,
                                target: targetFileId,
                                type: 'imports',
                            });
                        }
                    }
                }

                if (ts.isCallExpression(node)) {
                    const symbol = checker.getSymbolAtLocation(node.expression);
                    if (symbol && symbol.declarations && symbol.declarations.length > 0) {
                        const calleeDeclaration = symbol.declarations[0];

                        if (functionDeclarations.has(calleeDeclaration)) {
                            const calleeId = functionDeclarations.get(calleeDeclaration);

                            let parent = node.parent;
                            while(parent && !functionDeclarations.has(parent)) {
                                parent = parent.parent;
                            }

                            if (parent && functionDeclarations.has(parent)) {
                                const callerId = functionDeclarations.get(parent);
                                if (callerId && calleeId) {
                                    edges.push({
                                        id: `calls:${callerId}:${calleeId}`,
                                        source: callerId,
                                        target: calleeId,
                                        type: 'calls',
                                    });
                                }
                            }
                        }
                    }
                }

                ts.forEachChild(node, visit);
            }
        }
    }

    return { nodes, edges };
}

function getGitHistory(repoPath) {
    try {
        const command = `git log --pretty=format:'{%n  "id": "%H",%n  "type": "commit",%n  "author": "%an",%n  "timestamp": "%ad",%n  "message": "%f"%n},'`;
        const output = execSync(command, { cwd: repoPath, encoding: 'utf-8' });
        // Wrap in a JSON array and remove trailing comma
        const jsonString = `[${output.slice(0, -1)}]`;
        const history = JSON.parse(jsonString);
        history.forEach(commit => commit.message = commit.message.replace(/"/g, '\\"'));
        return history;
    } catch (error) {
        console.warn('Could not get git history. Falling back to file system timestamps.', error.message);
        return [];
    }
}

function scanForTodos(directory) {
    const events = [];
    const files = getProjectFiles(directory);
    const todoRegex = /\/\/\s*(TODO|FIXME|XXX):\s*(.*)/g;

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            let match;
            while ((match = todoRegex.exec(line)) !== null) {
                events.push({
                    id: `todo:${file}:${index + 1}`,
                    type: 'todo',
                    author: 'N/A',
                    timestamp: new Date().toISOString(),
                    message: `${match[1]}: ${match[2]}`,
                    affected_nodes: [`file:${file}`],
                    path: file,
                    line: index + 1,
                });
            }
        });
    }
    return events;
}

function generateMetadata(nodes) {
    const entities = nodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        path: node.path,
        start_line: node.startLine,
        end_line: node.endLine,
        docstring: node.docstring,
        lastModified: node.lastModified,
        // TODO: Add more fields like parameters, returns, etc.
    }));

    const index = nodes.reduce((acc, node) => {
        if (node.type === 'file' || node.type === 'test_file') {
            acc[node.path] = acc[node.path] || [];
        } else {
            if (!acc[node.path]) acc[node.path] = [];
            acc[node.path].push(node.id);
        }
        return acc;
    }, {});

    return { entities, index };
}

function getProjectFiles(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (IGNORED_PATTERNS.some(p => p.test(fullPath))) {
            continue;
        }
        if (entry.isDirectory()) {
            files = files.concat(getProjectFiles(fullPath));
        } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
            files.push(fullPath);
        }
    }
    return files;
}

// --- RUN SCRIPT ---
main().catch(err => {
    console.error('An error occurred during analysis:', err);
    process.exit(1);
});
