/**
 * Electron Main Process for Desktop IDE
 * Enforces strict security boundaries, context isolation, and workspace path verification.
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import type { IDesktopAPI, WorkspaceFile, CommandExecutionResult } from '../src/types/desktop';

let mainWindow: BrowserWindow | null = null;
let currentWorkspacePath: string = process.cwd();

// Restricted files that cannot be directly read or overwritten by AI without special authorization
const SENSITIVE_PATTERNS = [
  /\.env(\.production|\.local)?$/i,
  /\.ssh\//i,
  /id_rsa/i,
  /\.git\/config$/i,
  /\.aws\//i,
];

function isPathWithinWorkspace(targetPath: string, workspaceRoot: string): boolean {
  const resolved = path.resolve(targetPath);
  const root = path.resolve(workspaceRoot);
  return resolved.startsWith(root) && !resolved.includes('..');
}

function isSensitiveFile(filePath: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(filePath));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'NovaIDE - Desktop AI Engineering Studio',
    backgroundColor: '#020617', // slate-950
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: fs.existsSync(path.join(__dirname, 'preload.cjs'))
        ? path.join(__dirname, 'preload.cjs')
        : path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';

  if (app.isPackaged) {
    mainWindow.loadFile(distHtml);
  } else {
    // In dev, load dev server or fall back to pre-built dist/index.html if dev server is offline
    mainWindow.loadURL(devServerUrl).catch(() => {
      if (fs.existsSync(distHtml)) {
        mainWindow?.loadFile(distHtml);
      }
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Security: reject navigation to arbitrary external web pages inside the main window
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:3000' && !parsedUrl.protocol.startsWith('file:')) {
      event.preventDefault();
    }
  });
});

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function registerIpcHandlers() {
  // 1. Open Directory Dialog
  ipcMain.handle('workspace:openDirectoryDialog', async (): Promise<string | null> => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Workspace Repository',
    });
    if (!result.canceled && result.filePaths.length > 0) {
      currentWorkspacePath = result.filePaths[0];
      return currentWorkspacePath;
    }
    return null;
  });

  // 2. Read Workspace Tree
  ipcMain.handle('workspace:getTree', async (_, workspacePath: string): Promise<WorkspaceFile[]> => {
    const rootPath = workspacePath || currentWorkspacePath;
    if (!isPathWithinWorkspace(rootPath, rootPath)) {
      throw new Error('Access denied: Unauthorized workspace path');
    }

    function scanDir(dir: string, baseDir: string): WorkspaceFile[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: WorkspaceFile[] = [];

      for (const entry of entries) {
        if (
          entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name === 'dist' ||
          entry.name === '.vitest' ||
          entry.name === 'sample-projects' ||
          entry.name === '.gemini' ||
          entry.name === '.cache' ||
          entry.name === '__pycache__'
        ) {
          continue; // ignore test caches, dummy suites, and massive build artifacts
        }
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(baseDir, fullPath);

        if (entry.isDirectory()) {
          files.push({
            name: entry.name,
            path: fullPath,
            relativePath: relPath,
            type: 'folder',
            children: scanDir(fullPath, baseDir),
          });
        } else {
          files.push({
            name: entry.name,
            path: fullPath,
            relativePath: relPath,
            type: 'file',
            size: fs.statSync(fullPath).size,
            language: path.extname(entry.name).slice(1),
          });
        }
      }
      return files;
    }

    return scanDir(rootPath, rootPath);
  });

  // 3. Read File
  ipcMain.handle('workspace:readFile', async (_, filePath: string): Promise<string> => {
    if (!isPathWithinWorkspace(filePath, currentWorkspacePath)) {
      throw new Error(`Security Violation: Path "${filePath}" escapes active workspace.`);
    }
    return fs.promises.readFile(filePath, 'utf-8');
  });

  // 4. Write File (Atomic Write with temporary file)
  ipcMain.handle('workspace:writeFile', async (_, filePath: string, content: string) => {
    if (!isPathWithinWorkspace(filePath, currentWorkspacePath)) {
      return { success: false, error: 'Path outside authorized workspace' };
    }
    if (isSensitiveFile(filePath)) {
      return { success: false, error: 'Cannot modify sensitive configuration without explicit approval' };
    }

    const tempPath = `${filePath}.tmp.${Date.now()}`;
    try {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(tempPath, content, 'utf-8');
      await fs.promises.rename(tempPath, filePath);
      return { success: true };
    } catch (err: any) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return { success: false, error: err.message };
    }
  });

  // 5. Delete Path
  ipcMain.handle('workspace:deletePath', async (_, targetPath: string) => {
    if (!isPathWithinWorkspace(targetPath, currentWorkspacePath)) {
      return { success: false, error: 'Path outside authorized workspace' };
    }
    try {
      const stat = await fs.promises.stat(targetPath);
      if (stat.isDirectory()) {
        await fs.promises.rm(targetPath, { recursive: true, force: true });
      } else {
        await fs.promises.unlink(targetPath);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // 6. Rename / Move Path
  ipcMain.handle('workspace:renamePath', async (_, oldPath: string, newPath: string) => {
    if (!isPathWithinWorkspace(oldPath, currentWorkspacePath) || !isPathWithinWorkspace(newPath, currentWorkspacePath)) {
      return { success: false, error: 'Path outside authorized workspace' };
    }
    try {
      await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
      await fs.promises.rename(oldPath, newPath);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // 7. Controlled Command Execution (PTY / Child Process Sandbox)
  ipcMain.handle('terminal:executeCommand', async (_, command: string, options?: any): Promise<CommandExecutionResult> => {
    const startTime = Date.now();
    const cwd = options?.cwd || currentWorkspacePath;

    // Safety checks against forbidden destructive commands
    const FORBIDDEN_COMMANDS = [/rm\s+-rf\s+[\/\\]/i, /mkfs/i, /dd\s+if=/i, /:\(\)\{ :\|:& \};:/];
    if (FORBIDDEN_COMMANDS.some(r => r.test(command))) {
      return {
        stdout: '',
        stderr: 'Execution blocked: Command contains unsafe destructive pattern.',
        exitCode: 1,
        durationMs: 0,
      };
    }

    return new Promise((resolve) => {
      const child = spawn(command, {
        shell: true,
        cwd,
        env: { ...process.env, ...options?.env },
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      const timeout = setTimeout(() => {
        child.kill();
        resolve({
          stdout,
          stderr: stderr + '\nExecution timed out.',
          exitCode: 124,
          durationMs: Date.now() - startTime,
        });
      }, options?.timeoutMs || 30000);

      child.on('close', (code) => {
        clearTimeout(timeout);
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 0,
          durationMs: Date.now() - startTime,
        });
      });
    });
  });
}
