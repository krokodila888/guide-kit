import {
  defineComponent,
  h,
  ref,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  Teleport,
} from 'vue'
import { OverlayManager } from '../core/overlay'
import { autoUpdatePosition } from '../core/positioning'
import type { Placement } from '../core/positioning'
import type { TourStep, TourLocale } from './types'

const defaultLocale: TourLocale = {
  next: 'Next',
  back: 'Back',
  skip: 'Skip',
  done: 'Done',
  of:   'of',
}

export const GkTour = defineComponent({
  name: 'GkTour',
  props: {
    steps:           { type: Array,   required: true },
    run:             { type: Boolean, required: true },
    spotlightPadding: { type: Number, default: 8 },
    overlayOpacity:  { type: Number, default: 0.65 },
    locale:          { type: Object,  default: () => ({}) },
  },
  emits: ['complete', 'skip', 'step-change'],
  setup(props, { emit, expose }) {
    const isRunning   = ref(false)
    const currentStep = ref(-1)
    const popoverEl   = ref<HTMLElement | null>(null)
    const popX        = ref(0)
    const popY        = ref(0)
    let cleanupAutoUpdate: (() => void) | null = null

    function stop() {
      isRunning.value = false
      currentStep.value = -1
      OverlayManager.hide()
      cleanupAutoUpdate?.()
      cleanupAutoUpdate = null
    }

    async function showStep(index: number) {
      const steps = props.steps as TourStep[]
      if (index < 0 || index >= steps.length) { stop(); return }

      const step = steps[index]
      await step.beforeShow?.()

      const targetEl = document.querySelector(step.target) as HTMLElement | null
      if (!targetEl) { stop(); return }

      OverlayManager.show(targetEl, props.spotlightPadding as number, props.overlayOpacity as number)
      currentStep.value = index
      isRunning.value   = true
      emit('step-change', index)

      // Wait for popover to mount before positioning
      await nextTick()
      cleanupAutoUpdate?.()
      cleanupAutoUpdate = null
      if (popoverEl.value) {
        cleanupAutoUpdate = autoUpdatePosition(
          targetEl,
          popoverEl.value,
          (step.placement ?? 'bottom') as Placement,
          (pos) => { popX.value = pos.x; popY.value = pos.y },
        )
      }

      step.afterShow?.()
    }

    function start() { showStep(0) }
    function goTo(index: number) { showStep(index) }

    function next() {
      const steps = props.steps as TourStep[]
      if (currentStep.value < steps.length - 1) {
        showStep(currentStep.value + 1)
      } else {
        stop()
        emit('complete')
      }
    }

    function back() {
      if (currentStep.value > 0) showStep(currentStep.value - 1)
    }

    function skip() { stop(); emit('skip') }

    watch(() => props.run, (run) => { if (run) start(); else stop() })

    function onKeyDown(e: KeyboardEvent) {
      if (!isRunning.value) return
      if (e.key === 'ArrowRight' || e.key === 'Enter') next()
      else if (e.key === 'ArrowLeft') back()
      else if (e.key === 'Escape') skip()
    }
    onMounted(() => document.addEventListener('keydown', onKeyDown))
    onUnmounted(() => { document.removeEventListener('keydown', onKeyDown); stop() })

    expose({ start, stop, goTo })

    return () => {
      if (!isRunning.value || currentStep.value < 0) return null

      const steps  = props.steps as TourStep[]
      const step   = steps[currentStep.value]
      const locale = { ...defaultLocale, ...(props.locale as Partial<TourLocale>) }
      const isLast = currentStep.value === steps.length - 1
      const total  = steps.length
      const idx    = currentStep.value

      const popoverStyle = {
        position: 'fixed' as const,
        left:     `${popX.value}px`,
        top:      `${popY.value}px`,
        zIndex:   '10000',
        width:    '300px',
        background:   'var(--gk-bg, #ffffff)',
        color:        'var(--gk-text, #1f2937)',
        border:       '1px solid var(--gk-border, #e5e7eb)',
        borderRadius: 'var(--gk-radius, 8px)',
        boxShadow:    'var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12))',
        padding:      '16px 20px',
        fontFamily:   'var(--gk-font, inherit)',
      }

      const btnBase = {
        border:       'none',
        borderRadius: '6px',
        padding:      '7px 14px',
        fontSize:     '13px',
        fontWeight:   '500',
        cursor:       'pointer',
        fontFamily:   'inherit',
      }

      return h(Teleport, { to: 'body' }, [
        h('div', { ref: popoverEl, style: popoverStyle }, [
          // Progress
          h('div', { style: { fontSize: '12px', color: 'var(--gk-text-muted, #6b7280)', marginBottom: '8px' } },
            `Step ${idx + 1} ${locale.of} ${total}`),
          // Title
          step.title && h('div', { style: { fontWeight: '600', fontSize: '15px', marginBottom: '6px' } }, step.title),
          // Content
          h('div', { style: { fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' } }, step.content),
          // Navigation
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' } }, [
            // Skip
            h('button', {
              type: 'button',
              onClick: skip,
              style: { ...btnBase, background: 'transparent', color: 'var(--gk-text-muted, #6b7280)', padding: '7px 4px' },
            }, locale.skip),
            // Back / placeholder
            h('div', { style: { display: 'flex', gap: '8px' } }, [
              idx > 0 && h('button', {
                type: 'button',
                onClick: back,
                style: { ...btnBase, background: 'var(--gk-border, #e5e7eb)', color: 'var(--gk-text, #1f2937)' },
              }, locale.back),
              h('button', {
                type: 'button',
                onClick: next,
                style: { ...btnBase, background: 'var(--gk-primary, #2563eb)', color: '#fff' },
              }, isLast ? locale.done : locale.next),
            ]),
          ]),
        ]),
      ])
    }
  },
})
