import { css, html, LitElement } from 'lit'
import { DEFAULT_CAR_APPEARANCE, type CarAppearance } from '@cargame/shared'

const colorToHex = (color: number) => `#${color.toString(16).padStart(6, '0')}`

export class GameLogin extends LitElement {
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
      margin: auto;
      width: min(520px, calc(100vw - 32px));
      max-height: min(84svh, 700px);
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

    .row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    button {
      padding: 10px 14px;
      border: 0;
      border-radius: 999px;
      background: #c084fc;
      color: #0b1020;
      cursor: pointer;
    }

    .secondary {
      background: rgba(255, 255, 255, 0.12);
      color: #f3f6ff;
    }

    button[disabled] {
      opacity: 0.48;
      cursor: not-allowed;
    }

    .skin-preview {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 12px;
      align-items: center;
      margin-top: 16px;
      padding: 12px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .skin-art {
      width: 100%;
      height: auto;
    }

    .skin-copy {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .skin-label {
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: rgba(243, 246, 255, 0.72);
    }

  `

  private name = ''

  private lobbyId = ''

  private _appearance: CarAppearance = DEFAULT_CAR_APPEARANCE

  public get appearance() {
    return this._appearance
  }

  public set appearance(value: CarAppearance) {
    const oldValue = this._appearance
    this._appearance = value ? { ...value } : DEFAULT_CAR_APPEARANCE
    this.requestUpdate('appearance', oldValue)
  }

  private get bodyColor() {
    return colorToHex(this.appearance.color)
  }

  private get cabinColor() {
    const color = this.appearance.color
    const red = Math.round(((color >> 16) & 0xff) * 0.42)
    const green = Math.round(((color >> 8) & 0xff) * 0.42)
    const blue = Math.round((color & 0xff) * 0.42)

    return `#${[red, green, blue].map((part) => part.toString(16).padStart(2, '0')).join('')}`
  }

  private get canOpenSkinPicker() {
    return Boolean(this.name.trim())
  }

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

        <div class="row">
          <button type="button" @click=${this.handleCreateLobby}>Create Lobby</button>
          <button type="button" @click=${this.handleJoinLobby}>Join Lobby</button>
          <button
            type="button"
            class="secondary"
            ?disabled=${!this.canOpenSkinPicker}
            @click=${this.handleOpenPicker}
          >
            Pick Skin
          </button>
        </div>

        <div class="skin-preview" aria-label="Selected car skin preview">
          <svg class="skin-art" viewBox="0 0 220 120" role="img" aria-label="Selected car skin">
            <rect x="12" y="74" width="196" height="20" rx="10" fill="#121826" opacity="0.28"></rect>
            <rect x="32" y="52" width="156" height="30" rx="14" fill=${this.bodyColor}></rect>
            <path d="M70 52 L98 30 H130 L160 52 Z" fill=${this.cabinColor}></path>
            <circle cx="66" cy="86" r="16" fill="#111111"></circle>
            <circle cx="154" cy="86" r="16" fill="#111111"></circle>
          </svg>
          <div class="skin-copy">
            <span class="skin-label">Selected skin</span>
          </div>
        </div>

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
      this.dispatchEvent(
        new CustomEvent('create-lobby', {
          detail: { name: this.name.trim(), appearance: this.appearance },
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  private handleJoinLobby = () => {
    if (this.name.trim() && this.lobbyId.trim()) {
      this.dispatchEvent(
        new CustomEvent('join-lobby', {
          detail: { name: this.name.trim(), lobbyId: this.lobbyId.trim(), appearance: this.appearance },
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  private handleOpenPicker = () => {
    if (!this.canOpenSkinPicker) {
      console.log('[game-login] pick skin clicked but blocked because name is empty')
      return
    }

    console.log('[game-login] pick skin clicked', {
      name: this.name.trim(),
      lobbyCode: this.lobbyId.trim(),
      appearance: this.appearance,
    })

    this.dispatchEvent(new CustomEvent('pick-skin', { bubbles: true, composed: true }))
  }
}
