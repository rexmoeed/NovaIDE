/**
 * Types and interfaces for the Real Security & Dependency Auditor
 */

export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type SecurityCategory = 
  | 'dependency'
  | 'secret'
  | 'shell_injection'
  | 'path_traversal'
  | 'code_injection'
  | 'env_config'
  | 'network_cors'
  | 'auth_rbac'
  | 'electron_ipc'
  | 'insecure_pattern';

export type RemediationType = 
  | 'code_patch'
  | 'dependency_upgrade'
  | 'redact_secret'
  | 'config_update';

export interface SecurityRemediation {
  type: RemediationType;
  title: string;
  description: string;
  patchDiff?: string;
  replacementCode?: string;
  targetFile?: string;
  lineStart?: number;
  lineEnd?: number;
  packageName?: string;
  targetVersion?: string;
  isBreaking?: boolean;
  breakingRiskDetails?: string;
  requiresApproval: boolean;
  applied?: boolean;
  appliedAt?: string;
}

export interface SecurityFinding {
  id: string;
  ruleId: string;
  category: SecurityCategory;
  severity: SecuritySeverity;
  title: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  columnStart?: number;
  columnEnd?: number;
  evidence: string; // Strictly redacted code snippet or dependency line
  rawSecretRedacted?: boolean;
  explanation: string;
  attackVector: string;
  recommendedFix: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceReason: string;
  limitations: string;
  cve?: string;
  cwe?: string[];
  advisoryUrl?: string;
  remediation: SecurityRemediation;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface DependencyAuditItem {
  packageName: string;
  severity: SecuritySeverity;
  currentVersion: string;
  fixedVersion: string;
  advisoryTitle: string;
  advisoryUrl: string;
  cve?: string;
  cwe?: string[];
  isDirect: boolean;
  dependencyPath: string[];
  isBreaking: boolean;
  breakingExplanation: string;
  recommendedAction: string;
  fixAvailable: boolean;
}

export interface SecurityAuditReport {
  id: string;
  timestamp: string;
  projectPath: string;
  status: 'clean' | 'findings_detected' | 'scan_failed' | 'scan_partial';
  statusMessage: string;
  securityScore: number; // 0 to 100
  scannedFilesCount: number;
  durationMs: number;
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  categoryCounts: Record<SecurityCategory, number>;
  findings: SecurityFinding[];
  dependencies: DependencyAuditItem[];
  auditorCapabilities: string[];
  limitationsDisclaimer: string;
}

export interface AuditVerificationResult {
  findingId: string;
  resolved: boolean;
  message: string;
  verifiedAt: string;
  remainingDetails?: string;
}
