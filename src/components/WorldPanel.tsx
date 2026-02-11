import { Box, Text } from 'ink'
import { useStore } from '../store'
import { formatTime } from '../utils/narrative'

export const WorldPanel = () => {
  const { worldEvents } = useStore()

  const getEventColor = (type: string): string => {
    switch (type) {
      case 'system': return 'cyan'
      case 'world': return 'yellow'
      case 'combat': return 'red'
      case 'narrative': return 'green'
      default: return 'white'
    }
  }

  return (
    <Box 
      flexDirection="column" 
      borderStyle="single" 
      borderColor="gray"
      padding={1}
    >
      <Box marginBottom={1}>
        <Text bold underline color="white">江湖大事</Text>
      </Box>
      
      <Box flexDirection="column">
        {worldEvents.length === 0 ? (
          <Text color="gray">暂无消息...</Text>
        ) : (
          worldEvents.slice(-10).map((event) => (
            <Box key={event.id} marginBottom={1}>
              <Text color="gray">
                {formatTime(event.timestamp)}
              </Text>
              <Text> </Text>
              <Text color={getEventColor(event.type)}>
                {event.content}
              </Text>
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}
