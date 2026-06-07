import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const visibleTextFiles = [
  'app/+not-found.tsx',
  'app/guardian.tsx',
  'app/index.tsx',
  'app/quest-map.tsx',
  'app/quest-play.tsx',
  'app/reward.tsx',
  'src/components/MeerkatMascot.tsx',
  'src/components/QuestCategoryCard.tsx',
  'src/components/quest/QuestScreenFrame.tsx',
];

describe('app font', () => {
  it('loads kkukkukk from the bundled font assets with the registered family name', () => {
    const rootLayoutSource = readFileSync(resolve(process.cwd(), 'app/_layout.tsx'), 'utf8');
    const fontThemeSource = readFileSync(resolve(process.cwd(), 'src/theme/fonts.ts'), 'utf8');

    expect(existsSync(resolve(process.cwd(), 'assets/fonts/MemomentKkukkukk.ttf'))).toBe(true);
    expect(rootLayoutSource).toContain('MemomentKkukkukk');
    expect(rootLayoutSource).toContain('MemomentKkukkukk.ttf');
    expect(rootLayoutSource).toContain('fontFamily: fontFamilies.kkukkukk');
    expect(fontThemeSource).toContain("kkukkukk: 'MemomentKkukkukk'");
    expect(fontThemeSource).toContain("fontWeight: '400'");
  });

  it('routes visible app text through the kkukkukk text component', () => {
    const appTextSource = readFileSync(resolve(process.cwd(), 'src/components/AppText.tsx'), 'utf8');

    expect(appTextSource).toContain('kkukkukkTextStyle');
    expect(appTextSource).toContain('style={[kkukkukkTextStyle, style]}');

    for (const file of visibleTextFiles) {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8');

      expect(source).toContain("import { AppText as Text }");
      expect(source).not.toMatch(
        /import\s*\{[\s\S]*\bText\b[\s\S]*\}\s*from 'react-native'/,
      );
    }
  });
});
