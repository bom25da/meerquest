import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const appConfig = JSON.parse(readFileSync(new URL('../../app.json', import.meta.url), 'utf8'));

describe('expo app configuration', () => {
  it('locks the app to landscape orientation', () => {
    expect(appConfig.expo.orientation).toBe('landscape');
  });
});
