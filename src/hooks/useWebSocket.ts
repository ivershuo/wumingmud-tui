import { useEffect, useCallback } from 'react'
import { wsService } from '../services/websocket'
import { useStore } from '../store'
import type { ServerMessage } from '../types/message'
import { logInfo } from '../services/logger'

export function useWebSocket() {
  const { 
    setConnectionStatus, 
    setOnlineCount,
    updatePlayer, 
    updateRoom,
    addWorldEvent,
    addChatMessage,
    updateCombat,
    clearCombat,
  } = useStore()

  const handleMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case 'auth_ok':
        if (message.data.player) {
          updatePlayer(message.data.player)
        }
        if (message.data.room) {
          updateRoom(message.data.room)
        }
        break
      
      case 'auth_failed':
        useStore.getState().addNotification({
          id: Date.now().toString(),
          type: 'error',
          message: message.data.message || '认证失败',
        })
        break
      
      case 'room_update':
        updateRoom(message.data)
        break
      
      case 'player_update':
        updatePlayer(message.data)
        break
      
      case 'world_event':
        addWorldEvent({
          id: message.data.id || Date.now().toString(),
          type: message.data.type || 'system',
          content: message.data.content,
          timestamp: message.timestamp,
        })
        break

      case 'online_update':
        setOnlineCount(Number(message.data.count) || 0)
        break
      
      case 'chat':
        addChatMessage({
          id: message.data.id || Date.now().toString(),
          type: message.data.channel,
          sender: message.data.sender,
          content: message.data.content,
          timestamp: message.timestamp,
        })
        break
      
      case 'combat_start':
        updateCombat(message.data)
        break
      
      case 'combat_round':
        useStore.getState().updateCombat(message.data)
        addWorldEvent({
          id: Date.now().toString(),
          type: 'combat',
          content: message.data.narrative || '战斗进行中...',
          timestamp: Date.now(),
        })
        break
      
      case 'combat_end':
        clearCombat()
        addWorldEvent({
          id: Date.now().toString(),
          type: 'combat',
          content: message.data.narrative || '战斗结束',
          timestamp: Date.now(),
        })
        break
      
      case 'error':
        const errorMessage = message.data.narrative || message.data.message || '操作失败'
        addWorldEvent({
          id: Date.now().toString(),
          type: 'system',
          content: errorMessage,
          timestamp: Date.now(),
        })
        useStore.getState().addNotification({
          id: Date.now().toString(),
          type: 'error',
          message: errorMessage,
        })
        break

      case 'quest_update':
        addWorldEvent({
          id: message.data.id || Date.now().toString(),
          type: 'narrative',
          content: message.data.narrative || message.data.message || '任务状态更新',
          timestamp: Date.now(),
        })
        break
      
      case 'pong':
        break
      
      default:
        logInfo('ws.message.unhandled', {
          trace_id: message.trace_id,
          request_id: message.request_id,
          phase: 'ws_message',
          message_type: message.type,
        })
    }
  }, [setOnlineCount, updatePlayer, updateRoom, addWorldEvent, addChatMessage, updateCombat, clearCombat])

  useEffect(() => {
    const unsubscribe = wsService.onMessage(handleMessage)
    return unsubscribe
  }, [handleMessage])

  useEffect(() => {
    const unsubscribe = wsService.onStatusChange((status) => {
      setConnectionStatus(status)
    })
    return unsubscribe
  }, [setConnectionStatus])

  const connect = useCallback(() => {
    return wsService.connect()
  }, [])

  const disconnect = useCallback(() => {
    wsService.disconnect()
  }, [])

  const send = useCallback((message: any) => {
    return wsService.send(message)
  }, [])

  return {
    connect,
    disconnect,
    send,
    connectionStatus: wsService.getConnectionStatus(),
  }
}
