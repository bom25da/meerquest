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

  it('does not render a separate reward summary panel', () => {
    const rewardScreenSource = readFileSync(resolve(process.cwd(), 'app/reward.tsx'), 'utf8');

    expect(rewardScreenSource).not.toContain('새 보상');
    expect(rewardScreenSource).not.toContain('rewardBadge');
    expect(rewardScreenSource).not.toContain('rewardSeal');
    expect(rewardScreenSource).not.toContain('getRewardMark');
    expect(rewardScreenSource).not.toContain('accessibilityLabel={`획득한 보상');
  });

  it('places the reward navigation controls at the right edge with home before next', () => {
    const rewardScreenSource = readFileSync(resolve(process.cwd(), 'app/reward.tsx'), 'utf8');
    const homeButtonIndex = rewardScreenSource.indexOf('accessibilityLabel="홈으로 이동하기"');
    const questMapButtonIndex = rewardScreenSource.indexOf('accessibilityLabel="퀘스트맵으로 이동하기"');
    const nextButtonIndex = rewardScreenSource.indexOf('다음 퀘스트 시작하기');

    expect(homeButtonIndex).toBeGreaterThan(-1);
    expect(questMapButtonIndex).toBeGreaterThan(homeButtonIndex);
    expect(nextButtonIndex).toBeGreaterThan(questMapButtonIndex);
    expect(rewardScreenSource).toContain("alignSelf: 'flex-end'");
    expect(rewardScreenSource).toContain("justifyContent: 'flex-end'");
  });
});
