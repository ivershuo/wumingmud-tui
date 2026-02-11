export interface Player {
  id: string
  name: string
  level: number
  hp: number
  max_hp: number
  mp: number
  max_mp: number
  exp: number
  faction_id?: string
  guild_id?: string
  location_id: string
  gold: number
}

export interface NPC {
  id: string
  name: string
  description?: string
}

export interface Exit {
  direction: string
  name: string
  target: string
}

export interface Room {
  id: string
  name: string
  description: string
  npcs: NPC[]
  players: Player[]
  exits: Exit[]
}

export interface CombatState {
  combat_id: string
  type: 'pve' | 'pvp'
  opponent: {
    id: string
    name: string
    hp: number
    max_hp: number
  }
  narrative?: string
  round?: number
  result?: 'victory' | 'defeat' | 'flee'
  rewards?: {
    exp: number
    gold: number
    items: any[]
  }
}

export interface WorldEvent {
  id: string
  type: 'system' | 'world' | 'combat' | 'narrative'
  title?: string
  content: string
  timestamp: number
  importance?: 'low' | 'normal' | 'high'
}

export type ChatChannel = 'room' | 'guild' | 'private' | 'system'

export interface ChatMessage {
  id: string
  type: ChatChannel
  sender: {
    id: string
    name: string
  }
  content: string
  timestamp: number
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'pending'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}
