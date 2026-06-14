import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const scriptPath = resolve(process.cwd(), 'tools/supertonic3_tts.py');

describe('supertonic TTS helper', () => {
  it('reports the pinned supertonic-3 settings without loading the model', () => {
    const result = spawnSync(
      'python3',
      [
        scriptPath,
        '--dry-run',
        '--text',
        '미어로가 기다려요.',
        '--output',
        'assets/audio/voice/meero-waits.wav',
      ],
      { encoding: 'utf8' },
    );

    expect(result.status).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload).toMatchObject({
      lang: 'ko',
      model: 'supertonic-3',
      output: 'assets/audio/voice/meero-waits.wav',
      voice: 'F2',
    });
  });

  it('documents the Supertonic 3 model option in help output', () => {
    const result = spawnSync('python3', [scriptPath, '--help'], { encoding: 'utf8' });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('supertonic-3');
    expect(result.stdout).toContain('--lang');
    expect(result.stdout).toContain('--voice');
  });
});
