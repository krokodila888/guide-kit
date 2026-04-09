export class HelpStorage {
  private static defaultKey = 'guide-kit-help'

  static getEnabled(storageKey?: string): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(storageKey ?? this.defaultKey)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
      return parsed as Record<string, boolean>
    } catch {
      return {}
    }
  }

  static setEnabled(id: string, enabled: boolean, storageKey?: string): void {
    try {
      const key = storageKey ?? this.defaultKey
      const current = this.getEnabled(key)
      current[id] = enabled
      localStorage.setItem(key, JSON.stringify(current))
    } catch {
      // silently ignore (SSR, blocked storage)
    }
  }

  static reset(storageKey?: string): void {
    try {
      localStorage.removeItem(storageKey ?? this.defaultKey)
    } catch {
      // silently ignore
    }
  }
}
