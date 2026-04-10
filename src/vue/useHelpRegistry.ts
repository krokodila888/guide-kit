import { onMounted, onUnmounted } from 'vue'
import { HelpRegistry } from '../core/registry'
import type { HelpItemRegistration } from '../core/registry'

/**
 * Registers a help item in the global HelpRegistry when the component mounts
 * and automatically unregisters it when the component unmounts.
 *
 * Analogous to the React `useHelpRegistry` hook.
 */
export function useHelpRegistry(item: HelpItemRegistration): void {
  let unregister: (() => void) | null = null

  onMounted(() => {
    unregister = HelpRegistry.register(item)
  })

  onUnmounted(() => {
    unregister?.()
    unregister = null
  })
}
