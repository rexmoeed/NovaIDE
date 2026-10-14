import {
  ArchitecturePlan,
  ScaffoldingContext,
  PlannedFileItem,
  ArchitectureType,
} from '../types/scaffolding';
import { TemplateRegistry } from './templateRegistry';
import { NamingEngine } from './namingEngine';

export class ArchitecturePlanner {
  /**
   * Generates a comprehensive architectural plan for the given context
   */
  public static async planArchitecture(ctx: ScaffoldingContext): Promise<ArchitecturePlan> {
    const template = TemplateRegistry.getById(ctx.templateId) || TemplateRegistry.getAll()[0];
    const baseFiles = template.generateManifest(ctx);

    // Complexity heuristic based on description and selected libraries
    const goalLower = (ctx.projectDescription || '').toLowerCase();
    let complexity: 'small' | 'medium' | 'large' = 'medium';

    if (
      goalLower.includes('enterprise') ||
      goalLower.includes('microservice') ||
      goalLower.includes('multi-tenant') ||
      goalLower.includes('rbac') ||
      ctx.category === 'fullstack'
    ) {
      complexity = 'large';
    } else if (
      goalLower.includes('simple') ||
      goalLower.includes('minimal') ||
      goalLower.includes('landing') ||
      ctx.architecture === 'simple'
    ) {
      complexity = 'small';
    }

    // Determine boundaries and contracts
    const boundaries = this.determineBoundaries(ctx, complexity);
    const entryPoints = this.determineEntryPoints(ctx);
    const routes = this.determineRoutes(ctx);
    const stateManagement = this.determineStateManagement(ctx);
    const testingStrategy = this.determineTestingStrategy(ctx);

    const summary = `Tailored ${complexity}-scale architecture for ${ctx.projectName} utilizing ${template.name}. Enforces clean separation of concerns, explicit contracts, and immediate local runnable baseline.`;

    const rationale = this.generateRationale(ctx, complexity, template.name);

    return {
      summary,
      complexity,
      rationale,
      boundaries,
      entryPoints,
      routesAndNavigation: routes,
      stateManagement,
      testingStrategy,
      devAndProdCommands: template.commands,
      assumptions: [
        'Development machine has active runtime installed and available in PATH.',
        'Dependencies will be installed into local workspace isolation without global pollution.',
        'Strict TypeScript and linting standards enabled across all generated source code.',
      ],
      files: baseFiles,
    };
  }

  /**
   * Revises an existing architecture plan based on natural language user instructions
   */
  public static revisePlan(
    currentPlan: ArchitecturePlan,
    instruction: string,
    ctx: ScaffoldingContext
  ): ArchitecturePlan {
    const lower = instruction.toLowerCase();
    const updatedFiles = [...currentPlan.files];
    let newComplexity = currentPlan.complexity;
    let newRationale = currentPlan.rationale;

    // 1. "Keep simple / Don't create unnecessary layers"
    if (lower.includes('simple') || lower.includes('minimal') || lower.includes('unnecessary')) {
      newComplexity = 'small';
      newRationale += ` (Revised to simplified minimal structure per request: "${instruction}")`;
      // Filter out overly nested feature folders if present
      const simplified = updatedFiles.filter(f => !f.path.includes('/features/dashboard/'));
      return {
        ...currentPlan,
        complexity: newComplexity,
        rationale: newRationale,
        files: simplified,
      };
    }

    // 2. "Move API logic into services folder"
    if (lower.includes('services') || lower.includes('api logic')) {
      const hasService = updatedFiles.some(f => f.path.startsWith('src/services/'));
      if (!hasService) {
        updatedFiles.push({
          id: `service-api-${Date.now()}`,
          path: 'src/services/apiService.ts',
          description: 'Centralized HTTP client and API integration gateway',
          category: 'source',
          isCustom: true,
          content: `// Centralized API Service
export class ApiService {
  private static baseUrl = process.env.VITE_API_URL || '/api';

  public static async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(\`\${this.baseUrl}\${endpoint}\`);
    if (!res.ok) throw new Error(\`API Error: \${res.statusText}\`);
    return res.json();
  }
}
`,
        });
      }
    }

    // 3. "Separate backend and frontend into two top-level folders"
    if (lower.includes('separate') && (lower.includes('frontend') || lower.includes('backend'))) {
      newRationale += ' (Partitioned into explicit /client and /server monorepo domains.)';
      return {
        ...currentPlan,
        rationale: newRationale,
        boundaries: {
          ...currentPlan.boundaries,
          frontend: '/client (Isolated React Vite workspace)',
          backend: '/server (Isolated Express / API workspace)',
        },
      };
    }

    // 4. "Add authentication" / "Add database"
    if (lower.includes('auth') && !updatedFiles.some(f => f.path.includes('auth'))) {
      updatedFiles.push({
        id: `auth-context-${Date.now()}`,
        path: 'src/context/AuthContext.tsx',
        description: 'Authentication provider and user session management',
        category: 'source',
        isCustom: true,
        content: `import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: { email: string } | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  return (
    <AuthContext.Provider value={{ user, login: email => setUser({ email }), logout: () => setUser(null) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
`,
      });
    }

    return {
      ...currentPlan,
      rationale: `${currentPlan.rationale} [Updated according to: "${instruction}"]`,
      files: updatedFiles,
    };
  }

