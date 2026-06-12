import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('background music controller wiring', () => {
  it('uses the bundled background.mp3 asset', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/features/audio/BackgroundMusicController.tsx'),
      'utf8',
    );

    expect(existsSync(resolve(process.cwd(), 'assets/audio/background.mp3'))).toBe(true);
    expect(source).toContain("require('../../../assets/audio/background.mp3')");
  });

  it('mounts the controller from the root layout', () => {
    const layoutSource = readFileSync(resolve(process.cwd(), 'app/_layout.tsx'), 'utf8');

    expect(layoutSource).toContain(
      "import { BackgroundMusicController } from '@/src/features/audio/BackgroundMusicController';",
    );
    expect(layoutSource).toContain('<BackgroundMusicController />');
  });
});
