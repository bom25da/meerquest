import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('reward screen progress handling', () => {
  it('claims the completed quest reward when the reward screen is entered', () => {
    const rewardScreenSource = readFileSync(resolve(process.cwd(), 'app/reward.tsx'), 'utf8');

    expect(rewardScreenSource).toContain('useEffect');
    expect(rewardScreenSource).toContain('useRef');
    expect(rewardScreenSource).toContain('completeQuest');
    expect(rewardScreenSource).toContain('completeQuest(quest.id)');
    expect(rewardScreenSource).toContain('completionRecordedQuestIdRef');
  });
});
