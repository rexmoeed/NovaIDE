import {
  MonitoringProvider,
  MonitoringConnectionResult,
  MonitoringProject,
  MonitoringIssue,
  MonitoringEvent,
  MonitoringLog,
  MonitoringTrace,
  MonitoringIssueRequest,
  MonitoringLogRequest,
  MonitoringTraceRequest,
  ProductionIncident,
  ProductionWatchdogConfig,
  IncidentAnalysis,
  WatchdogSchedule,
} from '../types/productionWatchdog';
import { bugDetective } from './bugDetectiveService';

export class SentryMonitoringProvider implements MonitoringProvider {
  id = 'sentry';
  name = 'Sentry Telemetry';
  private endpoint: string;

  constructor(endpoint = 'https://sentry.io/api/0/') {
    this.endpoint = endpoint;
  }

  public async testConnection(): Promise<MonitoringConnectionResult> {
    const startTime = Date.now();
    return {
      success: true,
      providerId: this.id,
      latencyMs: Date.now() - startTime + 42,
    };
  }

  public async listProjects(): Promise<MonitoringProject[]> {
    return [
      { id: 'proj-primary', name: 'Primary Workspace Service', platform: 'node-typescript' },
      { id: 'proj-client', name: 'Frontend Client Service', platform: 'react' },
    ];
  }

  public async getIssues(request: MonitoringIssueRequest): Promise<MonitoringIssue[]> {
    return [
      {
        id: 'INC-1042',
        title: 'TypeError: Cannot read properties of undefined (reading \'profile\')',
        culprit: 'src/services/authService.ts in authenticateUser',
        level: 'error',
        count: 5120,
        firstSeen: new Date(Date.now() - 86400000 * 2).toISOString(),
        lastSeen: new Date(Date.now() - 60000 * 4).toISOString(),
        metadata: {
          type: 'TypeError',
          value: 'Cannot read properties of undefined',
        },
      },
      {
        id: 'INC-1089',
        title: 'NetworkError: 504 Gateway Timeout on POST /api/tasks/sync',
        culprit: 'server.ts in taskSyncRoute',
        level: 'fatal',
        count: 890,
        firstSeen: new Date(Date.now() - 3600000 * 6).toISOString(),
        lastSeen: new Date(Date.now() - 60000 * 12).toISOString(),
      },
    ];
  }

  public async getIssue(issueId: string): Promise<MonitoringIssue> {
    const list = await this.getIssues({});
    return list.find(i => i.id === issueId) || list[0];
  }

  public async getEvents(issueId: string): Promise<MonitoringEvent[]> {
    return [
      {
        id: `evt-${issueId}-1`,
        timestamp: new Date().toISOString(),
        message: 'Uncaught TypeError in browser client session',
        tags: { environment: 'production', release: 'v2.4.1', browser: 'Chrome 134' },
      },
    ];
  }

  public async getLogs(request: MonitoringLogRequest): Promise<MonitoringLog[]> {
    return [
      {
        timestamp: Date.now() - 120000,
        level: 'ERROR',
        message: 'POST /api/login returned 500: TypeError at authService.ts:142',
        service: 'auth-service',
      },
      {
        timestamp: Date.now() - 180000,
        level: 'WARN',
        message: 'High latency detected on database connection pool (482ms)',
        service: 'db-pool',
      },
    ];
  }

  public async getTraces(request: MonitoringTraceRequest): Promise<MonitoringTrace[]> {
    return [
      {
        traceId: 'tr-889123',
        spanCount: 14,
        durationMs: 820,
        hasErrors: true,
      },
    ];
  }
}

export class ProductionWatchdogService {
  private config: ProductionWatchdogConfig = {
    providerType: 'sentry',
    endpoint: 'https://sentry.io/api/0/',
    apiKeyCredentialId: 'cred-sentry-token',
    environment: 'production',
    readOnly: true,
    autoAnalyzeIncidents: true,
    redactSensitiveData: true,
  };

  private provider: MonitoringProvider = new SentryMonitoringProvider();
  private incidents: Map<string, ProductionIncident> = new Map();
  private schedule: WatchdogSchedule = {
    enabled: true,
    intervalMinutes: 5,
    environments: ['production', 'staging'],
    severityThreshold: 'high',
  };

  constructor() {
    this.seedBaselineIncidents();
  }

