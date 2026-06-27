import { spawn } from 'node:child_process'

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

const backendProcess = startProcess('npm', ['run', 'dev'], '../backend')
const frontendProcess = startProcess('npm', ['run', 'dev'], '.')

backendProcess.on('exit', (code) => {
  if (code && code !== 0) {
    shutdown(code)
  }
})

frontendProcess.on('exit', (code) => {
  shutdown(code ?? 0)
})
