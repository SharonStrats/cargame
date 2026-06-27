import * as THREE from 'three'
import type { GameInputState } from './InputManager'
import { PlayerCar } from './PlayerCar'

const ACCELERATION = 9
const BRAKE_FORCE = 12
const DRAG = 5
const MAX_FORWARD_SPEED = 6
const MAX_REVERSE_SPEED = -2.5
const STEERING_BASE = 2.4
const PLAYER_HEIGHT = -0.55

export class CarController {
  private readonly spawnPosition = new THREE.Vector3()
  private readonly forwardDirection = new THREE.Vector3(0, 0, -1)
  private readonly upDirection = new THREE.Vector3(0, 1, 0)
  private speed = 0
  private heading = 0

  public reset(spawnPosition: THREE.Vector3) {
    this.spawnPosition.copy(spawnPosition)
    this.speed = 0
    this.heading = 0
  }

  public update(car: PlayerCar, delta: number, input: GameInputState) {
    if (input.up) {
      this.speed += ACCELERATION * delta
    } else if (input.down) {
      this.speed -= BRAKE_FORCE * delta
    } else {
      this.applyDrag(delta)
    }

    this.speed = THREE.MathUtils.clamp(this.speed, MAX_REVERSE_SPEED, MAX_FORWARD_SPEED)

    const speedFactor = Math.min(1, Math.abs(this.speed) / MAX_FORWARD_SPEED)
    const steering = STEERING_BASE * (0.35 + speedFactor * 0.65) * delta

    if (input.left) {
      this.heading += this.speed < 0 ? -steering : steering
    }

    if (input.right) {
      this.heading += this.speed < 0 ? steering : -steering
    }

    const travelDirection = this.forwardDirection.clone().applyAxisAngle(this.upDirection, this.heading)
    this.spawnPosition.addScaledVector(travelDirection, this.speed * delta)

    car.setPosition(this.spawnPosition.x, PLAYER_HEIGHT, this.spawnPosition.z)
    car.setRotationY(this.heading)
  }

  public getTransform() {
    return {
      position: {
        x: this.spawnPosition.x,
        y: PLAYER_HEIGHT,
        z: this.spawnPosition.z,
      },
      rotationY: this.heading,
    }
  }

  private applyDrag(delta: number) {
    if (this.speed > 0) {
      this.speed = Math.max(0, this.speed - DRAG * delta)
      return
    }

    if (this.speed < 0) {
      this.speed = Math.min(0, this.speed + DRAG * delta)
    }
  }
}