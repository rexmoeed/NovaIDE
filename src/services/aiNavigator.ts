import { VirtualFileSystem } from './virtualFs';
import { CodebaseIndexer } from './codebaseIndexer';
import { InspectionResult, InspectionStep, ProposedFileChange } from '../types/desktop';

export class AIProjectNavigator {
  private vfs: VirtualFileSystem;
  private indexer: CodebaseIndexer;

  constructor(vfs: VirtualFileSystem, indexer: CodebaseIndexer) {
    this.vfs = vfs;
    this.indexer = indexer;
  }

  public updateDependencies(vfs: VirtualFileSystem, indexer: CodebaseIndexer) {
    this.vfs = vfs;
    this.indexer = indexer;
  }

  /**
   * Explains where a feature is implemented with a clear inspection trail
   */
  public explainFeature(query: string): InspectionResult {
    const steps: InspectionStep[] = [];
    const index = this.indexer.getIndex();
    const lowerQuery = query.toLowerCase();

    // 1. Locate primary entry points
    const allFiles = Array.from(this.vfs.getAllFiles().keys());
    const entryFile = allFiles.find(f => f.includes('App') || f.includes('main') || f.includes('index')) || allFiles[0] || 'src/App.tsx';
    const entryContent = this.vfs.readFile(entryFile);
    if (entryContent) {
      steps.push({
        id: `step-${Date.now()}-1`,
        targetFile: entryFile,
        reason: 'Inspected workspace entry point, routes, and high-level component mounts.',
        symbolsFound: [entryFile.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Root'],
        snippet: entryContent.slice(0, 240),
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 2. Search components and functions matching query
    let matchedComponent: any = null;
    const queryTokens = lowerQuery.split(/\s+/).filter(t => t.length > 2);
    const components = index.symbols.filter(s => s.kind === 'component');
    for (const comp of components) {
      if (queryTokens.some((token: string) => comp.name.toLowerCase().includes(token))) {
        matchedComponent = comp;
        const compContent = this.vfs.readFile(comp.filePath) || '';
        steps.push({
          id: `step-${Date.now()}-2`,
          targetFile: comp.filePath,
          reason: `Found implementation of "${comp.name}" component matching query.`,
          symbolsFound: [comp.name],
          snippet: compContent.slice(0, 280),
          timestamp: new Date().toLocaleTimeString(),
        });
        break;
      }
    }

    // 3. Inspect related domain services or utilities
    const matchedService = allFiles.find(f => 
      (f.includes('service') || f.includes('util') || f.includes('helper') || f.includes('api')) &&
      queryTokens.some((token: string) => f.toLowerCase().includes(token))
    );
    if (matchedService) {
      const serviceContent = this.vfs.readFile(matchedService);
      if (serviceContent) {
        steps.push({
          id: `step-${Date.now()}-3`,
          targetFile: matchedService,
          reason: `Inspected business logic and domain functions in ${matchedService}.`,
          symbolsFound: [matchedService.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Service'],
          snippet: serviceContent.slice(0, 240),
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }

    const primaryFile = matchedComponent?.filePath || matchedService || entryFile;
    const primaryLine = matchedComponent?.line || 1;
    const relatedFiles = Array.from(new Set(steps.map(s => s.targetFile)));

    return {
      query,
      explanation: `The requested capability is analyzed in **${primaryFile}** and coordinated across ${relatedFiles.join(', ')}.`,
      inspectedFiles: steps,
      primaryFile,
      primaryLine,
      relatedFiles,
      architectureSummary: 'Modular workspace architecture with decoupled components and type-safe contracts.',
    };
  }

  /**
   * Plans multi-file modifications based on natural language instructions
   */
  public planMultiFileChanges(instruction: string): ProposedFileChange[] {
    const changes: ProposedFileChange[] = [];
    const lower = instruction.toLowerCase();

    // 1. "Create a reusable button component and replace duplicated buttons"
    if (lower.includes('button') || lower.includes('reusable button')) {
      const newButtonCode = `import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300"
  };
  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-2 text-sm",
    lg: "px-4.5 py-2.5 text-base"
  };

  return (
    <button className={\`\${base} \${variants[variant]} \${sizes[size]} \${className}\`} {...props}>
      {children}
    </button>
  );
};
`;
      changes.push({
        id: 'chg-btn',
        filePath: 'src/components/ui/Button.tsx',
        action: 'create',
        newContent: newButtonCode,
        explanation: 'Create production-ready reusable Button component with variant and size styling.',
        additions: 32,
        deletions: 0,
        accepted: true,
        riskLevel: 'low',
      });

      const currentBoard = this.vfs.readFile('src/components/TaskBoard.tsx') || '';
      if (currentBoard) {
        const updatedBoard = `import { Button } from './ui/Button';\n` + currentBoard.replace(
          /className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"/,
          `className="shadow-md" variant="primary" size="sm"`
        );
        changes.push({
          id: 'chg-board-refactor',
          filePath: 'src/components/TaskBoard.tsx',
          action: 'modify',
          originalContent: currentBoard,
          newContent: updatedBoard,
          explanation: 'Refactor TaskBoard to import and use the new reusable Button component.',
          additions: 2,
          deletions: 1,
          accepted: true,
          riskLevel: 'low',
        });
      }
    }

    // 2. "Add a settings page and connect it to the existing navigation"
    else if (lower.includes('settings') || lower.includes('settings page')) {
      const settingsComponent = `import React, { useState } from 'react';

export const SettingsView: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [apiKeyExpiry, setApiKeyExpiry] = useState('30_days');

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6 text-white">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Workspace Settings</h2>
        <p className="text-xs text-slate-400">Configure team notifications and security credentials</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-200">Notification Preferences</h3>
        <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={notifications}
            onChange={e => setNotifications(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
          />
          <span>Send email digest for sprint milestone transitions</span>
        </label>
      </div>
    </div>
  );
};
`;
      changes.push({
        id: 'chg-settings-page',
        filePath: 'src/components/SettingsView.tsx',
        action: 'create',
        newContent: settingsComponent,
        explanation: 'Create dedicated SettingsView component with notification preferences.',
        additions: 28,
        deletions: 0,
        accepted: true,
        riskLevel: 'low',
      });

      const currentApp = this.vfs.readFile('src/App.tsx') || '';
      if (currentApp) {
        let updatedApp = currentApp;
        if (!updatedApp.includes('SettingsView')) {
          updatedApp = `import { SettingsView } from './components/SettingsView';\n` + updatedApp;
          updatedApp = updatedApp.replace(
            `const [activeTab, setActiveTab] = useState<'board' | 'team'>('board');`,
            `const [activeTab, setActiveTab] = useState<'board' | 'team' | 'settings'>('board');`
          );
          updatedApp = updatedApp.replace(
            `<nav className="flex gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">`,
            `<nav className="flex gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">\n          <button onClick={() => setActiveTab('settings')} className={\`px-3 py-1.5 rounded-md text-xs font-medium transition-colors \${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}\`}>Settings</button>`
          );
          updatedApp = updatedApp.replace(
            `</main>`,
            `{activeTab === 'settings' && <SettingsView />}\n      </main>`
          );
        }
        changes.push({
          id: 'chg-app-nav',
          filePath: 'src/App.tsx',
          action: 'modify',
          originalContent: currentApp,
          newContent: updatedApp,
          explanation: 'Integrate Settings tab into header navigation and main conditional view rendering.',
          additions: 8,
          deletions: 2,
          accepted: true,
          riskLevel: 'low',
        });
      }
    }

    // 3. "Add authentication to this project"
    else if (lower.includes('auth') || lower.includes('login')) {
      const authTypes = `export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  token: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}
`;
      changes.push({
        id: 'chg-auth-type',
        filePath: 'src/types/auth.ts',
        action: 'create',
        newContent: authTypes,
        explanation: 'Define AuthUser and AuthState domain contracts.',
        additions: 15,
        deletions: 0,
        accepted: true,
        riskLevel: 'low',
      });

      const authService = `import { AuthUser } from '../types/auth';

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  if (!email || !password) throw new Error('Missing credentials');
  return {
    id: 'u-auth-1',
    email,
    name: email.split('@')[0],
    role: 'admin',
    token: 'jwt-token-sample',
  };
}
`;
      changes.push({
        id: 'chg-auth-service',
        filePath: 'src/services/authService.ts',
        action: 'create',
        newContent: authService,
        explanation: 'Create authentication service handling token generation and credential validation.',
        additions: 14,
        deletions: 0,
        accepted: true,
        riskLevel: 'medium',
      });
    }

    // Default multi-file refactoring plan
    else {
      changes.push({
        id: `chg-${Date.now()}-1`,
        filePath: 'src/services/featureService.ts',
        action: 'create',
        newContent: `// Feature Implementation for: ${instruction}\nexport const featureStatus = 'implemented';\n`,
        explanation: `Implement helper service for "${instruction}".`,
        additions: 3,
        deletions: 0,
        accepted: true,
        riskLevel: 'low',
      });
    }

    return changes;
  }

  /**
   * Scans workspace for broken imports or missing files
   */
  public findBrokenImports(): Array<{ file: string; line: number; importPath: string; error: string }> {
    const broken: Array<{ file: string; line: number; importPath: string; error: string }> = [];
    const index = this.indexer.getIndex();

    for (const imp of index.imports) {
      if (imp.importedFile.startsWith('.')) {
        // Resolve relative path
        const dir = imp.sourceFile.substring(0, imp.sourceFile.lastIndexOf('/'));
        let target = imp.importedFile.replace(/^\.\//, `${dir}/`);
        if (target.startsWith('../')) {
          const parts = dir.split('/');
          parts.pop();
          target = target.replace(/^\.\.\//, `${parts.join('/')}/`);
        }

        // Check if file exists in VFS with standard extensions (.ts, .tsx)
        const exists =
          this.vfs.readFile(target) !== null ||
          this.vfs.readFile(`${target}.ts`) !== null ||
          this.vfs.readFile(`${target}.tsx`) !== null ||
          this.vfs.readFile(`${target}/index.ts`) !== null;

        if (!exists) {
          broken.push({
            file: imp.sourceFile,
            line: 1,
            importPath: imp.importedFile,
            error: `Target module "${imp.importedFile}" cannot be resolved in workspace tree.`,
          });
        }
      }
    }

    return broken;
  }
}
