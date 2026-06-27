import * as THREE from 'three'
import { createCarGroup } from './cars/CarFactory'
import type { CarDesign } from './cars/CarDesign'

export interface PlayerCarConfig {
  id: string
  name: string
  design: CarDesign
}

export class PlayerCar {
  public readonly id: string
  public name: string
  public readonly group: THREE.Group

  constructor(config: PlayerCarConfig) {
    this.id = config.id
    this.name = config.name
    this.group = createCarGroup(config.design)
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
}