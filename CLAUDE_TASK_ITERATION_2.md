# Задание для Claude Code — guide-kit, Итерация 2

Ты продолжаешь разработку npm-библиотеки `guide-kit`.
Итерация 1 уже выполнена: в `src/` есть ядро (positioning, overlay),
компоненты Hint, Tour, FormulaBlock, DocButton и оба entrypoint.

Перед началом работы:
1. Прочитай `src/react.ts` и `src/index.ts` — изучи текущую структуру экспортов.
2. Прочитай `src/components/DocButton/DocButton.tsx` — VideoPanel будет
   использовать схожий паттерн для inline-варианта.
3. Прочитай `src/components/Hint/Hint.tsx` — изучи как реализован портал
   и управление состоянием, SidebarOverlay использует тот же подход.
4. Запусти `npm run build` и убедись, что итерация 1 собирается без ошибок.

═══════════════════════════════════════════════════════
ШАГ 1: Компонент VideoPanel
═══════════════════════════════════════════════════════

Создай `src/components/VideoPanel/VideoPanel.tsx` и `VideoPanel.types.ts`.

─────────────────────────────────────────────────────
Типы
─────────────────────────────────────────────────────

```ts
interface VideoSource {
  url: string           // embed URL или прямая ссылка
  title?: string        // отображается в заголовке карточки
  duration?: string     // «12:34» — на превью и в карточке
  thumbnail?: string    // URL превью-картинки
}

interface VideoPanelProps {
  source: VideoSource
  mode?: 'embed' | 'link'      // default: 'embed'
  aspectRatio?: '16/9' | '4/3' // default: '16/9'
  width?: number | string       // default: '100%'
  allowFullscreen?: boolean     // только embed, default: true
  linkText?: string             // только link, default: 'Смотреть видео'
  className?: string
  style?: React.CSSProperties
}
```

─────────────────────────────────────────────────────
Реализация mode='embed'
─────────────────────────────────────────────────────

Рендери контейнер с заданным соотношением сторон через padding-bottom trick
или aspect-ratio CSS (aspect-ratio: 16/9 или 4/3).

Внутри — `<iframe>` с:
  src={source.url}
  title={source.title ?? 'Видео'}
  style={{ border: 'none', width: '100%', height: '100%' }}
  allowFullScreen={allowFullscreen}
  loading="lazy"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media;
         gyroscope; picture-in-picture"

Если передан source.title — рендери строку-заголовок над iframe:
  иконка видео (inline SVG) + текст + duration справа (если есть).

─────────────────────────────────────────────────────
Реализация mode='link'
─────────────────────────────────────────────────────

Рендери карточку-превью. Структура:

  [превью-область]
    если thumbnail: <img src={thumbnail} alt={title} />
    если нет thumbnail: серый прямоугольник с иконкой Play по центру
    duration поверх превью в правом нижнем углу (тёмный бейдж)
  [нижняя часть карточки]
    title (если есть)
    ссылка: <a href={url} target="_blank" rel="noopener noreferrer">
      иконка + linkText
    </a>

Карточка — белый фон, border, border-radius через --gk-radius,
тень через --gk-shadow. Без внешних зависимостей.

─────────────────────────────────────────────────────
Иконки (inline SVG, без зависимостей)
─────────────────────────────────────────────────────

Play-иконка (заполненный треугольник):
```tsx
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
)
```

Иконка внешней ссылки (стрелка):
```tsx
const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
```

═══════════════════════════════════════════════════════
ШАГ 2: Компонент SidebarOverlay
═══════════════════════════════════════════════════════

Создай `src/components/SidebarOverlay/SidebarOverlay.tsx` и `.types.ts`.

─────────────────────────────────────────────────────
Типы
─────────────────────────────────────────────────────

