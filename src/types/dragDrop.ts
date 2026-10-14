/**
 * Drag and Drop typed contracts for Explorer-to-Editor interactions in NovaIDE
 */

export const FILE_DRAG_MIME = 'application/x-novaide-file';

export interface FileDragPayload {
  path: string;
  relativePath: string;
  workspaceId: string;
  type: 'file';
  size?: number;
  language?: string;
}

export interface FileDragState {
  active: boolean;
  sourcePath?: string;
  sourceWorkspaceId?: string;
  isOverEditor?: boolean;
  targetGroupId?: number;
}
