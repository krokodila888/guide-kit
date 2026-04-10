import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { autoUpdatePosition } from '../core/positioning'
import type { Placement } from '../core/positioning'

/**
 * Composable: keeps a floating element positioned relative to a reference.
 * Starts tracking when both elements are in the DOM and `enabled` is true.
 * Call the returned `startTracking`/`stopTracking` to control when autoUpdate runs.
 */
export function useFloating(
  referenceEl: Ref<HTMLElement | null>,
  floatingEl: Ref<HTMLElement | null>,
  placement: Ref<string>,
  enabled: Ref<boolean>,
): { x: Ref<number>; y: Ref<number> } {
  const x = ref(0)
  const y = ref(0)
  let cleanup: (() => void) | null = null

  function start() {
    cleanup?.()
    cleanup = null
    if (!referenceEl.value || !floatingEl.value || !enabled.value) return
    cleanup = autoUpdatePosition(
      referenceEl.value,
      floatingEl.value,
      placement.value as Placement,
      (pos) => {
        x.value = pos.x
        y.value = pos.y
      },
    )
  }

  function stop() {
    cleanup?.()
    cleanup = null
  }

  onMounted(() => {
    watch([referenceEl, floatingEl, placement, enabled], start, { immediate: true })
  })

  onUnmounted(stop)

  return { x, y }
}

/**
 * Composable: simple open/close/toggle state for popovers.
 */
export function usePopoverState(initial = false): {
  isOpen: Ref<boolean>
  show: () => void
  hide: () => void
  toggle: () => void
} {
  const isOpen = ref(initial)
  return {
    isOpen,
    show:   () => { isOpen.value = true },
    hide:   () => { isOpen.value = false },
    toggle: () => { isOpen.value = !isOpen.value },
  }
}

/**
 * Composable: attaches hover/click/focus triggers to a DOM element.
 * Cleans up automatically on unmount.
 */
export function useTrigger(
  targetEl: Ref<HTMLElement | null>,
  trigger: Ref<'hover' | 'click' | 'focus'>,
  onShow: () => void,
  onHide: () => void,
): void {
  let cleanupListeners: (() => void) | null = null

  function attach(el: HTMLElement, type: 'hover' | 'click' | 'focus') {
    cleanupListeners?.()
    cleanupListeners = null

    if (type === 'hover') {
      el.addEventListener('mouseenter', onShow)
      el.addEventListener('mouseleave', onHide)
      cleanupListeners = () => {
        el.removeEventListener('mouseenter', onShow)
        el.removeEventListener('mouseleave', onHide)
      }
    } else if (type === 'click') {
      let open = false
      const handler = () => { open = !open; open ? onShow() : onHide() }
      el.addEventListener('click', handler)
      cleanupListeners = () => el.removeEventListener('click', handler)
    } else {
      el.addEventListener('focus', onShow)
      el.addEventListener('blur', onHide)
      cleanupListeners = () => {
        el.removeEventListener('focus', onShow)
        el.removeEventListener('blur', onHide)
      }
    }
  }

  onMounted(() => {
    watch(
      [targetEl, trigger],
      ([el, t]) => {
        if (el) attach(el as HTMLElement, t as 'hover' | 'click' | 'focus')
      },
      { immediate: true },
    )
  })

  onUnmounted(() => cleanupListeners?.())
}