```ts
// Типы секций контента
type SidebarSectionType = 'text' | 'steps' | 'checklist' | 'doc' | 'video' | 'formula'

interface SidebarSectionBase {
  id?: string
  title?: string
  collapsible?: boolean   // default: false
  defaultOpen?: boolean   // для collapsible, default: true
}

interface TextSection extends SidebarSectionBase {
  type: 'text'
  content: string | React.ReactNode
}

interface StepsSection extends SidebarSectionBase {
  type: 'steps'
  steps: Array<{
    label: string
    description?: string
    done?: boolean  // отметка выполненного шага
  }>
}

interface ChecklistSection extends SidebarSectionBase {
  type: 'checklist'
  items: Array<{ id: string; label: string; checked?: boolean }>
  onItemChange?: (id: string, checked: boolean) => void
}

interface DocSection extends SidebarSectionBase {
  type: 'doc'
  // передаются те же props что DocButton
  docs: DocItem | DocItem[]
}

interface VideoSection extends SidebarSectionBase {
  type: 'video'
  // передаются те же props что VideoPanel
  source: VideoSource
  mode?: 'embed' | 'link'
}

interface FormulaSection extends SidebarSectionBase {
  type: 'formula'
  // передаются те же props что FormulaBlock
  formula: FormulaHTMLProps | FormulaObjectProps
}

type SidebarSection =
  | TextSection | StepsSection | ChecklistSection
  | DocSection  | VideoSection | FormulaSection

interface SidebarOverlayProps {
  sections: SidebarSection[]
  open: boolean
  onClose: () => void
  title?: string
  side?: 'left' | 'right'       // default: 'left'
  width?: number | string        // default: 320
  showToggleButton?: boolean     // встроенная кнопка-триггер, default: true
  toggleButtonLabel?: string     // default: 'Учебные материалы'
  backdrop?: boolean             // затемнение фона, default: false
  zIndex?: number                // default: 9000
  className?: string
  style?: React.CSSProperties
}
```

─────────────────────────────────────────────────────
Реализация
─────────────────────────────────────────────────────

Сайдбар рендерится через `React.createPortal` в `document.body`.
Позиция: `position: fixed`, `top: 0`, `bottom: 0`,
  `left: 0` или `right: 0` в зависимости от `side`.
Ширина: `width` prop.
z-index: `zIndex` prop.
Фон: белый (`--gk-bg`), тень (`--gk-shadow`), нет border-radius.

Анимация открытия/закрытия:
  transform: translateX(-100%) → translateX(0) для side='left'
  transform: translateX(100%)  → translateX(0) для side='right'
  transition: transform 0.25s ease
  Управляй через CSS-класс или inline style на основе `open`.

Структура сайдбара:
  [шапка]
    title (если есть)
    кнопка закрытия ✕ справа
    разделитель

  [тело — скроллируемое]
    список секций, каждая секция:
      если collapsible: раскрывающийся блок с заголовком и стрелкой
      иначе: просто содержимое с опциональным заголовком

  [кнопка-триггер — если showToggleButton=true]
    position: fixed, выступает сбоку от сайдбара
    при side='left': right края сайдбара, вертикально по центру
    при side='right': left края сайдбара, вертикально по центру
    Кнопка вертикальная (writing-mode: vertical-rl или rotate)
    текст: toggleButtonLabel
    при open: кнопка скрыта или показывает «✕ Закрыть»

Если backdrop=true: при открытом сайдбаре рендери полупрозрачный
  div поверх страницы (position:fixed, inset:0, z-index: zIndex-1,
  background: rgba(0,0,0,0.3)), клик по нему вызывает onClose.

─────────────────────────────────────────────────────
Рендеринг секций
─────────────────────────────────────────────────────

type='text':
  Если content — строка: <p> с white-space:pre-wrap.
  Если ReactNode: рендери как есть.

type='steps':
  Нумерованный список. Каждый шаг:
    кружок с номером (фон --gk-primary, белый текст)
    label жирным
    description серым под ним (если есть)
    если done=true: кружок зелёный с галочкой, label с opacity 0.6

type='checklist':
  Список чекбоксов. Каждый item:
    <input type="checkbox" checked={item.checked}
           onChange={e => onItemChange?.(item.id, e.target.checked)} />
    label рядом
  Состояние checked управляется снаружи через onItemChange.
  Внутреннего состояния нет — компонент uncontrolled по умолчанию,
  но если onItemChange не передан — используй внутренний useState.

type='doc':
  Рендери <DocButton docs={section.docs} /> напрямую.

type='video':
  Рендери <VideoPanel source={section.source} mode={section.mode} />.

type='formula':
  Рендери <FormulaBlock {...section.formula} />.

═══════════════════════════════════════════════════════
ШАГ 3: Компонент SidebarPush
═══════════════════════════════════════════════════════

Создай `src/components/SidebarPush/SidebarPush.tsx` и `.types.ts`.

─────────────────────────────────────────────────────
Типы
─────────────────────────────────────────────────────

