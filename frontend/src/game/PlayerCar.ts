import * as THREE from 'three'
import type { CarAppearance } from '@cargame/shared'
import { applyCarAppearance, createCarGroup } from './cars/CarFactory'
import type { CarDesign } from './cars/CarDesign'

export interface PlayerCarConfig {
  id: string
  name: string
  design: CarDesign
  appearance: CarAppearance
}

export class PlayerCar {
  public readonly id: string
  public name: string
  public readonly group: THREE.Group
  private appearance: CarAppearance

  constructor(config: PlayerCarConfig) {
    this.id = config.id
    this.name = config.name
    this.appearance = config.appearance
    this.group = createCarGroup(config.design, config.appearance)
    this.group.userData.playerId = config.id
    this.group.userData.playerName = config.name
  }

  public setPosition(x: number, y: number, z: number) {
    this.group.position.set(x, y, z)
  }

  public setRotationY(rotationY: number) {
    this.group.rotation.y = rotationY
  }

  public getTransform() {
    return {
      position: {
        x: this.group.position.x,
        y: this.group.position.y,
        z: this.group.position.z,
      },
      rotationY: this.group.rotation.y,
    }
  }

  public setName(name: string) {
    this.name = name
    this.group.userData.playerName = name
  }

  public setAppearance(appearance: CarAppearance) {
    const hasChanged = this.appearance.carId !== appearance.carId || this.appearance.color !== appearance.color

    if (!hasChanged) {
      return
    }

    this.appearance = appearance
    applyCarAppearance(this.group, appearance)
  }
}