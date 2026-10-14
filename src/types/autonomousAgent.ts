/**
 * Autonomous AI Software Engineer Contracts & Types
 * Complete specification for autonomous planning, multi-step execution loop,
 * tool registry, checkpoints, safety permissions, and verification reports.
 */

import { AgentRole } from './ide';

export type AgentTaskState =
  | 'pending'
  | 'running'
  | 'blocked'
  | 'waiting_approval'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AutonomousExecutionState =
  | 'idle'
  | 'planning'
  | 'waiting_plan_approval'
  | 'executing'
  | 'paused'
  | 'waiting_step_approval'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ToolName =
  | 'file_search'
  | 'symbol_search'
  | 'read_file'
  | 'write_file'
  | 'patch_file'
  | 'create_file'
  | 'delete_file'
  | 'list_dir'
  | 'terminal_command'
  | 'server_lifecycle'
  | 'browser_navigate'
  | 'git_status'
  | 'git_diff'
  | 'run_tests'
  | 'type_check'
  | 'build_project'
  | 'project_diagnostics';

export type PermissionMode =
  | 'strict'        // Ask before every consequential action
  | 'supervised'    // Routine workspace allowed, approve edits and commands individually
  | 'autonomous';   // Allow routine workspace actions, require approval for high-risk operations

export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  output?: string;
  durationMs?: number;
  changesDetected?: boolean;
  diff?: string;
}

export interface StepExecutionRecord {
  id: string;
  stepIndex: number;
  tool: ToolName;
  args: Record<string, any>;
  result: ToolResult;
  rationale: string;
  observation: string;
  diagnosis?: string;
  requiresApproval?: boolean;
  approved?: boolean;
  timestamp: number;
}

export interface FileCheckpoint {
  id: string;
  taskId: string;
  timestamp: number;
  description: string;
  files: Array<{
    path: string;
    originalContent: string | null;
    existsBefore: boolean;
  }>;
}

export interface AutonomousTask {
  id: string;
  title: string;
  description: string;
  role: AgentRole;
  status: AgentTaskState;
  dependencies: string[]; // Task IDs that must complete first
  acceptanceCriteria: string[];
  estimatedTools: ToolName[];
  targetFiles: string[];
  requiresApproval: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  executionHistory: StepExecutionRecord[];
  resultSummary?: string;
  verificationReport?: VerificationSummary;
  checkpointId?: string;
  retryCount: number;
  maxRetries: number;
  error?: string;
}

export interface VerificationSummary {
  filesChanged: string[];
  commandsExecuted: Array<{
    command: string;
    exitCode: number;
    success: boolean;
    outputSnippet?: string;
  }>;
  testsPassed: number;
  testsFailed: number;
  testErrors?: string[];
  typeCheckPassed: boolean;
  typeCheckErrors?: string[];
  buildPassed?: boolean;
  buildErrors?: string[];
  checksNotRun: string[];
  remainingRisks: string[];
  overallSuccess: boolean;
  timestamp: number;
}

export interface AutonomousPlan {
  id: string;
  goal: string;
  techStackSummary: string;
  rootWorkspace: string;
  tasks: AutonomousTask[];
  suggestedTools: ToolName[];
  estimatedTotalSteps: number;
  createdAt: number;
  status: 'draft' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
}

export interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
  requiresExplicitApproval: boolean;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
}
