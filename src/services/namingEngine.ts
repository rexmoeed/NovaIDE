/**
 * Production Naming Convention Engine
 * Enforces language- and framework-specific file, folder, and symbol conventions.
 */

export class NamingEngine {
  private static RESERVED_NAMES = new Set([
    'node_modules',
    'con',
    'prn',
    'aux',
    'nul',
    'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
    'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9',
    '.git',
    '.env',
  ]);

  /**
   * Validates a project name for filesystem, package manager, and safety standards
   */
  public static validateProjectName(name: string): { valid: boolean; error?: string } {
    if (!name || !name.trim()) {
      return { valid: false, error: 'Project name cannot be empty.' };
    }

    const trimmed = name.trim();

    if (trimmed.length > 100) {
      return { valid: false, error: 'Project name cannot exceed 100 characters.' };
    }

    if (this.RESERVED_NAMES.has(trimmed.toLowerCase())) {
      return { valid: false, error: `"${trimmed}" is a reserved system name. Please choose another.` };
    }

    // Check invalid characters for cross-platform filesystems
    if (/[<>:"/\\|?*\x00-\x1F]/.test(trimmed)) {
      return { valid: false, error: 'Project name contains invalid characters (<, >, :, ", /, \\, |, ?, *).' };
    }

    if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
      return { valid: false, error: 'Project name cannot start or end with a period.' };
    }

    if (trimmed.startsWith(' ') || trimmed.endsWith(' ')) {
      return { valid: false, error: 'Project name cannot start or end with a space.' };
    }

    return { valid: true };
  }

  /**
   * Validates a relative file/folder path inside the project
   */
  public static validateRelativePath(pathStr: string): { valid: boolean; error?: string } {
    if (!pathStr || !pathStr.trim()) {
      return { valid: false, error: 'Path cannot be empty.' };
    }

    const normalized = pathStr.replace(/\\/g, '/').trim();

    if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
      return { valid: false, error: 'Path must be relative to the project root (no leading slash or drive letter).' };
    }

    // Check directory traversal
    const segments = normalized.split('/');
    if (segments.some(seg => seg === '..' || seg === '.')) {
      return { valid: false, error: 'Path traversal (".." or ".") is prohibited.' };
    }

    if (segments.some(seg => !seg && seg !== '')) {
      return { valid: false, error: 'Empty path segments detected.' };
    }

    for (const seg of segments) {
      if (/[<>:"|?*\x00-\x1F]/.test(seg)) {
        return { valid: false, error: `Invalid character in path segment: "${seg}".` };
      }
      if (this.RESERVED_NAMES.has(seg.toLowerCase())) {
        return { valid: false, error: `"${seg}" is a reserved name.` };
      }
    }

    return { valid: true };
  }

  /**
   * Convert string to PascalCase (e.g. "task card" -> "TaskCard")
   */
  public static toPascalCase(str: string): string {
    return str
      .replace(/[-_.\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^[a-z]/, c => c.toUpperCase());
  }

  /**
   * Convert string to camelCase (e.g. "task service" -> "taskService")
   */
  public static toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  /**
   * Convert string to kebab-case (e.g. "TaskCard" -> "task-card")
   */
  public static toKebabCase(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_.]+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert string to snake_case (e.g. "TaskCard" -> "task_card")
   */
  public static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[\s\-.]+/g, '_')
      .toLowerCase();
  }

  /**
   * Formats a file name according to language and framework standards
   */
  public static formatFileName(
    name: string,
    type: 'react-component' | 'react-hook' | 'ts-service' | 'ts-type' | 'css-module' | 'python' | 'dart' | 'go' | 'rust' | 'java'
  ): string {
    const raw = name.replace(/\.[a-zA-Z0-9]+$/, ''); // strip existing extension

    switch (type) {
      case 'react-component':
        return `${this.toPascalCase(raw)}.tsx`;
      case 'react-hook': {
        const camel = this.toCamelCase(raw);
        return camel.startsWith('use') ? `${camel}.ts` : `use${this.toPascalCase(raw)}.ts`;
      }
      case 'ts-service':
        return `${this.toCamelCase(raw)}.ts`;
      case 'ts-type':
        return `${this.toCamelCase(raw)}.ts`;
      case 'css-module':
        return `${this.toPascalCase(raw)}.module.css`;
      case 'python':
        return `${this.toSnakeCase(raw)}.py`;
      case 'dart':
        return `${this.toSnakeCase(raw)}.dart`;
      case 'go':
        return `${this.toSnakeCase(raw)}.go`;
      case 'rust':
        return `${this.toSnakeCase(raw)}.rs`;
      case 'java':
        return `${this.toPascalCase(raw)}.java`;
      default:
        return name;
    }
  }

  /**
   * Analyzes an existing project's files to detect prevailing conventions
   */
  public static detectConventions(files: string[]): {
    componentCase: 'PascalCase' | 'kebab-case';
    featureFolderCase: 'kebab-case' | 'camelCase';
    styleConvention: 'tailwind' | 'css-modules' | 'styled-components';
  } {
    let pascalComponents = 0;
    let kebabComponents = 0;

    for (const f of files) {
      const fileName = f.split('/').pop() || '';
      if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
        if (/^[A-Z][a-zA-Z0-9]+\.(tsx|jsx)$/.test(fileName)) {
          pascalComponents++;
        } else if (/^[a-z0-9-]+\.(tsx|jsx)$/.test(fileName)) {
          kebabComponents++;
        }
      }
    }

    const hasTailwind = files.some(f => f.includes('tailwind.config') || f.includes('index.css'));
    const hasCssModules = files.some(f => f.includes('.module.css') || f.includes('.module.scss'));

    return {
      componentCase: pascalComponents >= kebabComponents ? 'PascalCase' : 'kebab-case',
      featureFolderCase: 'kebab-case',
      styleConvention: hasTailwind ? 'tailwind' : hasCssModules ? 'css-modules' : 'tailwind',
    };
  }
}
