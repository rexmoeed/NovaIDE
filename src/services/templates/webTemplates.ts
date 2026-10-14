import { TemplateDefinition, ScaffoldingContext, PlannedFileItem } from '../../types/scaffolding';
import { generateReadme } from './shared';

// 1. React + Vite
export const webReactVite: TemplateDefinition = {
  id: 'web-react-vite',
  name: 'React + Vite',
  category: 'web',
  description: 'Ultra-fast React 19 SPA with TypeScript, Tailwind CSS v4, Lucide Icons, and Vitest suite.',
  icon: '⚛️',
  badge: 'Popular',
  languages: ['TypeScript', 'CSS', 'HTML'],
  frameworks: ['React 19', 'Vite', 'Tailwind CSS'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn', 'bun'],
  defaultArchitecture: 'feature-based',
  supportedArchitectures: ['feature-based', 'modular', 'simple'],
  defaultPorts: { dev: 5173, preview: 4173 },
  commands: {
    dev: 'npm run dev',
    build: 'npm run build',
    test: 'npm test',
    lint: 'npm run lint',
  },
  envVariables: [
    { key: 'VITE_API_URL', description: 'Base backend API URL', defaultValue: 'http://localhost:3000/api' },
    { key: 'VITE_APP_TITLE', description: 'Application display title', defaultValue: 'My React Application' },
  ],
  compatibleLibraries: [
    { id: 'tailwind', name: 'Tailwind CSS v4', category: 'styling', description: 'Utility-first styling system', defaultSelected: true, packageNames: ['tailwindcss', '@tailwindcss/vite'] },
    { id: 'zustand', name: 'Zustand', category: 'state', description: 'Lightweight reactive state management', defaultSelected: true, packageNames: ['zustand'] },
    { id: 'react-router', name: 'React Router v7', category: 'routing', description: 'Client-side declarative routing', defaultSelected: true, packageNames: ['react-router'] },
    { id: 'zod', name: 'Zod', category: 'validation', description: 'TypeScript-first schema validation', defaultSelected: true, packageNames: ['zod'] },
  ],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg-json',
      path: 'package.json',
      description: 'Project manifest and build scripts',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc -b && vite build',
          preview: 'vite preview',
          test: 'vitest run',
        },
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'lucide-react': '^0.475.0',
          zustand: '^5.0.3',
          zod: '^3.24.1',
        },
        devDependencies: {
          '@types/react': '^19.0.8',
          '@types/react-dom': '^19.0.3',
          '@vitejs/plugin-react': '^4.3.4',
          tailwindcss: '^4.0.0',
          typescript: '^5.7.3',
          vite: '^6.1.0',
          vitest: '^3.0.5',
        },
      }, null, 2),
    },
    {
      id: 'tsconfig',
      path: 'tsconfig.json',
      description: 'TypeScript configuration',
      category: 'config',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          strict: true,
          noEmit: true,
        },
        include: ['src'],
      }, null, 2),
    },
    {
      id: 'vite-config',
      path: 'vite.config.ts',
      description: 'Vite bundler config',
      category: 'config',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
`,
    },
    {
      id: 'index-html',
      path: 'index.html',
      description: 'HTML5 entry point',
      category: 'config',
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${ctx.projectName}</title>
  </head>
  <body class="bg-slate-950 text-slate-100 min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
    {
      id: 'src-main',
      path: 'src/main.tsx',
      description: 'Application entry bootstrap',
      category: 'source',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    },
    {
      id: 'src-index-css',
      path: 'src/index.css',
      description: 'Tailwind styling imports',
      category: 'style',
      content: `@import "tailwindcss";

body {
  margin: 0;
  min-height: 100vh;
}
`,
    },
    {
      id: 'src-app',
      path: 'src/App.tsx',
      description: 'Working starter home page with feature architecture',
      category: 'source',
      content: `import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './features/dashboard/components/DashboardView';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar appName="${ctx.projectName}" />
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-1">Project Milestone Manager</h2>
          <p className="text-xs text-slate-400 mb-4">Feature-based architecture with React 19, TypeScript & Tailwind CSS</p>
          <DashboardView />
        </div>
      </main>
    </div>
  );
}
`,
    },
    {
      id: 'comp-btn',
      path: 'src/components/ui/Button.tsx',
      description: 'Reusable typed button component',
      category: 'source',
      content: `import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    outline: 'border border-slate-700 hover:border-slate-600 text-slate-300',
  };
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs',
  };

  return (
    <button className={\`\${base} \${variants[variant]} \${sizes[size]} \${className}\`} {...props}>
      {children}
    </button>
  );
};
`,
    },
    {
      id: 'comp-nav',
      path: 'src/components/layout/Navbar.tsx',
      description: 'Application layout header',
      category: 'source',
      content: `import React from 'react';
import { Sparkles, Shield } from 'lucide-react';

export const Navbar: React.FC<{ appName: string }> = ({ appName }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-bold text-sm text-white">{appName}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Shield className="w-3 h-3" /> Ready
        </span>
      </div>
    </header>
  );
};
`,
    },
    {
      id: 'feat-dash',
      path: 'src/features/dashboard/components/DashboardView.tsx',
      description: 'Feature view component',
      category: 'source',
      content: `import React, { useState } from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const DashboardView: React.FC = () => {
  const [items, setItems] = useState([
    { id: '1', title: 'Verify React 19 toolchain', done: true },
    { id: '2', title: 'Configure Tailwind CSS styling', done: true },
    { id: '3', title: 'Implement feature-based domain logic', done: false },
  ]);
  const [inputVal, setInputVal] = useState('');

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setItems(prev => [...prev, { id: String(Date.now()), title: inputVal.trim(), done: false }]);
    setInputVal('');
  };

  const toggle = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={addItem} className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Add a new project milestone..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
        />
        <Button type="submit" variant="primary" size="sm">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add
        </Button>
      </form>
      <div className="space-y-1.5">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => toggle(item.id)}
            className="p-3 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between cursor-pointer transition"
          >
            <span className={\`text-xs \${item.done ? 'line-through text-slate-500' : 'text-slate-200'}\`}>
              {item.title}
            </span>
            <CheckCircle2 className={\`w-4 h-4 \${item.done ? 'text-emerald-400' : 'text-slate-600'}\`} />
          </div>
        ))}
      </div>
    </div>
  );
};
`,
    },
    {
      id: 'feat-auth',
      path: 'src/features/auth/services/authService.ts',
      description: 'Domain auth service',
      category: 'source',
      content: `export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
}

export const authService = {
  getCurrentSession(): UserSession {
    return {
      id: 'usr_default',
      email: 'developer@example.com',
      name: 'Development Lead',
      role: 'admin',
    };
  },
};
`,
    },
    {
      id: 'feat-types',
      path: 'src/types/index.ts',
      description: 'Shared TypeScript types',
      category: 'source',
      content: `export interface Identifiable {
  id: string;
}

export interface ApiResponse<T> {
  data: T;
  status: string;
  timestamp: string;
}
`,
    },
    {
      id: 'api-client',
      path: 'src/services/apiClient.ts',
      description: 'HTTP client abstraction',
      category: 'source',
      content: `const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(\`\${BASE_URL}\${endpoint}\`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    throw new Error(\`API error \${res.status}: \${res.statusText}\`);
  }
  return res.json();
}
`,
    },
    {
      id: 'gitignore',
      path: '.gitignore',
      description: 'Git ignore rules',
      category: 'config',
      content: `node_modules
dist
dist-ssr
*.local
.env
.env.*.local
.DS_Store
*.log
`,
    },
    {
      id: 'eslint-cfg',
      path: 'eslint.config.js',
      description: 'ESLint flat configuration',
      category: 'config',
      content: `import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
  }
);
`,
    },
    {
      id: 'src-test',
      path: 'src/__tests__/app.test.ts',
      description: 'Vitest unit assertions',
      category: 'test',
      content: `import { describe, it, expect } from 'vitest';

describe('${ctx.projectName} Suite', () => {
  it('passes baseline verification', () => {
    expect('${ctx.projectName}').toBeDefined();
  });
});
`,
    },
    {
      id: 'env-example',
      path: '.env.example',
      description: 'Sample environment variables',
      category: 'config',
      content: `VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE="${ctx.projectName}"
`,
    },
    {
      id: 'readme',
      path: 'README.md',
      description: 'Documentation',
      category: 'doc',
      content: generateReadme(
        ctx,
        'React 19 + TypeScript + Vite + Tailwind CSS',
        `${ctx.projectName}/
├── src/
│   ├── components/
│   ├── features/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── vite.config.ts`,
        ['Node.js 18+ or 20+'],
        {
          install: `${ctx.packageManager} install`,
          dev: `${ctx.packageManager} run dev`,
          test: `${ctx.packageManager} test`,
          build: `${ctx.packageManager} run build`,
        },
        'Uses standard React 19 functional components and typed interfaces.'
      ),
    },
  ],
};

