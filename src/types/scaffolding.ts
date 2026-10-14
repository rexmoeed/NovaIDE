export type ProjectTypeCategory = 'web' | 'mobile' | 'backend' | 'fullstack';

export type ArchitectureType = 'feature-based' | 'modular' | 'clean' | 'simple';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'pip' | 'poetry' | 'cargo' | 'go' | 'gradle' | 'dotnet';

export interface PlannedFileItem {
  id: string;
  path: string;
  description: string;
  isDirectory?: boolean;
  content?: string;
  category?: 'config' | 'source' | 'test' | 'doc' | 'asset' | 'style';
  isCustom?: boolean;
}

export interface ScaffoldingContext {
  projectName: string;
  projectDescription: string;
  destinationPath: string;
  parentDir: string;
  templateId: string;
  category: ProjectTypeCategory;
  architecture: ArchitectureType;
  packageManager: PackageManager;
  initGit: boolean;
  selectedLibraries: string[];
  author?: string;
}

export interface CompatibleLibrary {
  id: string;
  name: string;
  category: 'state' | 'routing' | 'database' | 'styling' | 'validation' | 'testing' | 'auth';
  description: string;
  defaultSelected?: boolean;
  packageNames: string[];
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: ProjectTypeCategory;
  description: string;
  icon: string;
  badge?: string;
  languages: string[];
  frameworks: string[];
  defaultPackageManager: PackageManager;
  supportedPackageManagers: PackageManager[];
  defaultArchitecture: ArchitectureType;
  supportedArchitectures: ArchitectureType[];
  defaultPorts: { dev: number; preview?: number };
  commands: { dev: string; build: string; test: string; lint?: string };
  envVariables: Array<{ key: string; description: string; defaultValue: string; required?: boolean }>;
  compatibleLibraries: CompatibleLibrary[];
  generateManifest: (ctx: ScaffoldingContext) => PlannedFileItem[];
}

export interface ArchitecturePlan {
  summary: string;
  complexity: 'small' | 'medium' | 'large';
  rationale: string;
  boundaries: {
    frontend?: string;
    backend?: string;
    database?: string;
    authentication?: string;
    api?: string;
  };
  entryPoints: string[];
  routesAndNavigation: string[];
  stateManagement: string;
  testingStrategy: string;
  devAndProdCommands: { dev: string; build: string; test: string };
  assumptions: string[];
  files: PlannedFileItem[];
}

export interface PathValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
  exists?: boolean;
  isEmpty?: boolean;
  itemCount?: number;
  resolvedPath?: string;
}

export interface CreationLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export interface CreationExecutionResult {
  success: boolean;
  projectPath: string;
  createdFilesCount: number;
  createdDirsCount: number;
  dependenciesInstalled: boolean;
  gitInitialized: boolean;
  testSummary?: string;
  error?: string;
  logs: CreationLogEntry[];
}
