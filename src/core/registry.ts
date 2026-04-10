export interface HelpItemRegistration {
  id: string
  type: 'tour' | 'hint' | 'sidebar' | 'doc' | 'video' | 'custom'
  label: string
  description?: string
  action?: () => void
  defaultEnabled?: boolean
}

export class HelpRegistry {
  private static items: Map<string, HelpItemRegistration> = new Map()
  private static listeners: Array<() => void> = []

  static register(item: HelpItemRegistration): () => void {
    this.items.set(item.id, item)
    this.notify()
    return () => this.unregister(item.id)
  }

  static unregister(id: string): void {
    if (this.items.has(id)) {
      this.items.delete(id)
      this.notify()
    }
  }

  static getAll(): HelpItemRegistration[] {
    return Array.from(this.items.values())
  }

  static subscribe(listener: () => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  static clear(): void {
    this.items.clear()
    this.notify()
  }

  private static notify(): void {
    this.listeners.forEach(l => l())
  }
}
