import React, { useState } from 'react';
import { useIDE } from '../../context/IDEContext';
import {
  X,
  Check,
  SplitSquareVertical,
  CheckCircle2,
  XCircle,
  FileCode,
  FilePlus,
  FileDiff,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { ProposedFileChange } from '../../types/desktop';

interface MultiFileReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  changes: ProposedFileChange[];
  onApplySelected: (acceptedChanges: ProposedFileChange[]) => void;
}

export const MultiFileReviewModal: React.FC<MultiFileReviewModalProps> = ({
  isOpen,
  onClose,
  changes: initialChanges,
  onApplySelected,
}) => {
  const [changes, setChanges] = useState<ProposedFileChange[]>(initialChanges);
  const [selectedFileId, setSelectedFileId] = useState<string>(initialChanges[0]?.id || '');

  if (!isOpen || changes.length === 0) return null;

  const currentChange = changes.find(c => c.id === selectedFileId) || changes[0];

  const handleToggleAccept = (id: string) => {
    setChanges(prev =>
      prev.map(c => (c.id === id ? { ...c, accepted: !c.accepted } : c))
    );
  };

  const handleSelectAll = (val: boolean) => {
    setChanges(prev => prev.map(c => ({ ...c, accepted: val })));
  };

  const acceptedCount = changes.filter(c => c.accepted).length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[80vh] shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
              <SplitSquareVertical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Safe Multi-File Diff Review</h2>
              <p className="text-xs text-slate-400">
                Inspect changes file-by-file. Accept or reject modifications individually before writing to disk.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              <strong className="text-emerald-400">{acceptedCount}</strong> of {changes.length} files accepted
            </span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Master-Detail Split Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Changed Files List */}
          <div className="w-72 bg-slate-950/60 border-r border-slate-800 flex flex-col">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Proposed Files</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSelectAll(true)}
                  className="hover:text-indigo-300 text-[10px]"
                >
                  All
                </button>
                <span>/</span>
                <button
                  onClick={() => handleSelectAll(false)}
                  className="hover:text-indigo-300 text-[10px]"
                >
                  None
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
              {changes.map(chg => {
                const isSelected = chg.id === selectedFileId;
                return (
                  <div
                    key={chg.id}
                    onClick={() => setSelectedFileId(chg.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer flex flex-col gap-1 transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <input
                          type="checkbox"
                          checked={chg.accepted}
                          onChange={e => {
                            e.stopPropagation();
                            handleToggleAccept(chg.id);
                          }}
                          className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <span className="font-mono text-[11px] truncate font-medium">{chg.filePath}</span>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        chg.action === 'create' ? 'bg-emerald-500/20 text-emerald-300' :
                        chg.action === 'delete' ? 'bg-rose-500/20 text-rose-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {chg.action}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pl-5">
                      <span className="text-emerald-400 font-mono">+{chg.additions} -{chg.deletions}</span>
                      <span className={chg.accepted ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        {chg.accepted ? 'Accepted' : 'Rejected'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: File Diff & Explanation View */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* Diff Header */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-900/40">
              <div className="flex items-center gap-2">
                <FileDiff className="w-4 h-4 text-indigo-400" />
                <span className="font-mono font-bold text-slate-200">{currentChange.filePath}</span>
              </div>
              <button
                onClick={() => handleToggleAccept(currentChange.id)}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentChange.accepted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {currentChange.accepted ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Accepted
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" /> Excluded (Click to Accept)
                  </>
                )}
              </button>
            </div>

            {/* Explanation banner */}
            <div className="px-4 py-2 bg-indigo-950/20 border-b border-slate-800/80 text-xs text-indigo-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{currentChange.explanation}</span>
            </div>

            {/* Diff preview */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
              {currentChange.action === 'create' ? (
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase mb-2">New File Content:</div>
                  <pre className="text-slate-200 whitespace-pre-wrap">{currentChange.newContent}</pre>
                </div>
              ) : (
                <div className="grid grid-cols-2 divide-x divide-slate-800 h-full">
                  <div className="pr-3">
                    <div className="text-[10px] text-rose-400 font-bold uppercase mb-2">Original:</div>
                    <pre className="text-slate-400 whitespace-pre-wrap">{currentChange.originalContent}</pre>
                  </div>
                  <div className="pl-3 bg-emerald-950/10">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase mb-2">Modified:</div>
                    <pre className="text-slate-200 whitespace-pre-wrap">{currentChange.newContent}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              const accepted = changes.filter(c => c.accepted);
              onApplySelected(accepted);
              onClose();
            }}
            disabled={acceptedCount === 0}
            className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Selected ({acceptedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
