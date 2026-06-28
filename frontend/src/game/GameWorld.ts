import * as THREE from 'three'
import type { PlayerProfile, PlayerTransform } from '@cargame/shared'
import type { GameInputState } from './InputManager'
import { CarController } from './CarController'
import { PlayerCar } from './PlayerCar'
import { getCarDesign } from './cars/CarCatalog'
import { createCarGroup } from './cars/CarFactory'
import { ChunkManager, TriggerManager, type TriggerEvent } from './world'

export interface GameWorldOptions {
  showcaseEnabled?: boolean
}

const SHOWCASE_ROTATION_SPEED = 0.65
const SHOWCASE_BOB_SPEED = 1.5
const SHOWCASE_BOB_AMPLITUDE = 0.03
const SHOWCASE_BASE_HEIGHT = -0.4
const PLAYER_SPACING = 1.2
const PLAYER_HEIGHT = -0.55

export class GameWorld {
  private readonly scene: THREE.Scene
  private readonly chunkManager: ChunkManager
  private readonly triggerManager: TriggerManager
  private readonly playerCars = new Map<string, PlayerCar>()
  private readonly localCarController = new CarController()
  private readonly showcaseCar: THREE.Group | null
  private readonly showcasePedestal: THREE.Mesh | null
  private readonly triggerListeners = new Set<(event: TriggerEvent) => void>()
  private localPlayerId: string | null = null
  private elapsedTime = 0

  private getPlayerPosition(index: number, totalPlayers: number) {
    const centeredIndex = index - (totalPlayers - 1) / 2

    return centeredIndex * PLAYER_SPACING
  }

  private setControlledSpawnPosition(index: number, totalPlayers: number) {
    this.localCarController.reset(new THREE.Vector3(this.getPlayerPosition(index, totalPlayers), PLAYER_HEIGHT, 0))
  }

  constructor(scene: THREE.Scene, options: GameWorldOptions = {}) {
    this.scene = scene
    this.buildEnvironment()
    this.chunkManager = new ChunkManager(this.scene)
    this.triggerManager = new TriggerManager(this.scene)
    this.triggerManager.onTrigger((event) => this.emitTriggerEvent(event))

    if (options.showcaseEnabled ?? true) {
      this.showcasePedestal = this.buildShowcasePedestal()
      this.showcaseCar = this.buildShowcaseCar()
    } else {
      this.showcasePedestal = null
      this.showcaseCar = null
    }
  }

  private buildEnvironment() {
    this.scene.fog = new THREE.Fog(0x0b1020, 18, 90)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.4)
    directionalLight.position.set(4, 6, 3)
    this.scene.add(directionalLight)
  }

  private buildShowcasePedestal() {
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.7, 0.18, 24),
      new THREE.MeshStandardMaterial({ color: 0x2a3552, roughness: 0.8, metalness: 0.1 }),
    )

    pedestal.position.set(2.2, -0.78, 0.35)
    this.scene.add(pedestal)

    return pedestal
  }

  private buildShowcaseCar() {
    const showcaseCar = createCarGroup(getCarDesign('starter-sprint'))
    showcaseCar.position.set(2.2, -0.4, 0.35)
    showcaseCar.rotation.y = -0.45
    showcaseCar.scale.setScalar(1.08)
    this.scene.add(showcaseCar)

    return showcaseCar
  }

  public syncPlayers(players: PlayerProfile[]) {
    const activePlayerIds = new Set(players.map((player) => player.id))

    for (const [playerId, car] of this.playerCars.entries()) {
      if (!activePlayerIds.has(playerId)) {
        this.scene.remove(car.group)
        this.playerCars.delete(playerId)
      }
    }

    players.forEach((player, index) => {
      let car = this.playerCars.get(player.id)

      if (!car) {
        car = new PlayerCar({
          id: player.id,
          name: player.name,
          design: getCarDesign(index % 2 === 0 ? 'starter-sprint' : 'dune-runner'),
        })

        this.playerCars.set(player.id, car)
        this.scene.add(car.group)

        if (player.id === this.localPlayerId) {
          this.setControlledSpawnPosition(index, players.length)
        }
      }

      car.setName(player.name)

      if (player.id !== this.localPlayerId) {
        car.setPosition(player.transform.position.x, player.transform.position.y, player.transform.position.z)
        car.setRotationY(player.transform.rotationY)
      }
    })
  }

  public setLocalPlayerId(playerId: string | null) {
    if (this.localPlayerId === playerId) {
      return
    }

    this.localPlayerId = playerId

    if (playerId) {
      const index = [...this.playerCars.keys()].indexOf(playerId)

      if (index >= 0) {
        this.setControlledSpawnPosition(index, this.playerCars.size)
      }
    }
  }

  public getLocalPlayerTransform(): PlayerTransform | null {
    if (!this.localPlayerId) {
      return null
    }

    const controlledCar = this.playerCars.get(this.localPlayerId)

    if (!controlledCar) {
      return null
    }

    return this.localCarController.getTransform()
  }

  public applyPlayerTransform(playerId: string, transform: PlayerTransform) {
    if (playerId === this.localPlayerId) {
      return
    }

    const car = this.playerCars.get(playerId)

    if (!car) {
      return
    }

    car.setPosition(transform.position.x, transform.position.y, transform.position.z)
    car.setRotationY(transform.rotationY)
  }

  public update(delta: number, input: GameInputState) {
    this.elapsedTime += delta
    this.updateShowcase(delta)
    let localTransform: PlayerTransform | null = null

    if (!this.localPlayerId) {
      this.chunkManager.update(0)
      return
    }

    const controlledCar = this.playerCars.get(this.localPlayerId)

    if (!controlledCar) {
      this.chunkManager.update(0)
      return
    }

    this.localCarController.update(controlledCar, delta, input)
    localTransform = this.localCarController.getTransform()

    this.chunkManager.update(localTransform.position.z)
    this.triggerManager.update(localTransform)
  }

  private updateShowcase(delta: number) {
    if (!this.showcaseCar) {
      return
    }

    this.showcaseCar.rotation.y += delta * SHOWCASE_ROTATION_SPEED
    this.showcaseCar.position.y =
      SHOWCASE_BASE_HEIGHT + Math.sin(this.elapsedTime * SHOWCASE_BOB_SPEED) * SHOWCASE_BOB_AMPLITUDE
  }

  public dispose() {
    for (const car of this.playerCars.values()) {
      this.scene.remove(car.group)
    }

    this.playerCars.clear()
    this.chunkManager.dispose()
    this.triggerManager.dispose()

    if (this.showcaseCar) {
      this.scene.remove(this.showcaseCar)
    }

    if (this.showcasePedestal) {
      this.scene.remove(this.showcasePedestal)
    }
  }

  public onTriggerEvent(listener: (event: TriggerEvent) => void) {
    this.triggerListeners.add(listener)

    return () => {
      this.triggerListeners.delete(listener)
    }
  }

  private emitTriggerEvent(event: TriggerEvent) {
    for (const listener of this.triggerListeners) {
      listener(event)
    }
  }
}
