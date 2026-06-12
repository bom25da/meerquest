import { describe, expect, it } from 'vitest';

import {
  getBootstrapMessage,
  getDownloadPercent,
  reduceTtsBootstrapState,
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
});
