import type { ChatMessage, LobbyStatePayload, PlayerProfile, PlayerTransform } from '@cargame/shared'
import { GameSocket, type GameSocketUpdate } from './GameSocket'

export interface GameClientSnapshot {
  connection: 'connecting' | 'connected' | 'disconnected'
  socketId: string | null
  lobbyId: string | null
  hostSocketId: string | null
  isHost: boolean
  gameStarted: boolean
  players: PlayerProfile[]
  chatMessages: ChatMessage[]
  error: string
}

export class GameClient {
  private readonly gameSocket: GameSocket
  private lobbyId: string | null = null
  private hostSocketId: string | null = null
  private socketId: string | null = null
  private players: Map<string, PlayerProfile> = new Map()
  private chatMessages: ChatMessage[] = []
  private connection: GameClientSnapshot['connection'] = 'connecting'
  private gameStarted = false
  private error = ''
  private readonly playerTransformListeners = new Set<(update: { playerId: string; transform: PlayerTransform }) => void>()
  private readonly listeners = new Set<(snapshot: GameClientSnapshot) => void>()

  constructor() {
    this.gameSocket = new GameSocket()
    this.registerSocketHandlers()
  }

  private setLobbyId(lobbyId: string | null) {
    this.lobbyId = lobbyId
  }

  private setConnection(connection: GameClientSnapshot['connection']) {
    this.connection = connection
  }

  private setSocketId(socketId: string | null) {
    this.socketId = socketId
  }

  private setHostSocketId(hostSocketId: string | null) {
    this.hostSocketId = hostSocketId
  }

  private setError(error: string) {
    this.error = error
  }

  private setGameStarted(gameStarted: boolean) {
    this.gameStarted = gameStarted
  }

  private upsertPlayer(id: string, player: PlayerProfile) {
    this.players.set(id, player)
  }

  private clearPlayers() {
    this.players.clear()
  }

  private appendChatMessage(message: ChatMessage) {
    this.chatMessages = [...this.chatMessages, message]
  }

  private notifyListeners() {
    const snapshot = this.getSnapshot()

    for (const listener of this.listeners) {
      listener(snapshot)
    }
  }

  private registerSocketHandlers() {
    this.gameSocket.onUpdate(this.handleGameSocketUpdate)
  }

  private handleLobbyState = (payload: LobbyStatePayload) => {
    this.setLobbyId(payload.lobbyId)
    this.setHostSocketId(payload.hostSocketId)
    this.setGameStarted(payload.gameStarted)
    this.clearPlayers()
    this.setError('')

    for (const player of payload.players) {
      this.upsertPlayer(player.id, player)
    }

    this.notifyListeners()
  }

  private handleLobbyLeft = ({ lobbyId }: { lobbyId: string }) => {
    if (this.lobbyId === lobbyId) {
      this.setLobbyId(null)
      this.clearPlayers()
      this.setGameStarted(false)
      this.chatMessages = []
      this.notifyListeners()
    }
  }

  private handleGameSocketUpdate = (update: GameSocketUpdate) => {
    switch (update.type) {
      case 'connected':
        this.setConnection('connected')
        this.setSocketId(update.socketId)
        this.notifyListeners()
        break
      case 'disconnected':
        this.setConnection('disconnected')
        this.notifyListeners()
        break
      case 'lobby-created':
      case 'lobby-joined':
      case 'lobby-state':
        this.handleLobbyState(update.payload)
        break
      case 'lobby-left':
        this.handleLobbyLeft({ lobbyId: update.lobbyId })
        break
      case 'lobby-error':
        this.setError(update.message)
        this.notifyListeners()
        console.error(update.message)
        break
      case 'game-started':
        if (this.lobbyId === update.lobbyId) {
          this.setGameStarted(true)
          this.notifyListeners()
        }
        break
      case 'chat-message':
        this.appendChatMessage(update.message)
        this.notifyListeners()
        break
      case 'player-transform-updated':
        for (const listener of this.playerTransformListeners) {
          listener({ playerId: update.playerId, transform: update.transform })
        }
        break
    }
  }

  public getLobbyId(): string | null {
    return this.lobbyId
  }

  public getPlayers(): PlayerProfile[] {
    return [...this.players.values()]
  }

  public getSnapshot(): GameClientSnapshot {
    const isHost = Boolean(this.socketId && this.hostSocketId && this.socketId === this.hostSocketId)

    return {
      connection: this.connection,
      socketId: this.socketId,
      lobbyId: this.lobbyId,
      hostSocketId: this.hostSocketId,
      isHost,
      gameStarted: this.gameStarted,
      players: this.getPlayers(),
      chatMessages: this.chatMessages,
      error: this.error,
    }
  }

  public onChange(listener: (snapshot: GameClientSnapshot) => void) {
    this.listeners.add(listener)
    listener(this.getSnapshot())

    return () => {
      this.listeners.delete(listener)
    }
  }

  public onPlayerTransformUpdate(listener: (update: { playerId: string; transform: PlayerTransform }) => void) {
    this.playerTransformListeners.add(listener)

    return () => {
      this.playerTransformListeners.delete(listener)
    }
  }

  public createLobby(name: string) {
    this.gameSocket.createLobby(name)
  }

  public joinLobby(lobbyId: string, name: string) {
    this.gameSocket.joinLobby(lobbyId, name)
  }

  public leaveLobby() {
    this.gameSocket.leaveLobby()
  }

  public startGame() {
    this.gameSocket.startGame()
  }

  public sendMessage(content: string) {
    this.gameSocket.sendChatMessage(content)
  }

  public updatePlayerTransform(transform: PlayerTransform) {
    this.gameSocket.updatePlayerTransform(transform)
  }
}
