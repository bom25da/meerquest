import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { speechModelLicenseNotice } from './modelLicenses';

describe('model license notices', () => {
  it('documents Supertonic 3 model and code licenses for commercial distribution', () => {
    expect(speechModelLicenseNotice).toMatchObject({
      codeLicenseName: 'MIT',
      licenseName: 'OpenRAIL-M',
      modelId: 'Supertone/supertonic-3',
      modelName: 'Supertonic 3',
      permitsCommercialUse: true,
    });
    expect(speechModelLicenseNotice.notice).toContain('모델 가중치');
    expect(speechModelLicenseNotice.notice).toContain('OpenRAIL-M');
    expect(speechModelLicenseNotice.notice).toContain('샘플 코드');
    expect(speechModelLicenseNotice.notice).toContain('MIT');
    expect(speechModelLicenseNotice.obligations).toEqual(
      expect.arrayContaining([
        expect.stringContaining('라이선스 사본'),
        expect.stringContaining('저작권'),
        expect.stringContaining('사용 제한'),
      ]),
    );
    expect(speechModelLicenseNotice.restrictedUseSummary).toEqual(
      expect.arrayContaining([
        expect.stringContaining('동의 없는 사칭'),
        expect.stringContaining('미성년자에게 해로운 사용'),
      ]),
    );
    expect(speechModelLicenseNotice.sourceUrls).toEqual(
      expect.arrayContaining([
        'https://huggingface.co/Supertone/supertonic-3',
        'https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE',
      ]),
    );
  });

  it('keeps a local copy of the OpenRAIL-M license text in the repository', () => {
    const licensePath = resolve(process.cwd(), 'docs/licenses/supertonic3-openrail-m-license.txt');

    expect(existsSync(licensePath)).toBe(true);
    expect(readFileSync(licensePath, 'utf8')).toContain('BigScience Open RAIL-M License');
  });

  it('surfaces the Supertonic 3 notice on the guardian screen', () => {
    const guardianSource = readFileSync(resolve(process.cwd(), 'app/guardian.tsx'), 'utf8');

    expect(guardianSource).toContain('speechModelLicenseNotice');
    expect(guardianSource).toContain('modelLicense');
    expect(guardianSource).toContain('restrictedUseSummary');
  });
});
