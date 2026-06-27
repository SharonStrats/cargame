import type { ClientToServerEvents, ServerToClientEvents } from "@cargame/shared"
import { io, Socket } from "socket.io-client"

function getBackendUrl() {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim()

  if (configuredUrl) {
    return configuredUrl
  }

  return import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin
}

export class SocketClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>

  constructor(url: string = getBackendUrl()) {
    this.socket = io(url, {
      autoConnect: false,
    })
  }

  connect() {
    this.socket.connect()
  }

  disconnect() {
    this.socket.disconnect()
  }

  emit<K extends keyof ClientToServerEvents>(event: K, ...args: Parameters<ClientToServerEvents[K]>) {
    this.socket.emit(event as never, ...(args as never))
  }

  on<K extends keyof ServerToClientEvents>(event: K, listener: ServerToClientEvents[K]) {
    this.socket.on(event as never, listener as never)
  }

  off<K extends keyof ServerToClientEvents>(event: K, listener?: ServerToClientEvents[K]) {
    this.socket.off(event as never, listener as never)
  }

  offAll() {
    this.socket.removeAllListeners()
  }

  getSocket() {
    return this.socket
  }
}
