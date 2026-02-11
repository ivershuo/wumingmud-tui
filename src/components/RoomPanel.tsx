import { Box, Text } from 'ink'
import { useStore } from '../store'

export const RoomPanel = () => {
  const { currentRoom, onlinePlayers, npcsInRoom } = useStore()

  if (!currentRoom) {
    return (
      <Box 
        flexDirection="column" 
        borderStyle="single" 
        borderColor="blue"
        padding={1}
      >
        <Text color="gray">暂无位置信息...</Text>
      </Box>
    )
  }

  return (
    <Box 
      flexDirection="column" 
      borderStyle="single" 
      borderColor="blue"
      padding={1}
    >
      <Box marginBottom={1}>
        <Text bold color="yellow">【{currentRoom.name}】</Text>
      </Box>
      
      <Box marginBottom={1}>
        <Text color="gray">{currentRoom.description}</Text>
      </Box>
      
      {npcsInRoom.length > 0 && (
        <Box marginBottom={1}>
          <Text color="green">这里的人：{' '}</Text>
          {npcsInRoom.map((npc, index) => (
            <Text key={npc.id} color="green">
              {npc.name}
              {index < npcsInRoom.length - 1 ? '、' : ''}
            </Text>
          ))}
        </Box>
      )}
      
      {onlinePlayers.length > 1 && (
        <Box marginBottom={1}>
          <Text color="cyan">在线玩家：{' '}</Text>
          {onlinePlayers.filter(p => p.id !== useStore.getState().player?.id).map((player, index) => (
            <Text key={player.id} color="cyan">
              {player.name}
              {index < onlinePlayers.length - 1 ? '、' : ''}
            </Text>
          ))}
        </Box>
      )}
      
      {currentRoom.exits.length > 0 && (
        <Box>
          <Text color="yellow">出口：{' '}</Text>
          {currentRoom.exits.map((exit, index) => (
            <Text key={exit.direction} color="yellow">
              {exit.name}
              {index < currentRoom.exits.length - 1 ? ' ' : ''}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  )
}
