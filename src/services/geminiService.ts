export interface AIPlanResponse {
  interpretation: string;
  technologyRationale?: string;
  suggestedStack: string;
  clarifications?: string[];
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    agent: any;
    status: 'pending' | 'in-progress' | 'completed';
    targetFile?: string;
  }>;
  proposedFiles?: Array<{
    path: string;
    action: 'create' | 'modify';
    description: string;
  }>;
}

export interface AICodeResponse {
  code: string;
  explanation: string;
  tests?: string;
}

export interface AIDebugResponse {
  rootCause: string;
  explanation: string;
  patch: string;
  verificationCommand: string;
  confidence: number;
}

export interface AICodeReviewResponse {
  overallScore: number;
  summary: string;
  findings: Array<{
    severity: 'high' | 'medium' | 'low' | 'info';
    title: string;
    file: string;
    recommendation: string;
  }>;
}

export class GeminiService {
  public static async checkHealth(): Promise<{ status: string; hasApiKey: boolean; defaultModel: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'offline', hasApiKey: false, defaultModel: 'gemini-3.8-flash' };
    }
  }

  public static async planProject(params: {
    goal: string;
    currentStack?: string;
    filesSummary?: string;
    model?: string;
  }): Promise<AIPlanResponse> {
    const res = await fetch('/api/ai/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Planning failed: ${res.statusText}`);
    return await res.json();
  }

  public static async generateCode(params: {
    taskTitle: string;
    taskDetails?: string;
    filePath: string;
    currentCode?: string;
    projectContext?: string;
    agentRole?: string;
    model?: string;
  }): Promise<AICodeResponse> {
    const res = await fetch('/api/ai/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Code generation failed: ${res.statusText}`);
    return await res.json();
  }

  public static async chat(params: {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    activeFile?: string;
    fileContent?: string;
    projectSummary?: string;
    agentRole?: string;
    model?: string;
    images?: Array<{ data: string; mimeType: string } | string>;
  }): Promise<{ reply: string; agent?: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Chat request failed: ${res.statusText}`);
    return await res.json();
  }

  public static async debugIssue(params: {
    errorLog: string;
    failingFile?: string;
    fileContent?: string;
    testOutput?: string;
    model?: string;
  }): Promise<AIDebugResponse> {
    const res = await fetch('/api/ai/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Debug request failed: ${res.statusText}`);
    return await res.json();
  }

  public static async reviewCode(params: {
    files: Array<{ path: string; content: string }>;
    model?: string;
  }): Promise<AICodeReviewResponse> {
    const res = await fetch('/api/ai/code-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Code review request failed: ${res.statusText}`);
    return await res.json();
  }
}
