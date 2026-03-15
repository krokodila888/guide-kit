# guide-kit

`guide-kit` is a UI components library for user onboarding in engineering software. It provides lightweight, accessible, and customizable components to guide users through complex workflows — from inline parameter hints with formula support to multi-step guided tours with spotlight overlays. Built with TypeScript and React, it integrates seamlessly into engineering dashboards, CAD tools, and technical web applications. All components are zero-dependency on the React side and rely only on `@floating-ui/dom` for precise positioning.

## Installation

```bash
npm install guide-kit
```

React and ReactDOM are peer dependencies and must be installed separately:

```bash
npm install react react-dom
```

## Quick Start

### Hint

Wrap any element with `<Hint>` to show a contextual popover with parameter details:

```tsx
import { Hint } from 'guide-kit/react'

function MyComponent() {
  return (
    <Hint
      content={{
        title: 'Коэффициент запаса',
        description: 'Отношение предельной нагрузки к расчётной.',
        range: '1.2 – 2.5',
        unit: 'безразмерный',
        norm: 'ГОСТ 27751-2014',
      }}
      placement="right"
      trigger="hover"
    >
      <span>K = 1.5</span>
    </Hint>
  )
}
```

### Tour

Run a guided product tour across multiple DOM elements:

```tsx
import { useRef } from 'react'
import { Tour, useTour } from 'guide-kit/react'
import type { TourHandle } from 'guide-kit/react'

function App() {
  const tourRef = useRef<TourHandle>(null)
  const { start } = useTour(tourRef)

  const steps = [
    {
      target: '#step-one',
      title: 'Шаг 1',
      content: 'Введите значение нагрузки.',
      placement: 'bottom',
    },
    {
      target: '#step-two',
      title: 'Шаг 2',
      content: 'Выберите материал из каталога.',
      placement: 'right',
    },
  ]

  return (
    <>
      <button onClick={start}>Начать тур</button>
      <Tour
        ref={tourRef}
        steps={steps}
        run={false}
        onComplete={() => console.log('Tour done')}
        onSkip={() => console.log('Tour skipped')}
      />
    </>
  )
}
```

## Components

### `<Hint>`

Shows a contextual popover anchored to a child element. Supports hover and click triggers.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `HintContent \| string` | required | Popover content. Pass a string for simple text, or an object for structured content with title, range, norm, etc. |
| `trigger` | `'hover' \| 'click'` | `'hover'` | How the popover is opened |
| `placement` | `Placement` | `'right'` | Preferred floating placement (from `@floating-ui/dom`) |
| `children` | `React.ReactElement` | required | The element to anchor the hint to |

```tsx
<Hint content="This field represents pipeline pressure in bar." placement="top">
  <label>Pressure</label>
</Hint>
```

### `<Tour>`

A multi-step guided tour with a spotlight overlay. Uses `forwardRef` so you can control it imperatively.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `TourStep[]` | required | Array of tour steps |
| `run` | `boolean` | required | Whether the tour is running |
| `onComplete` | `() => void` | — | Called when the last step is finished |
| `onSkip` | `() => void` | — | Called when the tour is dismissed |
| `onStepChange` | `(index: number) => void` | — | Called on each step change |
| `spotlightPadding` | `number` | `8` | Padding around the spotlight cutout (px) |
| `overlayOpacity` | `number` | `0.65` | Opacity of the dark overlay |
| `locale` | `Partial<TourLocale>` | — | Override button labels |

Use `useTour(ref)` for a convenience hook that exposes `start`, `stop`, and `goTo`.

```tsx
const tourRef = useRef<TourHandle>(null)
const { start, goTo } = useTour(tourRef)
```

Keyboard shortcuts: `→` / `Enter` — next, `←` — back, `Escape` — skip.

### `<FormulaBlock>`

Renders a mathematical formula inline with optional variable legend and source citation.

```tsx
import { FormulaBlock } from 'guide-kit/react'

// Fraction mode
<FormulaBlock
  mode="fraction"
  numerator="F"
  denominator="A"
  result="σ"
  variables={[
    { symbol: 'F', description: 'Сила', unit: 'Н' },
    { symbol: 'A', description: 'Площадь сечения', unit: 'м²' },
    { symbol: 'σ', description: 'Нормальное напряжение', unit: 'Па' },
  ]}
  source="СП 20.13330.2017"
/>

// HTML mode (for complex formulas)
<FormulaBlock
  mode="html"
  html="E = mc<sup>2</sup>"
/>
```

### `<DocButton>`

A download button (or inline link) for one or more documents.

```tsx
import { DocButton } from 'guide-kit/react'

// Single document
<DocButton
  docs={{ label: 'Руководство пользователя', url: '/docs/manual.pdf', fileType: 'pdf', size: '2.4 MB' }}
/>

// Multiple documents — renders a dropdown
<DocButton
  label="Нормативные документы"
  docs={[
    { label: 'ГОСТ 27751', url: '/docs/gost27751.pdf', fileType: 'pdf' },
    { label: 'Таблица нагрузок', url: '/docs/loads.xlsx', fileType: 'xlsx' },
  ]}
/>

// Inline link variant
<DocButton
  variant="inline"
  docs={{ label: 'Скачать отчёт', url: '/report.docx', fileType: 'docx' }}
/>
```

## Theming

All components use CSS custom properties for visual customisation. Override them globally or scoped to a container:

```css
:root {
  --gk-primary: #0f62fe;       /* Accent color (buttons, links, markers) */
  --gk-bg: #ffffff;            /* Popover / card background */
  --gk-text: #161616;          /* Primary text color */
  --gk-text-muted: #6f6f6f;    /* Secondary / muted text */
  --gk-border: #e0e0e0;        /* Border and formula background */
  --gk-radius: 6px;            /* Border radius */
  --gk-shadow: 0 2px 16px rgba(0, 0, 0, 0.16); /* Popover shadow */
  --gk-font: 'IBM Plex Sans', sans-serif; /* Font family */
}
```

Dark mode example:

```css
[data-theme="dark"] {
  --gk-bg: #1c1c1c;
  --gk-text: #f4f4f4;
  --gk-text-muted: #a8a8a8;
  --gk-border: #3d3d3d;
}
```

## TypeScript

All components and types are fully typed. Import types from `guide-kit/react` or from `guide-kit` (core/utility types only):

```ts
import type { HintContent, TourStep, TourHandle, FormulaBlockProps, DocItem } from 'guide-kit/react'
```

## License

MIT
