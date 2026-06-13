import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: vi.fn(() => null),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import {
  createSupertonic3NativeRuntime,
  isSupertonic3RuntimeSupported,
} from './supertonic3Native';

describe('supertonic3 native runtime wrapper', () => {
  it('only supports iOS with an installed native module', () => {
    expect(isSupertonic3RuntimeSupported('ios', {})).toBe(false);
    expect(isSupertonic3RuntimeSupported('android', { prepareTts: vi.fn() })).toBe(false);
    expect(isSupertonic3RuntimeSupported('ios', { prepareTts: vi.fn() })).toBe(true);
  });

  it('passes model root and synthesis options to native', async () => {
    const nativeStatus = {
      state: 'ready',
      revision: 'abc',
      rootUri: 'file:///docs/supertonic3/rev',
    } as const;
    const nativeModule = {
      getModelStatus: vi.fn(async () => nativeStatus),
      prepareTts: vi.fn(async () => undefined),
      synthesizeToFile: vi.fn(async () => ({ uri: 'file:///speech.wav', durationSeconds: 1.2 })),
    };
    const runtime = createSupertonic3NativeRuntime({
      nativeModule,
      platformOS: 'ios',
    });

    await runtime.prepareTts('file:///docs/supertonic3/rev');
    const result = await runtime.synthesizeToFile('안녕', { lang: 'ko', voice: 'M3' });

    expect(nativeModule.prepareTts).toHaveBeenCalledWith('file:///docs/supertonic3/rev');
    expect(nativeModule.synthesizeToFile).toHaveBeenCalledWith('안녕', {
      lang: 'ko',
      voice: 'M3',
      speed: 1.05,
      steps: 4,
    });
    expect(result).toEqual({ uri: 'file:///speech.wav', durationSeconds: 1.2 });
  });

  it('defaults omitted synthesis options to Korean F2 voice', async () => {
    const nativeModule = {
      prepareTts: vi.fn(async () => undefined),
      synthesizeToFile: vi.fn(async () => ({ uri: 'file:///speech.wav', durationSeconds: 1.2 })),
    };
    const runtime = createSupertonic3NativeRuntime({
      nativeModule,
      platformOS: 'ios',
    });

    await runtime.synthesizeToFile('오늘도 같이 탐험해보자');

    expect(nativeModule.synthesizeToFile).toHaveBeenCalledWith('오늘도 같이 탐험해보자', {
      lang: 'ko',
      voice: 'F2',
      speed: 1.05,
      steps: 4,
    });
  });

  it('defaults the native iOS runtime to the F2 voice style', () => {
    const swiftSource = readFileSync(
      resolve(
        process.cwd(),
        'modules/supertonic3-runtime/ios/Supertonic3RuntimeSupport.swift',
      ),
      'utf8',
    );

    expect(swiftSource).toContain('options["voice"] as? String ?? "F2"');
  });

  it('documents all supported voices in the iOS runtime validation', () => {
    const swiftSource = readFileSync(
      resolve(
        process.cwd(),
        'modules/supertonic3-runtime/ios/Supertonic3RuntimeSupport.swift',
      ),
      'utf8',
    );

    expect(swiftSource).toContain('supportedSupertonic3Voices');
    expect(swiftSource).toContain('"F5"');
    expect(swiftSource).toContain('"M5"');
    expect(swiftSource).toContain('supportedSupertonic3Voices.contains(voice)');
  });

  it('passes model root and manifest to native status', async () => {
    const nativeStatus = {
      state: 'ready',
      revision: 'abc',
      rootUri: 'file:///docs/supertonic3/rev',
    } as const;
    const manifest = { revision: 'abc', files: [] };
    const nativeModule = {
      getModelStatus: vi.fn(async () => nativeStatus),
      prepareTts: vi.fn(async () => undefined),
      synthesizeToFile: vi.fn(async () => ({ uri: 'file:///speech.wav', durationSeconds: 1.2 })),
    };
    const runtime = createSupertonic3NativeRuntime({
      nativeModule,
      platformOS: 'ios',
    });

    const result = await runtime.getModelStatus('file:///docs/supertonic3/rev', manifest);

    expect(nativeModule.getModelStatus).toHaveBeenCalledWith(
      'file:///docs/supertonic3/rev',
      manifest,
    );
    expect(result).toBe(nativeStatus);
  });

  it('returns unavailable status when model status is unsupported', async () => {
    const runtime = createSupertonic3NativeRuntime({
      nativeModule: {
        getModelStatus: vi.fn(async () => ({
          state: 'ready',
          revision: 'abc',
          rootUri: 'file:///docs/supertonic3/rev',
        }) as const),
        prepareTts: vi.fn(async () => undefined),
      },
      platformOS: 'android',
    });

    await expect(runtime.getModelStatus('file:///docs/supertonic3/rev', {})).resolves.toEqual({
      state: 'missing',
      reason: 'runtime-unavailable',
      rootUri: 'file:///docs/supertonic3/rev',
    });
  });

  it('returns unavailable status when native model status is missing', async () => {
    const runtime = createSupertonic3NativeRuntime({
      nativeModule: { prepareTts: vi.fn(async () => undefined) },
      platformOS: 'ios',
    });

    await expect(runtime.getModelStatus('file:///docs/supertonic3/rev', {})).resolves.toEqual({
      state: 'missing',
      reason: 'runtime-unavailable',
      rootUri: 'file:///docs/supertonic3/rev',
    });
  });

  it('throws unavailable error when native synthesis is missing', async () => {
    const runtime = createSupertonic3NativeRuntime({
      nativeModule: { prepareTts: vi.fn(async () => undefined) },
      platformOS: 'ios',
    });

    await expect(runtime.synthesizeToFile('안녕')).rejects.toThrow(
      'Supertonic 3 native runtime is unavailable on this platform.',
    );
  });
});
