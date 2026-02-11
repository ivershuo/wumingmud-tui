import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

class FileStorage implements StorageLike {
  private filePath: string
  private data: Record<string, string>

  constructor(filePath: string) {
    this.filePath = filePath
    this.data = this.load()
  }

  private load(): Record<string, string> {
    try {
      if (!existsSync(this.filePath)) {
        return {}
      }
      const raw = readFileSync(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') {
        return {}
      }
      return parsed as Record<string, string>
    } catch {
      return {}
    }
  }

  private save(): void {
    try {
      mkdirSync(dirname(this.filePath), { recursive: true })
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8')
    } catch {
      // Ignore storage persistence failure to avoid breaking TUI flow.
    }
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null
  }

  setItem(key: string, value: string): void {
    this.data[key] = value
    this.save()
  }

  removeItem(key: string): void {
    delete this.data[key]
    this.save()
  }
}

function resolveStorage(): StorageLike {
  const g = globalThis as typeof globalThis & { localStorage?: StorageLike }
  if (g.localStorage) {
    return g.localStorage
  }
  const filePath = process.env.CLIENT_STORAGE_PATH || join(homedir(), '.wumingmud', 'client-storage.json')
  return new FileStorage(filePath)
}

const storage = resolveStorage()

export function getItem(key: string): string | null {
  return storage.getItem(key)
}

export function setItem(key: string, value: string): void {
  storage.setItem(key, value)
}

export function removeItem(key: string): void {
  storage.removeItem(key)
}
