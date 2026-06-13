import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const rootsToScan = [
  'app',
  'modules',
  'plugins',
  'src',
  'tools',
  'docs/superpowers',
  'README.md',
  'app.json',
  'package.json',
  'package-lock.json',
];

const ignoredDirectories = new Set(['node_modules', 'Pods', '.git']);
const legacyLowerName = `supertonic${2}`;
const legacyPascalName = `Supertonic${2}`;

function collectFiles(path: string): string[] {
  if (!existsSync(path)) {
    return [];
  }

  const stats = statSync(path);
  if (stats.isFile()) {
    return [path];
  }

  if (!stats.isDirectory()) {
    return [];
  }

  return readdirSync(path).flatMap((entry) => {
    if (ignoredDirectories.has(entry)) {
      return [];
    }

    return collectFiles(join(path, entry));
  });
}

describe('Supertonic 3 naming', () => {
  it('keeps runtime, tooling, and app integration names aligned with Supertonic 3', () => {
    const offenders = rootsToScan
      .flatMap(collectFiles)
      .filter((path) => !path.endsWith('supertonic3Naming.test.ts'))
      .flatMap((path) => {
        const text = readFileSync(path, 'utf8');
        const matches = [legacyLowerName, legacyPascalName].filter(
          (name) => path.includes(name) || text.includes(name),
        );
        return matches.map((name) => `${path}: ${name}`);
      });

    expect(offenders).toEqual([]);
  });
});
