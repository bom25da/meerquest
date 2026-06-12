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
    expect(supertonic2IosRuntime.ONNX_RUNTIME_MIN_VERSION).toBe('1.16.0');
  });

  it('keeps package insertion idempotent', () => {
    const pbxproj = [
      '/* Begin PBXNativeTarget section */',
      '    13B07F861A680F5B00A75B9A /* MeerQuest */ = {',
      '      isa = PBXNativeTarget;',
      '      name = MeerQuest;',
      '      productName = MeerQuest;',
      '    };',
      '/* End PBXNativeTarget section */',
      '/* Begin XCRemoteSwiftPackageReference section */',
      '/* End XCRemoteSwiftPackageReference section */',
      'packageReferences = (',
      ');',
    ].join('\n');

    const once = supertonic2IosRuntime.addOnnxRuntimeSwiftPackage(pbxproj);
    const twice = supertonic2IosRuntime.addOnnxRuntimeSwiftPackage(once);

    expect((twice.match(/onnxruntime-swift-package-manager/g) ?? []).length).toBe(1);
    expect((twice.match(/isa = XCSwiftPackageProductDependency;/g) ?? []).length).toBe(1);
    expect((twice.match(/packageProductDependencies = \(/g) ?? []).length).toBe(1);
    expect((twice.match(/5A2D0F760F974E4E94D00002 \/\* onnxruntime \*\//g) ?? []).length).toBe(
      2,
    );
  });

  it('adds the ONNX package reference and product dependency to pbxproj sections', () => {
    const pbxproj = [
      '/* Begin PBXNativeTarget section */',
      '    13B07F861A680F5B00A75B9A /* MeerQuest */ = {',
      '      isa = PBXNativeTarget;',
      '      name = MeerQuest;',
      '      packageProductDependencies = (',
      '      );',
      '    };',
      '/* End PBXNativeTarget section */',
      '/* Begin XCRemoteSwiftPackageReference section */',
      '/* End XCRemoteSwiftPackageReference section */',
      '/* Begin XCSwiftPackageProductDependency section */',
      '/* End XCSwiftPackageProductDependency section */',
      'packageReferences = (',
      ');',
    ].join('\n');

    const updated = supertonic2IosRuntime.addOnnxRuntimeSwiftPackage(pbxproj);

    expect(updated).toContain('isa = XCRemoteSwiftPackageReference;');
    expect(updated).toContain(
      'repositoryURL = "https://github.com/microsoft/onnxruntime-swift-package-manager.git";',
    );
    expect(updated).toContain('minimumVersion = 1.16.0;');
    expect(updated).toContain('productName = onnxruntime;');
    expect(updated).toContain('package = ');
    expect(updated).toContain('isa = XCSwiftPackageProductDependency;');
    expect(updated).toContain('packageReferences = (');
    expect(updated).toContain('packageProductDependencies = (');
  });

  it('can create Swift package sections for Expo prebuild serialization', () => {
    const pbxproj = [
      '/* Begin PBXNativeTarget section */',
      '    13B07F861A680F5B00A75B9A /* MeerQuest */ = {',
      '      isa = PBXNativeTarget;',
      '      name = MeerQuest;',
      '      productName = MeerQuest;',
      '    };',
      '/* End PBXNativeTarget section */',
      '/* Begin PBXProject section */',
      '    83CBB9F71A601CBA00E9B192 /* Project object */ = {',
      '      isa = PBXProject;',
      '      productRefGroup = 83CBBA001A601CBA00E9B192 /* Products */;',
      '    };',
      '/* End PBXProject section */',
      '/* Begin XCBuildConfiguration section */',
      '/* End XCBuildConfiguration section */',
    ].join('\n');

    const updated = supertonic2IosRuntime.addOnnxRuntimeSwiftPackage(pbxproj, {
      ensureSwiftPackageSections: true,
    });

    expect(updated).toContain('/* Begin XCRemoteSwiftPackageReference section */');
    expect(updated).toContain('/* End XCRemoteSwiftPackageReference section */');
    expect(updated).toContain('/* Begin XCSwiftPackageProductDependency section */');
    expect(updated).toContain('/* End XCSwiftPackageProductDependency section */');
    expect(updated).toContain('packageProductDependencies = (');
    expect(updated).toContain('5A2D0F760F974E4E94D00002 /* onnxruntime */');
  });

  it('uses the mod request project name for default prebuild attachment', () => {
    const options = supertonic2IosRuntime.getOnnxRuntimeSwiftPackagePatchOptions({
      projectName: 'MeerQuest',
    });

    expect(options).toEqual({
      ensureSwiftPackageSections: true,
      targetName: 'MeerQuest',
    });
  });

  it('adds an idempotent post-install hook to keep the CocoaPods fallback compile-only', () => {
    const podfile = [
      "target 'MeerQuest' do",
      '  post_install do |installer|',
      '    react_native_post_install(',
      '      installer,',
      '      config[:reactNativePath],',
      '    )',
      '  end',
      'end',
    ].join('\n');

    const once = supertonic2IosRuntime.addOnnxRuntimeObjcPodLinkageExclusion(
      podfile,
      'MeerQuest',
    );
    const twice = supertonic2IosRuntime.addOnnxRuntimeObjcPodLinkageExclusion(
      once,
      'MeerQuest',
    );

    expect(twice).toContain("Target Support Files', 'Pods-MeerQuest'");
    expect(twice).toContain('Pods-MeerQuest.*.xcconfig');
    expect(twice).toContain('gsub(\' -l"onnxruntime-objc"\', \'\')');
    expect((twice.match(/supertonic2-onnxruntime-objc-linkage/g) ?? []).length).toBe(2);
    expect(twice.indexOf('react_native_post_install')).toBeLessThan(
      twice.indexOf('supertonic2-onnxruntime-objc-linkage'),
    );
  });

  it('can attach the product dependency to a named native target', () => {
    const pbxproj = [
      '/* Begin PBXNativeTarget section */',
      '    8D101DC8E085BC33A59C07215B56B898 /* Supertonic2Runtime */ = {',
      '      isa = PBXNativeTarget;',
      '      name = Supertonic2Runtime;',
      '      productName = Supertonic2Runtime;',
      '    };',
      '/* End PBXNativeTarget section */',
      'packageReferences = (',
      ');',
    ].join('\n');

    const updated = supertonic2IosRuntime.addOnnxRuntimeSwiftPackage(pbxproj, {
      targetName: 'Supertonic2Runtime',
    });

    expect(updated).toContain('name = Supertonic2Runtime;');
    expect(updated).toContain('packageProductDependencies = (');
    expect(updated).toContain('5A2D0F760F974E4E94D00002 /* onnxruntime */');
  });

  it('can leave the product dependency unattached for pod-owned linking', () => {
    const pbxproj = [
      '/* Begin PBXNativeTarget section */',
      '    13B07F861A680F5B00A75B9A /* MeerQuest */ = {',
      '      isa = PBXNativeTarget;',
      '      name = MeerQuest;',
      '      productName = MeerQuest;',
      '    };',
      '/* End PBXNativeTarget section */',
      'packageReferences = (',
      ');',
    ].join('\n');

    const updated = supertonic2IosRuntime.addOnnxRuntimeSwiftPackage(pbxproj, {
      targetName: null,
    });

    expect(updated).toContain('isa = XCSwiftPackageProductDependency;');
    expect(updated).not.toContain('packageProductDependencies = (');
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
    expect(podspec).toContain("s.source         = { :git => 'https://github.com/bom25da/meerquest.git' }");
    expect(podspec).toContain(":ios => '16.4'");
    expect(podspec).toContain("s.swift_version  = '5.9'");
    expect(podspec).toContain("s.dependency 'ExpoModulesCore'");
    expect(podspec).toContain("s.dependency 'onnxruntime-objc', '1.16.0'");
    expect(podspec).toContain('s.source_files = "ios/**/*.{swift,h,m,mm}"');
    expect(moduleConfig.ios.podspecPath).toBe('./Supertonic2Runtime.podspec');
    expect(moduleConfig.ios.swiftModuleName).toBe('Supertonic2Runtime');
  });
});
