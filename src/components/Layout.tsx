import { Box } from 'ink'
import { StatusBar } from './StatusBar'
import { WorldPanel } from './WorldPanel'
import { RoomPanel } from './RoomPanel'
import { ChatPanel } from './ChatPanel'
import { InputPanel } from './InputPanel'

export const Layout = () => {
  return (
    <Box flexDirection="column" flexGrow={1}>
      <StatusBar />
      
      <Box flexDirection="column" flexGrow={1}>
        <Box flexDirection="column" flexGrow={1} height="30%">
          <WorldPanel />
        </Box>
        
        <Box flexDirection="column" flexGrow={1} height="20%">
          <RoomPanel />
        </Box>
        
        <Box flexDirection="column" flexGrow={1}>
          <ChatPanel />
        </Box>
      </Box>
      
      <InputPanel />
    </Box>
  )
}
