import type { ChatMessage } from '@cargame/shared'
import { SocketClient } from './SocketClient'

export type ChatSocketUpdate =
  | { type: 'connected'; socketId: string }
  | { type: 'disconnected' }
  | { type: 'message'; message: ChatMessage }
  | { type: 'error'; message: string }

export class ChatSocket {
  private readonly socketClient: SocketClient
  private readonly listeners = new Set<(update: ChatSocketUpdate) => void>()

  constructor(socketClient = new SocketClient()) {
    this.socketClient = socketClient
    this.registerSocketHandlers()
    this.socketClient.connect()
  }

  private registerSocketHandlers() {
    const socket = this.socketClient.getSocket()

    socket.on('connect', () => this.emitUpdate({ type: 'connected', socketId: socket.id ?? '' }))
    socket.on('disconnect', () => this.emitUpdate({ type: 'disconnected' }))
    this.socketClient.on('chatMessage', (message) => this.emitUpdate({ type: 'message', message }))
    this.socketClient.on('lobbyError', ({ message }) => this.emitUpdate({ type: 'error', message }))
  }

  private emitUpdate(update: ChatSocketUpdate) {
    for (const listener of this.listeners) {
      listener(update)
    }
  }

  public onUpdate(listener: (update: ChatSocketUpdate) => void) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  public sendMessage(content: string) {
    this.socketClient.emit('sendChatMessage', { content })
  }

  public disconnect() {
    this.socketClient.disconnect()
  }
}
