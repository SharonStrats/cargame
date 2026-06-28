import * as THREE from 'three'
import type { CarDesign } from './CarDesign'
import type { CarAppearance } from '@cargame/shared'

function createWheel(design: CarDesign['wheels'][number]) {
  const geometry = new THREE.CylinderGeometry(design.radius, design.radius, design.width, 18)
  const material = new THREE.MeshStandardMaterial({ color: design.color, roughness: 0.95 })
  const wheel = new THREE.Mesh(geometry, material)

  wheel.rotation.z = Math.PI / 2
  wheel.position.set(...design.position)

  return wheel
}

function shadeColor(color: number, amount: number) {
  const threeColor = new THREE.Color(color)
  const black = new THREE.Color(0x000000)

  return threeColor.lerp(black, amount).getHex()
}

export function createCarGroup(design: CarDesign, appearance?: CarAppearance) {
  const group = new THREE.Group()
  const bodyColor = appearance?.color ?? design.body.color
  const cabinColor = shadeColor(bodyColor, 0.58)

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(...design.body.size),
    new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.08, roughness: 0.45 }),
  )
  body.position.set(...design.body.position)
  body.userData.carPart = 'body'

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(...design.cabin.size),
    new THREE.MeshStandardMaterial({ color: cabinColor, metalness: 0.02, roughness: 0.2 }),
  )
  cabin.position.set(...design.cabin.position)
  cabin.userData.carPart = 'cabin'

  group.add(body)
  group.add(cabin)

  for (const wheelDesign of design.wheels) {
    group.add(createWheel(wheelDesign))
  }

  return group
}

export function applyCarAppearance(group: THREE.Group, appearance: CarAppearance) {
  const bodyColor = new THREE.Color(appearance.color)
  const cabinColor = new THREE.Color(appearance.color).lerp(new THREE.Color(0x000000), 0.58)

  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return
    }

    const material = child.material

    if (!(material instanceof THREE.MeshStandardMaterial)) {
      return
    }

    if (child.userData.carPart === 'body') {
      material.color.copy(bodyColor)
    }

    if (child.userData.carPart === 'cabin') {
      material.color.copy(cabinColor)
    }
  })
}