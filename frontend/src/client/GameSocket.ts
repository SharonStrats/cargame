import type { LobbyStatePayload } from '@cargame/shared'
import type { ChatMessage } from '@cargame/shared'
import type { CarAppearance } from '@cargame/shared'
import type { PlayerTransform } from '@cargame/shared'
import { SocketClient } from './SocketClient'

export type GameSocketUpdate =
  | { type: 'connected'; socketId: string }
  | { type: 'disconnected' }
  | { type: 'lobby-created'; payload: LobbyStatePayload }
  | { type: 'lobby-joined'; payload: LobbyStatePayload }
  | { type: 'lobby-state'; payload: LobbyStatePayload }
  | { type: 'lobby-left'; lobbyId: string }
  | { type: 'lobby-error'; message: string }
  | { type: 'game-started'; lobbyId: string }
  | { type: 'chat-message'; message: ChatMessage }
  | { type: 'player-transform-updated'; playerId: string; transform: PlayerTransform }

export class GameSocket {
  private readonly socketClient: SocketClient
  private readonly listeners = new Set<(update: GameSocketUpdate) => void>()

  constructor(socketClient = new SocketClient()) {
    this.socketClient = socketClient
    this.registerSocketHandlers()
    this.socketClient.connect()
  }

  private registerSocketHandlers() {
    const socket = this.socketClient.getSocket()

    socket.on('connect', () => this.emitUpdate({ type: 'connected', socketId: socket.id ?? '' }))
    socket.on('disconnect', () => this.emitUpdate({ type: 'disconnected' }))
    this.socketClient.on('lobbyCreated', (payload) => this.emitUpdate({ type: 'lobby-created', payload }))
    this.socketClient.on('lobbyJoined', (payload) => this.emitUpdate({ type: 'lobby-joined', payload }))
    this.socketClient.on('lobbyState', (payload) => this.emitUpdate({ type: 'lobby-state', payload }))
    this.socketClient.on('lobbyLeft', ({ lobbyId }) => this.emitUpdate({ type: 'lobby-left', lobbyId }))
    this.socketClient.on('lobbyError', ({ message }) => this.emitUpdate({ type: 'lobby-error', message }))
    this.socketClient.on('gameStarted', ({ lobbyId }) => this.emitUpdate({ type: 'game-started', lobbyId }))
    this.socketClient.on('chatMessage', (message) => this.emitUpdate({ type: 'chat-message', message }))
    this.socketClient.on('playerTransformUpdated', ({ playerId, transform }) =>
      this.emitUpdate({ type: 'player-transform-updated', playerId, transform }),
    )
  }

  private emitUpdate(update: GameSocketUpdate) {
    for (const listener of this.listeners) {
      listener(update)
    }
  }

  public onUpdate(listener: (update: GameSocketUpdate) => void) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  public createLobby(name: string, appearance?: CarAppearance) {
    this.socketClient.emit('createLobby', { name, appearance })
  }

  public joinLobby(lobbyId: string, name: string, appearance?: CarAppearance) {
    this.socketClient.emit('joinLobby', { lobbyId, name, appearance })
  }

  public leaveLobby() {
    this.socketClient.emit('leaveLobby')
  }

  public startGame() {
    this.socketClient.emit('startGame')
  }

  public sendChatMessage(content: string) {
    this.socketClient.emit('sendChatMessage', { content })
  }

  public updatePlayerTransform(transform: PlayerTransform) {
    this.socketClient.emit('updatePlayerTransform', transform)
  }

  public updatePlayerAppearance(appearance: CarAppearance) {
    this.socketClient.emit('updatePlayerAppearance', appearance)
  }

  public disconnect() {
    this.socketClient.disconnect()
  }
}