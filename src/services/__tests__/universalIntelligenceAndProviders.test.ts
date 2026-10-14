import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UniversalSystemPromptBuilder, PromptContextOptions } from '../universalSystemPrompt';
import { AIProviderService } from '../aiProviderService';
import { VirtualFileSystem } from '../virtualFs';
import { ProjectProfile } from '../../types/project';

describe('UniversalSystemPromptBuilder', () => {
  let vfs: VirtualFileSystem;

  beforeEach(() => {
    vfs = new VirtualFileSystem([
      {
        id: 'pkg-1',
        name: 'package.json',
        path: 'package.json',
        type: 'file',
        content: JSON.stringify({
          name: 'enterprise-portal',
          version: '1.0.0',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            test: 'vitest run',
          },
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            zustand: '^5.0.0',
          },
          devDependencies: {
            typescript: '^5.0.0',
            vite: '^6.0.0',
            vitest: '^3.0.0',
          },
        }),
      },
      {
        id: 'main-1',
        name: 'main.tsx',
        path: 'src/main.tsx',
        type: 'file',
        content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(<App />);`,
      },
      {
        id: 'app-1',
        name: 'App.tsx',
        path: 'src/App.tsx',
        type: 'file',
        content: `export default function App() { return <h1>Enterprise Portal</h1>; }`,
      },
    ]);
  });

  it('correctly classifies verified evidence vs inferred vs unknown', () => {
    const profile: ProjectProfile = {
      id: 'test-project-1',
      name: 'enterprise-portal',
      rootPath: '/workspace/enterprise-portal',
      isLocalFilesystem: false,
      type: 'web',
      languages: ['TypeScript', 'JavaScript'],
      frameworks: ['React'],
      libraries: [],
      technologies: [
        { name: 'React', category: 'frontend', version: '^19.0.0', entryPoint: 'src/main.tsx', configFiles: ['package.json'] },
        { name: 'Vite', category: 'tooling', version: '^6.0.0', configFiles: ['vite.config.ts'] },
      ],
      packageManager: 'pnpm',
      scripts: { dev: 'vite', build: 'vite build', test: 'vitest run' },
      dependencies: { react: '^19.0.0' },
      devDependencies: { typescript: '^5.0.0' },
      architecture: 'Feature-based',
      health: {
        score: 95,
        projectDetected: true,
        dependenciesInstalled: true,
        packageManagerDetected: true,
        packageManagerName: 'pnpm',
        typeScriptConfigured: true,
        gitRepository: true,
        testFrameworkDetected: true,
        envVariablesPresent: true,
        buildConfigDetected: true,
        items: [],
      },
      detectedAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
    };

    const evidence = UniversalSystemPromptBuilder.extractVerifiedEvidence({
      userPrompt: 'Explain how the portal boots up',
      projectProfile: profile,
      activeFile: 'src/main.tsx',
      activeFileContent: 'console.log("dirty buffer");',
      hasUnsavedChanges: true,
      terminalContext: {
        lastCommand: 'pnpm test',
        lastExitCode: 0,
      },
      gitContext: {
        branch: 'feat/auth-integration',
      },
    });

    const verifiedFacts = evidence.filter(e => e.category === 'VERIFIED');
    expect(verifiedFacts.length).toBeGreaterThanOrEqual(4);

    expect(verifiedFacts.some(f => f.fact.includes('Package Manager: pnpm'))).toBe(true);
    expect(verifiedFacts.some(f => f.fact.includes('Languages: TypeScript, JavaScript'))).toBe(true);
    expect(verifiedFacts.some(f => f.fact.includes('main.tsx'))).toBe(true);

    const inferredFacts = evidence.filter(e => e.category === 'INFERRED');
    expect(inferredFacts.some(f => f.fact.includes('Architecture Pattern: Feature-based'))).toBe(true);
  });

  it('builds a model-agnostic dynamic system prompt including unsaved buffer priority', () => {
    const profile: ProjectProfile = {
      id: 'test-project-2',
      name: 'enterprise-portal',
      rootPath: '/workspace',
      isLocalFilesystem: false,
      type: 'web',
      languages: ['TypeScript'],
      frameworks: ['React'],
      libraries: [],
      technologies: [{ name: 'React', category: 'frontend', configFiles: ['package.json'] }],
      packageManager: 'bun',
      scripts: { dev: 'bun dev' },
      dependencies: {},
      devDependencies: {},
      health: {
        score: 90,
        projectDetected: true,
        dependenciesInstalled: true,
        packageManagerDetected: true,
        packageManagerName: 'bun',
        typeScriptConfigured: true,
        gitRepository: true,
        testFrameworkDetected: false,
        envVariablesPresent: false,
        buildConfigDetected: true,
        items: [],
      },
      detectedAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
    };

    const prompt = UniversalSystemPromptBuilder.buildSystemPrompt({
      userPrompt: 'Where is state stored?',
      projectProfile: profile,
      activeFile: 'src/App.tsx',
      activeFileContent: 'const [user, setUser] = useState({ id: 1, role: "admin" });',
      hasUnsavedChanges: true,
      agentRole: 'Architect',
      includeTools: true,
    });

    expect(prompt).toContain('Role: Architect');
    expect(prompt).toContain('Package Manager: bun');
    expect(prompt).toContain('UNSAVED CHANGES IN MONACO (Prioritize this buffer over disk)');
    expect(prompt).toContain('const [user, setUser] = useState');
    expect(prompt).toContain('fs_read_file');
    expect(prompt).toContain('terminal_execute');
  });

  it('executes real tools against VFS without hallucination', async () => {
    // 1. fs_read_file
    const readRes = await UniversalSystemPromptBuilder.executeTool(
      'fs_read_file',
      { filePath: 'src/App.tsx' },
      vfs
    );
    expect(readRes.success).toBe(true);
    expect(readRes.result.content).toContain('Enterprise Portal');

    // 2. fs_write_file
    const writeRes = await UniversalSystemPromptBuilder.executeTool(
      'fs_write_file',
      { filePath: 'src/utils/format.ts', content: 'export const fmt = (x: string) => x.trim();' },
      vfs
    );
    expect(writeRes.success).toBe(true);
    expect(vfs.readFile('src/utils/format.ts')).toContain('export const fmt');

    // 3. fs_list_directory
    const listRes = await UniversalSystemPromptBuilder.executeTool(
      'fs_list_directory',
      { dirPath: 'src' },
      vfs
    );
    expect(listRes.success).toBe(true);
    expect(listRes.result.some((e: any) => e.name === 'App.tsx')).toBe(true);

    // 4. codebase_search
    const searchRes = await UniversalSystemPromptBuilder.executeTool(
      'codebase_search',
      { query: 'Enterprise Portal' },
      vfs
    );
    expect(searchRes.success).toBe(true);
    expect(searchRes.result.length).toBeGreaterThan(0);
  });
});

describe('AIProviderService Multi-Provider Catalog & BYOK', () => {
  it('loads all standard providers including DeepSeek, Mistral, Groq, xAI, Ollama, and Custom', () => {
    const providers = AIProviderService.loadProviders();
    const ids = providers.map(p => p.id);

    expect(ids).toContain('gemini');
    expect(ids).toContain('openai');
    expect(ids).toContain('anthropic');
    expect(ids).toContain('deepseek');
    expect(ids).toContain('mistral');
    expect(ids).toContain('xai');
    expect(ids).toContain('groq');
    expect(ids).toContain('ollama');
    expect(ids).toContain('custom');
  });

  it('masks API keys securely without leaking plaintext', () => {
    expect(AIProviderService.maskApiKey(undefined)).toBe('Not configured');
    expect(AIProviderService.maskApiKey('short')).toBe('••••••••');
    const masked = AIProviderService.maskApiKey('sk-ant-api03-abcdef1234567890xyz');
    expect(masked).toBe('sk-a••••••••••••0xyz');
    expect(masked).not.toContain('abcdef1234567890');
  });

  it('filters models across provider and capabilities accurately', () => {
    const codingModels = AIProviderService.filterModels({ capability: 'coding' });
    expect(codingModels.length).toBeGreaterThan(0);
    expect(codingModels.every(m => m.isCoding)).toBe(true);

    const reasoningModels = AIProviderService.filterModels({ capability: 'reasoning' });
    expect(reasoningModels.length).toBeGreaterThan(0);
    expect(reasoningModels.every(m => m.isReasoning)).toBe(true);

    const deepseekModels = AIProviderService.filterModels({ providerId: 'deepseek' });
    expect(deepseekModels.length).toBeGreaterThan(0);
    expect(deepseekModels.every(m => m.providerId === 'deepseek')).toBe(true);
  });

  it('records usage telemetry records accurately', () => {
    const rec = AIProviderService.recordUsage({
      providerId: 'deepseek',
      modelId: 'deepseek-chat',
      agentRole: 'Backend',
      project: 'TestPortal',
      inputTokens: 500,
      outputTokens: 250,
      estimatedCostUsd: 0.00014,
      durationMs: 400,
      success: true,
      isReported: true,
    });

    expect(rec.id).toBeDefined();
    expect(rec.providerId).toBe('deepseek');
    expect(rec.estimatedCostUsd).toBe(0.00014);

    const history = AIProviderService.loadUsageHistory();
    expect(history.some(h => h.id === rec.id)).toBe(true);
  });

  it('sanitizes environment credentials before LLM context generation', () => {
    const safeCheck = AIProviderService.sanitizeContentForLLM('.env.local', 'DATABASE_URL=postgres://root:pass@localhost');
    expect(safeCheck.isSafe).toBe(false);
    expect(safeCheck.sanitized).toContain('SECURITY GUARD');

    const codeCheck = AIProviderService.sanitizeContentForLLM('src/api.ts', 'const key = "AIzaSyDummyKey12345678901234567890123";');
    expect(codeCheck.isSafe).toBe(true);
    expect(codeCheck.sanitized).toContain('AIza[REDACTED_API_KEY]');
  });
});
