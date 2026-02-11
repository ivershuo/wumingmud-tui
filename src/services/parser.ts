import type { ParsedCommand } from '../types/api'

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim()
  
  if (!trimmed) {
    return {
      type: 'empty',
      data: {}
    }
  }

  const firstChar = trimmed.charAt(0)

  if (firstChar === '!' || firstChar === '/') {
    const parts = trimmed.slice(1).trim().split(/\s+/)
    const command = parts[0]?.toLowerCase()
    const args = parts.slice(1)
    
    switch (command) {
      case 'go':
      case 'n':
      case 'north':
        return {
          type: 'move',
          data: { direction: 'north' }
        }
      case 's':
      case 'south':
        return {
          type: 'move',
          data: { direction: 'south' }
        }
      case 'e':
      case 'east':
        return {
          type: 'move',
          data: { direction: 'east' }
        }
      case 'w':
      case 'west':
        return {
          type: 'move',
          data: { direction: 'west' }
        }
      case 'u':
      case 'up':
        return {
          type: 'move',
          data: { direction: 'up' }
        }
      case 'd':
      case 'down':
        return {
          type: 'move',
          data: { direction: 'down' }
        }
      case 'look':
      case 'l':
        return {
          type: 'look',
          data: {}
        }
      case 'say':
        return {
          type: 'chat',
          data: {
            channel: 'room',
            content: args.join(' ')
          }
        }
      case 'tell':
        if (args.length >= 2) {
          const target = args[0]
          const content = args.slice(1).join(' ')
          return {
            type: 'chat',
            data: {
              channel: 'private',
              target,
              content
            }
          }
        }
        break
      case 'guild':
      case 'g':
        return {
          type: 'chat',
          data: {
            channel: 'guild',
            content: args.join(' ')
          }
        }
      case 'attack':
      case 'kill':
        if (args.length > 0) {
          return {
            type: 'combat_attack',
            data: {
              target: args[0],
              skill: args[1] || 'normal_attack'
            }
          }
        }
        break
      case 'quest':
      case 'q':
        if (args.length === 0) {
          return {
            type: 'quest_list',
            data: {}
          }
        }
        if (args[0] === 'accept' && args[1]) {
          return {
            type: 'quest_accept',
            data: { quest_id: args[1] }
          }
        }
        break
      case 'help':
      case 'h':
        return {
          type: 'help',
          data: {}
        }
      case 'who':
        return {
          type: 'who',
          data: {}
        }
      case 'inventory':
      case 'inv':
      case 'i':
        return {
          type: 'inventory',
          data: {}
        }
      case 'status':
      case 'stat':
        return {
          type: 'status',
          data: {}
        }
      default:
        return {
          type: 'unknown_command',
          data: { command }
        }
    }
  }
  
  // Non-slash inputs are treated as natural language and interpreted by backend.
  return {
    type: 'player_input',
    data: {
      text: trimmed
    }
  }
}

export function isMovementInput(input: string): boolean {
  const trimmed = input.trim().toLowerCase()
  const movementCommands = ['n', 'north', 's', 'south', 'e', 'east', 'w', 'west', 'u', 'up', 'd', 'down']
  return movementCommands.includes(trimmed)
}

export function isChatInput(input: string): boolean {
  return input.trim().startsWith('"')
}

export function isCommandInput(input: string): boolean {
  const trimmed = input.trim()
  return trimmed.startsWith('!') || trimmed.startsWith('/')
}
