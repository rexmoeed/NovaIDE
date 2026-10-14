import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Cmd/Ctrl + I', desc: 'Cursor Composer: multi-file generation with @ mentions' },
    { key: 'Cmd/Ctrl + K', desc: 'Cursor Inline Edit: in-editor code generation & diff review' },
    { key: 'Tab', desc: 'Cursor Tab: accept inline ghost text autocomplete prediction' },
    { key: 'Cmd/Ctrl + K (Terminal)', desc: 'Terminal AI: synthesize shell commands from prompt' },
    { key: 'Cmd/Ctrl + S', desc: 'Save active file & trigger static analysis' },
    { key: 'Cmd/Ctrl + Enter', desc: 'Execute autonomous task or send AI chat prompt' },
    { key: 'Cmd/Ctrl + `', desc: 'Toggle integrated terminal & diagnostics dock' },
    { key: 'Cmd/Ctrl + P', desc: 'Quick-open file across workspace' },
    { key: 'Cmd/Ctrl + Shift + T', desc: 'Run all Vitest assertions & unit tests' },
    { key: 'Cmd/Ctrl + Shift + F', desc: 'Global codebase search (Grep)' },
    { key: 'F5 / Shift + F5', desc: 'Start / Continue / Stop DAP Debugging' },
    { key: 'F10 / F11', desc: 'Step Over / Step Into current statement' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-100">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">NovaIDE Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-2.5">
          {shortcuts.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-700/50 text-xs"
            >
              <span className="text-slate-300">{s.desc}</span>
              <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] font-mono font-semibold text-indigo-300 shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
