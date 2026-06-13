import type { Supertonic3Voice } from './supertonic3Manifest';

export const supertonic3ChildFemaleVoice: Supertonic3Voice = 'F2';

export const supertonic3ChildFemaleVoiceUseCase =
  'Bright, cheerful female preset for lively youth content and character voices.';

export const meerQuestSpeechDefaults = {
  lang: 'ko',
  voice: supertonic3ChildFemaleVoice,
} as const;

export const meerQuestBrightSpeechDefaults = {
  ...meerQuestSpeechDefaults,
  speed: 1.12,
} as const;
