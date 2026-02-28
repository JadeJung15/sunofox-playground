#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const TARGET_DIRS = ['js', 'scripts', 'worker'];
const VALID_EXTENSIONS = new Set(['.js', '.mjs', '.cjs']);

function walk(dir, collected) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, collected);
      continue;
    }
    const ext = path.extname(entry.name);
    if (VALID_EXTENSIONS.has(ext)) {
      collected.push(fullPath);
    }
  }
}

function isModuleFile(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.mjs') return true;
  if (ext === '.cjs') return false;
  return filePath.includes(`${path.sep}js${path.sep}`);
}

function checkFile(filePath) {
  if (!isModuleFile(filePath)) {
    const result = spawnSync('node', ['--check', filePath], { encoding: 'utf8' });
    if (result.status !== 0) {
      throw new Error((result.stderr || result.stdout || 'Unknown syntax error').trim());
    }
    return;
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'syntax-check-'));
  const tmpFile = path.join(tmpDir, `${path.basename(filePath)}.mjs`);

  try {
    fs.writeFileSync(tmpFile, source, 'utf8');
    const result = spawnSync('node', ['--check', tmpFile], { encoding: 'utf8' });
    if (result.status !== 0) {
      throw new Error((result.stderr || result.stdout || 'Unknown syntax error').trim());
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function main() {
  const files = [];
  for (const target of TARGET_DIRS) {
    const fullTarget = path.join(ROOT, target);
    if (fs.existsSync(fullTarget)) {
      walk(fullTarget, files);
    }
  }

  const errors = [];
  for (const filePath of files) {
    try {
      checkFile(filePath);
    } catch (error) {
      errors.push({ filePath: path.relative(ROOT, filePath), message: error.message });
    }
  }

  if (errors.length > 0) {
    console.error(`Syntax check failed (${errors.length} file(s))`);
    for (const error of errors) {
      console.error(`- ${error.filePath}: ${error.message}`);
    }
    process.exit(1);
  }

  console.log(`Syntax check passed (${files.length} file(s))`);
}

main();
