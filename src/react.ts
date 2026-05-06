import {
  Hint,
  Tour,
  FormulaBlock,
  DocButton,
  VideoPanel,
  SidebarOverlay,
  SidebarPush,
  HelpPanel,
  HelpPanelProvider,
} from './components';

export * from './components';
export type { HintContent, HintProps, FormulaConfig } from './components/Hint/Hint.types';
export type { TourStep, TourLocale, TourProps, TourHandle } from './components/Tour/Tour.types';
export type {
  FormulaBlockProps,
  FormulaHTMLProps,
  FormulaObjectProps,
  FormulaVariable,
} from './components/FormulaBlock/FormulaBlock.types';
export type { DocItem, DocButtonProps } from './components/DocButton/DocButton.types';
export type { VideoPanelProps, VideoSource } from './components/VideoPanel/VideoPanel.types';
export type { SidebarOverlayProps } from './components/SidebarOverlay/SidebarOverlay.types';
export type { SidebarPushProps } from './components/SidebarPush/SidebarPush.types';
export type { SidebarSection } from './components/Sidebar/types';

export const GK = {
  Hint,
  Tour,
  FormulaBlock,
  DocButton,
  VideoPanel,
  SidebarOverlay,
  SidebarPush,
  HelpPanel,
  HelpPanelProvider,
} as const;
