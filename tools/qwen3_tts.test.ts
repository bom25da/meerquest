import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const scriptPath = resolve(process.cwd(), 'tools/qwen3_tts.py');

describe('qwen3 TTS helper', () => {
  it('reports the default Korean CustomVoice settings without loading the model', () => {
    const result = spawnSync(
      'python3',
      [
        scriptPath,
        '--dry-run',
        '--text',
        '오늘도 같이 탐험하자.',
        '--output',
        'assets/audio/voice/qwen3-home-entry.wav',
      ],
      { encoding: 'utf8' },
    );

    expect(result.status).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload).toMatchObject({
      language: 'Korean',
      license: 'Apache-2.0',
      mode: 'custom-voice',
      model: 'Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice',
      output: 'assets/audio/voice/qwen3-home-entry.wav',
      speaker: 'Sohee',
      voiceRightsConfirmed: false,
    });
  });

  it('requires explicit rights confirmation before voice cloning', () => {
    const result = spawnSync(
      'python3',
      [
        scriptPath,
        '--dry-run',
        '--mode',
        'voice-clone',
        '--text',
        '오늘도 같이 탐험하자.',
        '--output',
        'assets/audio/voice/qwen3-clone.wav',
        '--ref-audio',
        'private/reference.wav',
      ],
      { encoding: 'utf8' },
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('--confirm-voice-rights');
  });

  it('documents license and voice rights options in help output', () => {
    const result = spawnSync('python3', [scriptPath, '--help'], { encoding: 'utf8' });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Apache-2.0');
    expect(result.stdout).toContain('--confirm-voice-rights');
    expect(result.stdout).toContain('--instruct');
  });
});
