import React from 'react';
import {
  AlertTriangle,
  FileCode,
  Save,
  Trash2,
  X,
  Server,
  Bot,
} from 'lucide-react';
import { OpenTab } from '../../types/ide';

interface CloseProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  dirtyTabs: OpenTab[];
  hasRunningServer: boolean;
  hasRunningAgent: boolean;
  onSaveAndClose: () => void;
  onDiscardAndClose: () => void;
}

export const CloseProjectModal: React.FC<CloseProjectModalProps> = ({
  isOpen,
  onClose,
  projectName,
  dirtyTabs,
  hasRunningServer,
  hasRunningAgent,
  onSaveAndClose,
  onDiscardAndClose,
}) => {
  if (!isOpen) return null;

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
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Close Project</h2>
              <p className="text-[11px] text-slate-400">Workspace: {projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 text-xs text-slate-300">
          {dirtyTabs.length > 0 ? (
            <div>
              <p className="font-semibold text-slate-200 mb-2">
                You have {dirtyTabs.length} unsaved file{dirtyTabs.length > 1 ? 's' : ''}:
              </p>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 max-h-40 overflow-y-auto space-y-1">
                {dirtyTabs.map(tab => (
                  <div
                    key={tab.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 text-slate-200"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{tab.title}</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono">Unsaved</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-300">
              Are you sure you want to close this project workspace and return to the Welcome screen?
            </p>
          )}

          {hasRunningServer && (
            <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2 text-indigo-300">
              <Server className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-[11px]">Active development server process will be terminated.</span>
            </div>
          )}

          {hasRunningAgent && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2 text-amber-300">
              <Bot className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px]">Autonomous agent workflow is currently active and will be halted.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onDiscardAndClose}
              className="px-3 py-1.5 rounded-lg text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Don't Save</span>
            </button>
            {dirtyTabs.length > 0 && (
              <button
                onClick={onSaveAndClose}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors text-xs font-semibold shadow-md flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All & Close</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
