import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

import type { Supertonic3Voice } from './supertonic3Manifest';
import type { Supertonic3ModelStatus } from './supertonic3ModelStore';
import { meerQuestSpeechDefaults } from './supertonic3VoiceProfile';

type NativeModuleLike = {
  getModelStatus?: (rootUri: string, manifest: unknown) => Promise<Supertonic3ModelStatus>;
  prepareTts?: (rootUri: string) => Promise<void>;
  synthesizeToFile?: (
    text: string,
    options: { lang: 'ko' | 'en'; voice: Supertonic3Voice; speed: number; steps: number },
  ) => Promise<{ uri: string; durationSeconds: number }>;
};

const runtimeUnavailableStatus: Supertonic3ModelStatus = {
  state: 'missing',
  reason: 'runtime-unavailable',
};

const runtimeUnavailableMessage = 'Supertonic 3 native runtime is unavailable on this platform.';

export interface Supertonic3SynthesisOptions {
  lang?: 'ko' | 'en';
  voice?: Supertonic3Voice;
  speed?: number;
  steps?: number;
}

export function isSupertonic3RuntimeSupported(
  platformOS: string = Platform.OS,
  nativeModule: NativeModuleLike | null = requireOptionalNativeModule('Supertonic3Runtime'),
) {
  return platformOS === 'ios' && typeof nativeModule?.prepareTts === 'function';
}

export function createSupertonic3NativeRuntime({
  nativeModule = requireOptionalNativeModule('Supertonic3Runtime') as NativeModuleLike | null,
  platformOS = Platform.OS,
}: {
  nativeModule?: NativeModuleLike | null;
  platformOS?: string;
} = {}) {
  return {
    isSupported: () => isSupertonic3RuntimeSupported(platformOS, nativeModule),

    async getModelStatus(rootUri: string, manifest: unknown) {
      if (
        !isSupertonic3RuntimeSupported(platformOS, nativeModule) ||
        typeof nativeModule?.getModelStatus !== 'function'
      ) {
        return { ...runtimeUnavailableStatus, rootUri };
      }

      return nativeModule.getModelStatus(rootUri, manifest);
    },

    async prepareTts(rootUri: string) {
      if (
        !isSupertonic3RuntimeSupported(platformOS, nativeModule) ||
        typeof nativeModule?.prepareTts !== 'function'
      ) {
        throw new Error(runtimeUnavailableMessage);
      }

      await nativeModule.prepareTts(rootUri);
    },

    async synthesizeToFile(text: string, options: Supertonic3SynthesisOptions = {}) {
      if (
        !isSupertonic3RuntimeSupported(platformOS, nativeModule) ||
        typeof nativeModule?.synthesizeToFile !== 'function'
      ) {
        throw new Error(runtimeUnavailableMessage);
      }

      return nativeModule.synthesizeToFile(text, {
        lang: options.lang ?? meerQuestSpeechDefaults.lang,
        voice: options.voice ?? meerQuestSpeechDefaults.voice,
        speed: options.speed ?? 1.05,
        steps: options.steps ?? 4,
      });
    },
  };
}

export const supertonic3NativeRuntime = createSupertonic3NativeRuntime();
