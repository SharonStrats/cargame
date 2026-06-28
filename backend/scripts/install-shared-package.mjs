import { execFileSync } from 'node:child_process'
import { mkdir, readdir, rm, copyFile, stat, access } from 'node:fs/promises'
import path from 'node:path'

const backendRoot = process.cwd()
const sharedRoot = path.resolve(backendRoot, '../packages/shared')
const sharedPackageJson = path.resolve(sharedRoot, 'package.json')
const sharedDist = path.resolve(sharedRoot, 'dist')
const runtimePackageRoot = path.resolve(backendRoot, 'node_modules/@cargame/shared')

async function pathExists(targetPath) {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

async function copyDirectory(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true })

  const entries = await readdir(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath)
      continue
    }

    await copyFile(sourcePath, targetPath)
  }
}

async function main() {
  if (!(await pathExists(sharedPackageJson))) {
    throw new Error(`Shared package not found at ${sharedPackageJson}`)
  }

  execFileSync('npm', ['run', 'build'], {
    cwd: sharedRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  await rm(runtimePackageRoot, { recursive: true, force: true })
  await mkdir(path.dirname(runtimePackageRoot), { recursive: true })
  await mkdir(runtimePackageRoot, { recursive: true })

  const sharedPackageTarget = path.join(runtimePackageRoot, 'package.json')
  await copyFile(sharedPackageJson, sharedPackageTarget)
  await copyDirectory(sharedDist, path.join(runtimePackageRoot, 'dist'))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})