import fs from 'node:fs';

import { describe, expect, it } from 'vitest';

import supertonic2IosRuntime from './with-supertonic2-ios-runtime.js';

describe('supertonic2 iOS runtime config', () => {
  it('registers the config plugin in app.json', () => {
    const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    expect(appConfig.expo.plugins).toContain('./plugins/with-supertonic2-ios-runtime.js');
  });

  it('exports the SPM constants used by the plugin', () => {
    expect(supertonic2IosRuntime.ONNX_RUNTIME_SPM_URL).toBe(
      'https://github.com/microsoft/onnxruntime-swift-package-manager.git',
    );
    expect(supertonic2IosRuntime.ONNX_RUNTIME_PRODUCT).toBe('onnxruntime');
  });
});
