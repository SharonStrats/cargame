import type * as THREE from 'three'

export interface CarWheelDesign {
  radius: number
  width: number
  color: number
  position: THREE.Vector3Tuple
}

export interface CarBodyDesign {
  size: THREE.Vector3Tuple
  position: THREE.Vector3Tuple
  color: number
}

export interface CarCabinDesign {
  size: THREE.Vector3Tuple
  position: THREE.Vector3Tuple
  color: number
}

export interface CarDesign {
  id: string
  name: string
  body: CarBodyDesign
  cabin: CarCabinDesign
  wheels: CarWheelDesign[]
}