import type { BuildingDesign } from './BuildingTypes'

export const buildingCatalog: BuildingDesign[] = [
  {
    id: 'roadside-garage',
    name: 'Roadside Garage',
    base: {
      size: [2.4, 2.2, 2.8],
      position: [0, 0.24, 0],
      color: 0x8088a0,
    },
    roof: {
      size: [2.55, 0.28, 2.95],
      position: [0, 1.46, 0],
      color: 0x253042,
    },
    door: {
      size: [0.9, 1.2, 0.08],
      position: [0, -0.12, 1.42],
      color: 0x16202f,
    },
  },
  {
    id: 'small-shop',
    name: 'Small Shop',
    base: {
      size: [2.8, 2.45, 2.7],
      position: [0, 0.36, 0],
      color: 0xb9b0a3,
    },
    roof: {
      size: [2.95, 0.22, 2.85],
      position: [0, 1.66, 0],
      color: 0x8d2e39,
    },
    door: {
      size: [0.84, 1.22, 0.08],
      position: [0, -0.02, 1.39],
      color: 0x2d1d17,
    },
  },
]

export function getBuildingDesign(designId: string) {
  return buildingCatalog.find((design) => design.id === designId) ?? buildingCatalog[0]
}