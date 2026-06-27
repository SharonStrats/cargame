import { css, html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import type { ChatMessage } from '@cargame/shared'

export class Chat extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      z-index: 1000;
      display: block;
      pointer-events: auto;
    }

    dialog {
      margin: 0;
      width: 100%;
      box-sizing: border-box;
      height: 300px;
      padding: 12px;
      border: 0;
      border-radius: 8px;
      background: var(--code-bg);
      color: var(--text-h);
      overflow-y: auto;
      box-shadow: var(--shadow);
    }

    h2 {
      margin: 0 0 8px;
    }

    ul {
      margin: 0;
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1 1 auto;
    }

    form {
      display: flex;
      gap: 8px;
      margin-top: auto;
    }

    input {
      flex: 1 1 auto;
      min-width: 0;
    }
  `

  @property({ type: Array }) messages: ChatMessage[] = []

  private draft = ''

  render() {
    return html`
      <dialog open>
        <h2>Chat</h2>
        <ul>
          ${this.messages.map(
            (message) => html`<li><span>${message.senderName}:</span> ${message.content}</li>`,
          )}
        </ul>

        <form @submit=${this.handleSubmit}>
          <input
            type="text"
            .value=${this.draft}
            placeholder="Type a message"
            @input=${this.handleInput}
          />
          <button type="submit">Send</button>
        </form>
      </dialog>
    `
  }

  private handleInput = (event: Event) => {
    this.draft = (event.target as HTMLInputElement).value
    this.requestUpdate()
  }

  private handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()

    const content = this.draft.trim()

    if (!content) {
      return
    }

    this.dispatchEvent(new CustomEvent('send-message', { detail: { message: content }, bubbles: true, composed: true }))
    this.draft = ''
    this.requestUpdate()
  }
}
