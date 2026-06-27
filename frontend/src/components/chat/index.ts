import { Chat } from './Chat'

export { Chat }

const CHAT_TAG_NAME = 'game-chat'

if (!customElements.get(CHAT_TAG_NAME)) {
  customElements.define(CHAT_TAG_NAME, Chat)
}
