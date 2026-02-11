import { Box, Text } from 'ink'
import { useStore } from '../store'

export const StatusBar = () => {
  const { player, connectionStatus, onlineCount } = useStore()

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'green'
      case 'connecting': return 'yellow'
      case 'disconnected': return 'red'
      case 'error': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '已连接'
      case 'connecting': return '连接中...'
      case 'disconnected': return '未连接'
      case 'error': return '错误'
      default: return connectionStatus
    }
  }

  const formatHP = () => {
    if (!player) return '--/--'
    const hp = player.hp ?? 0
    const maxHP = player.max_hp ?? 0
    return `${hp}/${maxHP}`
  }

  const formatMP = () => {
    if (!player) return '--/--'
    const mp = player.mp ?? 0
    const maxMP = player.max_mp ?? 0
    return `${mp}/${maxMP}`
  }

  return (
    <Box 
      flexDirection="row" 
      borderStyle="single" 
      borderColor="gray"
      paddingX={1}
      justifyContent="space-between"
    >
      <Box marginRight={2}>
        <Text bold color="cyan">
          {player?.name || '未登录'}
        </Text>
        <Text> </Text>
        <Text color="yellow">
          Lv.{player?.level || 0}
        </Text>
      </Box>

      <Box marginRight={2}>
        <Text color="red">HP: {formatHP()}</Text>
        <Text> </Text>
        <Text color="blue">MP: {formatMP()}</Text>
      </Box>

      <Box marginRight={2}>
        <Text color="green">在线: {onlineCount ?? 0}</Text>
      </Box>

      <Box>
        <Text color={getStatusColor()}>{getStatusText()}</Text>
      </Box>
    </Box>
  )
}
