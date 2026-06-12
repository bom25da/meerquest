import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

vi.mock('@/src/components/speech/ModelDownloadScreen', () => ({
  ModelDownloadScreen: () => null,
}));

import {
  getBootstrapMessage,
  getDownloadPercent,
  reduceTtsBootstrapState,
  type TtsBootstrapEvent,
  type TtsBootstrapState,
} from './TTSBootstrapGate';

describe('TTS bootstrap gate state', () => {
  it('blocks the app while downloading', () => {
    const initial: TtsBootstrapState = { phase: 'checking', canEnterApp: false };
    const next = reduceTtsBootstrapState(initial, {
      type: 'download-progress',
      progress: { downloadedBytes: 25, totalBytes: 100, fileIndex: 1, fileCount: 7 },
    });

    expect(next).toEqual({
      phase: 'downloading',
      canEnterApp: false,
      progress: { downloadedBytes: 25, totalBytes: 100, fileIndex: 1, fileCount: 7 },
    });
    expect(getDownloadPercent(next.progress)).toBe(25);
  });

  it('allows app entry only after preparation succeeds', () => {
    const next = reduceTtsBootstrapState(
      { phase: 'preparing', canEnterApp: false },
      { type: 'ready' },
    );
    expect(next).toEqual({ phase: 'ready', canEnterApp: true });
  });

  it('keeps app blocked after failure and exposes retry copy', () => {
    const next = reduceTtsBootstrapState(
      { phase: 'downloading', canEnterApp: false },
      {
        type: 'failed',
        errorMessage: 'network',
      },
    );
    expect(next.canEnterApp).toBe(false);
    expect(getBootstrapMessage(next)).toBe('목소리 보물을 다시 준비해볼게요.');
  });

  it('keeps every non-ready phase blocked', () => {
    const initial: TtsBootstrapState = { phase: 'checking', canEnterApp: false };
    const blockedEvents: TtsBootstrapEvent[] = [
      {
        type: 'download-progress',
        progress: { downloadedBytes: 25, totalBytes: 100, fileIndex: 1, fileCount: 7 },
      },
      { type: 'verifying' },
      { type: 'preparing' },
      { type: 'failed', errorMessage: 'network' },
    ];

    for (const event of blockedEvents) {
      expect(reduceTtsBootstrapState(initial, event).canEnterApp).toBe(false);
    }

    expect(reduceTtsBootstrapState(initial, { type: 'ready' }).canEnterApp).toBe(true);
  });

  it('returns zero percent for missing progress and zero totals', () => {
    expect(getDownloadPercent()).toBe(0);
    expect(
      getDownloadPercent({ downloadedBytes: 50, totalBytes: 0, fileIndex: 1, fileCount: 7 }),
    ).toBe(0);
  });

  it('clamps download percent into display bounds', () => {
    expect(
      getDownloadPercent({ downloadedBytes: 150, totalBytes: 100, fileIndex: 1, fileCount: 7 }),
    ).toBe(100);
    expect(
      getDownloadPercent({ downloadedBytes: -25, totalBytes: 100, fileIndex: 1, fileCount: 7 }),
    ).toBe(0);
  });

  it('renders the download screen synchronously when blocked', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/features/speech/TTSBootstrapGate.tsx'),
      'utf8',
    );

    expect(source).toContain(
      "import { ModelDownloadScreen } from '@/src/components/speech/ModelDownloadScreen';",
    );
    expect(source).not.toContain('setDownloadScreen');
    expect(source).not.toContain('return null;');
  });
});
