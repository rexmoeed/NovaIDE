/**
 * Debug Adapter Protocol (DAP) & Multi-Language Debugger Contracts
 */

export interface Breakpoint {
  id: string;
  filePath: string;
  line: number;
  column?: number;
  enabled: boolean;
  condition?: string;
  hitCount?: number;
  verified: boolean;
  logMessage?: string;
}

export interface StackFrame {
  id: number;
  name: string;
  source: {
    path: string;
    name: string;
  };
  line: number;
  column: number;
  instructionPointer?: string;
}

export interface Scope {
  name: string;
  variablesReference: number;
  expensive: boolean;
}

export interface Variable {
  name: string;
  value: string;
  type?: string;
  variablesReference: number;
  evaluateName?: string;
  children?: Variable[];
  childrenLoaded?: boolean;
}

export interface WatchExpression {
  id: string;
  expression: string;
  value?: string;
  type?: string;
  error?: string;
  updatedAt: number;
}

export interface Thread {
  id: number;
  name: string;
  status: 'running' | 'paused' | 'terminated';
  pauseReason?: 'breakpoint' | 'step' | 'exception' | 'pause' | 'entry';
  currentFrameId?: number;
  exceptionText?: string;
}

export interface DebugConfiguration {
  name: string;
  type: 'node' | 'pwa-node' | 'tsx' | 'python' | 'custom';
  request: 'launch' | 'attach';
  program?: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  stopOnEntry?: boolean;
  runtimeExecutable?: string;
  sourceMaps?: boolean;
  port?: number;
}

export interface DebugSession {
  id: string;
  name: string;
  type: string;
  status: 'initializing' | 'running' | 'paused' | 'stopped';
  configuration: DebugConfiguration;
  activeThreadId: number;
  startTime: number;
  exitCode?: number;
  terminatedReason?: string;
}

export interface DebugConsoleMessage {
  id: string;
  text: string;
  category: 'console' | 'stdout' | 'stderr' | 'output' | 'input' | 'system';
  timestamp: string;
}

export interface RuntimeCapability {
  language: string;
  runtime: string;
  version?: string;
  isAvailable: boolean;
  adapterName: string;
  adapterInstalled: boolean;
  reasonIfNotAvailable?: string;
}

export interface AIDebugDiagnosis {
  hypothesis: string;
  rootCause: string;
  suggestedFix: string;
  targetFile: string;
  replacementCode?: string;
  redactedVariables: string[];
}
