import { useState } from 'react'
import { Box, Text, useInput, useApp } from 'ink'
import TextInput from 'ink-text-input'
import { useStore } from '../store'
import { parseCommand } from '../services/parser'
import { logout } from '../services/auth'
import { wsService } from '../services/websocket'

export const InputPanel = () => {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const { exit } = useApp()
  const { connectionStatus, setAuthenticated, setPlayer, cycleChatTab } = useStore()

  useInput((_, key) => {
    if (key.tab) {
      cycleChatTab(!!key.shift)
      return
    }

    if (key.upArrow && history.length > 0) {
      const newIndex = historyIndex < 0 
        ? history.length - 1 
        : Math.max(0, historyIndex - 1)
      setHistoryIndex(newIndex)
      setInput(history[newIndex])
    }
    
    if (key.downArrow && historyIndex >= 0) {
      const newIndex = historyIndex + 1
      if (newIndex >= history.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      }
    }
    
    if (key.ctrl && input === 'c') {
      exit()
    }
  })

  const handleSubmit = () => {
    if (!input.trim()) return

    const trimmed = input.trim()

    if (trimmed.startsWith('/')) {
      const command = trimmed.slice(1).trim().toLowerCase()
      if (command === 'q' || command === 'exit') {
        exit()
        return
      }
      if (command === 'logout') {
        wsService.disconnect()
        logout()
        setPlayer(null)
        setAuthenticated(false)
        setInput('')
        useStore.getState().addNotification({
          id: Date.now().toString(),
          type: 'info',
          message: '已退出登录',
        })
        return
      }
    }

    const command = parseCommand(trimmed)
    
    if (connectionStatus !== 'connected') {
      useStore.getState().addNotification({
        id: Date.now().toString(),
        type: 'warning',
        message: '未连接到服务器',
      })
      setInput('')
      return
    }

    if (command.type !== 'empty') {
      wsService.send({
        type: command.type,
        timestamp: Date.now(),
        data: command.data
      })
    }

    setHistory([...history, trimmed])
    setHistoryIndex(-1)
    setInput('')
  }

  return (
    <Box 
      borderStyle="single" 
      borderColor="yellow"
      padding={1}
    >
      <Text color="yellow">{'>'}</Text>
      <Text> </Text>
      <TextInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        placeholder="输入指令..."
      />
    </Box>
  )
}