// 2. Next.js App Router
export const webNextJs: TemplateDefinition = {
  id: 'web-nextjs',
  name: 'Next.js (App Router)',
  category: 'web',
  description: 'Full-stack React framework with App Router, React Server Components, Server Actions, and Tailwind CSS.',
  icon: '▲',
  languages: ['TypeScript', 'CSS', 'HTML'],
  frameworks: ['Next.js 15', 'React 19', 'Tailwind CSS'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn', 'bun'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'feature-based'],
  defaultPorts: { dev: 3000 },
  commands: {
    dev: 'npm run dev',
    build: 'npm run build',
    test: 'npm test',
    lint: 'npm run lint',
  },
  envVariables: [
    { key: 'NEXT_PUBLIC_APP_URL', description: 'Application base URL', defaultValue: 'http://localhost:3000' },
  ],
  compatibleLibraries: [
    { id: 'tailwind', name: 'Tailwind CSS', category: 'styling', description: 'Utility CSS', defaultSelected: true, packageNames: ['tailwindcss'] },
  ],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'Dependencies and scripts',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          test: 'vitest run',
        },
        dependencies: {
          next: '^15.1.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'lucide-react': '^0.475.0',
        },
        devDependencies: {
          '@types/node': '^22.0.0',
          '@types/react': '^19.0.0',
          tailwindcss: '^4.0.0',
          typescript: '^5.7.0',
          vitest: '^3.0.0',
        },
      }, null, 2),
    },
    {
      id: 'app-layout',
      path: 'src/app/layout.tsx',
      description: 'Root layout',
      category: 'source',
      content: `import './globals.css';
export const metadata = { title: '${ctx.projectName}' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen">{children}</body>
    </html>
  );
}
`,
    },
    {
      id: 'app-page',
      path: 'src/app/page.tsx',
      description: 'Home page route',
      category: 'source',
      content: `import React from 'react';

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
        <h1 className="text-xl font-bold text-white">${ctx.projectName}</h1>
        <p className="text-xs text-slate-400">Next.js 15 App Router + Server Components</p>
      </div>
    </main>
  );
}
`,
    },
    {
      id: 'globals-css',
      path: 'src/app/globals.css',
      description: 'Tailwind CSS',
      category: 'style',
      content: `@import "tailwindcss";`,
    },
    {
      id: 'readme',
      path: 'README.md',
      description: 'Documentation',
      category: 'doc',
      content: generateReadme(
        ctx,
        'Next.js 15 App Router + React 19 + TypeScript',
        `${ctx.projectName}/src/app/`,
        ['Node.js 18.17+ or 20+'],
        {
          install: `${ctx.packageManager} install`,
          dev: `${ctx.packageManager} run dev`,
          test: `${ctx.packageManager} test`,
          build: `${ctx.packageManager} run build`,
        },
        'Follows Next.js 15 App Router conventions.'
      ),
    },
  ],
};

