export interface GameInputState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export class InputManager {
  private readonly inputState: GameInputState = {
    up: false,
    down: false,
    left: false,
    right: false,
  }

  public getState(): GameInputState {
    return this.inputState
  }

  public handleKeyChange(event: KeyboardEvent, isPressed: boolean) {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      return
    }

    let handled = false

    switch (event.key) {
      case 'ArrowUp':
        this.inputState.up = isPressed
        handled = true
        break
      case 'ArrowDown':
        this.inputState.down = isPressed
        handled = true
        break
      case 'ArrowLeft':
        this.inputState.left = isPressed
        handled = true
        break
      case 'ArrowRight':
        this.inputState.right = isPressed
        handled = true
        break
    }

    if (handled) {
      event.preventDefault()
    }
  }
}