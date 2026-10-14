import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialogModal: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'warning',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  const isDanger = severity === 'danger';
  const isWarning = severity === 'warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-fadeIn">
      <div
        style={{
          backgroundColor: 'var(--ide-surface, #121214)',
          borderColor: 'var(--ide-border, #27272a)',
          color: 'var(--ide-text, #f4f4f5)',
        }}
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col text-xs"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDanger
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                  : isWarning
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                  : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
              }`}
            >
              {isDanger ? (
                <AlertCircle className="w-4 h-4" />
              ) : isWarning ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>
            <h3 className="font-bold text-sm text-white">{title}</h3>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 text-slate-300 leading-relaxed text-xs">
          {message}
        </div>

        <div className="p-3.5 border-t border-white/10 flex items-center justify-end gap-2.5 bg-black/30">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium cursor-pointer transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 rounded-lg font-bold text-white shadow-md transition cursor-pointer ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
