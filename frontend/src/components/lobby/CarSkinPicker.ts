import { css, html, LitElement } from 'lit'
import { DEFAULT_CAR_APPEARANCE, type CarAppearance } from '@cargame/shared'

const SKIN_COLORS = [
  0x4cc9f0,
  0xf94144,
  0x43aa8b,
  0xf9c74f,
  0x9b5de5,
  0xf9844a,
  0xf8fafc,
  0x1f2937,
]

function colorToHex(color: number) {
  return `#${color.toString(16).padStart(6, '0')}`
}

function shadeColor(color: number, amount: number) {
  const value = Math.max(0, Math.min(1, amount))
  const red = Math.round(((color >> 16) & 0xff) * (1 - value))
  const green = Math.round(((color >> 8) & 0xff) * (1 - value))
  const blue = Math.round((color & 0xff) * (1 - value))

  return `#${[red, green, blue].map((part) => part.toString(16).padStart(2, '0')).join('')}`
}

export class CarSkinPicker extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100svh;
      z-index: 4;
      pointer-events: none;
    }

    dialog {
      position: fixed;
      inset: 0;
      margin: auto;
      width: min(760px, calc(100vw - 24px));
      max-height: min(88svh, 720px);
      padding: 22px;
      border: 0;
      border-radius: 22px;
      background: rgba(11, 16, 32, 0.92);
      color: #f3f6ff;
      backdrop-filter: blur(18px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.42);
      pointer-events: auto;
      box-sizing: border-box;
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 220px;
      gap: 18px;
      align-items: stretch;
    }

    h2,
    p {
      margin: 0;
      color: #f3f6ff;
    }

    .preview {
      display: flex;
      flex-direction: column;
      gap: 14px;
      min-height: 100%;
    }

    .preview-card {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 280px;
      border-radius: 20px;
      background: linear-gradient(180deg, rgba(96, 165, 250, 0.18), rgba(11, 16, 32, 0.08));
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    .preview-art {
      width: min(100%, 420px);
      height: auto;
    }

    .aside {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .swatches {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .swatch {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      border: 2px solid transparent;
      border-radius: 14px;
      cursor: pointer;
      transition: transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
    }

    .swatch:hover {
      transform: translateY(-1px);
    }

    .swatch[aria-pressed='true'] {
      border-color: #f8fafc;
      box-shadow: 0 0 0 3px rgba(248, 250, 252, 0.18);
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 18px;
    }

    button {
      font: inherit;
      cursor: pointer;
    }

    .ghost,
    .primary {
      padding: 10px 14px;
      border: 0;
      border-radius: 999px;
    }

    .ghost {
      background: rgba(255, 255, 255, 0.12);
      color: #f3f6ff;
    }

    .primary {
      background: #c084fc;
      color: #0b1020;
    }

    @media (max-width: 760px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
  `

  private _open = false
  private _appearance: CarAppearance = DEFAULT_CAR_APPEARANCE

  public get open() {
    return this._open
  }

  public set open(value: boolean) {
    const oldValue = this._open
    this._open = value
    console.log('[car-skin-picker] open set', { value })
    this.requestUpdate('open', oldValue)
  }

  public get appearance() {
    return this._appearance
  }

  public set appearance(value: CarAppearance) {
    const oldValue = this._appearance
    this._appearance = value ?? DEFAULT_CAR_APPEARANCE
    this.requestUpdate('appearance', oldValue)
  }

  private get selectedColor() {
    return this._appearance.color
  }

  render() {
    const bodyColor = colorToHex(this.selectedColor)
    const cabinColor = shadeColor(this.selectedColor, 0.55)
    const wheelColor = '#111111'

    return html`
      <dialog ?open=${this.open} aria-labelledby="skin-picker-title">
        <h2 id="skin-picker-title">Pick Skin</h2>
        <p>Choose a color now. You can add more car options later without changing this flow.</p>

        <div class="layout">
          <section class="preview" aria-label="Car preview">
            <div class="preview-card">
              <svg class="preview-art" viewBox="0 0 440 240" role="img" aria-label="Car preview illustration">
                <rect x="28" y="144" width="384" height="42" rx="20" fill="#121826" opacity="0.22"></rect>
                <rect x="64" y="118" width="312" height="64" rx="28" fill=${bodyColor}></rect>
                <path d="M128 118 L182 76 H260 L320 118 Z" fill=${cabinColor}></path>
                <rect x="173" y="86" width="22" height="26" rx="4" fill="rgba(255,255,255,0.35)"></rect>
                <rect x="203" y="86" width="22" height="26" rx="4" fill="rgba(255,255,255,0.25)"></rect>
                <rect x="233" y="86" width="22" height="26" rx="4" fill="rgba(255,255,255,0.18)"></rect>
                <circle cx="146" cy="186" r="28" fill=${wheelColor}></circle>
                <circle cx="294" cy="186" r="28" fill=${wheelColor}></circle>
                <circle cx="146" cy="186" r="14" fill="#374151"></circle>
                <circle cx="294" cy="186" r="14" fill="#374151"></circle>
                <rect x="82" y="130" width="276" height="18" rx="9" fill="rgba(255,255,255,0.12)"></rect>
              </svg>
            </div>
          </section>

          <aside class="aside">
            <p>Swatches</p>
            <div class="swatches">
              ${SKIN_COLORS.map(
                (color) => html`
                  <button
                    class="swatch"
                    style="background: ${colorToHex(color)}"
                    aria-pressed=${String(color === this.selectedColor)}
                    @click=${() => this.selectColor(color)}
                  ></button>
                `,
              )}
            </div>
          </aside>
        </div>

        <div class="actions">
          <button class="ghost" @click=${this.handleClose}>Back</button>
          <button class="primary" @click=${this.handleSelect}>Select</button>
        </div>
      </dialog>
    `
  }

  private selectColor(color: number) {
    console.log('[car-skin-picker] swatch selected', { color })
    this._appearance = {
      carId: this._appearance.carId,
      color,
    }

    this.requestUpdate()
  }

  private handleClose = () => {
    console.log('[car-skin-picker] close clicked')
    this.dispatchEvent(new CustomEvent('close-picker', { bubbles: true, composed: true }))
  }

  private handleSelect = () => {
    console.log('[car-skin-picker] select clicked', this._appearance)
    this.dispatchEvent(
      new CustomEvent('select-skin', {
        detail: { appearance: this._appearance },
        bubbles: true,
        composed: true,
      }),
    )
  }
}