export type SecretType = 'api_key' | 'token' | 'ssh_key' | 'db_credential' | 'oauth_secret' | 'env_secret';
export type SecretAccessPolicy = 'always_ask' | 'ask_once_per_session' | 'auto_within_scope' | 'owner_only';

export interface VaultSecret {
  id: string;
  name: string;
  type: SecretType;
  maskedPreview: string; // e.g. "sk-••••••••••••3a9f"
  encryptedValue: string; // AES-GCM ciphertext
  iv: string;
  scopeBusinessId?: string;
  scopeProjectId?: string;
  policy: SecretAccessPolicy;
  createdAt: number;
  lastUsedAt?: number;
  rotationDueAt?: number;
  notes?: string;
}

export interface VaultAuditEntry {
  id: string;
  secretId: string;
  secretName: string;
  action: 'read' | 'create' | 'rotate' | 'delete' | 'inject';
  requester: 'agent' | 'user' | 'system' | 'council';
  callerTool?: string;
  targetService?: string;
  granted: boolean;
  timestamp: number;
}

export type GateSeverity = 'advisory' | 'block';
export type GateCheckType = 'regex' | 'glob' | 'command' | 'test' | 'lint' | 'diff_size' | 'protected_file';

export interface RulebookRule {
  id: string;
  description: string;
  severity: GateSeverity;
  checkType: GateCheckType;
  pattern?: string;
  maxDiffLines?: number;
  scope: ('tools' | 'git_commit' | 'git_push' | 'ai_context' | 'terminal')[];
  enabled: boolean;
  businessId?: string;
}

export interface RulebookViolation {
  id: string;
  ruleId: string;
  ruleDescription: string;
  severity: GateSeverity;
  target: string;
  details: string;
  timestamp: number;
  overridden?: boolean;
  overriddenBy?: string;
  overrideReason?: string;
}

export interface SecretScanFinding {
  id: string;
  type: string;
  file: string;
  line: number;
  matchSnippet: string;
  entropy: number;
  isAllowlisted: boolean;
  timestamp: number;
}

export interface TamperManifestEntry {
  path: string;
  expectedSha256: string;
  actualSha256: string;
  lastVerified: number;
  tampered: boolean;
  protectedBy: 'system' | 'owner';
}

export interface CouncilMember {
  providerId: string;
  modelId: string;
  displayName: string;
  role: 'proposer' | 'critic' | 'reviewer' | 'judge';
}

export interface CouncilVote {
  memberModel: string;
  decision: 'approve' | 'reject' | 'revise';
  reasoning: string;
  latencyMs: number;
  estimatedCostUsd: number;
  confidence: number;
}

export interface CouncilSession {
  id: string;
  topic: string;
  contextCode?: string;
  mode: 'parallel_compare' | 'debate' | 'vote' | 'chairman_synthesis';
  members: CouncilMember[];
  votes: CouncilVote[];
  consensusSummary: string;
  dissentingOpinions: string[];
  finalVerdict: 'approved' | 'rejected' | 'pending';
  timestamp: number;
}

export type MemoryType = 'fact' | 'preference' | 'decision' | 'lesson';
export type MemoryScope = 'user' | 'workspace' | 'business';

export interface PersistentMemoryEntry {
  id: string;
  type: MemoryType;
  scope: MemoryScope;
  scopeId: string; // businessId, workspaceId, or 'global'
  title: string;
  content: string;
  source: string;
  confidence: number;
  approved: boolean;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

export interface SkillTrigger {
  type: 'regex' | 'file_ext' | 'intent' | 'slash_command';
  pattern: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  triggers: SkillTrigger[];
  instructions: string;
  allowedTools: string[];
  enabled: boolean;
  scope: 'global' | 'business' | 'workspace';
  author: string;
  createdAt: number;
}

export type TrackerStatus = 'backlog' | 'in_progress' | 'review' | 'done';
export type TrackerPriority = 'critical' | 'high' | 'medium' | 'low';

export interface BusinessTrackerItem {
  id: string;
  businessId: string;
  title: string;
  description: string;
  status: TrackerStatus;
  priority: TrackerPriority;
  assignedAgent?: string;
  linkedBranch?: string;
  linkedPr?: string;
  linkedChatId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BusinessEntity {
  id: string;
  name: string;
  description: string;
  color: string;
  monthlyBudgetUsd: number;
  spentBudgetUsd: number;
  workspacePaths: string[];
  rulesCount: number;
  secretsCount: number;
}

export type ApprovalRiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'modified';

export interface ApprovalQueueItem {
  id: string;
  title: string;
  category: 'tool_execution' | 'rule_override' | 'vault_access' | 'budget_spend' | 'pr_merge' | 'deploy';
  risk: ApprovalRiskLevel;
  status: ApprovalStatus;
  requester: string;
  businessId?: string;
  description: string;
  diffSnippet?: string;
  metadata?: Record<string, any>;
  createdAt: number;
  resolvedAt?: number;
  resolutionNote?: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  schedule: string; // cron expression
  enabled: boolean;
  type: 'cve_audit' | 'test_run' | 'knowledge_graph' | 'health_check' | 'index_refresh' | 'pr_poll';
  lastRunTime?: number;
  nextRunTime: number;
  lastStatus: 'success' | 'failed' | 'running' | 'idle';
  attempts: number;
  maxRetries: number;
  consecutiveFailures: number;
  circuitBroken: boolean;
  lastOutput?: string;
}

export type TaskRoutingCategory =
  | 'autocomplete'
  | 'chat_qa'
  | 'inline_edit'
  | 'agent_planning'
  | 'code_generation'
  | 'code_review'
  | 'summarization'
  | 'commit_message'
  | 'embeddings'
  | 'council_judge';

export interface TaskModelRoute {
  category: TaskRoutingCategory;
  primaryProvider: string;
  primaryModel: string;
  fallbackChain: { provider: string; model: string }[];
  maxTokens: number;
  temperature: number;
  costCeilingPerReqUsd: number;
}

export interface LocalAiNode {
  id: string;
  name: string;
  host: string;
  port: number;
  type: 'ollama' | 'lmstudio' | 'vllm' | 'llamacpp';
  authToken?: string;
  status: 'online' | 'offline' | 'unreachable';
  latencyMs: number;
  availableModels: string[];
  hardwareInfo?: string;
  lastChecked: number;
}

export interface OpsMetricSnapshot {
  timestamp: number;
  activeJobs: number;
  pendingApprovals: number;
  totalTokensSession: number;
  totalCostUsdSession: number;
  averageLatencyMs: number;
  errorRatePercent: number;
  nodeHealthScore: number;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'file' | 'symbol' | 'test' | 'pr' | 'decision';
  metadata: Record<string, any>;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  relation: 'imports' | 'calls' | 'tests' | 'owns' | 'documents';
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  lastBuilt: number;
  nodeCount: number;
  edgeCount: number;
}

export interface ProjectReleaseVersion {
  version: string;
  bumpType: 'major' | 'minor' | 'patch';
  changelog: string;
  timestamp: number;
  commitHash: string;
  releasedBy: string;
}
