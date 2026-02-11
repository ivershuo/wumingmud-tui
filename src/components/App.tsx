import React, { useEffect, useRef } from 'react'
import { Box, useStdout } from 'ink'
import { useStore } from '../store'
import { useWebSocket } from '../hooks/useWebSocket'
import { useReconnect } from '../hooks/useReconnect'
import { LoginPanel } from './LoginPanel'
import { Layout } from './Layout'
import { Notification } from './Notification'
import { logError } from '../services/logger'

export const App = () => {
  const { stdout } = useStdout()
  const { isAuthenticated, connectionStatus } = useStore()
  const { connect, disconnect } = useWebSocket()
  const { startReconnect, stopReconnect } = useReconnect()
  const hasConnectedRef = useRef(false)

  useEffect(() => {
    if (isAuthenticated) {
      void connect().catch((err) => {
        logError('app.ws.connect_failed', err, {
          phase: 'ws_connect',
        })
      })
    }
    
    return () => {
      disconnect()
      stopReconnect()
    }
  }, [isAuthenticated, connect, disconnect, stopReconnect])

  useEffect(() => {
    if (connectionStatus === 'connected') {
      hasConnectedRef.current = true
    }
  }, [connectionStatus])

  useEffect(() => {
    if (connectionStatus === 'disconnected' && isAuthenticated) {
      if (!hasConnectedRef.current) return
      startReconnect()
    }
  }, [connectionStatus, isAuthenticated, startReconnect])

  useEffect(() => {
    stdout.write('\x1b[?25l')
    return () => {
      stdout.write('\x1b[?25h')
    }
  }, [stdout])

  if (!isAuthenticated) {
    return <LoginPanel />
  }

  return (
    <Box flexDirection="column" height={stdout.rows}>
      <Layout />
      <Notification />
    </Box>
  )
}
