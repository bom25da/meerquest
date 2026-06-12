import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const scriptPath = resolve(process.cwd(), 'tools/supertonic2_tts.py');

describe('supertonic-2 TTS helper', () => {
  it('reports the pinned supertonic-2 settings without loading the model', () => {
    const result = spawnSync(
      'python3',
      [
        scriptPath,
        '--dry-run',
        '--text',
        '미어루가 기다려요.',
        '--output',
        'assets/audio/voice/meero-waits.wav',
      ],
      { encoding: 'utf8' },
    );

    expect(result.status).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload).toMatchObject({
      lang: 'ko',
      model: 'supertonic-2',
      output: 'assets/audio/voice/meero-waits.wav',
      voice: 'F1',
    });
  });

  it('documents the Supertonic 2 model option in help output', () => {
    const result = spawnSync('python3', [scriptPath, '--help'], { encoding: 'utf8' });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('supertonic-2');
    expect(result.stdout).toContain('--lang');
    expect(result.stdout).toContain('--voice');
  });
});
