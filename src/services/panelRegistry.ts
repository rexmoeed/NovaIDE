import { PanelDefinition, PanelLocation } from '../types/panelRegistry';

export class PanelRegistry {
  private static panels: Map<string, PanelDefinition> = new Map();

  static {
    // 1. PRIMARY SIDEBAR PANELS (Left / Right)
    PanelRegistry.register({
      id: 'explorer',
      title: 'Explorer',
      location: 'left',
      defaultVisible: true,
      minSize: 180,
      maxSize: 550,
      defaultSize: 260,
      icon: 'Folder',
      description: 'Project file hierarchy and directory navigation',
    });

    PanelRegistry.register({
      id: 'search',
      title: 'Search',
      location: 'left',
      defaultVisible: false,
      minSize: 200,
      maxSize: 600,
      defaultSize: 280,
      icon: 'Search',
      description: 'Full codebase symbol and text pattern search',
    });

    PanelRegistry.register({
      id: 'git',
      title: 'Source Control',
      location: 'left',
      defaultVisible: false,
      minSize: 220,
      maxSize: 600,
      defaultSize: 280,
      icon: 'GitBranch',
      description: 'Git diffs, staged mutations, and commit history',
    });

    PanelRegistry.register({
      id: 'tests',
      title: 'Testing',
      location: 'left',
      defaultVisible: false,
      minSize: 220,
      maxSize: 600,
      defaultSize: 280,
      icon: 'FlaskConical',
      description: 'Vitest test suites and automated test runner',
    });

    PanelRegistry.register({
      id: 'agents',
      title: 'Agent Team',
      location: 'left',
      defaultVisible: false,
      minSize: 240,
      maxSize: 600,
      defaultSize: 300,
      icon: 'Bot',
      description: 'Autonomous multi-agent role delegator',
    });

    // 2. SECONDARY SIDEBAR PANELS (Right / Left)
    PanelRegistry.register({
      id: 'ai-orchestrator',
      title: 'AI Assistant',
      location: 'right',
      defaultVisible: true,
      minSize: 280,
      maxSize: 650,
      defaultSize: 340,
      icon: 'Sparkles',
      description: 'Autonomous AI coding agent, code generator, and chat',
    });

    PanelRegistry.register({
      id: 'project-control',
      title: 'Project Control',
      location: 'right',
      defaultVisible: false,
      minSize: 260,
      maxSize: 500,
      defaultSize: 320,
      icon: 'Sliders',
      description: 'Project metadata, health, dependencies, and settings',
    });

    PanelRegistry.register({
      id: 'preview',
      title: 'Live Preview',
      location: 'right',
      defaultVisible: false,
      minSize: 280,
      maxSize: 800,
      defaultSize: 420,
      icon: 'ExternalLink',
      description: 'Interactive responsive browser preview sandbox',
    });

    // 3. BOTTOM PANEL DOCKS
    PanelRegistry.register({
      id: 'terminal',
      title: 'Terminal',
      location: 'bottom',
      defaultVisible: true,
      minSize: 120,
      maxSize: 650,
      defaultSize: 220,
      icon: 'Terminal',
      description: 'Local PTY shell and build command runner',
    });

    PanelRegistry.register({
      id: 'problems',
      title: 'Problems',
      location: 'bottom',
      defaultVisible: false,
      minSize: 120,
      maxSize: 500,
      defaultSize: 200,
      icon: 'AlertCircle',
      description: 'Linter warnings, syntax errors, and diagnostics',
    });

    PanelRegistry.register({
      id: 'test-runner',
      title: 'Test Results',
      location: 'bottom',
      defaultVisible: false,
      minSize: 120,
      maxSize: 500,
      defaultSize: 220,
      icon: 'CheckCircle2',
      description: 'Unit test execution assertion logs',
    });

    PanelRegistry.register({
      id: 'security-review',
      title: 'Security Review',
      location: 'bottom',
      defaultVisible: false,
      minSize: 140,
      maxSize: 550,
      defaultSize: 240,
      icon: 'ShieldCheck',
      description: 'Code audit, vulnerability scan, and AST verification',
    });

    PanelRegistry.register({
      id: 'agent-audit',
      title: 'Agent Audit Log',
      location: 'bottom',
      defaultVisible: false,
      minSize: 120,
      maxSize: 550,
      defaultSize: 220,
      icon: 'History',
      description: 'Autonomous agent action log and tool execution timeline',
    });

    // 4. EDITOR PANELS
    PanelRegistry.register({
      id: 'code-editor',
      title: 'Code Editor',
      location: 'editor',
      defaultVisible: true,
      minSize: 300,
      icon: 'FileCode',
      description: 'Multi-tab code editor with split groups and diffs',
    });
  }

  public static register(panel: PanelDefinition): void {
    PanelRegistry.panels.set(panel.id, panel);
  }

  public static unregister(panelId: string): void {
    PanelRegistry.panels.delete(panelId);
  }

  public static get(panelId: string): PanelDefinition | undefined {
    return PanelRegistry.panels.get(panelId);
  }

  public static getAll(): PanelDefinition[] {
    return Array.from(PanelRegistry.panels.values());
  }

  public static getByLocation(location: PanelLocation): PanelDefinition[] {
    return Array.from(PanelRegistry.panels.values()).filter(p => p.location === location);
  }
}
