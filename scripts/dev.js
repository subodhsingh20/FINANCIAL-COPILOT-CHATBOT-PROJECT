const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');

function runProcess(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    shell: true,
    env: process.env,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      process.stderr.write(`[${name}] exited with code ${code}\n`);
      shutdown(code);
    }
  });

  return child;
}

let backendProcess = null;
const frontendProcess = runProcess('frontend', 'npm', ['--prefix', 'frontend', 'run', 'dev'], rootDir);

function startBackend() {
  backendProcess = runProcess('backend', 'npm', ['--prefix', 'backend', 'run', 'start'], rootDir);
}

startBackend();

let isShuttingDown = false;
let restartTimer = null;

function restartBackend() {
  if (isShuttingDown) {
    return;
  }

  if (restartTimer) {
    clearTimeout(restartTimer);
  }

  restartTimer = setTimeout(() => {
    if (backendProcess && !backendProcess.killed) {
      backendProcess.once('exit', () => {
        startBackend();
      });
      backendProcess.kill('SIGINT');
    } else {
      startBackend();
    }
  }, 250);
}

try {
  fs.watch(backendDir, { recursive: true }, (eventType, filename) => {
    if (!filename) {
      return;
    }

    if (filename.endsWith('.js') || filename.endsWith('.json') || filename.endsWith('.env')) {
      process.stdout.write(`[watcher] backend change detected: ${filename}\n`);
      restartBackend();
    }
  });
} catch (error) {
  process.stderr.write(`[watcher] backend file watch unavailable: ${error.message}\n`);
}

function shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  const children = [backendProcess, frontendProcess].filter(Boolean);
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }

  setTimeout(() => {
    process.exit(exitCode);
  }, 300);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

process.stdout.write('Starting NexusAI from the project root...\n');
process.stdout.write('Frontend: http://localhost:5173\n');
process.stdout.write('Backend:  http://localhost:5000\n');
