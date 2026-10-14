import {
  TemplateDefinition,
  ProjectTypeCategory,
} from '../types/scaffolding';
import { allWebTemplates } from './templates/webTemplates';
import { allMobileTemplates } from './templates/mobileTemplates';
import { allBackendTemplates } from './templates/backendTemplates';
import { allFullstackTemplates } from './templates/fullstackTemplates';

/**
 * Universal Production Template Registry
 * Contains real, working starter templates across Web, Mobile, Backend, and Full-Stack domains.
 */
export class TemplateRegistry {
  private static templates: Map<string, TemplateDefinition> = new Map();

  static {
    // Register all web templates
    for (const t of allWebTemplates) {
      this.templates.set(t.id, t);
    }
    // Register all mobile templates
    for (const t of allMobileTemplates) {
      this.templates.set(t.id, t);
    }
    // Register all backend templates
    for (const t of allBackendTemplates) {
      this.templates.set(t.id, t);
    }
    // Register all fullstack templates
    for (const t of allFullstackTemplates) {
      this.templates.set(t.id, t);
    }
  }

  public static getAll(): TemplateDefinition[] {
    return Array.from(this.templates.values());
  }

  public static getByCategory(category: ProjectTypeCategory): TemplateDefinition[] {
    return this.getAll().filter(t => t.category === category);
  }

  public static getById(id: string): TemplateDefinition | undefined {
    return this.templates.get(id);
  }

  public static registerTemplate(template: TemplateDefinition) {
    this.templates.set(template.id, template);
  }
}
