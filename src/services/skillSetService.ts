import { SkillDefinition } from '../types/kos';

const SKILLS_STORAGE_KEY = 'nova_skill_sets_v1';

export class SkillSetService {
  private static skills: SkillDefinition[] = [];

  static {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(SKILLS_STORAGE_KEY);
        if (stored) {
          this.skills = JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn('Failed to load skills:', e);
    }

    if (this.skills.length === 0) {
      this.skills = [
        {
          id: 'skill-code-review',
          name: 'code-review',
          description: 'Comprehensive static security, type-safety, and architecture checklist review.',
          version: '1.0.0',
          triggers: [
            { type: 'slash_command', pattern: '/review' },
            { type: 'intent', pattern: 'review my changes' },
          ],
          instructions: `Review the provided diff or active file against:
1. Input validation & prompt injection boundaries
2. Null pointer / unhandled promise dereferences
3. Performance regressions & excessive re-renders
4. Adherence to TypeScript strict mode`,
          allowedTools: ['read_file', 'grep_search', 'get_diagnostics'],
          enabled: true,
          scope: 'global',
          author: 'Nova IDE Core',
          createdAt: Date.now() - 3600000,
        },
        {
          id: 'skill-write-tests',
          name: 'write-tests',
          description: 'Generate clean Vitest unit tests covering edge cases and error handling.',
          version: '1.0.0',
          triggers: [
            { type: 'slash_command', pattern: '/tests' },
            { type: 'intent', pattern: 'write unit tests' },
          ],
          instructions: `For the target component or module:
1. Mock external network/filesystem calls
2. Test happy paths, boundary cases, and error states
3. Ensure 100% type coverage without 'any'`,
          allowedTools: ['read_file', 'create_file', 'run_tests'],
          enabled: true,
          scope: 'global',
          author: 'Nova IDE Core',
          createdAt: Date.now() - 3600000,
        },
        {
          id: 'skill-bug-triage',
          name: 'bug-triage',
          description: 'Analyze stack trace, localize culprit lines, and propose minimal patch.',
          version: '1.0.0',
          triggers: [
            { type: 'slash_command', pattern: '/debug' },
            { type: 'intent', pattern: 'fix this bug' },
          ],
          instructions: `Isolate failing component from error log:
1. Map error back to source line
2. Check recent git diff for culprit changes
3. Propose minimal working fix and verification command`,
          allowedTools: ['read_file', 'edit_file', 'run_command'],
          enabled: true,
          scope: 'global',
          author: 'Nova IDE Core',
          createdAt: Date.now() - 3600000,
        },
      ];
      this.persist();
    }
  }

  public static listSkills(): SkillDefinition[] {
    return [...this.skills];
  }

  public static toggleSkill(id: string, enabled: boolean): void {
    const s = this.skills.find(item => item.id === id);
    if (s) {
      s.enabled = enabled;
      this.persist();
    }
  }

  public static addSkill(skill: Omit<SkillDefinition, 'id' | 'createdAt'>): SkillDefinition {
    const newSkill: SkillDefinition = {
      ...skill,
      id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    this.skills.push(newSkill);
    this.persist();
    return newSkill;
  }

  public static findMatchingSkill(input: string): SkillDefinition | null {
    const trimmed = input.trim();
    for (const skill of this.skills) {
      if (!skill.enabled) continue;
      for (const t of skill.triggers) {
        if (t.type === 'slash_command' && trimmed.startsWith(t.pattern)) {
          return skill;
        }
        if (t.type === 'intent' && new RegExp(t.pattern, 'i').test(trimmed)) {
          return skill;
        }
      }
    }
    return null;
  }

  private static persist(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(this.skills));
      }
    } catch {}
  }
}
