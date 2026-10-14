import { SymbolIndexItem, ImportRelation, CodebaseIndex } from '../types/desktop';
import { VirtualFileSystem } from './virtualFs';

export class CodebaseIndexer {
  private vfs: VirtualFileSystem;
  private cachedIndex: CodebaseIndex | null = null;

  constructor(vfs: VirtualFileSystem) {
    this.vfs = vfs;
  }

  public updateVFS(vfs: VirtualFileSystem) {
    this.vfs = vfs;
    this.invalidate();
  }

  public invalidate() {
    this.cachedIndex = null;
  }

  public getIndex(): CodebaseIndex {
    if (this.cachedIndex) return this.cachedIndex;

    const symbols: SymbolIndexItem[] = [];
    const imports: ImportRelation[] = [];
    const routes: Array<{ path: string; method?: string; file: string; line: number }> = [];

    const traverse = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.type === 'file' && node.content) {
          this.parseFile(node.path, node.content, symbols, imports, routes);
        }
        if (node.children) traverse(node.children);
      }
    };

    traverse(this.vfs.getTree());

    this.cachedIndex = {
      symbols,
      imports,
      routes,
      lastUpdated: Date.now(),
    };

    return this.cachedIndex;
  }

  private parseFile(
    filePath: string,
    content: string,
    symbols: SymbolIndexItem[],
    imports: ImportRelation[],
    routes: Array<{ path: string; method?: string; file: string; line: number }>
  ) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // 1. Match React Components & Functions
      // e.g., export const TaskBoard: React.FC = ... or function App()
      const compMatch = trimmed.match(/export\s+(const|function)\s+([A-Z][A-Za-z0-9_]+)/);
      if (compMatch) {
        symbols.push({
          name: compMatch[2],
          kind: 'component',
          filePath,
          line: lineNum,
          column: line.indexOf(compMatch[2]),
          exported: true,
          description: `React Component defined in ${filePath}`,
        });
      }

      // 2. Match Standard Functions
      const fnMatch = trimmed.match(/export\s+(async\s+)?function\s+([a-z][A-Za-z0-9_]+)/);
      if (fnMatch) {
        symbols.push({
          name: fnMatch[2],
          kind: 'function',
          filePath,
          line: lineNum,
          column: line.indexOf(fnMatch[2]),
          exported: true,
          description: `Utility / Business Logic function`,
        });
      }

      // 3. Match Interfaces & Types
      const ifaceMatch = trimmed.match(/export\s+(interface|type)\s+([A-Za-z0-9_]+)/);
      if (ifaceMatch) {
        symbols.push({
          name: ifaceMatch[2],
          kind: ifaceMatch[1] === 'interface' ? 'interface' : 'type',
          filePath,
          line: lineNum,
          column: line.indexOf(ifaceMatch[2]),
          exported: true,
          description: `Type Contract in ${filePath}`,
        });
      }

      // 4. Match Imports
      const importMatch = trimmed.match(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const specifiers = (importMatch[1] || importMatch[2] || importMatch[3] || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        const importedPath = importMatch[4];
        imports.push({
          sourceFile: filePath,
          importedFile: importedPath,
          specifiers,
        });
      }

      // 5. Match API Routes
      // e.g. app.get('/users', ...) or router.post('/auth', ...)
      const routeMatch = trimmed.match(/(app|router)\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/);
      if (routeMatch) {
        routes.push({
          method: routeMatch[2].toUpperCase(),
          path: routeMatch[3],
          file: filePath,
          line: lineNum,
        });
      }
    });
  }

  // Symbol resolution
  public findSymbol(name: string): SymbolIndexItem | undefined {
    const idx = this.getIndex();
    return idx.symbols.find(s => s.name.toLowerCase() === name.toLowerCase());
  }

  // Find where a component or function is defined
  public findComponent(name: string): SymbolIndexItem | undefined {
    const idx = this.getIndex();
    return idx.symbols.find(s => s.kind === 'component' && s.name.toLowerCase().includes(name.toLowerCase()));
  }

  // Follow imports from a file
  public getDependencies(filePath: string): string[] {
    const idx = this.getIndex();
    return idx.imports
      .filter(i => i.sourceFile === filePath)
      .map(i => i.importedFile);
  }

  // Find all files that depend on a given file
  public getDependents(filePath: string): string[] {
    const idx = this.getIndex();
    const fileName = filePath.split('/').pop()?.replace(/\.(tsx|ts|jsx|js)$/, '') || '';
    return idx.imports
      .filter(i => i.importedFile.includes(fileName))
      .map(i => i.sourceFile);
  }

  // Smart context retriever for a user goal: selects only the relevant files instead of all files
  public retrieveContextForGoal(goal: string): Array<{ path: string; summary: string }> {
    const idx = this.getIndex();
    const relevant: Array<{ path: string; summary: string }> = [];
    const lowerGoal = goal.toLowerCase();

    // Check symbols
    for (const sym of idx.symbols) {
      if (lowerGoal.includes(sym.name.toLowerCase())) {
        if (!relevant.some(r => r.path === sym.filePath)) {
          relevant.push({
            path: sym.filePath,
            summary: `Contains symbol ${sym.name} (${sym.kind}) at line ${sym.line}`,
          });
        }
      }
    }

    // Check routes
    for (const route of idx.routes) {
      if (lowerGoal.includes(route.path.toLowerCase()) || lowerGoal.includes('api') || lowerGoal.includes('auth')) {
        if (!relevant.some(r => r.path === route.file)) {
          relevant.push({
            path: route.file,
            summary: `Exposes ${route.method} ${route.path} route at line ${route.line}`,
          });
        }
      }
    }

    // Default primary files if no specific symbols matched
    if (relevant.length === 0) {
      const filePaths = Array.from(new Set(idx.symbols.map(s => s.filePath)));
      const topIndexed = filePaths.slice(0, 3);
      if (topIndexed.length > 0) {
        for (const file of topIndexed) {
          relevant.push({
            path: file,
            summary: `Key module in workspace: ${file}`,
          });
        }
      } else {
        relevant.push(
          { path: 'src/App.tsx', summary: 'Application entry point & view orchestration' },
          { path: 'package.json', summary: 'Project dependencies and build manifest' }
        );
      }
    }

    return relevant;
  }
}
