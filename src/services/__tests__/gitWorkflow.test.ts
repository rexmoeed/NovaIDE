import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitWorkflowService } from '../gitWorkflowService';

describe('Professional Git & GitHub Workflow Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Unified Diff Parsing & Inspection', () => {
    it('correctly parses unified diff with added, deleted, and context lines', () => {
      const sampleDiff = `diff --git a/src/index.ts b/src/index.ts
index 1234567..89abcdef 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,5 +1,6 @@
 import express from 'express';
-const port = 3000;
+const port = process.env.PORT || 3000;
+const app = express();
 console.log(port);
`;

      const parsed = GitWorkflowService.parseUnifiedDiff(sampleDiff, 'src/index.ts', false);

      expect(parsed.filePath).toBe('src/index.ts');
      expect(parsed.staged).toBe(false);
      expect(parsed.hunks).toHaveLength(1);
      expect(parsed.additions).toBe(2);
      expect(parsed.deletions).toBe(1);

      const hunk = parsed.hunks[0];
      expect(hunk.oldStart).toBe(1);
      expect(hunk.newStart).toBe(1);
      expect(hunk.lines.some(l => l.type === 'added' && l.content.includes('process.env.PORT'))).toBe(true);
      expect(hunk.lines.some(l => l.type === 'deleted' && l.content.includes('const port = 3000'))).toBe(true);
      expect(hunk.lines.some(l => l.type === 'context' && l.content.includes("express"))).toBe(true);
    });

    it('returns empty hunks for empty or whitespace diff', () => {
      const parsed = GitWorkflowService.parseUnifiedDiff('', 'README.md', true);
      expect(parsed.hunks).toHaveLength(0);
      expect(parsed.additions).toBe(0);
      expect(parsed.deletions).toBe(0);
      expect(parsed.staged).toBe(true);
    });

    it('detects binary file diffs correctly', () => {
      const binaryDiff = `diff --git a/logo.png b/logo.png
Binary files differ
`;
      const parsed = GitWorkflowService.parseUnifiedDiff(binaryDiff, 'logo.png', false);
      expect(parsed.isBinary).toBe(true);
    });
  });

  describe('Working Tree Status & Repository Detection', () => {
    it('fetches real repository status via API', async () => {
      const mockStatus = {
        isRepo: true,
        branch: 'main',
        ahead: 1,
        behind: 0,
        isDetached: false,
        staged: [{ filePath: 'src/App.tsx', status: 'modified', staged: true }],
        unstaged: [{ filePath: 'package.json', status: 'modified', staged: false }],
        untracked: [{ filePath: 'newfile.ts', status: 'untracked', staged: false }],
        conflicted: [],
        hasConflicts: false,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockStatus,
      } as any);

      const status = await GitWorkflowService.getStatus();
      expect(status.isRepo).toBe(true);
      expect(status.branch).toBe('main');
      expect(status.staged).toHaveLength(1);
      expect(status.unstaged).toHaveLength(1);
      expect(status.untracked).toHaveLength(1);
      expect(status.ahead).toBe(1);
    });

    it('returns safe fallback when git status endpoint fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const status = await GitWorkflowService.getStatus();
      expect(status.isRepo).toBe(false);
      expect(status.branch).toBe('main');
      expect(status.staged).toHaveLength(0);
    });
  });

  describe('Staging & Unstaging Workflows', () => {
    it('calls stage endpoint with specified file path', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const success = await GitWorkflowService.stage('src/index.ts');
      expect(success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/git/stage', expect.objectContaining({
        method: 'POST',
      }));
      const call = (global.fetch as any).mock.calls[0];
      const parsedBody = JSON.parse(call[1].body);
      expect(parsedBody.filePath).toBe('src/index.ts');
    });

    it('calls unstage endpoint with specified file path', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const success = await GitWorkflowService.unstage('src/index.ts');
      expect(success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/git/unstage', expect.objectContaining({
        method: 'POST',
      }));
      const call = (global.fetch as any).mock.calls[0];
      const parsedBody = JSON.parse(call[1].body);
      expect(parsedBody.filePath).toBe('src/index.ts');
    });
  });

  describe('Commit Creation and History', () => {
    it('executes commit with message and amend flag', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ output: '[main 9abc123] feat: add new feature' }),
      });

      const res = await GitWorkflowService.commit('feat: add new feature', false);
      expect(res.success).toBe(true);
      expect(res.output).toContain('feat: add new feature');
    });

    it('retrieves commit log entries', async () => {
      const mockLog = [
        {
          hash: 'abc123456789',
          shortHash: 'abc1234',
          message: 'initial commit',
          author: 'Developer',
          email: 'dev@example.com',
          timestamp: '2026-10-12T00:00:00Z',
          relativeTime: '2 hours ago',
          isHead: true,
          parents: [],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ commits: mockLog }),
      });

      const log = await GitWorkflowService.getLog(10);
      expect(log).toHaveLength(1);
      expect(log[0].shortHash).toBe('abc1234');
      expect(log[0].message).toBe('initial commit');
    });
  });

  describe('Branching & Safety Checks', () => {
    it('creates and checks out new branches', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const res = await GitWorkflowService.createBranch('feature/auth', true);
      expect(res.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/git/branch/create', expect.objectContaining({
        method: 'POST',
      }));
      const call = (global.fetch as any).mock.calls[0];
      const parsedBody = JSON.parse(call[1].body);
      expect(parsedBody.name).toBe('feature/auth');
      expect(parsedBody.checkout).toBe(true);
    });

    it('checks out an existing branch', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const res = await GitWorkflowService.checkoutBranch('main');
      expect(res.success).toBe(true);
    });

    it('deletes branch with safety confirmation', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const res = await GitWorkflowService.deleteBranch('feature/old', false);
      expect(res.success).toBe(true);
    });
  });

  describe('Stashes, Tags, Cherry-pick & Revert', () => {
    it('creates, lists and pops git stashes', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stashes: [{ index: 0, message: 'WIP' }] }) });

      const saveOk = await GitWorkflowService.saveStash('WIP on navbar');
      expect(saveOk).toBe(true);

      const stashes = await GitWorkflowService.getStashes();
      expect(stashes).toHaveLength(1);

      const popOk = await GitWorkflowService.applyStash('stash@{0}', true);
      expect(popOk).toBe(true);
    });

    it('creates and lists tags', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ tags: [{ name: 'v1.0.0', commitHash: 'abcdef' }] }) });

      const ok = await GitWorkflowService.createTag('v1.0.0', 'Release 1.0.0');
      expect(ok).toBe(true);

      const tags = await GitWorkflowService.getTags();
      expect(tags).toHaveLength(1);
      expect(tags[0].name).toBe('v1.0.0');
    });

    it('executes cherry-pick and revert operations', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stdout: 'success' }) });

      const cp = await GitWorkflowService.cherryPick('abcdef123');
      expect(cp.success).toBe(true);

      const rev = await GitWorkflowService.revertCommit('abcdef123');
      expect(rev.success).toBe(true);
    });
  });

  describe('Merge Conflict Detection and Resolution', () => {
    it('fetches conflicted files', async () => {
      const mockConflicts = [
        {
          filePath: 'src/utils.ts',
          rawContent: '<<<<<<< HEAD\nconst a = 1;\n=======\nconst a = 2;\n>>>>>>> feature\n',
          conflicts: [
            {
              id: 'block-0',
              currentContent: 'const a = 1;\n',
              incomingContent: 'const a = 2;\n',
              startLine: 1,
              endLine: 5,
            },
          ],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ conflictFiles: mockConflicts }),
      });

      const conflicts = await GitWorkflowService.getConflicts();
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflicts).toHaveLength(1);
      expect(conflicts[0].conflicts[0].currentContent).toBe('const a = 1;\n');
    });

    it('resolves conflict with selected merged content', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const resolved = await GitWorkflowService.resolveConflict('src/utils.ts', 'const a = 1;\n');
      expect(resolved).toBe(true);
    });
  });

  describe('GitHub Integration (Optional Authentication)', () => {
    it('checks authentication status without requiring token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: false }),
      });

      const auth = await GitWorkflowService.getGitHubAuthStatus();
      expect(auth.authenticated).toBe(false);
    });

    it('sets token and validates user profile', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          authenticated: true,
          user: { login: 'octocat', name: 'The Octocat', avatarUrl: 'https://github.com/octocat.png' },
        }),
      });

      const res = await GitWorkflowService.setGitHubToken('ghp_test123');
      expect(res.authenticated).toBe(true);
      expect(res.user?.login).toBe('octocat');
    });

    it('lists pull requests for target repository', async () => {
      const mockPulls = [
        {
          number: 42,
          title: 'Add dark mode theme support',
          state: 'open',
          headBranch: 'feat/dark-mode',
          baseBranch: 'main',
          author: { login: 'developer' },
          htmlUrl: 'https://github.com/owner/repo/pull/42',
          labels: [{ name: 'enhancement', color: '0075ca' }],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ pulls: mockPulls }),
      });

      const pulls = await GitWorkflowService.getGitHubPullRequests('owner', 'repo');
      expect(pulls).toHaveLength(1);
      expect(pulls[0].number).toBe(42);
      expect(pulls[0].title).toBe('Add dark mode theme support');
    });
  });

  describe('AI Git Assistance', () => {
    it('suggests Conventional Commit message from diff', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ suggestedCommitMessage: 'feat(core): enhance git workflow system' }),
      });

      const msg = await GitWorkflowService.aiSuggestCommitMessage('+ const newFeature = true;');
      expect(msg).toBe('feat(core): enhance git workflow system');
    });

    it('explains diffs with AI summary', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ summary: 'Added environment configuration support.' }),
      });

      const explanation = await GitWorkflowService.aiExplainDiff('+ export const ENV = "production";');
      expect(explanation).toContain('environment configuration');
    });

    it('reviews code changes for regressions', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ review: 'No security vulnerabilities or regressions detected.' }),
      });

      const review = await GitWorkflowService.aiReviewChanges('+ const safeInput = sanitize(val);');
      expect(review).toContain('No security vulnerabilities');
    });
  });
});
