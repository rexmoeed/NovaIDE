import { describe, it, expect, beforeEach } from 'vitest';
import { AgentHierarchyService } from '../agentHierarchyService';
import { VirtualFileSystem } from '../virtualFs';
import { FileNode, Project } from '../../types/ide';

describe('AgentHierarchyService - Dynamic Project Decomposition & Parallel Tasking', () => {
  let vfs: VirtualFileSystem;
  let service: AgentHierarchyService;

  const mockRootFiles: FileNode[] = [
    {
      id: 'pkg-json',
      name: 'package.json',
      path: 'package.json',
      type: 'file',
      content: JSON.stringify({ name: 'sample-project', version: '1.0.0' }),
    },
    {
      id: 'src-folder',
      name: 'src',
      path: 'src',
      type: 'folder',
      children: [
        {
          id: 'app-tsx',
          name: 'App.tsx',
          path: 'src/App.tsx',
          type: 'file',
          content: 'export default function App() { return <div>App</div>; }',
        },
        {
          id: 'index-css',
          name: 'index.css',
          path: 'src/index.css',
          type: 'file',
          content: ':root { --color-primary: #6366f1; }',
        },
        {
          id: 'services-folder',
          name: 'services',
          path: 'src/services',
          type: 'folder',
          children: [
            {
              id: 'api-ts',
              name: 'api.ts',
              path: 'src/services/api.ts',
              type: 'file',
              content: 'export const fetchUser = async () => ({ id: 1 });',
            },
          ],
        },
      ],
    },
  ];

  const mockProject: Project = {
    id: 'proj-123',
    name: 'E-Commerce Platform',
    description: 'High-scale multi-tenant commerce platform',
    techStack: {
      frontend: 'react',
      styling: 'tailwind',
    },
    rootFiles: mockRootFiles,
  };

  beforeEach(() => {
    vfs = new VirtualFileSystem(mockRootFiles);
    service = new AgentHierarchyService(vfs);
  });

  describe('1. Dynamic Project Decomposition', () => {
    it('decomposes any project into 10 structured sub-tasks across specialized leads', () => {
      const tasks = service.decomposeProjectIntoSubTasks(mockProject);
      expect(tasks).toHaveLength(10);

      // Verify specialized subagents are assigned
      const assignedRoles = tasks.map(t => t.subAgentRole);
      expect(assignedRoles).toContain('DependencyMapper');
      expect(assignedRoles).toContain('RequirementsAnalyst');
      expect(assignedRoles).toContain('SymbolSearchAgent');
      expect(assignedRoles).toContain('DesignTokenSpecialist');
      expect(assignedRoles).toContain('ReactComponentBuilder');
      expect(assignedRoles).toContain('APIEndpointBuilder');
      expect(assignedRoles).toContain('BuildConfigurationAssistant');
      expect(assignedRoles).toContain('InputValidationReviewer');
      expect(assignedRoles).toContain('UnitTestWriter');
      expect(assignedRoles).toContain('EndToEndWorkflowSpecialist');
    });

    it('creates Phase 1 tasks with zero dependencies for immediate parallel execution', () => {
      const tasks = service.decomposeProjectIntoSubTasks(mockProject);
      const phase1Tasks = tasks.filter(t => t.dependencies.length === 0);

      // Architecture, Product Design, and Research have 0 dependencies
      expect(phase1Tasks.length).toBeGreaterThanOrEqual(3);
      const phase1Roles = phase1Tasks.map(t => t.subAgentRole);
      expect(phase1Roles).toContain('DependencyMapper');
      expect(phase1Roles).toContain('RequirementsAnalyst');
      expect(phase1Roles).toContain('SymbolSearchAgent');
    });

    it('tailors task objectives and deliverables to custom user goal', () => {
      const customGoal = 'Implement JWT Authentication & RBAC permissions';
      const tasks = service.decomposeProjectIntoSubTasks(mockProject, customGoal);

      const backendTask = tasks.find(t => t.subAgentRole === 'APIEndpointBuilder');
      expect(backendTask).toBeDefined();
      expect(backendTask?.objective).toContain(customGoal);

      const productTask = tasks.find(t => t.subAgentRole === 'RequirementsAnalyst');
      expect(productTask?.instructions).toContain(customGoal);
    });
  });

  describe('2. File Reservations & Exclusive Write Locks', () => {
    it('grants exclusive write locks and detects concurrent conflict on same file', () => {
      const res1 = service.reserveFile('src/App.tsx', 'sub-agent-1', 'FrontendLead');
      expect(res1.success).toBe(true);

      // Another sub-agent tries to acquire lock on the same file
      const res2 = service.reserveFile('src/App.tsx', 'sub-agent-2', 'UIDesignLead');
      expect(res2.success).toBe(false);
      expect(res2.conflictWith).toBe('sub-agent-1');

      // Release lock
      service.releaseFile('src/App.tsx', 'sub-agent-1');

      // Now sub-agent-2 can acquire it
      const res3 = service.reserveFile('src/App.tsx', 'sub-agent-2', 'UIDesignLead');
      expect(res3.success).toBe(true);
    });
  });

  describe('3. Multi-Agent Parallel Task Execution', () => {
    it('executes tasks concurrently with parallel concurrency limit', async () => {
      service.decomposeProjectIntoSubTasks(mockProject);
      service.setParallelConcurrency(3);
      expect(service.getParallelConcurrency()).toBe(3);

      const reports = await service.executeAllTasksParallel({
        concurrency: 3,
        stepDelayMs: 10, // Fast execution for unit test
      });

      expect(reports).toHaveLength(10);
      expect(reports.every(r => r.testResults === 'passed')).toBe(true);
      expect(reports.every(r => r.approvedByLead === true)).toBe(true);

      const progress = service.getParallelProgress();
      expect(progress.percent).toBe(100);
      expect(progress.completedTasks).toBe(10);
      expect(progress.failedTasks).toBe(0);
      expect(service.isParallelRunning()).toBe(false);
    });

    it('can reset all tasks and leads cleanly', () => {
      service.decomposeProjectIntoSubTasks(mockProject);
      expect(service.getTasks().length).toBe(10);

      service.resetAllTasks();
      expect(service.getTasks().length).toBe(0);
      expect(service.getCompletionReports().length).toBe(0);
      expect(service.getFileReservations().length).toBe(0);
      expect(service.getActiveParallelSubAgents().length).toBe(0);
    });
  });
});