  private static determineBoundaries(ctx: ScaffoldingContext, complexity: 'small' | 'medium' | 'large') {
    switch (ctx.category) {
      case 'web':
        return {
          frontend: 'Single-page browser application bundle mounted in index.html',
          api: 'External REST / GraphQL API endpoints defined in .env.example',
          authentication: 'Client token storage (localStorage / HTTP-only cookies)',
        };
      case 'backend':
        return {
          backend: 'REST API service with routing controllers, services, and middlewares',
          database: 'Relational or document store abstraction layer',
          authentication: 'JWT or session-based token verification in request lifecycle',
        };
      case 'mobile':
        return {
          frontend: 'Native mobile screens, safe areas, and gesture navigation',
          api: 'Remote API communication layer with offline caching',
        };
      case 'fullstack':
        return {
          frontend: 'Client UI directory with reactive component state',
          backend: 'Server API directory with isolated controller processes',
          database: 'Database migrations and schema definitions',
          authentication: 'Unified session boundary between client and server',
        };
    }
  }

  private static determineEntryPoints(ctx: ScaffoldingContext): string[] {
    switch (ctx.category) {
      case 'web':
        return ctx.templateId === 'web-nextjs' ? ['src/app/page.tsx', 'src/app/layout.tsx'] : ['src/main.tsx', 'src/App.tsx'];
      case 'backend':
        return ctx.templateId.includes('fastapi') ? ['app/main.py'] : ['src/server.ts'];
      case 'mobile':
        return ['app/index.tsx'];
      case 'fullstack':
        return ['src/App.tsx (Client)', 'server/index.ts (Server)'];
    }
  }

  private static determineRoutes(ctx: ScaffoldingContext): string[] {
    if (ctx.category === 'backend') {
      return ['GET /health', 'GET /api/tasks', 'POST /api/tasks'];
    }
    return ['/ (Home / Dashboard)', '/auth (Login)', '/settings'];
  }

  private static determineStateManagement(ctx: ScaffoldingContext): string {
    if (ctx.selectedLibraries.includes('zustand')) {
      return 'Zustand immutable reactive stores with TypeScript inference.';
    }
    if (ctx.category === 'mobile') {
      return 'React Native state hooks + Context API for navigation params.';
    }
    return 'React functional state + Context API for domain state.';
  }

  private static determineTestingStrategy(ctx: ScaffoldingContext): string {
    if (ctx.templateId.includes('fastapi')) {
      return 'Pytest suite with TestClient HTTP assertions in tests/test_main.py';
    }
    return 'Vitest unit assertions with DOM simulation and fast HMR re-runs.';
  }

  private static generateRationale(ctx: ScaffoldingContext, complexity: string, templateName: string): string {
    return `Selected ${templateName} configured for ${complexity} architecture. Modular file boundaries prevent architectural drift and ensure straightforward component testing.`;
  }
}
