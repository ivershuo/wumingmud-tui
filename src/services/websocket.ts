import WebSocket from 'ws'
import type { ClientMessage, ServerMessage } from '../types/message'
import type { ConnectionStatus } from '../types/state'
import { ensureTraceId, logError, logInfo, newRequestId } from './logger'
import { getItem } from './safeStorage'

const WS_URL = process.env.WS_URL || 'ws://localhost:8080/ws'
const HEARTBEAT_INTERVAL = 30000

class WebSocketService {
  private ws: WebSocket | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private connectInFlight: Promise<void> | null = null
  private messageHandlers: ((message: ServerMessage) => void)[] = []
  private statusHandlers: ((status: ConnectionStatus) => void)[] = []

  connect(token?: string): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return Promise.resolve()
    }
    if (this.connectInFlight) {
      return this.connectInFlight
    }

    this.notifyStatus('connecting')
    this.connectInFlight = new Promise((resolve, reject) => {
      const traceId = ensureTraceId()
      const requestId = newRequestId()
      const start = Date.now()
      try {
        const authToken = token || getItem('token')
        if (!authToken) {
          this.notifyStatus('error')
          const err = new Error('No token available')
          logError('ws.connect.fail', err, {
            trace_id: traceId,
            request_id: requestId,
            phase: 'ws_connect',
            error_kind: 'auth',
          })
          reject(err)
          return
        }

        const url = `${WS_URL}?token=${encodeURIComponent(authToken)}&trace_id=${encodeURIComponent(traceId)}`
        logInfo('ws.connect.start', {
          trace_id: traceId,
          request_id: requestId,
          phase: 'ws_connect',
          ws_path: WS_URL,
        })
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          logInfo('ws.connect.success', {
            trace_id: traceId,
            request_id: requestId,
            phase: 'ws_connect',
            duration_ms: Date.now() - start,
          })
          this.notifyStatus('connected')
          this.startHeartbeat()
          this.connectInFlight = null
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const rawData = event?.data
            const payload = rawData == null
              ? ''
              : Buffer.isBuffer(rawData)
                ? rawData.toString('utf8')
                : typeof rawData === 'string'
                  ? rawData
                  : String(rawData)

            const message: ServerMessage = JSON.parse(payload)
            logInfo('ws.message.in', {
              trace_id: message.trace_id || traceId,
              request_id: message.request_id,
              phase: 'ws_message',
              message_type: message.type,
              payload_size: payload.length,
            })
            this.messageHandlers.forEach(handler => handler(message))
          } catch (err) {
            logError('ws.message.parse_error', err, {
              trace_id: traceId,
              phase: 'ws_message',
              error_kind: 'parse',
            })
          }
        }

        this.ws.onclose = (event) => {
          this.stopHeartbeat()
          logInfo('ws.connect.close', {
            trace_id: traceId,
            phase: 'ws_connect',
            code: event.code,
            reason: event.reason,
          })
          this.notifyStatus('disconnected')
          this.connectInFlight = null
        }

        this.ws.onerror = (error) => {
          logError('ws.connect.error', error, {
            trace_id: traceId,
            request_id: requestId,
            phase: 'ws_connect',
            error_kind: 'network',
          })
          this.notifyStatus('error')
          this.connectInFlight = null
          reject(error)
        }
      } catch (err) {
        logError('ws.connect.exception', err, {
          trace_id: traceId,
          request_id: requestId,
          phase: 'ws_connect',
          error_kind: 'network',
        })
        this.notifyStatus('error')
        this.connectInFlight = null
        reject(err)
      }
    })
    return this.connectInFlight
  }

  disconnect(): void {
    this.stopHeartbeat()
    this.connectInFlight = null
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(message: ClientMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false
    }
    
    try {
      const enrichedMessage: ClientMessage = {
        ...message,
        trace_id: message.trace_id || ensureTraceId(),
        request_id: message.request_id || newRequestId(),
      }
      this.ws.send(JSON.stringify(enrichedMessage))
      logInfo('ws.message.out', {
        trace_id: enrichedMessage.trace_id,
        request_id: enrichedMessage.request_id,
        phase: 'ws_message',
        message_type: enrichedMessage.type,
      })
      return true
    } catch (err) {
      logError('ws.message.send_error', err, {
        trace_id: ensureTraceId(),
        phase: 'ws_message',
      })
      return false
    }
  }

  onMessage(handler: (message: ServerMessage) => void): () => void {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
    }
  }

  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.statusHandlers.push(handler)
    return () => {
      this.statusHandlers = this.statusHandlers.filter(h => h !== handler)
    }
  }

  getConnectionStatus(): ConnectionStatus {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'disconnected'
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          timestamp: Date.now(),
          data: {}
        })
      }
    }, HEARTBEAT_INTERVAL)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private notifyStatus(status: ConnectionStatus): void {
    this.statusHandlers.forEach(handler => handler(status))
  }
}

export const wsService = new WebSocketService()
