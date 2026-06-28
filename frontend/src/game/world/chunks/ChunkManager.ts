import * as THREE from 'three'
import { createBuildingGroup, createTreeGroup, getChunkTheme, type BuildingDesign, type TreeDesign } from '../../scenery'

export interface ChunkManagerOptions {
  chunkLength?: number
  renderRadius?: number
}

interface TerrainCluster {
  road: THREE.Mesh
  centerLine: THREE.Group
  terrain: THREE.Mesh
  leftShoulder: THREE.Mesh
  rightShoulder: THREE.Mesh
  trees: THREE.Group
  buildings: THREE.Group
}

function seedNoise(seed: number) {
  const value = Math.sin(seed * 999.17) * 43758.5453

  return value - Math.floor(value)
}

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length
}

export class ChunkManager {
  private readonly root: THREE.Group
  private readonly chunkGroups = new Map<number, THREE.Group>()
  private readonly chunkLength: number
  private readonly renderRadius: number
  private currentCenterIndex = 0

  constructor(scene: THREE.Scene, options: ChunkManagerOptions = {}) {
    this.root = new THREE.Group()
    this.root.name = 'ChunkManager'
    this.chunkLength = options.chunkLength ?? 24
    this.renderRadius = options.renderRadius ?? 2

    scene.add(this.root)
    this.syncChunks(0)
  }

  public update(playerZ: number) {
    const centerIndex = Math.round(playerZ / this.chunkLength)

    if (centerIndex === this.currentCenterIndex) {
      return
    }

    this.syncChunks(centerIndex)
  }

  public dispose() {
    for (const group of this.chunkGroups.values()) {
      this.root.remove(group)
    }

    this.chunkGroups.clear()
    this.root.removeFromParent()
  }

  private syncChunks(centerIndex: number) {
    this.currentCenterIndex = centerIndex

    const minIndex = centerIndex - this.renderRadius
    const maxIndex = centerIndex + this.renderRadius
    const nextChunkIndexes = new Set<number>()

    for (let index = minIndex; index <= maxIndex; index += 1) {
      nextChunkIndexes.add(index)

      if (!this.chunkGroups.has(index)) {
        const chunk = this.createChunk(index)
        this.chunkGroups.set(index, chunk)
        this.root.add(chunk)
      }
    }

    for (const [index, chunk] of this.chunkGroups.entries()) {
      if (nextChunkIndexes.has(index)) {
        continue
      }

      this.root.remove(chunk)
      this.chunkGroups.delete(index)
    }
  }

  private createChunk(index: number) {
    const chunk = new THREE.Group()
    chunk.name = `Chunk-${index}`
    chunk.position.z = index * this.chunkLength

    const terrain = this.buildTerrain(index)
    chunk.add(terrain.terrain)
    chunk.add(terrain.road)
    chunk.add(terrain.centerLine)
    chunk.add(terrain.leftShoulder)
    chunk.add(terrain.rightShoulder)
    chunk.add(terrain.trees)
    chunk.add(terrain.buildings)

    return chunk
  }

  private buildTerrain(index: number): TerrainCluster {
    const terrain = new THREE.Mesh(
      new THREE.PlaneGeometry(26, this.chunkLength, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x27324a, roughness: 1 }),
    )

    terrain.rotation.x = -Math.PI / 2
    terrain.position.y = -0.92
    terrain.position.z = this.chunkLength / 2

    const road = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 0.16, this.chunkLength),
      new THREE.MeshStandardMaterial({ color: 0x1a1f2d, roughness: 0.95 }),
    )

    road.position.set(0, -0.84, this.chunkLength / 2)

    const centerLine = new THREE.Group()
    centerLine.name = `CenterLine-${index}`

    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.65 })
    const dashCount = Math.floor(this.chunkLength / 4)

    for (let dashIndex = 0; dashIndex < dashCount; dashIndex += 1) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 1.3), lineMaterial)
      dash.position.set(0, -0.74, 1.8 + dashIndex * 4)
      centerLine.add(dash)
    }

    const leftShoulder = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.12, this.chunkLength),
      new THREE.MeshStandardMaterial({ color: 0x48526d, roughness: 1 }),
    )
    leftShoulder.position.set(-5.85, -0.88, this.chunkLength / 2)

    const rightShoulder = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.12, this.chunkLength),
      new THREE.MeshStandardMaterial({ color: 0x48526d, roughness: 1 }),
    )
    rightShoulder.position.set(5.85, -0.88, this.chunkLength / 2)

    const trees = new THREE.Group()
    trees.name = `Trees-${index}`
    const buildingGroup = new THREE.Group()
    buildingGroup.name = `Buildings-${index}`

    const leftEdge = -8.6
    const rightEdge = 8.6
    const theme = getChunkTheme(index)
    const treeDensity = Math.max(0, theme.treeDensity)
    const buildingDensity = Math.max(0, theme.buildingDensity)

    for (let slot = 0; slot < 4; slot += 1) {
      const leftNoise = seedNoise(index * 10 + slot)
      const rightNoise = seedNoise(index * 10 + slot + 4)
      const leftTreeDesignIndex = wrapIndex(index + slot, theme.treeDesigns.length)
      const rightTreeDesignIndex = wrapIndex(index + slot + 1, theme.treeDesigns.length)

      if (leftNoise <= treeDensity) {
        trees.add(this.createTree(theme.treeDesigns[leftTreeDesignIndex], leftNoise, leftEdge, slot))
      }

      if (rightNoise <= treeDensity) {
        trees.add(this.createTree(theme.treeDesigns[rightTreeDesignIndex], rightNoise, rightEdge, slot))
      }
    }

    const buildingLeftNoise = seedNoise(index * 13)
    const buildingRightNoise = seedNoise(index * 17 + 2)

    if (buildingLeftNoise <= buildingDensity) {
      const buildingLeftDesignIndex = wrapIndex(index, theme.buildingDesigns.length)

      buildingGroup.add(
        this.createBuilding(
          theme.buildingDesigns[buildingLeftDesignIndex],
          buildingLeftNoise,
          -12.2,
          index,
        ),
      )
    }

    if (buildingRightNoise <= buildingDensity) {
      const buildingRightDesignIndex = wrapIndex(index + 1, theme.buildingDesigns.length)

      buildingGroup.add(
        this.createBuilding(
          theme.buildingDesigns[buildingRightDesignIndex],
          buildingRightNoise,
          12.2,
          index,
        ),
      )
    }

    return {
      road,
      centerLine,
      terrain,
      leftShoulder,
      rightShoulder,
      trees,
      buildings: buildingGroup,
    }
  }

  private createTree(treeDesign: TreeDesign, noiseValue: number, edgeX: number, slot: number) {
    const tree = new THREE.Group()
    const offsetZ = 3 + slot * 5 + noiseValue * 1.5
    const scale = 0.9 + noiseValue * 0.4

    tree.add(createTreeGroup(treeDesign))
    tree.scale.setScalar(scale)
    tree.position.set(edgeX + (noiseValue - 0.5) * 1.8, -0.84, offsetZ)

    return tree
  }

  private createBuilding(buildingDesign: BuildingDesign, noiseValue: number, edgeX: number, index: number) {
    const building = new THREE.Group()

    building.add(createBuildingGroup(buildingDesign))
    building.position.set(edgeX + (noiseValue - 0.5) * 2.8, 0, 5 + (index % 3) * 5)
    building.scale.setScalar(0.9 + noiseValue * 0.35)

    return building
  }
}