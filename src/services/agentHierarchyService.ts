import {
  TeamLeadRole,
  SubAgentRole,
  SubAgentTaskContract,
  CompletionReport,
  AgentMessage,
  FileReservation,
  SpecialistLeadInfo,
} from '../types/agentHierarchy';
import { VirtualFileSystem } from './virtualFs';

export class AgentHierarchyService {
  private vfs: VirtualFileSystem;
  private leads: Map<TeamLeadRole, SpecialistLeadInfo> = new Map();
  private taskContracts: Map<string, SubAgentTaskContract> = new Map();
  private completionReports: Map<string, CompletionReport> = new Map();
  private fileReservations: Map<string, FileReservation> = new Map();
  private messageLog: AgentMessage[] = [];
  private onUpdateCallback?: () => void;

  constructor(vfs: VirtualFileSystem) {
    this.vfs = vfs;
    this.initTeamLeads();
  }

  public setUpdateListener(callback: () => void) {
    this.onUpdateCallback = callback;
  }

  private notify() {
    if (this.onUpdateCallback) this.onUpdateCallback();
  }

  private initTeamLeads() {
    const leadsConfig: SpecialistLeadInfo[] = [
      {
        role: 'ProductDesignLead',
        title: 'Principal Product Designer',
        shortName: 'Product Design',
        icon: '🎯',
        description: 'Transforms requirements into user journeys, product briefs, and acceptance criteria.',
        status: 'idle',
        assignedSubAgents: ['RequirementsAnalyst', 'UserJourneyMapper', 'FeatureScopeAnalyst', 'AcceptanceCriteriaWriter'],
        qualityGatesPassed: 12,
        activeReservations: [],
      },
      {
        role: 'UIDesignLead',
        title: 'World-Class UI Designer',
        shortName: 'UI/UX Design',
        icon: '🎨',
        description: 'Enforces visual hierarchy, typography, tokens, and component specifications.',
        status: 'idle',
        assignedSubAgents: ['WireframeDesigner', 'VisualDesignAssistant', 'DesignTokenSpecialist', 'AccessibilityReviewer'],
        qualityGatesPassed: 15,
        activeReservations: [],
      },
      {
        role: 'FrontendLead',
        title: 'Principal Frontend Engineer',
        shortName: 'Frontend Lead',
        icon: '⚛️',
        description: 'Builds reusable, accessible React 19 components and state management.',
        status: 'idle',
        assignedSubAgents: ['ReactComponentBuilder', 'CSSLayoutSpecialist', 'StateManagementAssistant', 'FormsValidationSpecialist'],
        qualityGatesPassed: 24,
        activeReservations: [],
      },
      {
        role: 'BackendLead',
        title: 'Principal Backend Engineer',
        shortName: 'Backend Lead',
        icon: '⚙️',
        description: 'Architects APIs, database schemas, validation, and authentication rules.',
        status: 'idle',
        assignedSubAgents: ['APIEndpointBuilder', 'DatabaseSchemaSpecialist', 'AuthenticationSpecialist', 'BusinessLogicImplementer'],
        qualityGatesPassed: 18,
        activeReservations: [],
      },
      {
        role: 'FullStackLead',
        title: 'Principal Full-Stack Engineer',
        shortName: 'Full-Stack Lead',
        icon: '🌐',
        description: 'Aligns frontend and backend contracts, traces data flow, and end-to-end workflows.',
        status: 'idle',
        assignedSubAgents: ['APIIntegrationAssistant', 'DataFlowTracer', 'EndToEndWorkflowSpecialist'],
        qualityGatesPassed: 14,
        activeReservations: [],
      },
      {
        role: 'ArchitectureLead',
        title: 'Software Architect',
        shortName: 'Architecture Lead',
        icon: '🏛️',
        description: 'Defines module boundaries, analyzes dependencies, and technical risk.',
        status: 'idle',
        assignedSubAgents: ['DependencyMapper', 'ModuleBoundaryReviewer', 'TechnicalDebtAnalyst'],
        qualityGatesPassed: 16,
        activeReservations: [],
      },
      {
        role: 'QALead',
        title: 'QA & Test Engineer Lead',
        shortName: 'QA & Testing',
        icon: '🧪',
        description: 'Generates assertion test suites, reproduces bugs, and verifies execution.',
        status: 'idle',
        assignedSubAgents: ['UnitTestWriter', 'IntegrationTestWriter', 'BugReproductionAssistant'],
        qualityGatesPassed: 21,
        activeReservations: [],
      },
      {
        role: 'SecurityLead',
        title: 'Principal Security Engineer',
        shortName: 'Security Lead',
        icon: '🛡️',
        description: 'Audits AST vulnerabilities, auth validation, secret leaks, and dependencies.',
        status: 'idle',
        assignedSubAgents: ['DependencySecurityReviewer', 'AuthReviewer', 'InputValidationReviewer'],
        qualityGatesPassed: 19,
        activeReservations: [],
      },
      {
        role: 'DevOpsLead',
        title: 'DevOps & Tooling Lead',
        shortName: 'DevOps Lead',
        icon: '🚀',
        description: 'Configures build pipelines, packages, linting, and development environments.',
        status: 'idle',
        assignedSubAgents: ['BuildConfigurationAssistant', 'DeploymentAssistant'],
        qualityGatesPassed: 8,
        activeReservations: [],
      },
      {
        role: 'ResearchLead',
        title: 'Codebase Research Lead',
        shortName: 'Research Lead',
        icon: '🔍',
        description: 'Symbol searches, import tracer, and context retrieval across the repository.',
        status: 'idle',
        assignedSubAgents: ['SymbolSearchAgent', 'DependencyTracer'],
        qualityGatesPassed: 11,
        activeReservations: [],
      },
    ];

    leadsConfig.forEach(lead => this.leads.set(lead.role, lead));
  }

