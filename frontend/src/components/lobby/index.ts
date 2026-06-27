import { GameLogin } from './GameLogin'
import { Lobby } from './Lobby';

export { GameLogin, Lobby }

const LOGIN_TAG_NAME = 'game-login'

if (!customElements.get(LOGIN_TAG_NAME)) {
  customElements.define(LOGIN_TAG_NAME, GameLogin)
}

const LOBBY_TAG_NAME = 'game-lobby'

if (!customElements.get(LOBBY_TAG_NAME)) {
  customElements.define(LOBBY_TAG_NAME, Lobby);
} 
