import { DesignTokens } from '../types/agentHierarchy';

export interface ThemeConfig {
  id: 'dark' | 'light' | 'oceanic' | 'cyberpunk';
  name: string;
  tokens: DesignTokens;
  density: 'compact' | 'normal' | 'relaxed';
  accentColor: string;
}

export const DEFAULT_DARK_TOKENS: DesignTokens = {
  colors: {
    primary: '#4f46e5', // indigo-600
    secondary: '#1e293b', // slate-800
    surface: '#020617', // slate-950
    elevated: '#0f172a', // slate-900
    border: '#1e293b', // slate-800
    text: '#f8fafc', // slate-50
    textMuted: '#94a3b8', // slate-400
    accent: '#6366f1', // indigo-500
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: '#f43f5e', // rose-500
  },
  typography: {
    fontSans: 'Inter, system-ui, sans-serif',
    fontMono: 'JetBrains Mono, ui-monospace, monospace',
    scale: {
      xs: '11px',
      sm: '12px',
      base: '13px',
      lg: '15px',
      xl: '18px',
      '2xl': '22px',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
};

export const DEFAULT_LIGHT_TOKENS: DesignTokens = {
  colors: {
    primary: '#4f46e5',
    secondary: '#f1f5f9',
    surface: '#ffffff',
    elevated: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#6366f1',
    success: '#059669',
    warning: '#d97706',
    error: '#e11d48',
  },
  typography: DEFAULT_DARK_TOKENS.typography,
  spacing: DEFAULT_DARK_TOKENS.spacing,
  radii: DEFAULT_DARK_TOKENS.radii,
};

export class DesignSystemEngine {
  private currentTheme: ThemeConfig = {
    id: 'dark',
    name: 'Obsidian Studio Dark',
    tokens: DEFAULT_DARK_TOKENS,
    density: 'normal',
    accentColor: '#6366f1',
  };

  public getTheme(): ThemeConfig {
    return this.currentTheme;
  }

  public setTheme(themeId: ThemeConfig['id']) {
    this.currentTheme.id = themeId;
    if (themeId === 'light') {
      this.currentTheme.tokens = DEFAULT_LIGHT_TOKENS;
      this.currentTheme.name = 'Pristine Studio Light';
    } else {
      this.currentTheme.tokens = DEFAULT_DARK_TOKENS;
      this.currentTheme.name = 'Obsidian Studio Dark';
    }
  }

  public setDensity(density: ThemeConfig['density']) {
    this.currentTheme.density = density;
  }

  public setAccentColor(hex: string) {
    this.currentTheme.accentColor = hex;
    this.currentTheme.tokens.colors.accent = hex;
    this.currentTheme.tokens.colors.primary = hex;
  }

  /**
   * Calculates WCAG contrast ratio between text and background color
   */
  public calculateContrast(fgHex: string, bgHex: string): number {
    const getLuminance = (hex: string) => {
      const rgb = parseInt(hex.replace('#', ''), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    try {
      const l1 = getLuminance(fgHex);
      const l2 = getLuminance(bgHex);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      return Math.round(ratio * 10) / 10;
    } catch {
      return 7.5; // fallback high contrast
    }
  }
}

export const GlobalDesignEngine = new DesignSystemEngine();
