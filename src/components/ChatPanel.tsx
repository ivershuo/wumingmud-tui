import { Box, Text } from 'ink'
import { useStore } from '../store'
import { formatTime } from '../utils/narrative'
import type { ChatChannel } from '../types/state'

export const ChatPanel = () => {
  const { chatMessages, activeChatTab } = useStore()
  const tabs: ChatChannel[] = ['room', 'guild', 'private']

  const filteredMessages = chatMessages.filter(msg => {
    if (activeChatTab === 'room') return msg.type === 'room'
    if (activeChatTab === 'guild') return msg.type === 'guild' || msg.type === 'system'
    if (activeChatTab === 'private') return msg.type === 'private'
    return true
  })

  const getTypeColor = (type: ChatChannel): string => {
    switch (type) {
      case 'room': return 'green'
      case 'guild': return 'magenta'
      case 'private': return 'yellow'
      case 'system': return 'cyan'
      default: return 'white'
    }
  }

  const getTypeLabel = (type: ChatChannel): string => {
    switch (type) {
      case 'room': return '附近'
      case 'guild': return '帮派'
      case 'private': return '私聊'
      case 'system': return '系统'
      default: return ''
    }
  }

  return (
    <Box 
      flexDirection="column" 
      borderStyle="single" 
      borderColor="green"
      padding={1}
    >
      <Box marginBottom={1}>
        {tabs.map((tab) => (
          <Box key={tab} marginRight={2}>
            <Text 
              color={activeChatTab === tab ? 'white' : 'gray'}
              backgroundColor={activeChatTab === tab ? 'blue' : undefined}
              bold={activeChatTab === tab}
            >
              [{getTypeLabel(tab)}]
            </Text>
          </Box>
        ))}
        <Text color="gray"> (Tab/Shift+Tab 切换)</Text>
      </Box>

      <Box flexDirection="column">
        {filteredMessages.length === 0 ? (
          <Text color="gray">暂无消息...</Text>
        ) : (
          filteredMessages.slice(-15).map((msg) => (
            <Box key={msg.id} marginBottom={1}>
              <Text color="gray">
                {formatTime(msg.timestamp)}
              </Text>
              <Text> </Text>
              <Text color={getTypeColor(msg.type)}>
                [{getTypeLabel(msg.type)}]
              </Text>
              <Text> </Text>
              <Text color="cyan">{msg.sender.name}:</Text>
              <Text> </Text>
              <Text>{msg.content}</Text>
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}
