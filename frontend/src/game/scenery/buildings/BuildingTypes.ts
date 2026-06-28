import type * as THREE from 'three'

export interface BuildingDesign {
  id: string
  name: string
  base: {
    size: THREE.Vector3Tuple
    position: THREE.Vector3Tuple
    color: number
  }
  roof: {
    size: THREE.Vector3Tuple
    position: THREE.Vector3Tuple
    color: number
  }
  door: {
    size: THREE.Vector3Tuple
    position: THREE.Vector3Tuple
    color: number
  }
}