export type UserId = string

export interface PlayerTransform {
  position: {
    x: number
    y: number
    z: number
  }
  rotationY: number
}

export interface PlayerProfile {
  id: UserId
  socketId: string
  name: string
  connected: boolean
  transform: PlayerTransform
}

export interface RoomSummary {
  id: string
  name: string
  playerCount: number
  maxPlayers: number
}

export interface LobbyStatePayload {
  lobbyId: string
  hostSocketId: string
  gameStarted: boolean
  room: RoomSummary
  players: PlayerProfile[]
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: number
}

export interface ClientToServerEvents {
  createLobby: (payload: { name: string }) => void
  joinLobby: (payload: { lobbyId: string; name: string }) => void
  leaveLobby: () => void
  startGame: () => void
  sendChatMessage: (payload: { content: string }) => void
  updatePlayerTransform: (payload: PlayerTransform) => void
}

export interface ServerToClientEvents {
  lobbyCreated: (payload: LobbyStatePayload) => void
  lobbyJoined: (payload: LobbyStatePayload) => void
  lobbyState: (payload: LobbyStatePayload) => void
  lobbyLeft: (payload: { lobbyId: string }) => void
  lobbyError: (payload: { message: string }) => void
  gameStarted: (payload: { lobbyId: string }) => void
  chatMessage: (payload: ChatMessage) => void
  playerTransformUpdated: (payload: { playerId: string; transform: PlayerTransform }) => void
}