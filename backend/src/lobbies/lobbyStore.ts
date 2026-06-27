import { randomBytes } from 'node:crypto'
import type { PlayerProfile, PlayerTransform, RoomSummary, UserId } from '@cargame/shared'

export interface LobbyPlayer extends PlayerProfile {
  socketId: string
}

export interface LobbyRecord {
  id: string
  name: string
  hostSocketId: string
  gameStarted: boolean
  players: LobbyPlayer[]
  maxPlayers: number
  createdAt: number
}

export interface LobbySnapshot {
  lobby: LobbyRecord
  hostSocketId: string
  gameStarted: boolean
  room: RoomSummary
  players: PlayerProfile[]
}

export interface LeaveResult {
  lobbyId: string
  snapshot: LobbySnapshot | null
  deleted: boolean
}

const DEFAULT_MAX_PLAYERS = 8

function createLobbyId() {
  return randomBytes(3).toString('hex').toUpperCase()
}

function toPlayerProfile(player: LobbyPlayer): PlayerProfile {
  return {
    id: player.id,
    socketId: player.socketId,
    name: player.name,
    connected: player.connected,
    transform: player.transform,
  }
}

function toSnapshot(lobby: LobbyRecord): LobbySnapshot {
  return {
    lobby,
    hostSocketId: lobby.hostSocketId,
    gameStarted: lobby.gameStarted,
    room: {
      id: lobby.id,
      name: lobby.name,
      playerCount: lobby.players.length,
      maxPlayers: lobby.maxPlayers,
    },
    players: lobby.players.map(toPlayerProfile),
  }
}

export class LobbyStore {
  private readonly lobbies = new Map<string, LobbyRecord>()

  private readonly socketToLobbyId = new Map<string, string>()

  private readonly socketToPlayerId = new Map<string, UserId>()

  public getLobbyIdBySocketId(socketId: string) {
    return this.socketToLobbyId.get(socketId) ?? null
  }

  public getPlayerBySocketId(socketId: string) {
    const lobbyId = this.socketToLobbyId.get(socketId)

    if (!lobbyId) {
      return null
    }

    const lobby = this.lobbies.get(lobbyId)

    if (!lobby) {
      return null
    }

    return lobby.players.find((player) => player.socketId === socketId) ?? null
  }

  public getLobbyBySocketId(socketId: string) {
    const lobbyId = this.socketToLobbyId.get(socketId)

    if (!lobbyId) {
      return null
    }

    return this.lobbies.get(lobbyId) ?? null
  }

  createLobby(socketId: string, name: string, maxPlayers = DEFAULT_MAX_PLAYERS): LobbySnapshot {
    this.leaveSocket(socketId)

    const id = createLobbyId()
    const player = this.createPlayer(socketId, name)
    const lobby: LobbyRecord = {
      id,
      name: `Lobby ${id}`,
      hostSocketId: socketId,
      gameStarted: false,
      players: [player],
      maxPlayers,
      createdAt: Date.now(),
    }

    this.lobbies.set(id, lobby)
    this.socketToLobbyId.set(socketId, id)
    this.socketToPlayerId.set(socketId, player.id)

    return toSnapshot(lobby)
  }

  joinLobby(socketId: string, lobbyId: string, name: string): LobbySnapshot | null {
    const lobby = this.lobbies.get(lobbyId)

    if (!lobby || lobby.players.length >= lobby.maxPlayers) {
      return null
    }

    this.leaveSocket(socketId)

    const player = this.createPlayer(socketId, name)
    lobby.players.push(player)
    lobby.gameStarted = false
    this.socketToLobbyId.set(socketId, lobbyId)
    this.socketToPlayerId.set(socketId, player.id)

    return toSnapshot(lobby)
  }

  startGame(socketId: string): LobbySnapshot | null {
    const lobby = this.getLobbyBySocketId(socketId)

    if (!lobby || lobby.hostSocketId !== socketId) {
      return null
    }

    lobby.gameStarted = true

    return toSnapshot(lobby)
  }

  leaveSocket(socketId: string): LeaveResult | null {
    const lobbyId = this.socketToLobbyId.get(socketId)

    if (!lobbyId) {
      return null
    }

    const lobby = this.lobbies.get(lobbyId)

    this.socketToLobbyId.delete(socketId)
    this.socketToPlayerId.delete(socketId)

    if (!lobby) {
      return {
        lobbyId,
        snapshot: null,
        deleted: false,
      }
    }

    lobby.players = lobby.players.filter((player) => player.socketId !== socketId)

    if (lobby.players.length === 0) {
      this.lobbies.delete(lobbyId)

      return {
        lobbyId,
        snapshot: null,
        deleted: true,
      }
    }

    if (lobby.hostSocketId === socketId) {
      lobby.hostSocketId = lobby.players[0].socketId
    }

    return {
      lobbyId,
      snapshot: toSnapshot(lobby),
      deleted: false,
    }
  }

  private createPlayer(socketId: string, name: string): LobbyPlayer {
    const trimmedName = name.trim()

    return {
      id: randomBytes(8).toString('hex'),
      socketId,
      name: trimmedName.length > 0 ? trimmedName : 'Player',
      connected: true,
      transform: {
        position: {
          x: 0,
          y: -0.55,
          z: 0,
        },
        rotationY: 0,
      },
    }
  }

  public updatePlayerTransform(socketId: string, transform: PlayerTransform): LobbySnapshot | null {
    const lobbyId = this.socketToLobbyId.get(socketId)

    if (!lobbyId) {
      return null
    }

    const lobby = this.lobbies.get(lobbyId)

    if (!lobby) {
      return null
    }

    const player = lobby.players.find((currentPlayer) => currentPlayer.socketId === socketId)

    if (!player) {
      return null
    }

    player.transform = transform

    return toSnapshot(lobby)
  }
}