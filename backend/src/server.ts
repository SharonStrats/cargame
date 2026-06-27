import express from 'express'
import http from 'node:http'
import { Server } from 'socket.io'
import { randomBytes } from 'node:crypto'
import type { ChatMessage, ClientToServerEvents, LobbyStatePayload, PlayerProfile, RoomSummary, ServerToClientEvents } from '@cargame/shared'
import { LobbyStore } from './lobbies/lobbyStore.js'

interface SocketData {
  lobbyId?: string
}

const PORT = Number(process.env.PORT ?? 3000)
const frontendOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const lobbyStore = new LobbyStore()

const app = express()

app.get('/', (_request, response) => {
  response.send('cargame backend is running')
})

app.get('/health', (_request, response) => {
  response.json({ ok: true })
})

const server = http.createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(server, {
  cors: {
    origin: frontendOrigins.length === 1 ? frontendOrigins[0] : frontendOrigins,
  },
})

io.on('connection', (socket) => {
  socket.on('createLobby', ({ name }) => {
    const snapshot = lobbyStore.createLobby(socket.id, name)

    socket.data.lobbyId = snapshot.lobby.id
    socket.join(snapshot.lobby.id)

    socket.emit('lobbyCreated', {
      lobbyId: snapshot.lobby.id,
      hostSocketId: snapshot.hostSocketId,
      gameStarted: snapshot.gameStarted,
      room: snapshot.room,
      players: snapshot.players,
    })

    io.to(snapshot.lobby.id).emit('lobbyState', {
      lobbyId: snapshot.lobby.id,
      hostSocketId: snapshot.hostSocketId,
      gameStarted: snapshot.gameStarted,
      room: snapshot.room,
      players: snapshot.players,
    })
  })

  socket.on('joinLobby', ({ lobbyId, name }) => {
    const snapshot = lobbyStore.joinLobby(socket.id, lobbyId, name)

    if (!snapshot) {
      socket.emit('lobbyError', { message: 'Lobby not found or full.' })
      return
    }

    socket.data.lobbyId = snapshot.lobby.id
    socket.join(snapshot.lobby.id)

    socket.emit('lobbyJoined', {
      lobbyId: snapshot.lobby.id,
      hostSocketId: snapshot.hostSocketId,
      gameStarted: snapshot.gameStarted,
      room: snapshot.room,
      players: snapshot.players,
    })

    io.to(snapshot.lobby.id).emit('lobbyState', {
      lobbyId: snapshot.lobby.id,
      hostSocketId: snapshot.hostSocketId,
      gameStarted: snapshot.gameStarted,
      room: snapshot.room,
      players: snapshot.players,
    })
  })

  socket.on('leaveLobby', () => {
    const result = lobbyStore.leaveSocket(socket.id)

    if (!result) {
      return
    }

    socket.leave(result.lobbyId)
    socket.data.lobbyId = undefined

    if (result.deleted) {
      io.to(result.lobbyId).emit('lobbyLeft', { lobbyId: result.lobbyId })
      return
    }

    if (result.snapshot) {
      io.to(result.lobbyId).emit('lobbyState', {
        lobbyId: result.snapshot.lobby.id,
        hostSocketId: result.snapshot.hostSocketId,
        gameStarted: result.snapshot.gameStarted,
        room: result.snapshot.room,
        players: result.snapshot.players,
      })
    }
  })

  socket.on('startGame', () => {
    const snapshot = lobbyStore.startGame(socket.id)

    if (!snapshot) {
      socket.emit('lobbyError', { message: 'Join a lobby before starting the game.' })
      return
    }

    io.to(snapshot.lobby.id).emit('lobbyState', {
      lobbyId: snapshot.lobby.id,
      hostSocketId: snapshot.hostSocketId,
      gameStarted: snapshot.gameStarted,
      room: snapshot.room,
      players: snapshot.players,
    })
  })

  socket.on('sendChatMessage', ({ content }) => {
    const lobby = lobbyStore.getLobbyBySocketId(socket.id)
    const player = lobbyStore.getPlayerBySocketId(socket.id)

    if (!lobby || !player) {
      socket.emit('lobbyError', { message: 'Join a lobby before sending chat messages.' })
      return
    }

    const message: ChatMessage = {
      id: randomBytes(8).toString('hex'),
      senderId: player.id,
      senderName: player.name,
      content: content.trim(),
      timestamp: Date.now(),
    }

    if (!message.content) {
      return
    }

    io.to(lobby.id).emit('chatMessage', message)
  })

  socket.on('updatePlayerTransform', (transform) => {
    const snapshot = lobbyStore.updatePlayerTransform(socket.id, transform)

    if (!snapshot) {
      return
    }

    const player = lobbyStore.getPlayerBySocketId(socket.id)

    if (player) {
      io.to(snapshot.lobby.id).emit('playerTransformUpdated', {
        playerId: player.id,
        transform,
      })
    }
  })

  socket.on('disconnect', () => {
    const result = lobbyStore.leaveSocket(socket.id)

    if (!result) {
      return
    }

    if (result.deleted) {
      io.to(result.lobbyId).emit('lobbyLeft', { lobbyId: result.lobbyId })
      return
    }

    if (result.snapshot) {
      io.to(result.lobbyId).emit('lobbyState', {
        lobbyId: result.snapshot.lobby.id,
        hostSocketId: result.snapshot.hostSocketId,
        gameStarted: result.snapshot.gameStarted,
        room: result.snapshot.room,
        players: result.snapshot.players,
      })
    }
  })
})

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})