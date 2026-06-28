import './style.css'
import { html, render } from 'lit'
import { DEFAULT_CAR_APPEARANCE, type CarAppearance, type PlayerProfile, type PlayerTransform } from '@cargame/shared'
import type { GameClientSnapshot } from './client/GameClient'
import { GameClient } from './client/GameClient'
import './components/lobby'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app mount point')
}

const gameClient = new GameClient()

type GameCanvasLike = {
  destroy: () => void
  setLocalPlayerId: (playerId: string | null) => void
  syncPlayers: (players: PlayerProfile[]) => void
  getLocalPlayerTransform: () => PlayerTransform | null
  applyPlayerTransform: (playerId: string, transform: PlayerTransform) => void
}

type GameCanvasConstructor = new (container: HTMLElement) => GameCanvasLike

let currentSnapshot: GameClientSnapshot = gameClient.getSnapshot()
let gameCanvas: GameCanvasLike | null = null
let gameCanvasConstructor: GameCanvasConstructor | null = null
let gameUiLoadPromise: Promise<void> | null = null
let gameUiLoaded = false
let sceneContainer: HTMLDivElement | null = null
let draftAppearance: CarAppearance = DEFAULT_CAR_APPEARANCE
let skinPickerOpen = false

const ensureGameUiLoaded = () => {
  if (!gameUiLoadPromise) {
    gameUiLoadPromise = Promise.all([import('./game/GameCanvas'), import('./components/chat')]).then(
      ([gameCanvasModule]) => {
        gameCanvasConstructor = gameCanvasModule.GameCanvas as GameCanvasConstructor
        gameUiLoaded = true
      },
    )
  }

  return gameUiLoadPromise
}

const handleCreateLobby = (event: Event) => {
  const detail = (event as CustomEvent<{ name: string; appearance: CarAppearance }>).detail
  gameClient.createLobby(detail.name, detail.appearance)
}

const handleJoinLobby = (event: Event) => {
  const detail = (event as CustomEvent<{ name: string; lobbyId: string; appearance: CarAppearance }>).detail
  gameClient.joinLobby(detail.lobbyId, detail.name, detail.appearance)
}

const handlePlayGame = () => {
  if (!currentSnapshot.isHost || currentSnapshot.gameStarted) {
    return
  }

  void ensureGameUiLoaded()
  gameClient.startGame()
}

const handleOpenSkinPicker = () => {
  console.log('[skin-picker] open requested', {
    mode: currentSnapshot.gameStarted ? 'game' : currentSnapshot.lobbyId ? 'lobby' : 'login',
    currentSkin: draftAppearance,
  })
  skinPickerOpen = true
  renderApp()
}

const handleCloseSkinPicker = () => {
  console.log('[skin-picker] close requested')
  skinPickerOpen = false
  renderApp()
}

const handleSelectSkin = (event: Event) => {
  const detail = (event as CustomEvent<{ appearance: CarAppearance }>).detail

  console.log('[skin-picker] skin selected', detail.appearance)

  draftAppearance = detail.appearance
  skinPickerOpen = false

  if (currentSnapshot.lobbyId) {
    gameClient.updatePlayerAppearance(detail.appearance)
  }

  renderApp()
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
        .appearance=${draftAppearance}
        @play-game=${handlePlayGame}
        @pick-skin=${handleOpenSkinPicker}
      ></game-lobby>`
    }

    return html`<game-login
      .appearance=${draftAppearance}
      @create-lobby=${handleCreateLobby}
      @join-lobby=${handleJoinLobby}
      @pick-skin=${handleOpenSkinPicker}
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
                ${gameUiLoaded ? '' : html`<p>Loading game assets...</p>`}
              </div>
              <div id="scene" aria-label="3D scene"></div>
              ${gameUiLoaded ? mainContent : html`<div class="game-loading">Preparing the race...</div>`}
            `
          : html`
              <div class="scene-copy">
                <h1>Cargame</h1>
              </div>
              ${mainContent}
              <div id="scene" aria-label="3D scene"></div>
            `}
      </section>
      <game-car-skin-picker
        .open=${skinPickerOpen}
        .appearance=${draftAppearance}
        @close-picker=${handleCloseSkinPicker}
        @select-skin=${handleSelectSkin}
      ></game-car-skin-picker>
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

  if (!gameCanvasConstructor) {
    void ensureGameUiLoaded().then(() => {
      if (!currentSnapshot.gameStarted) {
        return
      }

      renderApp()
      syncGameCanvas()
    })
    return
  }

  if (!gameCanvas) {
    gameCanvas = new gameCanvasConstructor(sceneContainer)
  }

  gameCanvas.setLocalPlayerId(currentSnapshot.players.find((player) => player.socketId === currentSnapshot.socketId)?.id ?? null)
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
