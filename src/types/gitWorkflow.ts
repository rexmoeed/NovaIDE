/**
 * Professional Git & GitHub Workflow Types & Contracts
 */

export type GitFileChangeStatus =
  | 'modified'
  | 'added'
  | 'deleted'
  | 'untracked'
  | 'renamed'
  | 'conflicted'
  | 'copied'
  | 'typechange';

export interface GitFileStatus {
  filePath: string;
  status: GitFileChangeStatus;
  staged: boolean;
  oldPath?: string;
  additions?: number;
  deletions?: number;
}

export interface GitWorkingTreeStatus {
  isRepo: boolean;
  branch: string;
  upstream?: string;
  ahead: number;
  behind: number;
  staged: GitFileStatus[];
  unstaged: GitFileStatus[];
  untracked: GitFileStatus[];
  conflicted: GitFileStatus[];
  lastCommit?: {
    hash: string;
    shortHash: string;
    message: string;
    author: string;
    timestamp: string;
  };
  hasConflicts: boolean;
  isDetached: boolean;
}

export interface GitBranch {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
  upstream?: string;
  commitHash: string;
  commitMessage: string;
  ahead?: number;
  behind?: number;
}

export interface GitCommitInfo {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  email: string;
  timestamp: string;
  relativeTime: string;
  isHead: boolean;
  parents: string[];
}

export interface GitRemote {
  name: string;
  fetchUrl: string;
  pushUrl: string;
}

export interface GitTag {
  name: string;
  commitHash: string;
  message?: string;
  tagger?: string;
  date?: string;
}

export interface GitStash {
  index: number;
  name: string;
  message: string;
  branch: string;
  timestamp: string;
}

export interface GitConflictBlock {
  id: string;
  currentContent: string;
  incomingContent: string;
  commonAncestorContent?: string;
  startLine: number;
  endLine: number;
}

export interface GitConflictFile {
  filePath: string;
  conflicts: GitConflictBlock[];
  rawContent: string;
}

export interface GitDiffLine {
  type: 'context' | 'added' | 'deleted' | 'hunk-header';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface GitDiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  header: string;
  lines: GitDiffLine[];
}

export interface GitFileDiff {
  filePath: string;
  oldPath?: string;
  status: GitFileChangeStatus;
  staged: boolean;
  hunks: GitDiffHunk[];
  rawDiff: string;
  isBinary: boolean;
  additions: number;
  deletions: number;
}

export interface GitHubRepoInfo {
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  stars: number;
  forks: number;
  openIssues: number;
  isPrivate: boolean;
  defaultBranch: string;
  htmlUrl: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  author: {
    login: string;
    avatarUrl?: string;
  };
  headBranch: string;
  baseBranch: string;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
  mergeable?: boolean;
  labels: Array<{ name: string; color: string }>;
  draft?: boolean;
  commentsCount?: number;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  author: {
    login: string;
    avatarUrl?: string;
  };
  createdAt: string;
  labels: Array<{ name: string; color: string }>;
  commentsCount: number;
  htmlUrl: string;
}

export interface AIGitReviewFinding {
  filePath: string;
  line?: number;
  severity: 'error' | 'warning' | 'info';
  category: 'bug' | 'security' | 'regression' | 'style';
  message: string;
  suggestion?: string;
}

export interface AIGitAnalysis {
  summary: string;
  suggestedCommitMessage?: string;
  suggestedPrTitle?: string;
  suggestedPrDescription?: string;
  findings: AIGitReviewFinding[];
  potentialRegressions: string[];
}
