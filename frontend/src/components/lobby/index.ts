import { GameLogin } from './GameLogin'
import { Lobby } from './Lobby';
import { CarSkinPicker } from './CarSkinPicker'

export { CarSkinPicker, GameLogin, Lobby }

const LOGIN_TAG_NAME = 'game-login'

if (!customElements.get(LOGIN_TAG_NAME)) {
  customElements.define(LOGIN_TAG_NAME, GameLogin)
}

const LOBBY_TAG_NAME = 'game-lobby'

if (!customElements.get(LOBBY_TAG_NAME)) {
  customElements.define(LOBBY_TAG_NAME, Lobby);
} 

const SKIN_PICKER_TAG_NAME = 'game-car-skin-picker'

if (!customElements.get(SKIN_PICKER_TAG_NAME)) {
  customElements.define(SKIN_PICKER_TAG_NAME, CarSkinPicker)
}
