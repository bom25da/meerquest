import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSupertonic2SpeechService } from './supertonic2Speech';

describe('supertonic2 speech service', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns unavailable when runtime support is absent', async () => {
    const service = createSupertonic2SpeechService({
      runtime: { isSupported: () => false, synthesizeToFile: vi.fn() },
      createPlayer: vi.fn(),
    });

    await expect(service.speakText('안녕')).resolves.toEqual({ status: 'unavailable' });
  });

  it('synthesizes and plays one request at a time', async () => {
    const play = vi.fn();
    const remove = vi.fn();
    const service = createSupertonic2SpeechService({
      runtime: {
        isSupported: () => true,
        synthesizeToFile: vi.fn(async (text: string) => ({
          uri: `file:///${text}.wav`,
          durationSeconds: 0.1,
        })),
      },
      createPlayer: vi.fn(() => ({ play, remove })),
    });

    await expect(service.speakText('미어루')).resolves.toEqual({ status: 'played' });
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('keeps the player until the synthesis cleanup delay elapses', async () => {
    vi.useFakeTimers();
    const play = vi.fn();
    const remove = vi.fn();
    const service = createSupertonic2SpeechService({
      runtime: {
        isSupported: () => true,
        synthesizeToFile: vi.fn(async () => ({
          uri: 'file:///미어루.wav',
          durationSeconds: 0.75,
        })),
      },
      createPlayer: vi.fn(() => ({ play, remove })),
    });

    await expect(service.speakText('미어루')).resolves.toEqual({ status: 'played' });
    expect(remove).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1249);
    expect(remove).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
