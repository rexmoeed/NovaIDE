/**
 * Intelligent Testing, Failure Diagnosis, and Self-Repair Engine Types
 */

export type TestFrameworkType =
  | 'vitest'
  | 'jest'
  | 'mocha'
  | 'playwright'
  | 'cypress'
  | 'cargo'
  | 'pytest'
  | 'custom';

export type TestSuiteKind =
  | 'unit'
  | 'integration'
  | 'component'
  | 'e2e'
  | 'typecheck'
  | 'lint'
  | 'build';

export interface DiscoveredScript {
  name: string;
  command: string;
  kind: TestSuiteKind;
}

export interface DiscoveredFile {
  path: string;
  suite: TestSuiteKind;
  framework: TestFrameworkType;
  testCasesCount?: number;
}

export interface TestDiscovery {
  framework: TestFrameworkType;
  version?: string;
  configFile?: string;
  scripts: DiscoveredScript[];
  testFiles: DiscoveredFile[];
  typecheckCommand?: string;
  lintCommand?: string;
  buildCommand?: string;
  capabilities: {
    canRunSingleFile: boolean;
    canFilterByName: boolean;
    canRerunFailed: boolean;
    canTypecheck: boolean;
    canLint: boolean;
    canBuild: boolean;
  };
}

export interface TestCaseResult {
  id: string;
  name: string;
  suiteName: string;
  filePath: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  errorMessage?: string;
  errorStack?: string;
  expected?: string;
  actual?: string;
  location?: {
    filePath: string;
    line: number;
    column?: number;
  };
  assertion?: string;
}

export interface TestRunComparison {
  newFailures: string[];
  newPasses: string[];
  fixedTests: string[];
}

export interface TestRunResult {
  runId: string;
  timestamp: string;
  target: 'all' | 'file' | 'selected' | 'failed' | 'typecheck' | 'lint' | 'build';
  command: string;
  exitCode: number;
  durationMs: number;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  tests: TestCaseResult[];
  rawOutput: string;
  comparison?: TestRunComparison;
}

export type FailureCategory =
  | 'code_defect'
  | 'environment_problem'
  | 'missing_dependency'
  | 'flaky_test'
  | 'configuration_issue';

export interface ProposedFix {
  targetFile: string;
  explanation: string;
  patch: string;
  replacementCode?: string;
  confidence: number;
}

export interface RegressionTestSpec {
  filePath: string;
  testCode: string;
  description: string;
}

export interface FailureDiagnosis {
  failureId: string;
  testName: string;
  filePath: string;
  category: FailureCategory;
  rootCause: string;
  associatedSourceFiles: string[];
  associatedTestFiles: string[];
  recentDiffSummary?: string;
  proposedFix: ProposedFix;
  regressionTest?: RegressionTestSpec;
  verificationCommand: string;
}

export interface SelfRepairAttemptAudit {
  timestamp: string;
  action: string;
  outcome: string;
  targetFile?: string;
}

export interface SelfRepairResult {
  success: boolean;
  failureId: string;
  attempts: number;
  maxAttempts: number;
  modifiedFiles: string[];
  diff: string;
  regressionTestAdded?: boolean;
  retestPassed: boolean;
  suitePassed: boolean;
  message: string;
  auditTrail: SelfRepairAttemptAudit[];
}
