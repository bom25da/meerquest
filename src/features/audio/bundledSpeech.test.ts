import { describe, expect, it, vi } from 'vitest';

import { createBundledSpeechService } from './bundledSpeech';

describe('bundled speech service', () => {
  it('configures audio and plays a bundled voice asset', async () => {
    const play = vi.fn();
    const remove = vi.fn();
    const configureAudio = vi.fn(async () => undefined);
    const createPlayer = vi.fn(async () => ({ play, remove }));
    const source = 42;

    const service = createBundledSpeechService({
      cleanupDelayMs: 0,
      configureAudio,
      createPlayer,
    });

    await expect(service.play(source)).resolves.toEqual({ status: 'played' });

    expect(configureAudio).toHaveBeenCalledOnce();
    expect(createPlayer).toHaveBeenCalledWith(source);
    expect(play).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
  });

  it('returns unavailable when bundled playback setup fails', async () => {
    const service = createBundledSpeechService({
      configureAudio: vi.fn(async () => undefined),
      createPlayer: vi.fn(async () => {
        throw new Error('missing audio');
      }),
    });

    await expect(service.play(42)).resolves.toEqual({ status: 'unavailable' });
  });
});
