import { describe, expect, it } from 'vitest';

import responsiveSplashScreen from './with-responsive-splash-screen.js';

const { makeSplashStoryboardResponsive } = responsiveSplashScreen;

const storyboard = `<?xml version="1.0" encoding="UTF-8"?>
<document>
    <scenes>
        <scene>
            <objects>
                <viewController>
                    <view id="EXPO-ContainerView">
                        <subviews>
                            <imageView id="EXPO-SplashScreen" image="SplashScreenLogo" contentMode="scaleAspectFit" translatesAutoresizingMaskIntoConstraints="false">
                                <rect key="frame" x="36.5" y="266" width="700" height="700"/>
                            </imageView>
                        </subviews>
                        <constraints>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="centerX" secondItem="EXPO-ContainerView" secondAttribute="centerX" id="center-x"/>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="centerY" secondItem="EXPO-ContainerView" secondAttribute="centerY" id="center-y"/>
                        </constraints>
                    </view>
                </viewController>
            </objects>
        </scene>
    </scenes>
    <resources>
        <image name="SplashScreenLogo" width="700" height="700"/>
    </resources>
</document>`;

describe('makeSplashStoryboardResponsive', () => {
  it('limits splash size by both device width and height', () => {
    const result = makeSplashStoryboardResponsive(storyboard, { maxSizeRatio: 0.8 });

    expect(result).toContain('id="MQResponsiveSplashMaxWidth"');
    expect(result).toContain('id="MQResponsiveSplashMaxHeight"');
    expect(result).toContain('firstAttribute="width" relation="lessThanOrEqual"');
    expect(result).toContain('firstAttribute="height" relation="lessThanOrEqual"');
    expect(result).toContain('secondItem="EXPO-ContainerView"');
    expect(result).toContain('multiplier="0.8"');
  });

  it('keeps the splash artwork square while it scales', () => {
    const result = makeSplashStoryboardResponsive(storyboard, { maxSizeRatio: 0.8 });

    expect(result).toContain('id="MQResponsiveSplashAspectRatio"');
    expect(result).toContain('firstAttribute="width"');
    expect(result).toContain('secondItem="EXPO-SplashScreen" secondAttribute="height"');
    expect(result).toContain('multiplier="1:1"');
  });

  it('does not duplicate responsive constraints when prebuild runs repeatedly', () => {
    const once = makeSplashStoryboardResponsive(storyboard, { maxSizeRatio: 0.8 });
    const twice = makeSplashStoryboardResponsive(once, { maxSizeRatio: 0.8 });

    expect(twice.match(/MQResponsiveSplashMaxWidth/g)).toHaveLength(1);
    expect(twice.match(/MQResponsiveSplashMaxHeight/g)).toHaveLength(1);
    expect(twice.match(/MQResponsiveSplashAspectRatio/g)).toHaveLength(1);
  });
});