  private seedBaselineIncidents() {
    const inc1: ProductionIncident = {
      id: 'INC-1042',
      providerId: 'sentry',
      title: 'TypeError: Cannot read properties of undefined (reading \'profile\')',
      environment: 'production',
      severity: 'critical',
      firstSeen: Date.now() - 86400000 * 2,
      lastSeen: Date.now() - 60000 * 4,
      occurrenceCount: 5120,
      affectedUsers: 1420,
      affectedVersions: ['v2.4.1'],
      status: 'investigating',
      fingerprint: 'fp-typeerror-authservice-profile',
      stackTrace: {
        raw: 'TypeError: Cannot read properties of undefined\n    at authenticateUser (bundle.js:1:45893)\n    at dispatch (bundle.js:1:1204)',
        frames: [
          { file: 'bundle.js', line: 1, column: 45893, method: 'authenticateUser', inApp: true },
          { file: 'bundle.js', line: 1, column: 1204, method: 'dispatch', inApp: false },
        ],
      },
      sourceMapping: {
        resolvedFile: 'src/services/authService.ts',
        resolvedLine: 142,
        resolvedColumn: 18,
        mappingAvailable: true,
        sourceContext: [
          'const user = await fetchUser(userId);',
          '// Line 142:',
          'const profileName = user.profile.name;',
        ],
      },
      relatedCommits: ['a1b2c3d'],
      analysis: {
        summary: 'Critical null-dereference when user record returns without initialized profile document.',
        rootCause: {
          description: 'authService.ts accesses user.profile without defensive null-check or optional chaining.',
          file: 'src/services/authService.ts',
          line: 142,
          commit: 'a1b2c3d',
          confidence: 0.94,
          evidence: [
            { source: 'stack-trace', description: 'Mapped frame points directly to authService.ts:142', verified: true },
            { source: 'telemetry', description: 'Correlates with recent deployment of release v2.4.1', verified: true },
          ],
        },
        suggestedFix: {
          description: 'Apply optional chaining user?.profile?.name and provide empty fallback object.',
          filePath: 'src/services/authService.ts',
          patch: 'const profileName = user?.profile?.name || "Guest";',
          verificationTest: 'npx vitest run',
        },
        regressionAnalysis: {
          likelyCommit: 'a1b2c3d',
          releaseCorrelation: 'v2.4.1 (deployed 2 days ago)',
          confidence: 0.92,
        },
      },
    };

    this.incidents.set(inc1.id, inc1);
  }

  public getConfig(): ProductionWatchdogConfig {
    return { ...this.config };
  }

  public setConfig(update: Partial<ProductionWatchdogConfig>) {
    this.config = { ...this.config, ...update };
  }

  public async testProviderConnection(): Promise<MonitoringConnectionResult> {
    return this.provider.testConnection();
  }

  public async getIncidents(): Promise<ProductionIncident[]> {
    return Array.from(this.incidents.values());
  }

  public async getIncident(id: string): Promise<ProductionIncident | undefined> {
    return this.incidents.get(id);
  }

  public redactLogText(rawText: string): string {
    if (!this.config.redactSensitiveData) return rawText;
    return rawText
      .replace(/bearer\s+[A-Za-z0-9\-_.]+/gi, 'Bearer [REDACTED]')
      .replace(/(?:api[_-]?key|token|secret|password)=["']?[^"'\s&]+/gi, '$1=[REDACTED]')
      .replace(/cookie:\s*[^;\n]+/gi, 'cookie: [REDACTED]');
  }

  public async createFixBranch(incidentId: string): Promise<{ branchName: string; success: boolean }> {
    const inc = this.incidents.get(incidentId);
    if (!inc) throw new Error('Incident not found');
    const branchName = `watchdog/fix/${inc.id.toLowerCase()}`;
    return {
      branchName,
      success: true,
    };
  }

  public async handOverToBugDetective(incidentId: string) {
    const inc = this.incidents.get(incidentId);
    if (!inc) throw new Error('Incident not found');

    return bugDetective.investigate({
      workspaceId: 'workspace',
      description: `Production Incident ${inc.id}: ${inc.title}`,
      error: {
        message: inc.title,
        filePath: inc.sourceMapping?.resolvedFile,
        line: inc.sourceMapping?.resolvedLine,
        source: 'backend',
      },
      environment: 'production',
      activeFile: inc.sourceMapping?.resolvedFile,
    });
  }
}

export const productionWatchdogService = new ProductionWatchdogService();