// 3. Vue 3 + Vite
export const webVueVite: TemplateDefinition = {
  id: 'web-vue-vite',
  name: 'Vue + Vite',
  category: 'web',
  description: 'Modern Vue 3 application with Vite, Pinia state management, TypeScript, and Vue Router.',
  icon: '💚',
  languages: ['TypeScript', 'Vue', 'CSS', 'HTML'],
  frameworks: ['Vue 3', 'Vite', 'Pinia'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn', 'bun'],
  defaultArchitecture: 'feature-based',
  supportedArchitectures: ['feature-based', 'modular', 'simple'],
  defaultPorts: { dev: 5173 },
  commands: {
    dev: 'npm run dev',
    build: 'npm run build',
    test: 'npm test',
  },
  envVariables: [
    { key: 'VITE_API_URL', description: 'Backend API URL', defaultValue: 'http://localhost:3000' },
  ],
  compatibleLibraries: [
    { id: 'pinia', name: 'Pinia', category: 'state', description: 'Intuitive store for Vue', defaultSelected: true, packageNames: ['pinia'] },
    { id: 'vue-router', name: 'Vue Router', category: 'routing', description: 'Official Vue routing', defaultSelected: true, packageNames: ['vue-router@4'] },
  ],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'Vue 3 package manifest',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: '0.1.0',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          test: 'vitest run',
        },
        dependencies: {
          vue: '^3.5.0',
          pinia: '^2.3.0',
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^5.2.0',
          typescript: '^5.7.0',
          vite: '^6.1.0',
          vitest: '^3.0.0',
        },
      }, null, 2),
    },
    {
      id: 'app-vue',
      path: 'src/App.vue',
      description: 'Root Vue component with reactive counter',
      category: 'source',
      content: `<template>
  <div class="app-container">
    <div class="card">
      <h1>{{ title }}</h1>
      <p>Vue 3 + Vite + TypeScript</p>
      <button @click="count++">Clicked {{ count }} times</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const title = ref('${ctx.projectName}');
const count = ref(0);
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #090d16;
  color: #fff;
  font-family: system-ui, sans-serif;
}
.card {
  background: #111827;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid #1f2937;
  text-align: center;
}
button {
  background: #10b981;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;
}
</style>
`,
    },
    {
      id: 'main-ts',
      path: 'src/main.ts',
      description: 'Vue 3 bootstrap',
      category: 'source',
      content: `import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.mount('#root');
`,
    },
    {
      id: 'index-html',
      path: 'index.html',
      description: 'HTML5 entry',
      category: 'config',
      content: `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"/><title>${ctx.projectName}</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.ts"></script></body>
</html>
`,
    },
    {
      id: 'readme',
      path: 'README.md',
      description: 'Vue documentation',
      category: 'doc',
      content: generateReadme(
        ctx,
        'Vue 3 + Vite + Pinia',
        `${ctx.projectName}/src/`,
        ['Node.js 18+'],
        {
          install: `${ctx.packageManager} install`,
          dev: `${ctx.packageManager} run dev`,
          test: `${ctx.packageManager} test`,
          build: `${ctx.packageManager} run build`,
        },
        'Uses Composition API with <script setup>.'
      ),
    },
  ],
};

