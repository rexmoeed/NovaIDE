export type LayoutPreset = 
  | 'default' 
  | 'minimal'
  | 'developer'
  | 'ai'
  | 'debug' 
  | 'zen'
  | 'ai-dev' 
  | 'design' 
  | 'fullstack';

export interface PanelConstraints {
  minSize: number;
  maxSize: number;
  defaultSize: number;
}

export const PANEL_CONSTRAINTS: Record<string, PanelConstraints> = {
  primarySidebar: { minSize: 180, maxSize: 550, defaultSize: 260 },
  secondarySidebar: { minSize: 280, maxSize: 650, defaultSize: 340 },
  bottomPanel: { minSize: 120, maxSize: 650, defaultSize: 220 },
  preview: { minSize: 280, maxSize: 800, defaultSize: 420 },
};

export type SidebarPosition = 'left' | 'right';
export type EditorSplitOrientation = 'none' | 'vertical' | 'horizontal';
export type PanelFocusTarget = 'editor' | 'primarySidebar' | 'secondarySidebar' | 'terminal' | 'preview' | 'ai';

export interface EditorGroupState {
  id: string;
  activeTabId: string | null;
  tabIds: string[];
}

export interface IDEPanelConfig {
  activityBarVisible: boolean;
  primarySidebarVisible: boolean;
  primarySidebarPosition: SidebarPosition;
  primarySidebarWidth: number; // default 260, min 180, max 600
  secondarySidebarVisible: boolean; // AI Orchestrator / Secondary Views
  secondarySidebarPosition: SidebarPosition;
  secondarySidebarWidth: number; // default 340, min 240, max 700
  bottomPanelVisible: boolean;
  bottomPanelHeight: number; // default 240, min 100, max 550
  bottomPanelMaximized: boolean;
  editorSplit: EditorSplitOrientation;
  editorSplitRatio: number; // default 0.5, min 0.2, max 0.8
  activeEditorGroupIndex: number; // 0 or 1
  previewVisible: boolean;
  previewWidth: number; // default 420, min 280, max 800
  previewPosition: 'right' | 'bottom' | 'dock';
  isZenMode: boolean; // distraction-free
  currentPreset: LayoutPreset;
  focusedPanel: PanelFocusTarget;
}

export const DEFAULT_LAYOUT_CONFIG: IDEPanelConfig = {
  activityBarVisible: true,
  primarySidebarVisible: true,
  primarySidebarPosition: 'left',
  primarySidebarWidth: 260,
  secondarySidebarVisible: true,
  secondarySidebarPosition: 'right',
  secondarySidebarWidth: 340,
  bottomPanelVisible: true,
  bottomPanelHeight: 220,
  bottomPanelMaximized: false,
  editorSplit: 'none',
  editorSplitRatio: 0.5,
  activeEditorGroupIndex: 0,
  previewVisible: false,
  previewWidth: 420,
  previewPosition: 'right',
  isZenMode: false,
  currentPreset: 'default',
  focusedPanel: 'editor',
};
