import React, { useState } from 'react';
import { useIDE } from '../../context/IDEContext';
import {
  FolderTree,
  GitBranch,
  Terminal,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  Pause,
  XCircle,
  FileCode,
  Shield,
  FileText,
  Sliders,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ProjectControlPanel: React.FC = () => {
  const {
    activeProject,
    taskPlan,
    currentTaskIndex,
    orchestratorStatus,
    modifiedFiles,
    testResults,
    terminalHistory,
    cancelOrchestration,
    executeStep,
    openFile,
  } = useIDE();

  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'git' | 'tasks'>('overview');
  const [projectRules, setProjectRules] = useState(
    `# Project Specific Cursor & Agent Rules (.cursorrules)\n\n1. Always write TypeScript in strict mode with explicit interface contracts.\n2. Business logic functions must be pure and testable.\n3. Validate all RBAC authorization checks before task state transition.\n4. Avoid direct mutation: update state immutably.\n5. Keep all unit test assertions in src/__tests__/ with full coverage.\n`
  );

  const completedTasks = taskPlan.filter(t => t.status === 'completed');
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const recentCommands = terminalHistory.filter(t => t.type === 'command').slice(-5);

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 select-none">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Project Control Panel</span>
        </div>

        {/* Status controls */}
        <div className="flex items-center gap-1.5">
          {orchestratorStatus === 'executing' ? (
            <button
              onClick={cancelOrchestration}
              className="p-1 text-rose-400 hover:bg-rose-500/20 rounded"
              title="Pause / Halt Orchestrator"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => executeStep()}
              disabled={currentTaskIndex >= taskPlan.length}
              className="p-1 text-emerald-400 hover:bg-emerald-500/20 disabled:text-slate-600 rounded"
              title="Resume / Execute Next Step"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-[11px]">
        {(['overview', 'tasks', 'git', 'rules'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 capitalize font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-indigo-500 text-white bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 text-xs flex flex-col gap-3">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Repository Details</span>
              <div className="font-bold text-sm text-indigo-300">{activeProject.name}</div>
              <p className="text-[11px] text-slate-400 leading-snug">{activeProject.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Active Tasks</span>
                <span className="text-base font-bold text-white mt-0.5 block">
                  {completedTasks.length} / {taskPlan.length}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Verification Status</span>
                <span className={`text-base font-bold mt-0.5 block ${failedTests === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {failedTests === 0 ? 'All Green' : `${failedTests} Failing`}
                </span>
              </div>
            </div>

            {/* Recent commands */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Recent Verified Commands</span>
              <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 font-mono text-[11px] flex flex-col gap-1">
                {recentCommands.length === 0 ? (
                  <span className="text-slate-600">No commands recorded</span>
                ) : (
                  recentCommands.map((cmd, i) => (
                    <div key={i} className="text-slate-300 truncate">
                      <span className="text-emerald-400 mr-1.5">&gt;</span>
                      {cmd.text}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Changed files in current task */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Modified Workspace Files ({modifiedFiles.length})
              </span>
              {modifiedFiles.length === 0 ? (
                <span className="text-slate-500 italic">No modified files. Working tree clean.</span>
              ) : (
                modifiedFiles.map(f => (
                  <div
                    key={f.filePath}
                    onClick={() => openFile(f.filePath, true)}
                    className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-indigo-500 cursor-pointer flex justify-between items-center"
                  >
                    <span className="font-mono text-[11px] text-indigo-300 truncate">{f.filePath}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">+{f.additions} -{f.deletions}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TASKS */}
        {activeTab === 'tasks' && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Orchestrator Lifecycle Tasks</span>
            {taskPlan.length === 0 ? (
              <span className="text-slate-500 italic">No active task plan. Use AI panel to plan features.</span>
            ) : (
              taskPlan.map(t => (
                <div
                  key={t.id}
                  className={`p-2 rounded-lg border flex flex-col gap-1 ${
                    t.status === 'completed'
                      ? 'bg-slate-950/60 border-slate-800'
                      : t.status === 'in-progress'
                      ? 'bg-indigo-950/30 border-indigo-500'
                      : 'bg-slate-950/30 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{t.title}</span>
                    <span className="text-[9px] uppercase font-mono px-1 rounded bg-slate-800 text-indigo-300">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{t.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: GIT */}
        {activeTab === 'git' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Current Branch</span>
              <span className="font-mono text-indigo-400 font-bold flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5" /> main
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Pending Unstaged Diffs</span>
              {modifiedFiles.map(d => (
                <div key={d.filePath} className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[11px]">
                  <div className="text-slate-200">{d.filePath}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">+{d.additions} -{d.deletions}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PERSISTENT RULES (.cursorrules) */}
        {activeTab === 'rules' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">.cursorrules Configuration</span>
              <span className="text-[10px] text-emerald-400">Active</span>
            </div>
            <textarea
              value={projectRules}
              onChange={e => setProjectRules(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 h-64 resize-none leading-relaxed"
            />
            <button
              onClick={() => alert('Project rules updated and indexed into persistent memory.')}
              className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold self-end"
            >
              Save Rules
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
