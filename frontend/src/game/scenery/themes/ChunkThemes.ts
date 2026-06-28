import type { BuildingDesign } from '../buildings/BuildingTypes'
import type { TreeDesign } from '../trees/TreeTypes'
import { getBuildingDesign } from '../buildings/BuildingCatalog'
import { getTreeDesign } from '../trees/TreeCatalog'

export type ChunkThemeId = 'roadside' | 'forest' | 'town'

export interface ChunkTheme {
  id: ChunkThemeId
  name: string
  treeDesigns: TreeDesign[]
  buildingDesigns: BuildingDesign[]
  treeDensity: number
  buildingDensity: number
}

export const chunkThemes: ChunkTheme[] = [
  {
    id: 'roadside',
    name: 'Roadside',
    treeDesigns: [getTreeDesign('pine-cluster'), getTreeDesign('broadleaf-oak')],
    buildingDesigns: [getBuildingDesign('roadside-garage'), getBuildingDesign('small-shop')],
    treeDensity: 1,
    buildingDensity: 1,
  },
  {
    id: 'forest',
    name: 'Forest',
    treeDesigns: [getTreeDesign('pine-cluster'), getTreeDesign('broadleaf-oak')],
    buildingDesigns: [getBuildingDesign('roadside-garage')],
    treeDensity: 2,
    buildingDensity: 0.25,
  },
  {
    id: 'town',
    name: 'Town',
    treeDesigns: [getTreeDesign('broadleaf-oak')],
    buildingDesigns: [getBuildingDesign('roadside-garage'), getBuildingDesign('small-shop')],
    treeDensity: 0.4,
    buildingDensity: 2,
  },
]

export function getChunkTheme(chunkIndex: number) {
  const theme = chunkThemes[Math.abs(chunkIndex) % chunkThemes.length]

  return theme
}