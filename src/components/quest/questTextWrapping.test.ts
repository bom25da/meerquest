import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const liveTextSources = [
  'app/index.tsx',
  'app/quest-play.tsx',
  'src/components/speech/ModelDownloadScreen.tsx',
  'src/components/quest/QuestProblemScene.tsx',
  'src/components/quest/QuestScreenFrame.tsx',
];

describe('live text wrapping', () => {
  it('does not shrink live text to force long copy into one line', () => {
    for (const sourcePath of liveTextSources) {
      const source = readFileSync(resolve(process.cwd(), sourcePath), 'utf8');

      expect(source, sourcePath).not.toContain('adjustsFontSizeToFit');
      expect(source, sourcePath).not.toContain('numberOfLines=');
    }
  });
});
