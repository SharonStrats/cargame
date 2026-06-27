import type { ChatMessage } from '@cargame/shared'
import { ChatSocket, type ChatSocketUpdate } from './ChatSocket'

export interface ChatClientSnapshot {
  connection: 'connecting' | 'connected' | 'disconnected'
  socketId: string | null
  messages: ChatMessage[]
  error: string
}

export class ChatClient {
  private readonly chatSocket: ChatSocket
  private connection: ChatClientSnapshot['connection'] = 'connecting'
  private socketId: string | null = null
  private messages: ChatMessage[] = []
  private error = ''
  private readonly listeners = new Set<(snapshot: ChatClientSnapshot) => void>()

  constructor() {
    this.chatSocket = new ChatSocket()
    this.chatSocket.onUpdate(this.handleChatSocketUpdate)
  }

  private notifyListeners() {
    const snapshot = this.getSnapshot()

    for (const listener of this.listeners) {
      listener(snapshot)
    }
  }

  private handleChatSocketUpdate = (update: ChatSocketUpdate) => {
    switch (update.type) {
      case 'connected':
        this.connection = 'connected'
        this.socketId = update.socketId
        this.notifyListeners()
        break
      case 'disconnected':
        this.connection = 'disconnected'
        this.notifyListeners()
        break
      case 'message':
        this.messages = [...this.messages, update.message]
        this.notifyListeners()
        break
      case 'error':
        this.error = update.message
        this.notifyListeners()
        break
    }
  }

  public getSnapshot(): ChatClientSnapshot {
    return {
      connection: this.connection,
      socketId: this.socketId,
      messages: this.messages,
      error: this.error,
    }
  }

  public onChange(listener: (snapshot: ChatClientSnapshot) => void) {
    this.listeners.add(listener)
    listener(this.getSnapshot())

    return () => {
      this.listeners.delete(listener)
    }
  }

  public sendMessage(content: string) {
    this.chatSocket.sendMessage(content)
  }
}
