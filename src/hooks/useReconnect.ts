import { useCallback, useRef } from 'react'
import { wsService } from '../services/websocket'
import { useStore } from '../store'
import { getReconnectNarrative } from '../utils/narrative'
import { logError } from '../services/logger'

const MAX_RETRIES = 5
const INITIAL_DELAY = 1000
const MAX_DELAY = 30000

export function useReconnect() {
  const retryCountRef = useRef(0)
  const timeoutIdRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const startReconnect = useCallback(() => {
    if (retryCountRef.current >= MAX_RETRIES) {
      useStore.getState().addWorldEvent({
        id: Date.now().toString(),
        type: 'system',
        content: '多次重连失败，请检查网络后刷新重试',
        timestamp: Date.now(),
      })
      return
    }

    const delay = Math.min(
      INITIAL_DELAY * Math.pow(2, retryCountRef.current),
      MAX_DELAY
    )

    useStore.getState().addWorldEvent({
      id: Date.now().toString(),
      type: 'narrative',
      content: getReconnectNarrative(retryCountRef.current),
      timestamp: Date.now(),
    })

    timeoutIdRef.current = setTimeout(() => {
      retryCountRef.current++
      void wsService.connect().catch((err) => {
        logError('ws.reconnect.failed', err, {
          phase: 'ws_connect',
          reconnect_attempt: retryCountRef.current,
        })
      })
    }, delay)
  }, [])

  const stopReconnect = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
      timeoutIdRef.current = undefined
    }
    retryCountRef.current = 0
  }, [])

  return {
    startReconnect,
    stopReconnect,
  }
}
