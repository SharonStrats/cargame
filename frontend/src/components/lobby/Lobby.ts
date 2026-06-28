import { css, html, LitElement } from 'lit'
import { DEFAULT_CAR_APPEARANCE, type CarAppearance } from '@cargame/shared'
import type { GameClientSnapshot } from '../../client/GameClient'

const colorToHex = (color: number) => `#${color.toString(16).padStart(6, '0')}`

export class Lobby extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100svh;
      z-index: 2;
      pointer-events: auto;
    }

    dialog {
      position: fixed;
      inset: 0;
      margin: 0;
      width: min(420px, calc(100vw - 32px));
      max-height: min(80svh, 620px);
      padding: 20px;
      border: 0;
      border-radius: 18px;
      background: rgba(11, 16, 32, 0.72);
      color: #f3f6ff;
      backdrop-filter: blur(14px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      pointer-events: auto;
      overflow: auto;
      box-sizing: border-box;
      margin: auto;
    }

    h2,
    p,
    li {
      color: #f3f6ff;
    }

    ul {
      margin: 0 0 12px;
      padding-left: 18px;
    }

    li {
      list-style: none;
      margin-bottom: 10px;
    }

    .player-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .player-car {
      width: 54px;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 8px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .player-name {
      font-weight: 600;
      color: #f3f6ff;
    }

    .player-status {
      margin-left: 6px;
      font-size: 0.86rem;
      color: rgba(243, 246, 255, 0.68);
    }

    .row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .secondary {
      background: rgba(255, 255, 255, 0.12);
      color: #f3f6ff;
    }

    button {
      margin-top: 12px;
      padding: 10px 14px;
      border: 0;
      border-radius: 999px;
      background: #c084fc;
      color: #0b1020;
      cursor: pointer;
      font: inherit;
    }

    button[disabled] {
      opacity: 0.55;
      cursor: not-allowed;
    }
  `

  private _snapshot: GameClientSnapshot | null = null

  private _appearance: CarAppearance = DEFAULT_CAR_APPEARANCE

  public get appearance() {
    return this._appearance
  }

  public set appearance(value: CarAppearance) {
    const oldValue = this._appearance
    this._appearance = value ?? DEFAULT_CAR_APPEARANCE
    this.requestUpdate('appearance', oldValue)
  }

  public get snapshot(): GameClientSnapshot | null {
    return this._snapshot
  }

  public set snapshot(value: GameClientSnapshot | null) {
    const oldValue = this._snapshot
    this._snapshot = value
    this.requestUpdate('snapshot', oldValue)
  }

  private get canStartGame() {
    return Boolean(this.snapshot?.lobbyId && this.snapshot.isHost)
  }

  render() {
    return html`
      <dialog open aria-labelledby="lobby-title">
        <h2 id="lobby-title">Lobby</h2>

        ${this.snapshot
          ? html`
              <p>Connection: ${this.snapshot.connection}</p>
              <p>Lobby code: <strong>${this.snapshot.lobbyId}</strong></p>
              <p>You are ${this.snapshot.isHost ? 'the host' : 'a player'}.</p>
              <p>Players: ${this.snapshot.players.length}</p>
              <ul>
                ${this.snapshot.players.map(
                  (player) => html`
                    <li>
                      <div class="player-row">
                        ${this.renderPlayerCar(player.appearance.color)}
                        <div>
                          <span class="player-name">${player.name}</span>
                          ${player.connected ? '' : html`<span class="player-status">(offline)</span>`}
                        </div>
                      </div>
                    </li>
                  `,
                )}
              </ul>
            `
          : html`<p>No lobby selected yet.</p>`}

        <div class="row">
          <button type="button" class="secondary" @click=${this.handleOpenPicker}>Pick Skin</button>
        </div>

        ${this.canStartGame
          ? html`<button @click=${this.handlePlayGame}>Play Game</button>`
          : html`<button disabled title="Only the lobby creator can start the game">Play Game</button>`}
      </dialog>
    `
  }

  private handlePlayGame = () => {
    if (!this.canStartGame) {
      return
    }

    this.dispatchEvent(new CustomEvent('play-game', { bubbles: true, composed: true }))
  }

  private handleOpenPicker = () => {
    console.log('[lobby] pick skin clicked', {
      lobbyId: this.snapshot?.lobbyId,
      playerId: this.snapshot?.socketId,
      appearance: this.appearance,
    })

    this.dispatchEvent(new CustomEvent('pick-skin', { bubbles: true, composed: true }))
  }

  private renderPlayerCar(color: number) {
    const bodyColor = colorToHex(color)
    const cabinColor = this.getCabinColor(color)

    return html`
      <svg class="player-car" viewBox="0 0 120 60" role="img" aria-label="Player car">
        <rect x="10" y="34" width="100" height="12" rx="6" fill="#121826" opacity="0.28"></rect>
        <rect x="24" y="20" width="72" height="20" rx="9" fill=${bodyColor}></rect>
        <path d="M42 20 L53 10 H70 L82 20 Z" fill=${cabinColor}></path>
        <circle cx="40" cy="42" r="8" fill="#111111"></circle>
        <circle cx="82" cy="42" r="8" fill="#111111"></circle>
      </svg>
    `
  }

  private getCabinColor(color: number) {
    const red = Math.round(((color >> 16) & 0xff) * 0.42)
    const green = Math.round(((color >> 8) & 0xff) * 0.42)
    const blue = Math.round((color & 0xff) * 0.42)

    return `#${[red, green, blue].map((part) => part.toString(16).padStart(2, '0')).join('')}`
  }
}
