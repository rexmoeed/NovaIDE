/**
 * Electron Secure Preload Script
 * Exposes strictly typed, narrowly scoped IPC methods to the renderer.
 * Context isolation is enabled; Node.js integration is disabled.
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { IDesktopAPI } from '../src/types/desktop';

const desktopAPI: IDesktopAPI = {
  isElectron: true,
  platform: process.platform as 'darwin' | 'win32' | 'linux',

  openDirectoryDialog: () => ipcRenderer.invoke('workspace:openDirectoryDialog'),
  getWorkspaceTree: (workspacePath: string) => ipcRenderer.invoke('workspace:getTree', workspacePath),
  readFile: (filePath: string) => ipcRenderer.invoke('workspace:readFile', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('workspace:writeFile', filePath, content),
  createFile: (filePath: string, initialContent?: string) => ipcRenderer.invoke('workspace:createFile', filePath, initialContent),
  createDirectory: (dirPath: string) => ipcRenderer.invoke('workspace:createDirectory', dirPath),
  deletePath: (targetPath: string) => ipcRenderer.invoke('workspace:deletePath', targetPath),
  renamePath: (oldPath: string, newPath: string) => ipcRenderer.invoke('workspace:renamePath', oldPath, newPath),

  searchWorkspace: (query: string, options?: any) => ipcRenderer.invoke('workspace:search', query, options),
  executeCommand: (command: string, options?: any) => ipcRenderer.invoke('terminal:executeCommand', command, options),

  getGitStatus: (workspacePath: string) => ipcRenderer.invoke('git:status', workspacePath),
  getGitDiff: (workspacePath: string, filePath?: string) => ipcRenderer.invoke('git:diff', workspacePath, filePath),
  gitCommit: (workspacePath: string, message: string) => ipcRenderer.invoke('git:commit', workspacePath, message),

  checkPathAllowed: (filePath: string) => ipcRenderer.invoke('workspace:checkAllowed', filePath),
};

contextBridge.exposeInMainWorld('desktopAPI', desktopAPI);
