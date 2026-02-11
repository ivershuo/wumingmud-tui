import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

type LogLevel = 'info' | 'error'

export interface LogFields {
  trace_id?: string
  request_id?: string
  phase?: string
  endpoint?: string
  ws_path?: string
  message_type?: string
  status_code?: number
  duration_ms?: number
  error_kind?: 'network' | 'timeout' | 'http' | 'parse' | 'auth' | 'protocol'
  [key: string]: unknown
}

const REDACT_KEYS = ['password', 'token', 'authorization', 'api_key']

let currentTraceId: string | null = null
const LOG_PATH = process.env.CLIENT_LOG_PATH || join(process.cwd(), 'logs', 'client.log')
const LOG_STDOUT = process.env.CLIENT_LOG_STDOUT === 'true'

function nowISO(): string {
  return new Date().toISOString()
}

function newID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function redactValue(value: unknown): unknown {
  if (typeof value !== 'string') return value
  if (value.length <= 8) return '***'
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const lower = key.toLowerCase()
    if (REDACT_KEYS.some((sensitive) => lower.includes(sensitive))) {
      output[key] = redactValue(value)
      continue
    }
    output[key] = value
  }
  return output
}

function emit(level: LogLevel, event: string, fields: LogFields = {}): void {
  const entry = sanitize({
    ts: nowISO(),
    level,
    event,
    ...fields,
  })
  const line = JSON.stringify(entry)
  try {
    mkdirSync(dirname(LOG_PATH), { recursive: true })
    appendFileSync(LOG_PATH, `${line}\n`, 'utf8')
  } catch {
    // Ignore log sink failures to keep TUI responsive.
  }

  if (LOG_STDOUT) {
    if (level === 'error') {
      console.error(line)
    } else {
      console.log(line)
    }
  }
}

function serializeUnknown(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function beginTrace(): string {
  currentTraceId = newID()
  return currentTraceId
}

export function getTraceId(): string | null {
  return currentTraceId
}

export function ensureTraceId(): string {
  return currentTraceId || beginTrace()
}

export function clearTraceId(): void {
  currentTraceId = null
}

export function newRequestId(): string {
  return newID()
}

export function shortTraceId(traceId?: string | null): string {
  if (!traceId) return ''
  return traceId.slice(0, 8)
}

export function logInfo(event: string, fields: LogFields = {}): void {
  emit('info', event, fields)
}

export function logError(event: string, err: unknown, fields: LogFields = {}): void {
  const details: Record<string, unknown> = {
    ...fields,
  }

  if (err instanceof Error) {
    details.error_name = err.name
    details.error_message = err.message
  } else if (typeof err === 'string') {
    details.error_message = err
  } else {
    details.error_message = 'non-error rejection'
    details.error_value = serializeUnknown(err)
  }

  emit('error', event, details)
}
