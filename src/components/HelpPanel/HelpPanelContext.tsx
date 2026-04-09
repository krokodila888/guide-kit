import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type React from 'react'
import { HelpRegistry } from '../../core/registry'
import { HelpStorage } from '../../core/storage'
import type { HelpItemRegistration } from '../../core/registry'

interface HelpPanelContextValue {
  items: HelpItemRegistration[]
  enabled: Record<string, boolean>
  toggle: (id: string) => void
  isEnabled: (id: string) => boolean
  storageKey: string
}

export const HelpPanelContext = createContext<HelpPanelContextValue | null>(null)

export function useHelpPanel(): HelpPanelContextValue {
  const ctx = useContext(HelpPanelContext)
  if (!ctx) throw new Error('useHelpPanel must be used within HelpPanelProvider')
  return ctx
}

interface HelpPanelProviderProps {
  storageKey?: string
  children: React.ReactNode
}

export function HelpPanelProvider({ storageKey = 'guide-kit-help', children }: HelpPanelProviderProps) {
  const [items, setItems] = useState<HelpItemRegistration[]>(() => HelpRegistry.getAll())
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    HelpStorage.getEnabled(storageKey)
  )

  useEffect(() => {
    // Children's effects run before the parent's, so items registered via
    // useHelpRegistry may already be in the registry by the time this effect
    // fires — read the current state immediately before subscribing.
    setItems(HelpRegistry.getAll())

    const unsubscribe = HelpRegistry.subscribe(() => {
      setItems(HelpRegistry.getAll())
    })
    return unsubscribe
  }, [])

  const toggle = useCallback((id: string) => {
    setEnabled(prev => {
      const item = HelpRegistry.getAll().find(i => i.id === id)
      const current = prev[id] ?? (item?.defaultEnabled ?? true)
      const next = !current
      HelpStorage.setEnabled(id, next, storageKey)
      return { ...prev, [id]: next }
    })
  }, [storageKey])

  const isEnabled = useCallback((id: string) => {
    if (id in enabled) return enabled[id]
    const item = items.find(i => i.id === id)
    return item?.defaultEnabled ?? true
  }, [enabled, items])

  return (
    <HelpPanelContext.Provider value={{ items, enabled, toggle, isEnabled, storageKey }}>
      {children}
    </HelpPanelContext.Provider>
  )
}
