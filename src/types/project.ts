export type SupportedLanguage = 
  | 'TypeScript' 
  | 'JavaScript' 
  | 'Python' 
  | 'Go' 
  | 'Rust' 
  | 'Java' 
  | 'Kotlin' 
  | 'Swift' 
  | 'C#' 
  | 'HTML' 
  | 'CSS' 
  | 'SQL' 
  | 'Dart';

export type SupportedPackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'pip' | 'poetry' | 'cargo' | 'go' | 'gradle' | 'maven';

export interface TechnologyProfile {
  name: string;
  category: 'frontend' | 'backend' | 'mobile' | 'database' | 'tooling' | 'testing' | 'styling' | 'state';
  version?: string;
  configFiles: string[];
  entryPoint?: string;
}

export interface GitProfile {
  isRepo: boolean;
  branch: string;
  remoteUrl?: string;
  ahead: number;
  behind: number;
  modifiedCount: number;
  stagedCount: number;
  untrackedCount: number;
  lastCommit?: {
    hash: string;
    message: string;
    author: string;
    timestamp: string;
  };
}

export interface ProjectHealthItem {
  key: string;
  label: string;
  passed: boolean;
  message?: string;
  severity: 'success' | 'warning' | 'error' | 'info';
}

export interface ProjectHealth {
  score: number;
  projectDetected: boolean;
  dependenciesInstalled: boolean;
  packageManagerDetected: boolean;
  packageManagerName: SupportedPackageManager | string;
  typeScriptConfigured: boolean;
  gitRepository: boolean;
  testFrameworkDetected: boolean;
  testFrameworkName?: string;
  envVariablesPresent: boolean;
  buildConfigDetected: boolean;
  items: ProjectHealthItem[];
}

export interface ProjectProfile {
  id: string;
  rootPath: string;
  name: string;
  isLocalFilesystem: boolean;

  languages: SupportedLanguage[];
  frameworks: string[];
  libraries: string[];
  packageManager: SupportedPackageManager;

  type?: string;
  architecture?: string;
  technologies?: TechnologyProfile[];

  frontend?: TechnologyProfile;
  backend?: TechnologyProfile;
  mobile?: TechnologyProfile;
  database?: TechnologyProfile;
  styling?: TechnologyProfile;
  state?: TechnologyProfile;
  testing?: TechnologyProfile;

  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;

  git?: GitProfile;
  health: ProjectHealth;

  detectedAt: string;
  lastOpenedAt: string;

  overridden?: boolean;
  userOverrides?: {
    framework?: string;
    backend?: string;
    packageManager?: SupportedPackageManager;
    styling?: string;
    database?: string;
    devCommand?: string;
    testCommand?: string;
    buildCommand?: string;
  };
}

export interface DevServerProcess {
  pid: number;
  command: string;
  cwd: string;
  port: number;
  detectedPort?: number;
  status: 'running' | 'stopped' | 'failed' | 'starting' | 'probing';
  healthState?: 'pending' | 'healthy' | 'unhealthy' | 'stopped';
  portConflictDetected?: boolean;
  lastHealthCheck?: {
    timestamp: number;
    ok: boolean;
    statusCode?: number;
    latencyMs?: number;
    message: string;
  };
  startTime: number;
  url: string;
  logs: string[];
  error?: string;
}

export interface RecentProject {
  id: string;
  path: string;
  name: string;
  lastOpened: number;
  framework: string;
  packageManager: string;
  icon?: string;
  languages?: string[];
  workspaceState?: {
    activeFile?: string;
    openTabs?: string[];
    layoutPreset?: string;
  };
}

export interface DetectionContext {
  rootPath: string;
  files: string[];
  packageJson?: any;
  hasFile: (fileName: string) => boolean;
  readFile: (filePath: string) => Promise<string | null>;
}

export interface DetectionResult {
  languages?: SupportedLanguage[];
  frameworks?: string[];
  libraries?: string[];
  packageManager?: SupportedPackageManager;
  frontend?: TechnologyProfile;
  backend?: TechnologyProfile;
  mobile?: TechnologyProfile;
  database?: TechnologyProfile;
  styling?: TechnologyProfile;
  state?: TechnologyProfile;
  testing?: TechnologyProfile;
  confidence: number;
}
