export interface AutomationAction {
  id: string;
  target: 'browser' | 'ios' | 'android' | 'desktop';
  action: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'blocked';
  output?: string;
  blockedReason?: string;
}

export class AutomationToolService {
  private static domainAllowlist: string[] = ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://openrouter.ai', 'https://github.com'];
  private static killSwitchActive: boolean = false;

  public static isKillSwitchEngaged(): boolean {
    return this.killSwitchActive;
  }

  public static toggleKillSwitch(engage: boolean): void {
    this.killSwitchActive = engage;
  }

  public static getMobilePlatformStatus(): {
    android: { status: 'supported'; message: string };
    ios: { status: 'blocked'; message: string };
  } {
    const isWin = typeof navigator !== 'undefined' ? navigator.platform.includes('Win') : process.platform === 'win32';

    return {
      android: {
        status: 'supported',
        message: 'Android SDK & ADB emulator automation supported on Windows host.',
      },
      ios: {
        status: 'blocked',
        message: isWin
          ? 'Blocked: iOS Simulator (xcrun simctl) requires macOS host. Remote macOS build node required.'
          : 'Supported on macOS host.',
      },
    };
  }

  public static async executeBrowserAction(action: 'navigate' | 'screenshot' | 'click' | 'type', urlOrSelector: string): Promise<{ success: boolean; data?: string; error?: string }> {
    if (this.killSwitchActive) {
      return { success: false, error: 'Automation Kill-Switch is active. Action aborted.' };
    }

    if (action === 'navigate') {
      const isAllowed = this.domainAllowlist.some(d => urlOrSelector.startsWith(d));
      if (!isAllowed) {
        return { success: false, error: `Domain rejected: "${urlOrSelector}" is not on the secure domain allowlist.` };
      }
      return { success: true, data: `Navigated to ${urlOrSelector} in isolated headless browser sandbox.` };
    }

    return { success: true, data: `Simulated browser action: ${action} on ${urlOrSelector}` };
  }
}
