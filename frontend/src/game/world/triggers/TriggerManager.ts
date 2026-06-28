import * as THREE from 'three'
import type { PlayerTransform } from '@cargame/shared'

export type TriggerType = 'race-start' | 'checkpoint' | 'garage' | 'fuel-station'

export interface TriggerZoneConfig {
  id: string
  type: TriggerType
  position: THREE.Vector3Tuple
  size: THREE.Vector3Tuple
  color: number
}

export interface TriggerEvent {
  type: 'enter' | 'exit'
  zoneId: string
  zoneType: TriggerType
}

interface TriggerZone {
  config: TriggerZoneConfig
  bounds: THREE.Box3
  helper: THREE.Mesh
}

const DEFAULT_TRIGGER_ZONES: TriggerZoneConfig[] = [
  {
    id: 'race-start',
    type: 'race-start',
    position: [0, -0.45, 2],
    size: [7.5, 1.5, 4],
    color: 0x34d399,
  },
  {
    id: 'checkpoint-1',
    type: 'checkpoint',
    position: [0, -0.45, 24],
    size: [7.5, 1.5, 4],
    color: 0xf59e0b,
  },
  {
    id: 'garage',
    type: 'garage',
    position: [-8, -0.45, 36],
    size: [4, 1.5, 4],
    color: 0x60a5fa,
  },
  {
    id: 'fuel-station',
    type: 'fuel-station',
    position: [8, -0.45, 48],
    size: [4, 1.5, 4],
    color: 0xf87171,
  },
]

export class TriggerManager {
  private readonly root: THREE.Group
  private readonly zones = new Map<string, TriggerZone>()
  private readonly activeZones = new Set<string>()
  private readonly listeners = new Set<(event: TriggerEvent) => void>()

  constructor(scene: THREE.Scene, zones: TriggerZoneConfig[] = DEFAULT_TRIGGER_ZONES) {
    this.root = new THREE.Group()
    this.root.name = 'TriggerManager'
    scene.add(this.root)

    for (const zone of zones) {
      this.registerZone(zone)
    }
  }

  public registerZone(config: TriggerZoneConfig) {
    const helper = new THREE.Mesh(
      new THREE.BoxGeometry(config.size[0], config.size[1], config.size[2]),
      new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.12,
        wireframe: true,
      }),
    )

    helper.position.set(...config.position)
    helper.visible = false
    helper.userData.triggerId = config.id
    helper.userData.triggerType = config.type

    this.root.add(helper)

    const center = new THREE.Vector3(...config.position)
    const halfSize = new THREE.Vector3(config.size[0] / 2, config.size[1] / 2, config.size[2] / 2)

    this.zones.set(config.id, {
      config,
      bounds: new THREE.Box3(center.clone().sub(halfSize), center.clone().add(halfSize)),
      helper,
    })
  }

  public update(playerTransform: PlayerTransform) {
    const playerPosition = new THREE.Vector3(
      playerTransform.position.x,
      playerTransform.position.y,
      playerTransform.position.z,
    )

    for (const zone of this.zones.values()) {
      const isInside = zone.bounds.containsPoint(playerPosition)
      const wasInside = this.activeZones.has(zone.config.id)

      if (isInside && !wasInside) {
        this.activeZones.add(zone.config.id)
        this.emit({ type: 'enter', zoneId: zone.config.id, zoneType: zone.config.type })
        continue
      }

      if (!isInside && wasInside) {
        this.activeZones.delete(zone.config.id)
        this.emit({ type: 'exit', zoneId: zone.config.id, zoneType: zone.config.type })
      }
    }
  }

  public onTrigger(listener: (event: TriggerEvent) => void) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  public dispose() {
    for (const zone of this.zones.values()) {
      this.root.remove(zone.helper)
    }

    this.zones.clear()
    this.activeZones.clear()
    this.root.removeFromParent()
  }

  private emit(event: TriggerEvent) {
    for (const listener of this.listeners) {
      listener(event)
    }
  }
}