export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  name: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    token: string
    expires_in: number
    player: {
      id: string
      name: string
      level: number
    }
  }
  error?: string
  message?: string
}

export interface ErrorResponse {
  success: false
  error: string
  message: string
}

export interface ParsedCommand {
  type: string
  data: any
}
