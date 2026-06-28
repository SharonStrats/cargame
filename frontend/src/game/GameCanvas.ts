import * as THREE from 'three'
import type { PlayerProfile, PlayerTransform } from '@cargame/shared'
import { InputManager } from './InputManager'
import { GameWorld } from './GameWorld'
import type { TriggerEvent } from './world'

export interface GameCanvasOptions {
  backgroundColor?: number
}

export class GameCanvas {
  private readonly container: HTMLElement
  private readonly scene: THREE.Scene
  private readonly camera: THREE.PerspectiveCamera
  private readonly renderer: THREE.WebGLRenderer
  private readonly world: GameWorld
  private readonly inputManager: InputManager
  private readonly resizeHandler: () => void
  private readonly keyDownHandler: (event: KeyboardEvent) => void
  private readonly keyUpHandler: (event: KeyboardEvent) => void
  private lastFrameTime = performance.now()

  constructor(container: HTMLElement, options: GameCanvasOptions = {}) {
    this.container = container
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(options.backgroundColor ?? 0x0b1020)

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    this.camera.position.set(0, 1.2, 4.5)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1

    this.world = new GameWorld(this.scene)
    this.inputManager = new InputManager()

    this.resizeHandler = () => this.resize()
    this.keyDownHandler = (event) => this.inputManager.handleKeyChange(event, true)
    this.keyUpHandler = (event) => this.inputManager.handleKeyChange(event, false)

    this.mount()
    this.resize()
    this.start()
  }

  private mount() {
    this.container.appendChild(this.renderer.domElement)
    window.addEventListener('resize', this.resizeHandler)
    window.addEventListener('keydown', this.keyDownHandler)
    window.addEventListener('keyup', this.keyUpHandler)
  }

  private start() {
    this.renderer.setAnimationLoop(() => {
      const currentFrameTime = performance.now()
      const delta = (currentFrameTime - this.lastFrameTime) / 1000
      this.lastFrameTime = currentFrameTime

      this.world.update(delta, this.inputManager.getState())
      this.renderer.render(this.scene, this.camera)
    })
  }

  public resize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  public destroy() {
    window.removeEventListener('resize', this.resizeHandler)
    window.removeEventListener('keydown', this.keyDownHandler)
    window.removeEventListener('keyup', this.keyUpHandler)
    this.renderer.setAnimationLoop(null)
    this.world.dispose()
    this.renderer.dispose()
    this.container.innerHTML = ''
  }

  public syncPlayers(players: PlayerProfile[]) {
    this.world.syncPlayers(players)
  }

  public setLocalPlayerId(playerId: string | null) {
    this.world.setLocalPlayerId(playerId)
  }

  public getLocalPlayerTransform(): PlayerTransform | null {
    return this.world.getLocalPlayerTransform()
  }

  public applyPlayerTransform(playerId: string, transform: PlayerTransform) {
    this.world.applyPlayerTransform(playerId, transform)
  }

  public onTriggerEvent(listener: (event: TriggerEvent) => void) {
    return this.world.onTriggerEvent(listener)
  }
}