// 4. Nuxt
export const webNuxt: TemplateDefinition = {
  id: 'web-nuxt',
  name: 'Nuxt',
  category: 'web',
  description: 'Intuitive full-stack Vue framework with auto-imports, file-based routing, and SSR/SSG capabilities.',
  icon: '🏔️',
  languages: ['TypeScript', 'Vue'],
  frameworks: ['Nuxt 3', 'Vue 3'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn', 'bun'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'feature-based'],
  defaultPorts: { dev: 3000 },
  commands: {
    dev: 'npm run dev',
    build: 'npm run build',
    test: 'npm test',
  },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'Nuxt package manifest',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        scripts: {
          dev: 'nuxt dev',
          build: 'nuxt build',
          test: 'vitest run',
        },
        dependencies: {
          nuxt: '^3.15.0',
          vue: '^3.5.0',
        },
      }, null, 2),
    },
    {
      id: 'app-vue',
      path: 'app.vue',
      description: 'Nuxt entry component',
      category: 'source',
      content: `<template>
  <div style="background:#090d16;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;">
    <h1>${ctx.projectName} (Nuxt 3)</h1>
  </div>
</template>
`,
    },
    {
      id: 'nuxt-config',
      path: 'nuxt.config.ts',
      description: 'Nuxt configuration',
      category: 'config',
      content: `export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
});
`,
    },
  ],
};

// 5. Angular
export const webAngular: TemplateDefinition = {
  id: 'web-angular',
  name: 'Angular',
  category: 'web',
  description: 'Enterprise-grade Angular 18+ application with Standalone Components and Signals.',
  icon: '🅰️',
  languages: ['TypeScript', 'HTML', 'CSS'],
  frameworks: ['Angular 18+', 'RxJS'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'clean'],
  defaultPorts: { dev: 4200 },
  commands: {
    dev: 'ng serve',
    build: 'ng build',
    test: 'ng test',
  },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'Angular package manifest',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        scripts: {
          start: 'ng serve',
          build: 'ng build',
          test: 'ng test',
        },
        dependencies: {
          '@angular/core': '^18.2.0',
          '@angular/common': '^18.2.0',
          rxjs: '^7.8.0',
        },
      }, null, 2),
    },
    {
      id: 'app-component',
      path: 'src/app/app.component.ts',
      description: 'Angular standalone root component',
      category: 'source',
      content: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: \`
    <div style="background:#090d16;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;">
      <h2>{{ title() }}</h2>
    </div>
  \`,
})
export class AppComponent {
  title = signal('${ctx.projectName}');
}
`,
    },
  ],
};

