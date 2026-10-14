import React, { useState } from 'react';
import {
  Server,
  Play,
  Square,
  RotateCw,
  ExternalLink,
  Terminal,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { DevServerProcess } from '../../types/project';
import { DesktopBridge } from '../../services/desktopBridge';

interface DevServerManagerProps {
  serverProcess: DevServerProcess | null;
  onStartServer: (command?: string) => Promise<void>;
  onStopServer: () => Promise<void>;
  onRestartServer: () => Promise<void>;
  onOpenPreview: () => void;
  defaultDevCommand?: string;
}

export const DevServerManager: React.FC<DevServerManagerProps> = ({
  serverProcess,
  onStartServer,
  onStopServer,
  onRestartServer,
  onOpenPreview,
  defaultDevCommand = 'pnpm dev',
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  const isRunning = serverProcess?.status === 'running' || serverProcess?.status === 'starting' || serverProcess?.status === 'probing';

  const handleStart = async () => {
    setIsLoading(true);
    await onStartServer(defaultDevCommand);
    setIsLoading(false);
  };

  const handleStop = async () => {
    setIsLoading(true);
    await onStopServer();
    setIsLoading(false);
    setHealthStatus(null);
  };

  const handleRestart = async () => {
    setIsLoading(true);
    await onRestartServer();
    setIsLoading(false);
    setHealthStatus(null);
  };

  const handleProbeHealth = async () => {
    if (!serverProcess?.pid) return;
    setIsLoading(true);
    const res = await DesktopBridge.checkDevServerHealth(serverProcess.pid);
    setHealthStatus(res.isReady ? `Healthy (${res.statusCode || 200} OK)` : (res.message || 'Probing failed'));
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col gap-2.5 text-xs select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dev Server</span>
          </div>
          {isRunning && serverProcess?.pid && (
            <span className="text-[10px] text-slate-400 font-mono">PID {serverProcess.pid}</span>
          )}
          {serverProcess?.portConflictDetected && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
              Port Conflict Resolved
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-[11px] font-semibold transition-colors shadow-sm cursor-pointer"
              title="Start Development Server"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Start</span>
            </button>
          ) : (
            <>
              <button
                onClick={onOpenPreview}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold transition-colors shadow-sm cursor-pointer"
                title="Open Live Preview"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Preview</span>
              </button>
              <button
                onClick={handleProbeHealth}
                disabled={isLoading}
                className="p-1.5 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title="Verify HTTP Readiness & Health"
              >
                <Activity className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRestart}
                disabled={isLoading}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title="Restart Dev Server"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleStop}
                disabled={isLoading}
                className="flex items-center gap-1 px-2 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                title="Stop Dev Server"
              >
                <Square className="w-3 h-3 fill-rose-300" />
                <span>Stop</span>
              </button>
            </>
          )}

          {serverProcess?.logs && serverProcess.logs.length > 0 && (
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Server Logs"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Info strip */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-850">
        <span className="truncate">{isRunning ? serverProcess?.command : defaultDevCommand}</span>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {healthStatus && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{healthStatus}</span>
            </span>
          )}
          {isRunning && serverProcess?.url && (
            <a
              href={serverProcess.url}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>{serverProcess.url}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Real process logs */}
      {showLogs && serverProcess?.logs && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 max-h-48 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-0.5 scrollbar-slim">
          {serverProcess.logs.map((log, i) => (
            <div key={i} className="leading-tight break-all whitespace-pre-wrap">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
