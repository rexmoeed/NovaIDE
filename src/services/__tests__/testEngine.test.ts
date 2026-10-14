import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestEngineService } from '../testEngineService';
import { FailureDiagnosis, TestRunResult } from '../../types/testEngine';

describe('Intelligent Testing, Failure Diagnosis, and Self-Repair Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Test Discovery', () => {
    it('discovers project test framework, scripts, and capabilities', async () => {
      const mockDiscovery = {
        framework: 'vitest',
        version: '5.0.2',
        configFile: 'vitest.config.ts',
        scripts: [
          { name: 'test', command: 'vitest run', kind: 'unit' },
          { name: 'typecheck', command: 'tsc --noEmit', kind: 'typecheck' },
        ],
        testFiles: [
          { path: 'src/services/__tests__/debugger.test.ts', suite: 'unit', framework: 'vitest' },
          { path: 'src/services/__tests__/gitWorkflow.test.ts', suite: 'unit', framework: 'vitest' },
        ],
        capabilities: {
          canRunSingleFile: true,
          canFilterByName: true,
          canRerunFailed: true,
          canTypecheck: true,
          canLint: true,
          canBuild: true,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockDiscovery,
      } as any);

      const discovery = await TestEngineService.discoverTests();
      expect(discovery.framework).toBe('vitest');
      expect(discovery.scripts).toHaveLength(2);
      expect(discovery.testFiles).toHaveLength(2);
      expect(discovery.capabilities.canRunSingleFile).toBe(true);
    });

    it('returns safe default fallback if discovery endpoint fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const discovery = await TestEngineService.discoverTests();
      expect(discovery.framework).toBe('vitest');
      expect(discovery.capabilities.canRunSingleFile).toBe(true);
    });
  });

  describe('2. Test Execution & Result Parsing', () => {
    it('executes full test suite and receives structured results', async () => {
      const mockRunResult: TestRunResult = {
        runId: 'run-1',
        timestamp: '2026-10-12T00:00:00Z',
        target: 'all',
        command: 'npx vitest run --reporter=json',
        exitCode: 0,
        durationMs: 350,
        total: 10,
        passed: 10,
        failed: 0,
        skipped: 0,
        tests: [
          {
            id: 't-1',
            name: 'correctly adds numbers',
            suiteName: 'Calculator Suite',
            filePath: 'src/__tests__/calc.test.ts',
            status: 'passed',
            durationMs: 5,
          },
        ],
        rawOutput: '10 passed',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRunResult,
      } as any);

      const result = await TestEngineService.runAll();
      expect(result.exitCode).toBe(0);
      expect(result.passed).toBe(10);
      expect(result.failed).toBe(0);
      expect(result.tests).toHaveLength(1);
    });

    it('executes single test file', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          runId: 'run-file-1',
          target: 'file',
          exitCode: 0,
          passed: 4,
          failed: 0,
          tests: [],
        }),
      } as any);

      const res = await TestEngineService.runFile('src/calculator.test.ts');
      expect(res.passed).toBe(4);
      expect(global.fetch).toHaveBeenCalledWith('/api/test/run', expect.objectContaining({
        method: 'POST',
      }));
      const call = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.target).toBe('file');
      expect(body.testFile).toBe('src/calculator.test.ts');
    });

    it('executes typecheck and build targets', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          target: 'typecheck',
          exitCode: 0,
          passed: 1,
          failed: 0,
          tests: [{ id: 'typecheck', name: 'TypeScript Compilation', status: 'passed' }],
        }),
      } as any);

      const res = await TestEngineService.runTypecheck();
      expect(res.passed).toBe(1);

      const call = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.target).toBe('typecheck');
    });

    it('cancels running execution via process interrupt', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const ok = await TestEngineService.cancelRun('test-exec-123');
      expect(ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/process/interrupt', expect.objectContaining({
        method: 'POST',
      }));
    });
  });

  describe('3. Comparison Between Test Runs', () => {
    it('detects fixed tests and new failures between consecutive runs', () => {
      const prevRun: TestRunResult = {
        runId: 'run-1',
        timestamp: '2026-10-12T00:00:00Z',
        target: 'all',
        command: 'npx vitest run',
        exitCode: 1,
        durationMs: 100,
        total: 2,
        passed: 1,
        failed: 1,
        skipped: 0,
        tests: [
          { id: 't-1', name: 'division test', suiteName: 'Calc', filePath: 'calc.test.ts', status: 'failed', durationMs: 10 },
          { id: 't-2', name: 'addition test', suiteName: 'Calc', filePath: 'calc.test.ts', status: 'passed', durationMs: 5 },
        ],
        rawOutput: '',
      };

      const currentRun: TestRunResult = {
        runId: 'run-2',
        timestamp: '2026-10-12T00:01:00Z',
        target: 'all',
        command: 'npx vitest run',
        exitCode: 0,
        durationMs: 100,
        total: 2,
        passed: 2,
        failed: 0,
        skipped: 0,
        tests: [
          { id: 't-1', name: 'division test', suiteName: 'Calc', filePath: 'calc.test.ts', status: 'passed', durationMs: 8 },
          { id: 't-2', name: 'addition test', suiteName: 'Calc', filePath: 'calc.test.ts', status: 'passed', durationMs: 5 },
        ],
        rawOutput: '',
      };

      const comparison = TestEngineService.computeComparison(prevRun, currentRun);
      expect(comparison.fixedTests).toContain('division test');
      expect(comparison.newFailures).toHaveLength(0);
    });
  });

  describe('4. Failure Diagnosis', () => {
    it('diagnoses failure categorization and proposes targeted fix', async () => {
      const mockDiagnosis: FailureDiagnosis = {
        failureId: 'fail-123',
        testName: 'correctly divides two numbers',
        filePath: 'src/__tests__/calculator.test.ts',
        category: 'code_defect',
        rootCause: 'divide function returned multiplication instead of division',
        associatedSourceFiles: ['src/calculator.ts'],
        associatedTestFiles: ['src/__tests__/calculator.test.ts'],
        proposedFix: {
          targetFile: 'src/calculator.ts',
          explanation: 'Replace return a * b with return a / b',
          patch: '- return a * b;\n+ return a / b;',
          confidence: 0.98,
        },
        regressionTest: {
          filePath: 'src/__tests__/calculator.test.ts',
          testCode: "it('regression: handles floating point division', () => { expect(divide(7, 2)).toBe(3.5); });",
          description: 'Floating point test',
        },
        verificationCommand: 'npx vitest run src/__tests__/calculator.test.ts',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockDiagnosis,
      } as any);

      const diagnosis = await TestEngineService.diagnoseFailure({
        testName: 'correctly divides two numbers',
        filePath: 'src/__tests__/calculator.test.ts',
        errorMessage: 'expected 50 to be 2',
      });

      expect(diagnosis.category).toBe('code_defect');
      expect(diagnosis.associatedSourceFiles).toContain('src/calculator.ts');
      expect(diagnosis.proposedFix.targetFile).toBe('src/calculator.ts');
      expect(diagnosis.regressionTest).toBeDefined();
    });
  });

  describe('5. Bounded Self-Repair & Anti-Cheating Safety', () => {
    it('executes self-repair and confirms verification retest with audit trail', async () => {
      const diagnosis: FailureDiagnosis = {
        failureId: 'fail-123',
        testName: 'correctly divides two numbers',
        filePath: 'src/__tests__/calculator.test.ts',
        category: 'code_defect',
        rootCause: 'Multiplication defect in division function',
        associatedSourceFiles: ['src/calculator.ts'],
        associatedTestFiles: ['src/__tests__/calculator.test.ts'],
        proposedFix: {
          targetFile: 'src/calculator.ts',
          explanation: 'Fix arithmetic operator',
          patch: 'diff',
          confidence: 0.95,
        },
        verificationCommand: 'npx vitest run src/__tests__/calculator.test.ts',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          failureId: 'fail-123',
          attempts: 1,
          maxAttempts: 3,
          modifiedFiles: ['src/calculator.ts'],
          retestPassed: true,
          suitePassed: true,
          message: 'Successfully self-repaired defect in src/calculator.ts.',
          auditTrail: [
            { timestamp: '12:00:00', action: 'Applied patch to src/calculator.ts', outcome: 'Success' },
            { timestamp: '12:00:01', action: 'Reran failing test', outcome: 'PASSED with 0 errors' },
          ],
        }),
      } as any);

      const repair = await TestEngineService.selfRepair(diagnosis);
      expect(repair.success).toBe(true);
      expect(repair.attempts).toBeLessThanOrEqual(3);
      expect(repair.retestPassed).toBe(true);
      expect(repair.auditTrail).toHaveLength(2);
    });
  });
});
