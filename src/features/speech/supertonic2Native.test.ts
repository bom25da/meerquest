import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: vi.fn(() => null),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import {
  createSupertonic2NativeRuntime,
  isSupertonic2RuntimeSupported,
} from './supertonic2Native';

describe('supertonic2 native runtime wrapper', () => {
  it('only supports iOS with an installed native module', () => {
    expect(isSupertonic2RuntimeSupported('ios', {})).toBe(false);
    expect(isSupertonic2RuntimeSupported('android', { prepareTts: vi.fn() })).toBe(false);
    expect(isSupertonic2RuntimeSupported('ios', { prepareTts: vi.fn() })).toBe(true);
  });

  it('passes model root and synthesis options to native', async () => {
    const nativeStatus = {
      state: 'ready',
      revision: 'abc',
      rootUri: 'file:///docs/supertonic2/rev',
    } as const;
    const nativeModule = {
      getModelStatus: vi.fn(async () => nativeStatus),
      prepareTts: vi.fn(async () => undefined),
      synthesizeToFile: vi.fn(async () => ({ uri: 'file:///speech.wav', durationSeconds: 1.2 })),
    };
    const runtime = createSupertonic2NativeRuntime({
      nativeModule,
      platformOS: 'ios',
    });

    await runtime.prepareTts('file:///docs/supertonic2/rev');
    const result = await runtime.synthesizeToFile('안녕', { lang: 'ko', voice: 'F1' });

    expect(nativeModule.prepareTts).toHaveBeenCalledWith('file:///docs/supertonic2/rev');
    expect(nativeModule.synthesizeToFile).toHaveBeenCalledWith('안녕', {
      lang: 'ko',
      voice: 'F1',
      speed: 1.05,
      steps: 4,
    });
    expect(result).toEqual({ uri: 'file:///speech.wav', durationSeconds: 1.2 });
  });

  it('passes model root and manifest to native status', async () => {
    const nativeStatus = {
      state: 'ready',
      revision: 'abc',
      rootUri: 'file:///docs/supertonic2/rev',
    } as const;
    const manifest = { revision: 'abc', files: [] };
    const nativeModule = {
      getModelStatus: vi.fn(async () => nativeStatus),
      prepareTts: vi.fn(async () => undefined),
      synthesizeToFile: vi.fn(async () => ({ uri: 'file:///speech.wav', durationSeconds: 1.2 })),
    };
    const runtime = createSupertonic2NativeRuntime({
      nativeModule,
      platformOS: 'ios',
    });

    const result = await runtime.getModelStatus('file:///docs/supertonic2/rev', manifest);

    expect(nativeModule.getModelStatus).toHaveBeenCalledWith(
      'file:///docs/supertonic2/rev',
      manifest,
    );
    expect(result).toBe(nativeStatus);
  });

  it('returns unavailable status when model status is unsupported', async () => {
    const runtime = createSupertonic2NativeRuntime({
      nativeModule: {
        getModelStatus: vi.fn(async () => ({
          state: 'ready',
          revision: 'abc',
          rootUri: 'file:///docs/supertonic2/rev',
        }) as const),
        prepareTts: vi.fn(async () => undefined),
      },
      platformOS: 'android',
    });

    await expect(runtime.getModelStatus('file:///docs/supertonic2/rev', {})).resolves.toEqual({
      state: 'missing',
      reason: 'runtime-unavailable',
    });
  });

  it('returns unavailable status when native model status is missing', async () => {
    const runtime = createSupertonic2NativeRuntime({
      nativeModule: { prepareTts: vi.fn(async () => undefined) },
      platformOS: 'ios',
    });

    await expect(runtime.getModelStatus('file:///docs/supertonic2/rev', {})).resolves.toEqual({
      state: 'missing',
      reason: 'runtime-unavailable',
    });
  });

  it('throws unavailable error when native synthesis is missing', async () => {
    const runtime = createSupertonic2NativeRuntime({
      nativeModule: { prepareTts: vi.fn(async () => undefined) },
      platformOS: 'ios',
    });

    await expect(runtime.synthesizeToFile('안녕')).rejects.toThrow(
      'Supertonic 2 native runtime is unavailable on this platform.',
    );
  });
});
