import * as THREE from 'three'
import type { TreeDesign } from './TreeTypes'

export function createTreeGroup(design: TreeDesign) {
  const tree = new THREE.Group()
  tree.name = design.name

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(
      design.trunk.radiusTop,
      design.trunk.radiusBottom,
      design.trunk.height,
      design.trunk.radialSegments,
    ),
    new THREE.MeshStandardMaterial({ color: design.trunk.color, roughness: 1 }),
  )
  trunk.position.set(...design.trunk.position)

  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(design.canopy.radius, design.canopy.widthSegments, design.canopy.heightSegments),
    new THREE.MeshStandardMaterial({ color: design.canopy.color, roughness: 0.95 }),
  )
  canopy.position.set(...design.canopy.position)

  tree.add(trunk)
  tree.add(canopy)

  return tree
}