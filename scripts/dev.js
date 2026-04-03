const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

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

const processes = [
  runProcess('backend', 'npm', ['--prefix', 'backend', 'run', 'start'], rootDir),
  runProcess('frontend', 'npm', ['--prefix', 'frontend', 'run', 'dev'], rootDir),
];

let isShuttingDown = false;

function shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  for (const child of processes) {
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
