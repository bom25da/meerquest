import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('ModelDownloadScreen', () => {
  it('uses the generated Meero speaking-ready background with live loading text', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/speech/ModelDownloadScreen.tsx'), 'utf8');

    expect(
      existsSync(
        resolve(process.cwd(), 'assets/images/speech/meero-speaking-ready-background-v1.png'),
      ),
    ).toBe(true);
    expect(source).toContain('ImageBackground');
    expect(source).toContain('meero-speaking-ready-background-v1.png');
    expect(source).toContain('{message}');
    expect(source).toContain('accessibilityRole="progressbar"');
    expect(source).toContain('phaseStatusLabel');
    expect(source).not.toContain('MeerkatMascot');
  });
});
