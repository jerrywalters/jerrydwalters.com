// Builds each built-tier project under projects/<name>/ and assembles its
// output into the root dist/<name>/, so one deploy serves the umbrella plus
// every project at its subpath. Run after `astro build` (which creates dist/).
import { readdirSync, existsSync, statSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const projectsDir = join(root, 'projects');
const distDir = join(root, 'dist');

if (!existsSync(projectsDir)) {
  console.log('[build-projects] no projects/ directory — nothing to assemble.');
  process.exit(0);
}

const names = readdirSync(projectsDir).filter((name) => {
  const dir = join(projectsDir, name);
  return statSync(dir).isDirectory() && existsSync(join(dir, 'package.json'));
});

if (names.length === 0) {
  console.log('[build-projects] no built projects found.');
  process.exit(0);
}

for (const name of names) {
  const projDir = join(projectsDir, name);
  console.log(`\n[build-projects] building "${name}"…`);
  execSync('pnpm build', { cwd: projDir, stdio: 'inherit' });

  const out = join(projDir, 'dist');
  if (!existsSync(out)) {
    console.error(`[build-projects] ERROR: "${name}" produced no dist/.`);
    process.exit(1);
  }

  const dest = join(distDir, name);
  rmSync(dest, { recursive: true, force: true });
  cpSync(out, dest, { recursive: true });
  console.log(`[build-projects] assembled → dist/${name}/`);
}

console.log(`\n[build-projects] done — ${names.length} project(s) assembled.`);
