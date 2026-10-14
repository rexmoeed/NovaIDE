import React, { useState } from 'react';
import {
  FolderTree,
  Folder,
  FolderPlus,
  FileCode,
  FilePlus,
  Trash2,
  Edit2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { PlannedFileItem, ArchitecturePlan } from '../../types/scaffolding';
import { NamingEngine } from '../../services/namingEngine';

interface ProjectStructureEditorProps {
  files: PlannedFileItem[];
  plan: ArchitecturePlan;
  onUpdateFiles: (files: PlannedFileItem[]) => void;
  onRevisePlan: (instruction: string) => void;
  onResetToRecommended: () => void;
}

export const ProjectStructureEditor: React.FC<ProjectStructureEditorProps> = ({
  files,
  plan,
  onUpdateFiles,
  onRevisePlan,
  onResetToRecommended,
}) => {
  const [selectedItem, setSelectedItem] = useState<PlannedFileItem | null>(null);
  const [aiInstruction, setAiInstruction] = useState('');
  const [isRevising, setIsRevising] = useState(false);

  // Modal / Form state for Add/Edit
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPath, setNewPath] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [pathError, setPathError] = useState<string | null>(null);

  // Edit / Rename state
  const [editingItem, setEditingItem] = useState<PlannedFileItem | null>(null);
  const [renamedPath, setRenamedPath] = useState('');

  // Handle adding custom file or folder
  const handleAddNewItem = () => {
    const check = NamingEngine.validateRelativePath(newPath);
    if (!check.valid) {
      setPathError(check.error || 'Invalid path');
      return;
    }

    if (files.some(f => f.path.toLowerCase() === newPath.toLowerCase())) {
      setPathError('A file or folder already exists at this path.');
      return;
    }

    const newItem: PlannedFileItem = {
      id: `custom-${Date.now()}`,
      path: newPath.trim(),
      description: newDescription.trim() || 'Custom planned item',
      category: 'source',
      isCustom: true,
      content: '// Custom file initialized by user\n',
    };

    onUpdateFiles([...files, newItem]);
    setShowAddModal(false);
    setNewPath('');
    setNewDescription('');
    setPathError(null);
  };

  // Handle removing item
  const handleRemoveItem = (id: string) => {
    onUpdateFiles(files.filter(f => f.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  // Handle renaming item
  const handleSaveRename = () => {
    if (!editingItem) return;
    const check = NamingEngine.validateRelativePath(renamedPath);
    if (!check.valid) {
      setPathError(check.error || 'Invalid path');
      return;
    }

    if (files.some(f => f.id !== editingItem.id && f.path.toLowerCase() === renamedPath.toLowerCase())) {
      setPathError('Another item already exists with this path.');
      return;
    }

    onUpdateFiles(
      files.map(f => (f.id === editingItem.id ? { ...f, path: renamedPath.trim(), isCustom: true } : f))
    );
    setEditingItem(null);
    setRenamedPath('');
    setPathError(null);
  };

  // Trigger AI plan revision
  const handleTriggerRevision = () => {
    if (!aiInstruction.trim()) return;
    setIsRevising(true);
    setTimeout(() => {
      onRevisePlan(aiInstruction);
      setAiInstruction('');
      setIsRevising(false);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header & Actions Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-indigo-400" />
            <span>Planned Structure & Folder Manifest</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Preview, add, remove, or rename planned directories and starter files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewPath('');
              setNewDescription('');
              setPathError(null);
              setShowAddModal(true);
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Item</span>
          </button>
          <button
            onClick={onResetToRecommended}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            title="Restore AI Architect recommended layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Blueprint</span>
          </button>
        </div>
      </div>

      {/* 2. Natural-Language Architecture Revision Input */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ask Architect to Revise Structure</span>
          </span>
          <span className="text-[10px] text-slate-500">e.g., "Move all API logic into a services folder"</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiInstruction}
            onChange={e => setAiInstruction(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTriggerRevision()}
            placeholder="Type architectural adjustment (e.g., Keep simple, add auth context, separate client/server)..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            onClick={handleTriggerRevision}
            disabled={!aiInstruction.trim() || isRevising}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
          >
            {isRevising ? 'Revising...' : 'Revise Plan'}
          </button>
        </div>
      </div>

      {/* 3. Interactive File & Folder Manifest Tree */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col max-h-[300px]">
        <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>{files.length} planned files / directories</span>
          <span className="text-indigo-400">Architecture: {plan.complexity.toUpperCase()}</span>
        </div>

        <div className="p-2 overflow-y-auto space-y-1 divide-y divide-slate-900">
          {files.map(file => (
            <div
              key={file.id}
              className={`p-2 rounded-lg flex items-center justify-between transition group ${
                selectedItem?.id === file.id
                  ? 'bg-indigo-600/20 border border-indigo-500/50'
                  : 'hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div
                className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                onClick={() => setSelectedItem(file)}
              >
                <FileCode
                  className={`w-4 h-4 shrink-0 ${
                    file.path.endsWith('.json')
                      ? 'text-amber-400'
                      : file.path.endsWith('.tsx') || file.path.endsWith('.ts')
                      ? 'text-cyan-400'
                      : file.path.endsWith('.md')
                      ? 'text-emerald-400'
                      : 'text-indigo-400'
                  }`}
                />
                <span className="font-mono text-xs text-slate-200 truncate">{file.path}</span>
                {file.isCustom && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                    custom
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                <span className="text-[10px] text-slate-500 mr-2 max-w-[200px] truncate hidden md:inline">
                  {file.description}
                </span>

                <button
                  onClick={() => {
                    setEditingItem(file);
                    setRenamedPath(file.path);
                    setPathError(null);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Rename path"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleRemoveItem(file.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded"
                  title="Remove from plan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Edit/Rename Modal Inline Panel */}
      {editingItem && (
        <div className="p-3 bg-slate-900 border border-indigo-500/40 rounded-xl flex flex-col gap-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Rename Planned Item</span>
            <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={renamedPath}
              onChange={e => {
                setRenamedPath(e.target.value);
                setPathError(null);
              }}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
            />
            <button
              onClick={handleSaveRename}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold"
            >
              Save
            </button>
          </div>
          {pathError && <span className="text-[11px] text-rose-400">{pathError}</span>}
        </div>
      )}

      {/* 5. Add Item Modal */}
      {showAddModal && (
        <div className="p-3 bg-slate-900 border border-cyan-500/40 rounded-xl flex flex-col gap-2.5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Add New File or Folder</span>
            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Relative Path (e.g. src/utils/helpers.ts)</label>
              <input
                type="text"
                value={newPath}
                onChange={e => {
                  setNewPath(e.target.value);
                  setPathError(null);
                }}
                placeholder="src/components/MyComponent.tsx"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Description</label>
              <input
                type="text"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Brief purpose..."
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
              />
            </div>
          </div>
          {pathError && <span className="text-[11px] text-rose-400">{pathError}</span>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNewItem}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold"
            >
              Add Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
