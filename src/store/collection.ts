import { useSyncExternalStore } from 'react'

export interface Entity {
  id: string
  updatedAt: number
}

/**
 * A list of records persisted to localStorage, with React bindings and cross-tab sync.
 */
export function createCollection<T extends Entity>(key: string, sanitize: (raw: unknown) => T | null) {
  let items: T[] = load()
  const listeners = new Set<() => void>()

  function load(): T[] {
    try {
      const raw = localStorage.getItem(key)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.map(sanitize).filter((x): x is T => !!x) : []
    } catch {
      return []
    }
  }

  function set(next: T[]) {
    items = next
    try {
      localStorage.setItem(key, JSON.stringify(items))
    } catch (e) {
      console.error(`Could not save ${key}`, e)
    }
    listeners.forEach((l) => l())
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === key) {
        items = load()
        listeners.forEach((l) => l())
      }
    })
  }

  const subscribe = (l: () => void) => {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }

  return {
    subscribe,
    all: () => items,
    get: (id: string) => items.find((x) => x.id === id),
    useAll: () => useSyncExternalStore(subscribe, () => items),
    useOne: (id: string | null | undefined) =>
      useSyncExternalStore(subscribe, () => (id ? items.find((x) => x.id === id) : undefined)),
    save(item: T): T {
      const next = { ...item, updatedAt: Date.now() }
      const idx = items.findIndex((x) => x.id === item.id)
      set(idx === -1 ? [next, ...items] : items.map((x, i) => (i === idx ? next : x)))
      return next
    },
    /** Replace without touching updatedAt (used for undo). */
    put(item: T) {
      set(items.map((x) => (x.id === item.id ? item : x)))
    },
    update(id: string, patch: Partial<T> | ((x: T) => Partial<T>)) {
      const cur = items.find((x) => x.id === id)
      if (!cur) return
      this.save({ ...cur, ...(typeof patch === 'function' ? patch(cur) : patch) })
    },
    /** Insert or replace several items as-is (no updatedAt change), e.g. when syncing. */
    putMany(list: T[]) {
      if (!list.length) return
      const byId = new Map(list.map((x) => [x.id, x]))
      set([...list.filter((x) => !items.some((i) => i.id === x.id)), ...items.map((x) => byId.get(x.id) ?? x)])
    },
    removeWhere(pred: (x: T) => boolean) {
      if (items.some(pred)) set(items.filter((x) => !pred(x)))
    },
    remove(id: string) {
      set(items.filter((x) => x.id !== id))
    },
    addMany(list: T[]) {
      set([...list, ...items])
    },
  }
}