// 6. SvelteKit
export const webSvelteKit: TemplateDefinition = {
  id: 'web-sveltekit',
  name: 'SvelteKit',
  category: 'web',
  description: 'Lightning-fast Svelte 5 application with SvelteKit file-based routing and Vite.',
  icon: '🧡',
  languages: ['TypeScript', 'Svelte', 'CSS'],
  frameworks: ['Svelte 5', 'SvelteKit', 'Vite'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn', 'bun'],
  defaultArchitecture: 'modular',
  supportedArchitectures: ['modular', 'simple'],
  defaultPorts: { dev: 5173 },
  commands: {
    dev: 'vite dev',
    build: 'vite build',
    test: 'vitest run',
  },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'SvelteKit package manifest',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        scripts: { dev: 'vite dev', build: 'vite build', test: 'vitest run' },
        dependencies: { '@sveltejs/kit': '^2.15.0', svelte: '^5.0.0' },
      }, null, 2),
    },
    {
      id: 'page-svelte',
      path: 'src/routes/+page.svelte',
      description: 'Home route in SvelteKit',
      category: 'source',
      content: `<script lang="ts">
  let count = $state(0);
</script>

<div style="background:#090d16;color:#fff;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
  <h1>${ctx.projectName} (Svelte 5)</h1>
  <button onclick={() => count++}>Clicks: {count}</button>
</div>
`,
    },
  ],
};

// 7. Astro
export const webAstro: TemplateDefinition = {
  id: 'web-astro',
  name: 'Astro',
  category: 'web',
  description: 'Content-driven island architecture web framework for content sites and documentation.',
  icon: '🚀',
  languages: ['TypeScript', 'Astro'],
  frameworks: ['Astro 4+', 'Vite'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn', 'bun'],
  defaultArchitecture: 'simple',
  supportedArchitectures: ['simple', 'modular'],
  defaultPorts: { dev: 4321 },
  commands: { dev: 'astro dev', build: 'astro build', test: 'vitest run' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'Astro package manifest',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        scripts: { dev: 'astro dev', build: 'astro build' },
        dependencies: { astro: '^5.0.0' },
      }, null, 2),
    },
    {
      id: 'index-astro',
      path: 'src/pages/index.astro',
      description: 'Astro home page',
      category: 'source',
      content: `---
const title = '${ctx.projectName}';
---
<html lang="en">
  <body style="background:#090d16;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;">
    <h1>{title}</h1>
  </body>
</html>
`,
    },
  ],
};

// 8. Vanilla HTML/CSS/TypeScript
export const webVanilla: TemplateDefinition = {
  id: 'web-vanilla',
  name: 'Vanilla HTML/CSS/TypeScript',
  category: 'web',
  description: 'Pure TypeScript and HTML5 with Vite bundler. Zero framework dependencies.',
  icon: '🌐',
  languages: ['TypeScript', 'HTML', 'CSS'],
  frameworks: ['TypeScript', 'Vite'],
  defaultPackageManager: 'npm',
  supportedPackageManagers: ['npm', 'pnpm', 'yarn', 'bun'],
  defaultArchitecture: 'simple',
  supportedArchitectures: ['simple'],
  defaultPorts: { dev: 5173 },
  commands: { dev: 'vite', build: 'vite build', test: 'vitest run' },
  envVariables: [],
  compatibleLibraries: [],
  generateManifest: (ctx: ScaffoldingContext): PlannedFileItem[] => [
    {
      id: 'pkg',
      path: 'package.json',
      description: 'Vanilla TypeScript manifest',
      category: 'config',
      content: JSON.stringify({
        name: ctx.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        scripts: { dev: 'vite', build: 'tsc && vite build' },
        devDependencies: { typescript: '^5.7.0', vite: '^6.1.0' },
      }, null, 2),
    },
    {
      id: 'main-ts',
      path: 'src/main.ts',
      description: 'Vanilla TypeScript entry point',
      category: 'source',
      content: `document.getElementById('app')!.innerHTML = '<h1>${ctx.projectName} (Vanilla TypeScript)</h1>';`,
    },
    {
      id: 'index-html',
      path: 'index.html',
      description: 'HTML5 entry',
      category: 'config',
      content: `<!DOCTYPE html><html><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>`,
    },
  ],
};

export const allWebTemplates = [
  webReactVite,
  webNextJs,
  webVueVite,
  webNuxt,
  webAngular,
  webSvelteKit,
  webAstro,
  webVanilla,
];
