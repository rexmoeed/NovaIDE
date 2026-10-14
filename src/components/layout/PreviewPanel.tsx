import React, { useState } from 'react';
import { useIDE } from '../../context/IDEContext';
import { useLayout } from '../../context/LayoutContext';
import {
  X,
  RotateCw,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Shield,
  Play,
  Square,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Globe,
} from 'lucide-react';

export const PreviewPanel: React.FC = () => {
  const layout = useLayout();
  const {
    showPreview,
    setShowPreview,
    previewDevice,
    setPreviewDevice,
    activeProject,
    devServerProcess,
    startDevServer,
    stopDevServer,
    restartDevServer,
    projectProfile,
  } = useIDE();

  const [reloadKey, setReloadKey] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const defaultUrl = devServerProcess?.url || '';
  const effectiveUrl = customUrl.trim() || defaultUrl;

  const detectedDevCommand =
    projectProfile?.userOverrides?.devCommand ||
    projectProfile?.scripts?.['dev'] ||
    projectProfile?.scripts?.['start'] ||
    'npm run dev';

  if (!showPreview) return null;

  return (
    <div
      style={{
        width: `${layout.config.previewWidth}px`,
        backgroundColor: 'var(--ide-surface)',
        borderColor: 'var(--ide-border)',
        color: 'var(--ide-text)',
      }}
      className="border rounded-xl overflow-hidden flex flex-col h-full z-20 shadow-xs shrink-0"
    >
      {/* 1. PREVIEW BROWSER BAR */}
      <div
        style={{
          backgroundColor: 'var(--ide-surface-elevated)',
          borderColor: 'var(--ide-border)',
        }}
        className="h-10 px-3 flex items-center justify-between border-b select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex gap-1.5 mr-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          {/* Server status indicator */}
          {devServerProcess ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>PID {devServerProcess.pid}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Stopped</span>
            </div>
          )}

          <button
            onClick={() => setReloadKey(k => k + 1)}
            disabled={!devServerProcess}
            className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors shrink-0"
            title="Reload preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`p-1 rounded transition-colors ${
              previewDevice === 'desktop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop 100%"
          >
            <Monitor className="w-3 h-3" />
          </button>
          <button
            onClick={() => setPreviewDevice('tablet')}
            className={`p-1 rounded transition-colors ${
              previewDevice === 'tablet' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet (768px)"
          >
            <Tablet className="w-3 h-3" />
          </button>
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`p-1 rounded transition-colors ${
              previewDevice === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile (375px)"
          >
            <Smartphone className="w-3 h-3" />
          </button>
        </div>

        {/* Server Actions & Close */}
        <div className="flex items-center gap-1">
          {devServerProcess ? (
            <>
              <button
                onClick={() => restartDevServer()}
                className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                title="Restart dev server"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => stopDevServer()}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                title="Stop server"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => startDevServer()}
              className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
              title="Start dev server"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <button
            onClick={() => setShowPreview(false)}
            className="p-1 text-slate-400 hover:text-slate-200 ml-1"
            title="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* URL address bar */}
      <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-2 text-xs">
        <div className="flex-1 bg-slate-900 rounded px-2.5 py-1 text-slate-300 font-mono text-[11px] flex items-center gap-1.5 border border-slate-800 min-w-0">
          <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={customUrl || (devServerProcess ? devServerProcess.url : 'http://localhost:3000')}
            onChange={e => setCustomUrl(e.target.value)}
            placeholder="http://localhost:3000"
            className="bg-transparent text-slate-200 font-mono text-[11px] focus:outline-none w-full"
          />
        </div>
        {devServerProcess && (
          <a
            href={effectiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-slate-400 hover:text-cyan-400 shrink-0"
            title="Open in external browser"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* 2. PREVIEW CONTENT */}
      <div className="flex-1 bg-slate-950 overflow-hidden p-3 flex flex-col items-center justify-center relative">
        {devServerProcess ? (
          <div
            key={reloadKey}
            className={`h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
              previewDevice === 'mobile'
                ? 'w-[360px] max-h-[640px] border-4 border-slate-700 rounded-[28px]'
                : previewDevice === 'tablet'
                ? 'w-[520px] max-h-[680px]'
                : 'w-full h-full'
            }`}
          >
            <iframe
              src={effectiveUrl}
              title="Real Application Preview"
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        ) : (
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Development Server Offline</h3>
              <p className="text-xs text-slate-400 mt-1">
                Start the development server for <span className="text-indigo-300 font-medium">{activeProject.name}</span> to view the live preview.
              </p>
            </div>

            <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-left">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Detected Command</span>
              <div className="font-mono text-xs text-emerald-400 mt-0.5">$ {detectedDevCommand}</div>
            </div>

            <button
              onClick={() => startDevServer(detectedDevCommand)}
              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Development Server</span>
            </button>
          </div>
        )}

        {/* Server Logs Toggle Button */}
        {devServerProcess && (
          <div className="absolute bottom-3 right-4 z-10">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="px-2.5 py-1 bg-slate-900/95 hover:bg-slate-850 text-slate-300 border border-slate-750 rounded-lg text-[11px] font-mono flex items-center gap-1.5 shadow-lg backdrop-blur-sm"
            >
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span>{showLogs ? 'Hide Logs' : 'Server Logs'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
          </div>
        )}

        {/* Server Logs Drawer */}
        {devServerProcess && showLogs && (
          <div className="absolute inset-x-3 bottom-12 max-h-56 bg-slate-950/95 border border-slate-750 rounded-xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-2 z-20 font-mono text-[11px]">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Server Output (PID {devServerProcess.pid})</span>
              </div>
              <button onClick={() => setShowLogs(false)} className="text-slate-400 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-0.5 text-slate-300 pr-1 no-scrollbar select-text">
              {devServerProcess.logs.slice(-30).map((l, i) => (
                <div key={i} className="text-[10px] leading-relaxed break-all">
                  {l}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
