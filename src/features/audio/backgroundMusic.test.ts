import { describe, expect, it, vi } from 'vitest';

import { BACKGROUND_MUSIC_VOLUME, createBackgroundMusicService } from './backgroundMusic';

describe('background music service', () => {
  it('configures audio and starts a low-volume looping player', async () => {
    const player = {
      loop: false,
      play: vi.fn(),
      remove: vi.fn(),
      volume: 1,
    };
    const configureAudio = vi.fn(async () => undefined);
    const createPlayer = vi.fn(async () => player);
    const service = createBackgroundMusicService({
      configureAudio,
      createPlayer,
      source: 'background-source',
    });

    await expect(service.start()).resolves.toEqual({ status: 'playing' });

    expect(configureAudio).toHaveBeenCalledOnce();
    expect(createPlayer).toHaveBeenCalledWith('background-source');
    expect(player.loop).toBe(true);
    expect(player.volume).toBe(BACKGROUND_MUSIC_VOLUME);
    expect(player.play).toHaveBeenCalledOnce();
  });

  it('reuses the existing player on repeated starts', async () => {
    const player = {
      loop: false,
      play: vi.fn(),
      remove: vi.fn(),
      volume: 1,
    };
    const createPlayer = vi.fn(async () => player);
    const service = createBackgroundMusicService({
      configureAudio: vi.fn(async () => undefined),
      createPlayer,
      source: 'background-source',
    });

    await service.start();
    await service.start();

    expect(createPlayer).toHaveBeenCalledOnce();
    expect(player.play).toHaveBeenCalledTimes(2);
  });

  it('removes the player when stopped', async () => {
    const player = {
      loop: false,
      play: vi.fn(),
      remove: vi.fn(),
      volume: 1,
    };
    const service = createBackgroundMusicService({
      configureAudio: vi.fn(async () => undefined),
      createPlayer: vi.fn(async () => player),
      source: 'background-source',
    });

    await service.start();
    service.stop();

    expect(player.remove).toHaveBeenCalledOnce();
  });

  it('does not throw when playback setup fails', async () => {
    const service = createBackgroundMusicService({
      configureAudio: vi.fn(async () => undefined),
      createPlayer: vi.fn(async () => {
        throw new Error('audio failed');
      }),
      source: 'background-source',
    });

    await expect(service.start()).resolves.toEqual({ status: 'unavailable' });
  });
});
