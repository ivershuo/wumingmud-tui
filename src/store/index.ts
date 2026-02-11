import { create } from 'zustand'
import type { 
  Player, 
  Room, 
  ChatMessage, 
  WorldEvent, 
  CombatState,
  ConnectionStatus,
  Notification,
  ChatChannel,
} from '../types/state'

interface GameState {
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
  
  connectionStatus: ConnectionStatus
  setConnectionStatus: (status: ConnectionStatus) => void
  onlineCount: number
  setOnlineCount: (count: number) => void
  
  player: Player | null
  setPlayer: (player: Player | null) => void
  updatePlayer: (updates: Partial<Player>) => void
  
  currentRoom: Room | null
  updateRoom: (room: Room) => void
  
  onlinePlayers: Player[]
  setOnlinePlayers: (players: Player[]) => void
  
  npcsInRoom: Room['npcs']
  setNpcsInRoom: (npcs: Room['npcs']) => void
  
  worldEvents: WorldEvent[]
  addWorldEvent: (event: WorldEvent) => void
  
  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void
  activeChatTab: ChatChannel
  cycleChatTab: (reverse?: boolean) => void
  
  combatState: CombatState | null
  updateCombat: (combatState: CombatState) => void
  clearCombat: () => void
  
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
}

export const useStore = create<GameState>((set) => ({
  isAuthenticated: false,
  connectionStatus: 'disconnected',
  onlineCount: 0,
  player: null,
  currentRoom: null,
  onlinePlayers: [],
  npcsInRoom: [],
  worldEvents: [],
  chatMessages: [],
  activeChatTab: 'room',
  combatState: null,
  notifications: [],

  setAuthenticated: (value) => set({ isAuthenticated: value }),
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setOnlineCount: (count) => set({ onlineCount: count }),
  
  setPlayer: (player) => set({ player }),
  updatePlayer: (updates) => set((state) => ({
    player: state.player ? { ...state.player, ...updates } : null
  })),
  
  updateRoom: (room) => {
    const normalizedRoom = {
      ...room,
      description: room.description ?? '',
      players: Array.isArray(room.players) ? room.players : [],
      npcs: Array.isArray(room.npcs) ? room.npcs : [],
      exits: Array.isArray(room.exits) ? room.exits : [],
    }

    set({
      currentRoom: normalizedRoom,
      onlinePlayers: normalizedRoom.players,
      npcsInRoom: normalizedRoom.npcs,
    })
  },
  
  setOnlinePlayers: (players) => set({ onlinePlayers: players }),
  
  setNpcsInRoom: (npcs) => set({ npcsInRoom: npcs }),
  
  addWorldEvent: (event) => set((state) => ({
    worldEvents: [...state.worldEvents.slice(-99), event]
  })),
  
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages.slice(-199), message]
  })),

  cycleChatTab: (reverse = false) => set((state) => {
    const tabs: ChatChannel[] = ['room', 'guild', 'private']
    const currentIndex = tabs.indexOf(state.activeChatTab)
    const index = currentIndex < 0 ? 0 : currentIndex
    const nextIndex = reverse
      ? (index - 1 + tabs.length) % tabs.length
      : (index + 1) % tabs.length
    return { activeChatTab: tabs[nextIndex] }
  }),
  
  updateCombat: (combatState) => set({ combatState }),
  clearCombat: () => set({ combatState: null }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}))