```ts
interface SidebarPushProps {
  // Те же sections, title, side, width, showToggleButton,
  // toggleButtonLabel что и в SidebarOverlay.
  // Отличия:
  sections: SidebarSection[]   // импортировать тип из SidebarOverlay.types
  open: boolean
  onClose: () => void
  title?: string
  side?: 'left' | 'right'
  width?: number | string       // default: 320
  showToggleButton?: boolean
  toggleButtonLabel?: string
  animated?: boolean            // default: true
  containerSelector?: string    // CSS-селектор flex-контейнера
                                 // default: '[data-gk-container]'
  className?: string
  style?: React.CSSProperties
}
```

─────────────────────────────────────────────────────
Реализация
─────────────────────────────────────────────────────

В отличие от SidebarOverlay, SidebarPush НЕ использует portal.
Он рендерится inline — внутри flex-контейнера хост-приложения.

При монтировании компонент находит контейнер через containerSelector
(document.querySelector) и добавляет сайдбар как flex-child.

Но так как это React-компонент, реализуй проще:
SidebarPush рендерит сайдбар как обычный div, который должен быть
помещён разработчиком внутрь flex-контейнера:

```tsx
// Использование в хост-приложении:
<div data-gk-container style={{ display: 'flex', height: '100vh' }}>
  <SidebarPush open={open} onClose={() => setOpen(false)} sections={[...]} />
  <main style={{ flex: 1, overflow: 'auto' }}>
    {/* основной контент */}
  </main>
</div>
```

Стили сайдбара:
  position: relative (не fixed!)
  width: open ? width : 0
  overflow: hidden
  flex-shrink: 0
  transition: width 0.25s ease (если animated=true)
  height: 100%

Содержимое внутри — такое же как SidebarOverlay (шапка, тело, секции).
Внутренний div содержимого имеет фиксированную ширину равную width,
чтобы контент не сжимался при анимации закрытия.

Кнопка-триггер для SidebarPush:
  Не fixed, а абсолютно позиционированная относительно контейнера.
  Или просто: не реализовывай встроенную кнопку-триггер для SidebarPush —
  разработчик управляет open снаружи. Укажи это в JSDoc-комментарии.

─────────────────────────────────────────────────────
Общий код секций
─────────────────────────────────────────────────────

Логика рендеринга секций одинакова в обоих сайдбарах.
Вынеси её в отдельный файл:
  `src/components/Sidebar/SidebarContent.tsx`
  `src/components/Sidebar/SidebarSection.tsx`

SidebarOverlay и SidebarPush импортируют SidebarContent из этого файла.
Это исключает дублирование кода.

═══════════════════════════════════════════════════════
ШАГ 4: Обновить экспорты
═══════════════════════════════════════════════════════

Добавь в `src/react.ts`:

```ts
export { VideoPanel }   from './components/VideoPanel/VideoPanel'
export { SidebarOverlay } from './components/SidebarOverlay/SidebarOverlay'
export { SidebarPush }    from './components/SidebarPush/SidebarPush'
```

Добавь в `src/index.ts`:

```ts
export type * from './components/VideoPanel/VideoPanel.types'
export type * from './components/SidebarOverlay/SidebarOverlay.types'
export type * from './components/SidebarPush/SidebarPush.types'
```

═══════════════════════════════════════════════════════
ШАГ 5: Сборка и проверка
═══════════════════════════════════════════════════════

  npm run build

Убедись:
- Нет ошибок TypeScript
- dist/ обновился, все файлы присутствуют
- dist/react.mjs весит не более 55 кБ (добавились три новых компонента)
- Нет циклических импортов (tsup предупредит)

Если есть ошибки типов при импорте SidebarSection в SidebarPush —
реэкспортируй тип через общий файл src/components/Sidebar/types.ts
и импортируй из него в обоих компонентах.

═══════════════════════════════════════════════════════
ШАГ 6: Обновить README.md
═══════════════════════════════════════════════════════

Добавь в секцию Components описание трёх новых компонентов
с минимальным примером кода каждого:

VideoPanel:
  embed-пример с YouTube URL
  link-пример с thumbnail и title

SidebarOverlay:
  пример с двумя секциями: text и steps
  пример кнопки-триггера

SidebarPush:
  пример разметки flex-контейнера
  пример с checklist-секцией

═══════════════════════════════════════════════════════
ИТОГОВЫЙ ОТЧЁТ
═══════════════════════════════════════════════════════

После завершения выведи:
- Список созданных и изменённых файлов
- Размер dist/react.mjs после сборки
- Размер dist/react.js (CJS) после сборки
- Были ли вынесены общие части сайдбаров в SidebarContent — да/нет
- Любые отступления от плана и причины
- Что нужно сделать в итерации 3 (HelpPanel)
