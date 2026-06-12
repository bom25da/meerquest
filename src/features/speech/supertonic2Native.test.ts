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
    const nativeModule = {
      getModelStatus: vi.fn(async () => ({ state: 'ready', revision: 'abc' })),
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
});
