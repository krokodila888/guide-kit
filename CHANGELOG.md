# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-04-11

### Added
- **Vue 3 adapter** (`guide-kit/vue`): 7 components (`GkHint`, `GkTour`, `GkFormulaBlock`,
  `GkDocButton`, `GkVideoPanel`, `GkSidebarOverlay`, `GkHelpPanel`), composables
  (`useHelpRegistry`, `useFloating`, `usePopoverState`, `useTrigger`), and full TypeScript
  types — all implemented as render-function components, no `.vue` files or Vite plugin required.

### Changed
- **`action` is now optional** in `HelpItem` / `HelpItemRegistration` across all adapters
  (React, Vue, Vanilla). Items that only toggle a mode no longer need a no-op `action: () => {}`.
- **Default `zIndex` for `SidebarOverlay` lowered from `9000` to `200`** across all adapters.
  The toggle tab no longer overlaps modal dialogs and application overlays. Override with the
  `zIndex` prop if a higher value is needed.
- **All built-in UI strings changed to English** (default prop values and hardcoded labels).
  Affected components: `Tour`, `HelpPanel`, `SidebarOverlay`, `SidebarPush`, `DocButton`,
  `VideoPanel`, `FormulaBlock`, `Hint`, `Sidebar`. Russian-language projects can restore
  previous behaviour by passing locale/label props explicitly.

### Fixed
- `GkTour` (Vue): removed language-detection hack `locale.next === 'Next' ? 'Step' : 'Шаг'`;
  step counter now always uses `'Step'` as the prefix.

---

## [1.0.0] - 2026-04-11

### Added
- **React adapter** (`guide-kit/react`): `Hint`, `Tour`, `FormulaBlock`, `DocButton`,
  `VideoPanel`, `SidebarOverlay`, `SidebarPush`, `HelpPanel`, `HelpPanelProvider`,
  `useHelpPanel`, `useHelpRegistry`.
- **Vanilla JS adapter** (`guide-kit/vanilla`): `createHint`, `createTour`,
  `createFormulaBlock`, `createDocButton`, `createVideoPanel`, `createSidebar`,
  `createHelpPanel`.
- **Core** (`guide-kit`): `HelpRegistry`, `HelpStorage`, positioning and overlay utilities.
- `@floating-ui/dom` integration for all popover/tour positioning (`strategy: 'fixed'`).
- `OverlayManager` — SVG-mask spotlight for Tour step highlighting with `autoUpdate` tracking.
- `HelpRegistry` — static singleton for cross-component help item registration.
- `HelpStorage` — localStorage persistence for `HelpPanel` toggle state.
