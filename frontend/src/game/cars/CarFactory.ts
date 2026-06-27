import * as THREE from 'three'
import type { CarDesign } from './CarDesign'

function createWheel(design: CarDesign['wheels'][number]) {
  const geometry = new THREE.CylinderGeometry(design.radius, design.radius, design.width, 18)
  const material = new THREE.MeshStandardMaterial({ color: design.color, roughness: 0.95 })
  const wheel = new THREE.Mesh(geometry, material)

  wheel.rotation.z = Math.PI / 2
  wheel.position.set(...design.position)

  return wheel
}

export function createCarGroup(design: CarDesign) {
  const group = new THREE.Group()

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(...design.body.size),
    new THREE.MeshStandardMaterial({ color: design.body.color, metalness: 0.08, roughness: 0.45 }),
  )
  body.position.set(...design.body.position)

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(...design.cabin.size),
    new THREE.MeshStandardMaterial({ color: design.cabin.color, metalness: 0.02, roughness: 0.2 }),
  )
  cabin.position.set(...design.cabin.position)

  group.add(body)
  group.add(cabin)

  for (const wheelDesign of design.wheels) {
    group.add(createWheel(wheelDesign))
  }

  return group
}