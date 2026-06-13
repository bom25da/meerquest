import { describe, expect, it } from 'vitest';

import {
  meerQuestBrightSpeechDefaults,
  meerQuestSpeechDefaults,
  supertonic3ChildFemaleVoice,
  supertonic3ChildFemaleVoiceUseCase,
} from './supertonic3VoiceProfile';

describe('Supertonic 3 MeerQuest voice profile', () => {
  it('uses the Korean F2 female preset for a youthful character voice', () => {
    expect(supertonic3ChildFemaleVoice).toBe('F2');
    expect(meerQuestSpeechDefaults).toEqual({
      lang: 'ko',
      voice: 'F2',
    });
    expect(supertonic3ChildFemaleVoiceUseCase).toContain('youth');
    expect(supertonic3ChildFemaleVoiceUseCase).toContain('character');
  });

  it('adds a slightly faster bright delivery profile for MeerQuest greetings', () => {
    expect(meerQuestBrightSpeechDefaults).toEqual({
      lang: 'ko',
      speed: 1.12,
      voice: 'F2',
    });
  });
});
