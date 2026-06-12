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

  it('synthesizes and starts playback', async () => {
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

  it('configures iOS audio mode before playback so speech can play in silent mode', async () => {
    const configureAudio = vi.fn(async () => undefined);
    const play = vi.fn();
    const synthesizeToFile = vi.fn(async () => ({
      uri: 'file:///미어루.wav',
      durationSeconds: 0.1,
    }));
    const service = createSupertonic2SpeechService({
      runtime: {
        isSupported: () => true,
        synthesizeToFile,
      },
      createPlayer: vi.fn(() => ({ play, remove: vi.fn() })),
      configureAudio,
    });

    await expect(service.speakText('미어루')).resolves.toEqual({ status: 'played' });

    expect(configureAudio).toHaveBeenCalledOnce();
    expect(configureAudio.mock.invocationCallOrder[0]).toBeLessThan(
      synthesizeToFile.mock.invocationCallOrder[0],
    );
    expect(configureAudio.mock.invocationCallOrder[0]).toBeLessThan(
      play.mock.invocationCallOrder[0],
    );
  });

  it('waits for cleanup before starting the next request', async () => {
    vi.useFakeTimers();
    const playOrder: string[] = [];
    const synthesizeToFile = vi.fn(async (text: string) => ({
      uri: `file:///${text}.wav`,
      durationSeconds: 1,
    }));
    const service = createSupertonic2SpeechService({
      runtime: {
        isSupported: () => true,
        synthesizeToFile,
      },
      createPlayer: (uri) => ({
        play: () => playOrder.push(uri),
        remove: vi.fn(),
      }),
    });

    const first = service.speakText('첫번째');
    await expect(first).resolves.toEqual({ status: 'played' });

    const second = service.speakText('두번째');
    await Promise.resolve();
    expect(synthesizeToFile).toHaveBeenCalledTimes(1);
    expect(playOrder).toEqual(['file:///첫번째.wav']);

    await vi.advanceTimersByTimeAsync(1499);
    expect(synthesizeToFile).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await expect(second).resolves.toEqual({ status: 'played' });
    expect(synthesizeToFile).toHaveBeenCalledTimes(2);
    expect(playOrder).toEqual(['file:///첫번째.wav', 'file:///두번째.wav']);
  });

  it('keeps the player until the synthesis cleanup delay elapses', async () => {
    vi.useFakeTimers();
    const play = vi.fn();
    const remove = vi.fn();
    const deleteFile = vi.fn(async () => undefined);
    const service = createSupertonic2SpeechService({
      runtime: {
        isSupported: () => true,
        synthesizeToFile: vi.fn(async () => ({
          uri: 'file:///미어루.wav',
          durationSeconds: 0.75,
        })),
      },
      createPlayer: vi.fn(() => ({ play, remove })),
      deleteFile,
    });

    await expect(service.speakText('미어루')).resolves.toEqual({ status: 'played' });
    expect(remove).not.toHaveBeenCalled();
    expect(deleteFile).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1249);
    expect(remove).not.toHaveBeenCalled();
    expect(deleteFile).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(deleteFile).toHaveBeenCalledWith('file:///미어루.wav');
  });

  it('deletes a synthesized file if playback setup fails', async () => {
    const deleteFile = vi.fn(async () => undefined);
    const service = createSupertonic2SpeechService({
      runtime: {
        isSupported: () => true,
        synthesizeToFile: vi.fn(async () => ({
          uri: 'file:///failed.wav',
          durationSeconds: 0.1,
        })),
      },
      createPlayer: vi.fn(() => {
        throw new Error('player failed');
      }),
      deleteFile,
    });

    await expect(service.speakText('미어루')).resolves.toEqual({ status: 'unavailable' });
    expect(deleteFile).toHaveBeenCalledWith('file:///failed.wav');
  });

  it('returns unavailable for a failed request and lets later requests try again', async () => {
    vi.useFakeTimers();
    const synthesizeToFile = vi
      .fn()
      .mockRejectedValueOnce(new Error('synthesis failed'))
      .mockResolvedValueOnce({
        uri: 'file:///recovered.wav',
        durationSeconds: 0.1,
      });
    const play = vi.fn();
    const service = createSupertonic2SpeechService({
      runtime: {
        isSupported: () => true,
        synthesizeToFile,
      },
      createPlayer: vi.fn(() => ({ play, remove: vi.fn() })),
    });

    await expect(service.speakText('실패')).resolves.toEqual({ status: 'unavailable' });

    const recovered = service.speakText('다시');
    await expect(recovered).resolves.toEqual({ status: 'played' });
    expect(synthesizeToFile).toHaveBeenCalledTimes(2);
    expect(play).toHaveBeenCalledTimes(1);
  });
});
