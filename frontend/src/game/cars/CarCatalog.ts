import type { CarDesign } from './CarDesign'

export const carCatalog: CarDesign[] = [
  {
    id: 'starter-sprint',
    name: 'Starter Sprint',
    body: {
      size: [0.72, 0.22, 1.25],
      position: [0, 0.14, 0],
      color: 0x4cc9f0,
    },
    cabin: {
      size: [0.48, 0.2, 0.62],
      position: [0, 0.34, -0.06],
      color: 0x0b1020,
    },
    wheels: [
      { radius: 0.14, width: 0.1, color: 0x111111, position: [-0.34, 0.0, 0.42] },
      { radius: 0.14, width: 0.1, color: 0x111111, position: [0.34, 0.0, 0.42] },
      { radius: 0.14, width: 0.1, color: 0x111111, position: [-0.34, 0.0, -0.42] },
      { radius: 0.14, width: 0.1, color: 0x111111, position: [0.34, 0.0, -0.42] },
    ],
  },
  {
    id: 'dune-runner',
    name: 'Dune Runner',
    body: {
      size: [0.82, 0.24, 1.35],
      position: [0, 0.16, 0],
      color: 0xf9c74f,
    },
    cabin: {
      size: [0.5, 0.22, 0.68],
      position: [0, 0.38, -0.02],
      color: 0x1f2937,
    },
    wheels: [
      { radius: 0.16, width: 0.11, color: 0x111111, position: [-0.38, 0.0, 0.45] },
      { radius: 0.16, width: 0.11, color: 0x111111, position: [0.38, 0.0, 0.45] },
      { radius: 0.16, width: 0.11, color: 0x111111, position: [-0.38, 0.0, -0.45] },
      { radius: 0.16, width: 0.11, color: 0x111111, position: [0.38, 0.0, -0.45] },
    ],
  },
]

export function getCarDesign(designId: string) {
  return carCatalog.find((design) => design.id === designId) ?? carCatalog[0]
}