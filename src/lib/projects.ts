import { readdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Build-time scan of the hub's projects. A folder counts as a project only if it
// contains `requiredFile` (index.html for no-build, package.json for built), which
// naturally excludes shared asset folders like public/models. Used by both the
// /projects index and the landing's "digital projects" panel.
export type Tier = 'no-build' | 'built';

export interface Project {
  slug: string;
  title: string;
  blurb?: string;
  tier: Tier;
}

function readMeta(dir: string): { title?: string; blurb?: string } {
  const metaPath = join(dir, 'meta.json');
  if (!existsSync(metaPath)) return {};
  try {
    return JSON.parse(readFileSync(metaPath, 'utf8'));
  } catch {
    return {};
  }
}

function scan(baseDir: string, tier: Tier, requiredFile: string): Project[] {
  const abs = join(process.cwd(), baseDir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((name) => {
      const dir = join(abs, name);
      return statSync(dir).isDirectory() && existsSync(join(dir, requiredFile));
    })
    .map((name) => {
      const meta = readMeta(join(abs, name));
      return { slug: name, tier, title: meta.title ?? name, blurb: meta.blurb };
    });
}

export function getProjects(): Project[] {
  return [
    ...scan('public', 'no-build', 'index.html'),
    ...scan('projects', 'built', 'package.json'),
  ].sort((a, b) => a.title.localeCompare(b.title));
}