  public getLeads(): SpecialistLeadInfo[] {
    return Array.from(this.leads.values());
  }

  public getTasks(): SubAgentTaskContract[] {
    return Array.from(this.taskContracts.values());
  }

  public getCompletionReports(): CompletionReport[] {
    return Array.from(this.completionReports.values());
  }

  public getFileReservations(): FileReservation[] {
    return Array.from(this.fileReservations.values());
  }

  public getMessages(): AgentMessage[] {
    return this.messageLog;
  }

  /**
   * Request file reservation with conflict detection
   */
  public reserveFile(filePath: string, subAgentId: string, parentLead: TeamLeadRole): { success: boolean; conflictWith?: string } {
    const existing = this.fileReservations.get(filePath);
    if (existing && existing.subAgentId !== subAgentId) {
      this.logMessage({
        id: `msg-${Date.now()}`,
        fromAgent: subAgentId,
        toAgent: parentLead,
        taskId: subAgentId,
        type: 'conflict_alert',
        payload: {
          filePath,
          lockedBy: existing.subAgentId,
          lead: existing.parentLead,
        },
        timestamp: new Date().toLocaleTimeString(),
      });
      return { success: false, conflictWith: existing.subAgentId };
    }

    const reservation: FileReservation = {
      filePath,
      subAgentId,
      parentLead,
      acquiredAt: Date.now(),
      mode: 'exclusive_write',
    };
    this.fileReservations.set(filePath, reservation);
    this.notify();
    return { success: true };
  }

  public releaseFile(filePath: string, subAgentId: string) {
    const existing = this.fileReservations.get(filePath);
    if (existing && existing.subAgentId === subAgentId) {
      this.fileReservations.delete(filePath);
      this.notify();
    }
  }

