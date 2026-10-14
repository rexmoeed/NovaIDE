import React, { useState } from 'react';
import { useIDE } from '../../context/IDEContext';
import { AcceptanceTestRunner as RunnerService, AcceptanceTestReport } from '../../services/acceptanceTests';
import { TerminalRunner } from '../../services/terminalRunner';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export const AcceptanceTestRunnerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { vfs } = useIDE() as any; // or from context
  const [reports, setReports] = useState<AcceptanceTestReport[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setIsRunning(true);
    // Create new runner instance with current VFS
    const currentVfs = (window as any).__IDE_VFS__ || vfs;
    const runner = new RunnerService(currentVfs, new TerminalRunner(currentVfs));
    const results = await runner.runAll();
    setReports(results);
    setIsRunning(false);
  };

  const passedCount = reports.filter(r => r.passed).length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Acceptance Test Suite (10 Specification Workflows)</h2>
              <p className="text-xs text-slate-400">
                End-to-end verification of Project Creation, Codebase Navigation, Safe Multi-File Editing, and Security boundaries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {reports.length > 0 && (
              <span className="text-xs font-mono font-bold text-emerald-400">
                {passedCount} / {reports.length} Passed
              </span>
            )}
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
            >
              {isRunning ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Running Workflows...' : 'Execute 10 Acceptance Tests'}</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {reports.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 py-12">
              <ShieldCheck className="w-12 h-12 text-slate-700" />
              <p className="text-sm font-medium">Click "Execute 10 Acceptance Tests" to run all verified workflows live.</p>
              <div className="text-xs text-slate-600 max-w-md text-center leading-relaxed">
                Verifies natural language project creation, local file indexing, symbol location, multi-file diffs, selective file rejection, atomic renaming, feature explanation, command execution, filesystem sync, and security traversal blocks.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {reports.map(report => (
                <div
                  key={report.id}
                  className={`p-3.5 rounded-xl border text-xs flex flex-col gap-1.5 transition-colors ${
                    report.passed
                      ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/40'
                      : 'bg-rose-950/20 border-rose-800 hover:border-rose-500'
                  }`}
                >
                  <div
                    onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {report.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-bold text-slate-200">
                        {report.id}. {report.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-slate-500">{report.durationMs}ms</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        report.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {report.passed ? 'PASSED' : 'FAILED'}
                      </span>
                      {expandedId === report.id ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                  </div>

                  <div className="pl-7 text-[11px] text-slate-400 font-sans leading-relaxed">
                    {report.evidence}
                  </div>

                  {report.error && (
                    <div className="pl-7 font-mono text-[11px] text-rose-400">
                      Error: {report.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
