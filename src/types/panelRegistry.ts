import React from 'react';

export type PanelLocation = 'left' | 'right' | 'bottom' | 'editor';

export interface PanelDefinition {
  id: string;
  title: string;
  location: PanelLocation;
  defaultVisible: boolean;
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
  icon?: string;
  description?: string;
  badge?: () => string | number | undefined;
}

export interface PanelRegistryState {
  panels: Record<string, PanelDefinition>;
}