  /**
   * Main agent delegates work to a sub-agent with a formal task contract
   */
  public delegateTask(contract: Omit<SubAgentTaskContract, 'status' | 'progressPercent'>): SubAgentTaskContract {
    const fullContract: SubAgentTaskContract = {
      ...contract,
      status: contract.dependencies.length > 0 ? 'waiting_dependency' : 'queued',
      progressPercent: 0,
    };

    this.taskContracts.set(fullContract.taskId, fullContract);

    // Update parent lead status
    const lead = this.leads.get(contract.parentAgentId);
    if (lead) {
      lead.status = 'working';
      lead.currentTaskTitle = contract.title;
    }

    this.logMessage({
      id: `msg-${Date.now()}`,
      fromAgent: contract.parentAgentId,
      toAgent: contract.subAgentRole,
      taskId: contract.taskId,
      type: 'task_assignment',
      payload: contract,
      timestamp: new Date().toLocaleTimeString(),
    });

    this.notify();
    return fullContract;
  }

  /**
   * Execute task step with dependency and file ownership checks
   */
  public async executeSubAgentTask(taskId: string): Promise<CompletionReport> {
    const task = this.taskContracts.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    // Check dependencies
    for (const depId of task.dependencies) {
      const dep = this.taskContracts.get(depId);
      if (dep && dep.status !== 'completed') {
        task.status = 'waiting_dependency';
        this.notify();
        throw new Error(`Cannot execute ${taskId}: Dependency ${dep.title} is not completed yet.`);
      }
    }

    // Reserve target files
    for (const path of task.allowedFilePaths) {
      const res = this.reserveFile(path, task.taskId, task.parentAgentId);
      if (!res.success) {
        task.status = 'failed';
        task.error = `File lock conflict on ${path} held by ${res.conflictWith}`;
        this.notify();
        throw new Error(task.error);
      }
    }

    task.status = 'working';
    task.progressPercent = 50;
    this.notify();

    // Simulate work completion
    task.status = 'reviewing';
    task.progressPercent = 100;

    // Release reservations
    for (const path of task.allowedFilePaths) {
      this.releaseFile(path, task.taskId);
    }

    // Generate completion report
    const report: CompletionReport = {
      taskId: task.taskId,
      subAgentRole: task.subAgentRole,
      workCompleted: `Implemented ${task.title} in accordance with instructions.`,
      filesInspected: task.allowedFilePaths,
      filesModified: task.permissionLevel === 'write' ? task.allowedFilePaths : [],
      toolsUsed: task.allowedTools,
      testsRun: ['TypeCheck', 'ContractAssertions'],
      testResults: 'passed',
      knownLimitations: [],
      approvedByLead: true, // Approved through parent quality gate
      timestamp: new Date().toLocaleTimeString(),
    };

    this.completionReports.set(taskId, report);
    task.status = 'completed';

    const lead = this.leads.get(task.parentAgentId);
    if (lead) {
      lead.qualityGatesPassed += 1;
      lead.status = 'idle';
      lead.currentTaskTitle = undefined;
    }

    this.logMessage({
      id: `msg-${Date.now()}`,
      fromAgent: task.subAgentRole,
      toAgent: task.parentAgentId,
      taskId: task.taskId,
      type: 'completion_report',
      payload: report,
      timestamp: new Date().toLocaleTimeString(),
    });

    this.notify();
    return report;
  }

  private logMessage(msg: AgentMessage) {
    this.messageLog.unshift(msg);
  }

