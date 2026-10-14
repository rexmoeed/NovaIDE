import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Wrench,
  Settings,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Palette,
  Terminal,
  Play,
  RotateCw,
} from 'lucide-react';
import { ProjectProfile, SupportedPackageManager } from '../../types/project';

interface ProjectDetectionCardProps {
  profile: ProjectProfile;
  onUpdateOverrides: (overrides: ProjectProfile['userOverrides']) => void;
  onRefreshHealth: () => void;
}

export const ProjectDetectionCard: React.FC<ProjectDetectionCardProps> = ({
  profile,
  onUpdateOverrides,
  onRefreshHealth,
}) => {
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isHealthExpanded, setIsHealthExpanded] = useState(true);

  // Override draft state
  const [draftFramework, setDraftFramework] = useState(profile.userOverrides?.framework || profile.frontend?.name || profile.frameworks[0] || '');
  const [draftBackend, setDraftBackend] = useState(profile.userOverrides?.backend || profile.backend?.name || '');
  const [draftDatabase, setDraftDatabase] = useState(profile.userOverrides?.database || profile.database?.name || '');
  const [draftPM, setDraftPM] = useState<SupportedPackageManager>(profile.userOverrides?.packageManager || profile.packageManager || 'npm');
  const [draftDevCmd, setDraftDevCmd] = useState(profile.userOverrides?.devCommand || profile.scripts['dev'] || 'npm run dev');
  const [draftTestCmd, setDraftTestCmd] = useState(profile.userOverrides?.testCommand || profile.scripts['test'] || 'npm test');

  const handleSaveOverrides = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOverrides({
      framework: draftFramework,
      backend: draftBackend,
      database: draftDatabase,
      packageManager: draftPM,
      devCommand: draftDevCmd,
      testCommand: draftTestCmd,
    });
    setIsOverrideModalOpen(false);
  };

  const health = profile.health;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">{profile.name}</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono">
                {profile.overridden ? 'Customized' : 'Detected automatically'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm">{profile.rootPath}</p>
          </div>
        </div>

        <button
          onClick={() => setIsOverrideModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors text-[11px] font-medium"
        >
          <Wrench className="w-3 h-3 text-indigo-400" />
          <span>Change / Override</span>
        </button>
      </div>

      {/* Tech Profile Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        {/* Frontend */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Frontend</span>
          <span className="font-semibold text-slate-200 truncate">
            {profile.userOverrides?.framework || profile.frontend?.name || profile.frameworks[0] || 'Generic UI'}
          </span>
          {profile.languages.length > 0 && (
            <span className="text-[10px] text-indigo-400 font-mono">{profile.languages.join(', ')}</span>
          )}
        </div>

        {/* Styling */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Styling</span>
          <span className="font-semibold text-slate-200 truncate">
            {profile.styling?.name || 'CSS / Utility'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Modern Theme</span>
        </div>

        {/* State / Libs */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">State & Logic</span>
          <span className="font-semibold text-slate-200 truncate">
            {profile.state?.name || (profile.libraries[0] || 'Standard Hooks')}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{profile.libraries.length} libs active</span>
        </div>

        {/* Backend & DB */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Backend & Data</span>
          <span className="font-semibold text-slate-200 truncate">
            {profile.userOverrides?.backend || profile.backend?.name || 'Node.js Express'}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">
            {profile.userOverrides?.database || profile.database?.name || 'SQLite / Postgres'}
          </span>
        </div>
      </div>

      {/* Project Health Inspection */}
      <div className="border-t border-slate-800/80 pt-3">
        <div
          onClick={() => setIsHealthExpanded(!isHealthExpanded)}
          className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Project Health</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
              {health.score}% Passed
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefreshHealth();
              }}
              className="p-1 hover:text-slate-200 rounded"
              title="Refresh Health Inspection"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            {isHealthExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>

        {isHealthExpanded && (
          <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2">
            {health.items.map(item => (
              <div
                key={item.key}
                className="flex items-start gap-2 p-2 rounded-xl bg-slate-950/40 border border-slate-850"
              >
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : item.severity === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-slate-200">{item.label}</span>
                  {item.message && (
                    <span className="text-[10px] text-slate-400 truncate">{item.message}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Override Modal */}
      {isOverrideModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsOverrideModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-slate-100 text-sm">Override Detected Stack</h3>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOverrides} className="p-5 flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-300 font-semibold">Frontend Framework</label>
                <input
                  type="text"
                  value={draftFramework}
                  onChange={e => setDraftFramework(e.target.value)}
                  placeholder="e.g. React 19 + Vite"
                  className="bg-slate-950 border border-slate-750 rounded-xl px-3 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300 font-semibold">Backend Engine</label>
                <input
                  type="text"
                  value={draftBackend}
                  onChange={e => setDraftBackend(e.target.value)}
                  placeholder="e.g. Node.js Express / Python FastAPI"
                  className="bg-slate-950 border border-slate-750 rounded-xl px-3 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300 font-semibold">Database / ORM</label>
                <input
                  type="text"
                  value={draftDatabase}
                  onChange={e => setDraftDatabase(e.target.value)}
                  placeholder="e.g. PostgreSQL + Prisma / SQLite"
                  className="bg-slate-950 border border-slate-750 rounded-xl px-3 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300 font-semibold">Package Manager</label>
                <select
                  value={draftPM}
                  onChange={e => setDraftPM(e.target.value as SupportedPackageManager)}
                  className="bg-slate-950 border border-slate-750 rounded-xl px-3 py-1.5 text-slate-100 font-mono"
                >
                  <option value="pnpm">pnpm</option>
                  <option value="npm">npm</option>
                  <option value="yarn">yarn</option>
                  <option value="bun">bun</option>
                  <option value="poetry">poetry (Python)</option>
                  <option value="cargo">cargo (Rust)</option>
                  <option value="go">go (Golang)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300 font-semibold">Development Run Command</label>
                <input
                  type="text"
                  value={draftDevCmd}
                  onChange={e => setDraftDevCmd(e.target.value)}
                  placeholder="e.g. pnpm dev"
                  className="bg-slate-950 border border-slate-750 rounded-xl px-3 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-300 font-semibold">Test Command</label>
                <input
                  type="text"
                  value={draftTestCmd}
                  onChange={e => setDraftTestCmd(e.target.value)}
                  placeholder="e.g. pnpm test"
                  className="bg-slate-950 border border-slate-750 rounded-xl px-3 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs"
                >
                  Save Overrides
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
