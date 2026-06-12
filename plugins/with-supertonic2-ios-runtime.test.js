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

  it('defines the native iOS module autolinking contract', () => {
    const moduleConfig = JSON.parse(
      fs.readFileSync('modules/supertonic2-runtime/expo-module.config.json', 'utf8'),
    );
    const podspecPath = 'modules/supertonic2-runtime/Supertonic2Runtime.podspec';

    expect(moduleConfig.ios.modules).toContain('Supertonic2RuntimeModule');
    expect(fs.existsSync(podspecPath)).toBe(true);

    const podspec = fs.readFileSync(podspecPath, 'utf8');
    expect(podspec).toContain("s.name           = 'Supertonic2Runtime'");
    expect(podspec).toContain("s.version        = package['version']");
    expect(podspec).toContain(":ios => '16.4'");
    expect(podspec).toContain("s.swift_version  = '5.9'");
    expect(podspec).toContain("s.dependency 'ExpoModulesCore'");
    expect(podspec).toContain('s.source_files = "ios/**/*.{swift,h,m,mm}"');
    expect(moduleConfig.ios.podspecPath).toBe('./Supertonic2Runtime.podspec');
    expect(moduleConfig.ios.swiftModuleName).toBe('Supertonic2Runtime');
  });
});
