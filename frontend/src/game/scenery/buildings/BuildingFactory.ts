import * as THREE from 'three'
import type { BuildingDesign } from './BuildingTypes'

export function createBuildingGroup(design: BuildingDesign) {
  const building = new THREE.Group()
  building.name = design.name

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(...design.base.size),
    new THREE.MeshStandardMaterial({ color: design.base.color, roughness: 0.9 }),
  )
  base.position.set(...design.base.position)

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(...design.roof.size),
    new THREE.MeshStandardMaterial({ color: design.roof.color, roughness: 0.8 }),
  )
  roof.position.set(...design.roof.position)

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(...design.door.size),
    new THREE.MeshStandardMaterial({ color: design.door.color, roughness: 0.7 }),
  )
  door.position.set(...design.door.position)

  building.add(base)
  building.add(roof)
  building.add(door)

  return building
}