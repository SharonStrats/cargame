import { css, html, LitElement } from 'lit'
import type { GameClientSnapshot } from '../../client/GameClient'

export class Lobby extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100svh;
      z-index: 2;
      pointer-events: none;
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
                  (player) => html`<li>${player.name}${player.connected ? '' : ' (offline)'}</li>`,
                )}
              </ul>
            `
          : html`<p>No lobby selected yet.</p>`}

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
}
