import './style.css'
import { html, render } from 'lit'
import type { GameClientSnapshot } from './client/GameClient'
import { GameClient } from './client/GameClient'
import { GameCanvas } from './game/GameCanvas'
import './components/lobby'
import './components/chat'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app mount point')
}

const gameClient = new GameClient()

let currentSnapshot: GameClientSnapshot = gameClient.getSnapshot()
let gameCanvas: GameCanvas | null = null
let sceneContainer: HTMLDivElement | null = null

const handleCreateLobby = (event: Event) => {
  const detail = (event as CustomEvent<{ name: string }>).detail
  gameClient.createLobby(detail.name)
}

const handleJoinLobby = (event: Event) => {
  const detail = (event as CustomEvent<{ name: string; lobbyId: string }>).detail
  gameClient.joinLobby(detail.lobbyId, detail.name)
}

const handlePlayGame = () => {
  if (!currentSnapshot.isHost || currentSnapshot.gameStarted) {
    return
  }

  gameClient.startGame()
}

const renderApp = () => {
  const appMode: 'login' | 'lobby' | 'game' = currentSnapshot.gameStarted
    ? 'game'
    : currentSnapshot.lobbyId
      ? 'lobby'
      : 'login'

  const mainContent = (() => {
    if (appMode === 'game') {
      return html`
        <game-chat
          class="chat-dialog game-chat-overlay"
          .messages=${currentSnapshot.chatMessages}
          @send-message=${(event: Event) => {
            const detail = (event as CustomEvent<{ message: string }>).detail
            gameClient.sendMessage(detail.message)
          }}
        ></game-chat>
      `
    }

    if (appMode === 'lobby') {
      return html`<game-lobby
        .snapshot=${currentSnapshot}
        @play-game=${handlePlayGame}
      ></game-lobby>`
    }

    return html`<game-login
      @create-lobby=${handleCreateLobby}
      @join-lobby=${handleJoinLobby}
    ></game-login>`
  })()

  render(
    html`
      <section class="scene-shell ${appMode === 'game' ? 'game-mode' : ''}">
        ${appMode === 'game'
          ? html`
              <div class="game-hud">
                <p class="eyebrow">Game Mode</p>
                <p>Race view is active.</p>
              </div>
              <div id="scene" aria-label="3D scene"></div>
              ${mainContent}
            `
          : html`
              <div class="scene-copy">
                <h1>Cargame</h1>
              </div>
              ${mainContent}
              <div id="scene" aria-label="3D scene"></div>
            `}
      </section>
    `,
    app,
  )

  sceneContainer = app.querySelector<HTMLDivElement>('#scene')
}

const syncGameCanvas = () => {
  if (!sceneContainer) {
    return
  }

  if (!currentSnapshot.gameStarted) {
    if (gameCanvas) {
      gameCanvas.destroy()
      gameCanvas = null
    }

    return
  }

  if (!gameCanvas) {
    gameCanvas = new GameCanvas(sceneContainer)
  }

  gameCanvas.setLocalPlayerId(
    currentSnapshot.players.find((player) => player.socketId === currentSnapshot.socketId)?.id ?? null,
  )
  gameCanvas.syncPlayers(currentSnapshot.players)
}

renderApp()

sceneContainer = app.querySelector<HTMLDivElement>('#scene')

if (!sceneContainer) {
  throw new Error('Missing #scene mount point')
}

syncGameCanvas()

gameClient.onPlayerTransformUpdate(({ playerId, transform }) => {
  gameCanvas?.applyPlayerTransform(playerId, transform)
})

const publishLocalTransform = () => {
  const localTransform = gameCanvas?.getLocalPlayerTransform()

  if (localTransform) {
    gameClient.updatePlayerTransform(localTransform)
  }

  requestAnimationFrame(publishLocalTransform)
}

requestAnimationFrame(publishLocalTransform)

gameClient.onChange((snapshot) => {
  currentSnapshot = snapshot

  renderApp()
  syncGameCanvas()
})

window.addEventListener('beforeunload', () => {
  gameCanvas?.destroy()
})
