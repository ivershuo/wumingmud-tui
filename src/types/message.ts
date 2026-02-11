export interface ClientMessage {
  type: string
  timestamp: number
  data: any
  trace_id?: string
  request_id?: string
}

export interface ServerMessage {
  type: string
  timestamp: number
  data: any
  trace_id?: string
  request_id?: string
}

export type MessageType = 
  | 'auth_ok'
  | 'auth_failed'
  | 'room_update'
  | 'player_update'
  | 'chat'
  | 'world_event'
  | 'combat_start'
  | 'combat_round'
  | 'combat_end'
  | 'error'
  | 'ping'
  | 'pong'
  | 'player_input'
  | 'move'
  | 'combat_attack'
  | 'pvp_challenge'
  | 'pvp_response'
  | 'npc_talk'
  | 'quest_accept'
  | 'quest_list'
  | 'guild_create'
  | 'guild_join'
  | 'guild_leave'
  | 'pvp_challenge_received'
  | 'npc_dialogue'
  | 'quest_update'
  | 'quest_complete'
  | 'guild_notification'
  | 'online_update'
  | 'quest_update'
  | 'npc_talk'
