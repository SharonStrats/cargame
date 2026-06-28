import { execFileSync, spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const childProcesses = []

function startProcess(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: isWindows,
  })

  childProcesses.push(child)
  return child
}

function shutdown(exitCode = 0) {
  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill('SIGINT')
    }
  }

  process.exit(exitCode)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

execFileSync('npm', ['run', 'build'], {
  cwd: '../packages/shared',
  stdio: 'inherit',
  shell: isWindows,
})

const sharedProcess = startProcess('npm', ['run', 'dev'], '../packages/shared')
const backendRawProcess = startProcess('npm', ['run', 'dev:raw'], '../backend')
const frontendProcess = startProcess('npm', ['run', 'dev:raw'], '.')

sharedProcess.on('exit', (code) => {
  if (code && code !== 0) {
    shutdown(code)
  }
})

frontendProcess.on('exit', (code) => {
  shutdown(code ?? 0)
})

backendRawProcess.on('exit', (code) => {
  shutdown(code ?? 0)
})
