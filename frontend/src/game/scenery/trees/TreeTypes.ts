import type * as THREE from 'three'

export interface TreeDesign {
  id: string
  name: string
  trunk: {
    radiusTop: number
    radiusBottom: number
    height: number
    radialSegments: number
    color: number
    position: THREE.Vector3Tuple
  }
  canopy: {
    radius: number
    widthSegments: number
    heightSegments: number
    color: number
    position: THREE.Vector3Tuple
  }
}