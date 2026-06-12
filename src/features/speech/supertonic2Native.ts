import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

import type { Supertonic2ModelStatus } from './supertonic2ModelStore';

type NativeModuleLike = {
  getModelStatus?: (rootUri: string, manifest: unknown) => Promise<Supertonic2ModelStatus>;
  prepareTts?: (rootUri: string) => Promise<void>;
  synthesizeToFile?: (
    text: string,
    options: { lang: 'ko' | 'en'; voice: 'F1'; speed: number; steps: number },
  ) => Promise<{ uri: string; durationSeconds: number }>;
};

const runtimeUnavailableStatus: Supertonic2ModelStatus = {
  state: 'missing',
  reason: 'runtime-unavailable',
};

const runtimeUnavailableMessage = 'Supertonic 2 native runtime is unavailable on this platform.';

export interface Supertonic2SynthesisOptions {
  lang?: 'ko' | 'en';
  voice?: 'F1';
  speed?: number;
  steps?: number;
}

export function isSupertonic2RuntimeSupported(
  platformOS: string = Platform.OS,
  nativeModule: NativeModuleLike | null = requireOptionalNativeModule('Supertonic2Runtime'),
) {
  return platformOS === 'ios' && typeof nativeModule?.prepareTts === 'function';
}

export function createSupertonic2NativeRuntime({
  nativeModule = requireOptionalNativeModule('Supertonic2Runtime') as NativeModuleLike | null,
  platformOS = Platform.OS,
}: {
  nativeModule?: NativeModuleLike | null;
  platformOS?: string;
} = {}) {
  return {
    isSupported: () => isSupertonic2RuntimeSupported(platformOS, nativeModule),

    async getModelStatus(rootUri: string, manifest: unknown) {
      if (
        !isSupertonic2RuntimeSupported(platformOS, nativeModule) ||
        typeof nativeModule?.getModelStatus !== 'function'
      ) {
        return { ...runtimeUnavailableStatus, rootUri };
      }

      return nativeModule.getModelStatus(rootUri, manifest);
    },

    async prepareTts(rootUri: string) {
      if (
        !isSupertonic2RuntimeSupported(platformOS, nativeModule) ||
        typeof nativeModule?.prepareTts !== 'function'
      ) {
        throw new Error(runtimeUnavailableMessage);
      }

      await nativeModule.prepareTts(rootUri);
    },

    async synthesizeToFile(text: string, options: Supertonic2SynthesisOptions = {}) {
      if (
        !isSupertonic2RuntimeSupported(platformOS, nativeModule) ||
        typeof nativeModule?.synthesizeToFile !== 'function'
      ) {
        throw new Error(runtimeUnavailableMessage);
      }

      return nativeModule.synthesizeToFile(text, {
        lang: options.lang ?? 'ko',
        voice: options.voice ?? 'F1',
        speed: options.speed ?? 1.05,
        steps: options.steps ?? 4,
      });
    },
  };
}

export const supertonic2NativeRuntime = createSupertonic2NativeRuntime();
