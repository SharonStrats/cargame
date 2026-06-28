import type { TreeDesign } from './TreeTypes'

export const treeCatalog: TreeDesign[] = [
  {
    id: 'pine-cluster',
    name: 'Pine Cluster',
    trunk: {
      radiusTop: 0.12,
      radiusBottom: 0.18,
      height: 1.5,
      radialSegments: 8,
      color: 0x5b3a29,
      position: [0, -0.15, 0],
    },
    canopy: {
      radius: 0.8,
      widthSegments: 10,
      heightSegments: 10,
      color: 0x2f6b3f,
      position: [0, 0.78, 0],
    },
  },
  {
    id: 'broadleaf-oak',
    name: 'Broadleaf Oak',
    trunk: {
      radiusTop: 0.16,
      radiusBottom: 0.24,
      height: 1.7,
      radialSegments: 10,
      color: 0x6b4a34,
      position: [0, -0.05, 0],
    },
    canopy: {
      radius: 0.95,
      widthSegments: 12,
      heightSegments: 10,
      color: 0x3b7a43,
      position: [0, 0.95, 0],
    },
  },
]

export function getTreeDesign(designId: string) {
  return treeCatalog.find((design) => design.id === designId) ?? treeCatalog[0]
}