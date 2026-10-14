import React, { useState } from 'react';
import {
  GitBranch,
  Folder,
  Download,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { DesktopBridge } from '../../services/desktopBridge';

interface CloneRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCloned: (clonedPath: string) => Promise<void>;
}

export const CloneRepoModal: React.FC<CloneRepoModalProps> = ({
  isOpen,
  onClose,
  onProjectCloned,
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [targetDir, setTargetDir] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError('Please provide a valid repository URL');
      return;
    }

    setIsCloning(true);
    setError(null);

    const safeTarget = targetDir.trim() || undefined;
    const res = await DesktopBridge.gitClone(repoUrl.trim(), safeTarget);

    if (res.success && res.targetPath) {
      setIsCloning(false);
      onClose();
      await onProjectCloned(res.targetPath);
    } else {
      setIsCloning(false);
      setError(res.error || 'Failed to clone repository. Check URL and network connectivity.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Clone Git Repository</h2>
              <p className="text-[11px] text-slate-400">Clone a real repository to local disk workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleClone} className="p-5 flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-300">
              Repository URL <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="https://github.com/owner/repository.git"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              disabled={isCloning}
              className="bg-slate-950 border border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-300">
              Destination Directory (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave empty for auto-generated workspace folder"
              value={targetDir}
              onChange={e => setTargetDir(e.target.value)}
              disabled={isCloning}
              className="bg-slate-950 border border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isCloning && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center gap-2.5 text-[11px]">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
              <span>Cloning repository from remote... This may take a few seconds.</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isCloning}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCloning || !repoUrl.trim()}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              {isCloning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Cloning...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Clone Repository</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