  /**
   * Orchestrate sample benchmark workflow: "Comprehensive Workspace Engineering Audit"
   */
  public async orchestrateFullTeamBenchmark(): Promise<void> {
    // Stage 1: Product Design Lead delegates to RequirementsAnalyst
    const t1 = this.delegateTask({
      taskId: 'pd-req-1',
      parentAgentId: 'ProductDesignLead',
      subAgentRole: 'RequirementsAnalyst',
      title: 'Analyze Architecture & Component Hierarchy',
      objective: 'Define interface models, route state, and system contracts.',
      instructions: 'Review workspace entry points and component composition.',
      allowedTools: ['file_read'],
      workspaceScope: 'src',
      allowedFilePaths: ['src/App.tsx'],
      restrictedFilePaths: ['.env'],
      dependencies: [],
      expectedDeliverables: ['Architecture specification and contract audit'],
      acceptanceCriteria: ['Validates component hierarchy and prop interfaces'],
      permissionLevel: 'read',
    });
    await this.executeSubAgentTask(t1.taskId);

    // Stage 2: UI/UX Lead delegates to DesignTokenSpecialist
    const t2 = this.delegateTask({
      taskId: 'ui-tok-1',
      parentAgentId: 'UIDesignLead',
      subAgentRole: 'DesignTokenSpecialist',
      title: 'Audit Visual Tokens & Design System',
      objective: 'Verify dark/light theme tokens and layout consistency.',
      instructions: 'Review CSS variables, contrast ratios, and typography tokens.',
      allowedTools: ['file_read', 'file_write'],
      workspaceScope: 'src',
      allowedFilePaths: ['src/index.css'],
      restrictedFilePaths: ['.env'],
      dependencies: ['pd-req-1'],
      expectedDeliverables: ['Design tokens audit report'],
      acceptanceCriteria: ['WCAG AA compliance verified'],
      permissionLevel: 'write',
    });
    await this.executeSubAgentTask(t2.taskId);

    // Stage 3: Architecture Lead delegates to ModuleBoundaryReviewer
    const t3 = this.delegateTask({
      taskId: 'arch-mod-1',
      parentAgentId: 'ArchitectureLead',
      subAgentRole: 'ModuleBoundaryReviewer',
      title: 'Audit Bridge & Service Boundaries',
      objective: 'Ensure strict separation between UI rendering and host system APIs.',
      instructions: 'Verify desktopBridge and IPC communication patterns.',
      allowedTools: ['file_read'],
      workspaceScope: 'src/services',
      allowedFilePaths: ['src/services/desktopBridge.ts'],
      restrictedFilePaths: ['.env'],
      dependencies: ['pd-req-1'],
      expectedDeliverables: ['Service boundaries audit report'],
      acceptanceCriteria: ['No leaked credentials or unsafe direct mutations'],
      permissionLevel: 'read',
    });
    await this.executeSubAgentTask(t3.taskId);

    // Stage 4: QA Lead delegates to UnitTestWriter
    const t4 = this.delegateTask({
      taskId: 'qa-unit-1',
      parentAgentId: 'QALead',
      subAgentRole: 'UnitTestWriter',
      title: 'Verify Test Runner & Quality Gates',
      objective: 'Audit test suites and runner configuration.',
      instructions: 'Verify test script configuration and coverage targets.',
      allowedTools: ['file_read', 'terminal_run'],
      workspaceScope: 'src',
      allowedFilePaths: ['package.json'],
      restrictedFilePaths: ['.env'],
      dependencies: ['arch-mod-1'],
      expectedDeliverables: ['Test execution verification'],
      acceptanceCriteria: ['Test framework configuration verified'],
      permissionLevel: 'read',
    });
    await this.executeSubAgentTask(t4.taskId);

    // Stage 5: Security Lead delegates to AuthReviewer
    const t5 = this.delegateTask({
      taskId: 'sec-auth-1',
      parentAgentId: 'SecurityLead',
      subAgentRole: 'AuthReviewer',
      title: 'Security & Dependency Isolation Audit',
      objective: 'Prevent credential exposure and verify secure sandbox constraints.',
      instructions: 'Audit file permissions and external network communication.',
      allowedTools: ['file_read'],
      workspaceScope: 'src',
      allowedFilePaths: ['package.json'],
      restrictedFilePaths: ['.env'],
      dependencies: ['arch-mod-1'],
      expectedDeliverables: ['Security audit report'],
      acceptanceCriteria: ['Zero unauthorized credential access vulnerabilities'],
      permissionLevel: 'read',
    });
    await this.executeSubAgentTask(t5.taskId);
  }
}
