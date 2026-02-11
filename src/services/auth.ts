import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/api'
import { ensureTraceId, logError, logInfo, newRequestId } from './logger'
import * as safeStorage from './safeStorage'

const API_BASE_URL = process.env.API_URL || 'http://localhost:8080/api'

export class AuthRequestError extends Error {
  kind: 'network' | 'timeout' | 'http' | 'parse' | 'auth' | 'protocol'
  statusCode?: number
  traceId: string

  constructor(
    message: string,
    kind: 'network' | 'timeout' | 'http' | 'parse' | 'auth' | 'protocol',
    traceId: string,
    statusCode?: number
  ) {
    super(message)
    this.name = 'AuthRequestError'
    this.kind = kind
    this.traceId = traceId
    this.statusCode = statusCode
  }
}

async function apiRequest<T>(endpoint: string, method: string, body?: any): Promise<T> {
  const traceId = ensureTraceId()
  const requestId = newRequestId()
  const url = `${API_BASE_URL}${endpoint}`
  const start = Date.now()

  logInfo('auth.http.request', {
    trace_id: traceId,
    request_id: requestId,
    phase: 'auth_http',
    endpoint,
    method,
  })

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': traceId,
        'X-Request-ID': requestId,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    const wrapped = new AuthRequestError('网络连接失败', 'network', traceId)
    logError('auth.http.error', err, {
      trace_id: traceId,
      request_id: requestId,
      phase: 'auth_http',
      endpoint,
      error_kind: 'network',
      duration_ms: Date.now() - start,
    })
    throw wrapped
  }

  let data: any
  try {
    data = await response.json()
  } catch (err) {
    const wrapped = new AuthRequestError('服务返回了无效响应', 'parse', traceId, response.status)
    logError('auth.http.error', err, {
      trace_id: traceId,
      request_id: requestId,
      phase: 'auth_http',
      endpoint,
      status_code: response.status,
      error_kind: 'parse',
      response_content_type: response.headers.get('content-type') || '',
      duration_ms: Date.now() - start,
    })
    throw wrapped
  }

  logInfo('auth.http.response', {
    trace_id: traceId,
    request_id: requestId,
    phase: 'auth_http',
    endpoint,
    status_code: response.status,
    duration_ms: Date.now() - start,
  })

  if (!response.ok || !data.success) {
    const message = data.message || data.error || 'API request failed'
    const wrapped = new AuthRequestError(message, response.ok ? 'auth' : 'http', traceId, response.status)
    logError('auth.http.error', message, {
      trace_id: traceId,
      request_id: requestId,
      phase: 'auth_http',
      endpoint,
      status_code: response.status,
      error_kind: response.ok ? 'auth' : 'http',
      duration_ms: Date.now() - start,
    })
    throw wrapped
  }

  return data
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/login', 'POST', credentials)
  
  if (response.success && response.data?.token) {
    safeStorage.setItem('token', response.data.token)
    safeStorage.setItem('player', JSON.stringify(response.data.player))
    logInfo('auth.login.success', {
      trace_id: ensureTraceId(),
      phase: 'auth_http',
      player_id: response.data.player.id,
    })
  }
  
  return response
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/register', 'POST', data)
  
  if (response.success && response.data?.token) {
    safeStorage.setItem('token', response.data.token)
    safeStorage.setItem('player', JSON.stringify(response.data.player))
    logInfo('auth.register.success', {
      trace_id: ensureTraceId(),
      phase: 'auth_http',
      player_id: response.data.player.id,
    })
  }
  
  return response
}

export function logout(): void {
  safeStorage.removeItem('token')
  safeStorage.removeItem('player')
}

export function getToken(): string | null {
  return safeStorage.getItem('token')
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
