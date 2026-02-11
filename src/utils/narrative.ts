export const errorToNarrative = (error: string): string => {
  const narratives: Record<string, string> = {
    'connection_failed': '你感觉真气不畅，无法与江湖建立联系...',
    'auth_failed': '你的江湖令似乎出了问题，需要重新验证身份...',
    'timeout': '四周云雾缭绕，你暂时看不清方向...',
    'server_error': '天地元气震荡，似乎有什么变故发生...',
    'invalid_command': '你一时恍惚，不知该如何是好...',
    'move_failed': '这个方向没有路。',
    'move_blocked': '有人挡住了你的去路。',
    'move_combat': '你正在战斗中，无法移动。',
    'combat_target_invalid': '目标不存在。',
    'combat_in_progress': '你已经在战斗中了。',
    'combat_not_in_range': '目标太远了。',
    'pvp_target_offline': '对方不在江湖中。',
    'pvp_in_safe_zone': '这里是安全区，禁止斗殴。',
    'pvp_level_diff': '对方实力与你相差悬殊。',
    'pvp_target_fighting': '对方正在战斗中。',
    'guild_name_exists': '该帮派名已被使用。',
    'guild_not_found': '找不到该帮派。',
    'guild_full': '该帮派人数已满。',
    'guild_level_low': '你的等级不足以创建帮派。',
    'guild_not_enough_gold': '你的金币不足以创建帮派。',
    'quest_not_found': '该任务不存在。',
    'quest_prerequisites': '你还不能接取这个任务。',
    'quest_already_active': '你已经接受了这个任务。',
    'quest_already_completed': '你已经完成过这个任务了。',
  }
  
  return narratives[error] || '江湖中传来一阵莫名的波动...'
}

export const statusToNarrative = (status: string): string => {
  const narratives: Record<string, string> = {
    'connecting': '你正在尝试进入江湖...',
    'connected': '你已成功踏入江湖世界。',
    'disconnected': '你感觉与外界的联系中断了...',
    'reconnecting': '你正在努力恢复与江湖的联系...',
  }
  
  return narratives[status] || status
}

export const getReconnectNarrative = (retryCount: number): string => {
  const narratives = [
    '你感觉真气不畅，正在调息恢复...',
    '四周云雾缭绕，视线受阻...',
    '你正在努力冲破穴道封印...',
    '天地元气震荡，你正在适应...',
  ]
  
  return narratives[retryCount % narratives.length]
}

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
