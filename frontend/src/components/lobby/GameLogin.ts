import { css, html, LitElement } from 'lit'

export class GameLogin extends LitElement {
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
      box-sizing: border-box;
      margin: auto;
    }

    h2,
    p,
    label {
      color: #f3f6ff;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 12px;
    }

    input,
    button {
      font: inherit;
    }

    input {
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.06);
      color: inherit;
    }

    input::placeholder {
      color: rgba(243, 246, 255, 0.6);
    }

    button {
      margin-top: 12px;
      margin-right: 8px;
      padding: 10px 14px;
      border: 0;
      border-radius: 999px;
      background: #c084fc;
      color: #0b1020;
      cursor: pointer;
    }
  `

  private name = ""

  private lobbyId = ""

  render() {
    return html`
      <dialog open aria-labelledby="login-title">
        <h2 id="login-title">Login</h2>
        <p>Enter your name and either create a lobby or join one with a code.</p>
        <label>
          Name
          <input
            type="text"
            .value=${this.name}
            placeholder="Enter your name"
            @input=${this.handleNameInput}
          />
        </label>
        <label>
          Lobby code
          <input
            type="text"
            .value=${this.lobbyId}
            placeholder="Enter lobby code"
            @input=${this.handleLobbyInput}
          />
        </label>
        <button @click=${this.handleCreateLobby}>Create Lobby</button>
        <button @click=${this.handleJoinLobby}>Join Lobby</button>
      </dialog>
    `
  }

  private handleNameInput = (event: Event) => {
    this.name = (event.target as HTMLInputElement).value
    this.requestUpdate()
  }

  private handleLobbyInput = (event: Event) => {
    this.lobbyId = (event.target as HTMLInputElement).value
    this.requestUpdate()
  }

  private handleCreateLobby = () => {
    if (this.name.trim()) {
      this.dispatchEvent(new CustomEvent("create-lobby", { detail: { name: this.name.trim() }, bubbles: true, composed: true }))
    }
  }

  private handleJoinLobby = () => {
    if (this.name.trim() && this.lobbyId.trim()) {
      this.dispatchEvent(new CustomEvent("join-lobby", { detail: { name: this.name.trim(), lobbyId: this.lobbyId.trim() }, bubbles: true, composed: true }))
    }
  }
}
