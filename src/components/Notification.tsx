import { useEffect } from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../store'

export const Notification = () => {
  const { notifications } = useStore()

  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration) {
        setTimeout(() => {
          useStore.getState().removeNotification(notification.id)
        }, notification.duration)
      }
    })
  }, [notifications])

  if (notifications.length === 0) {
    return null
  }

  const getNotificationColor = (type: string): string => {
    switch (type) {
      case 'success': return 'green'
      case 'error': return 'red'
      case 'warning': return 'yellow'
      case 'info': return 'cyan'
      default: return 'white'
    }
  }

  return (
    <Box 
      position="absolute" 
      top={0} 
      left={0} 
      padding={1}
      flexDirection="column"
    >
      {notifications.map((notification) => (
        <Box key={notification.id} marginBottom={1}>
          <Box 
            borderStyle="single" 
            borderColor={getNotificationColor(notification.type)}
            padding={1}
          >
            <Text color={getNotificationColor(notification.type)}>
              {notification.message}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  )
}
