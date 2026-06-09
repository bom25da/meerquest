import { useEffect, useState } from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, type StyleProp } from 'react-native';

const meeroThinkAgainFrames: ImageSourcePropType[] = [
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-01.png'),
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-02.png'),
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-03.png'),
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-04.png'),
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-05.png'),
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-06.png'),
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-07.png'),
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-08.png'),
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-09.png'),
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-10.png'),
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-11.png'),
  require('../../../assets/images/characters/animations/meero-think-again-smooth/meero-think-again-smooth-12.png'),
];

const defaultFrameMs = 80;

interface MeeroThinkAgainAnimationProps {
  frameMs?: number;
  style?: StyleProp<ImageStyle>;
}

export function MeeroThinkAgainAnimation({
  frameMs = defaultFrameMs,
  style,
}: MeeroThinkAgainAnimationProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFrameIndex((currentFrameIndex) => (currentFrameIndex + 1) % meeroThinkAgainFrames.length);
    }, frameMs);

    return () => clearInterval(intervalId);
  }, [frameMs]);

  return (
    <Image
      accessibilityLabel="다시 생각해보는 미어루"
      resizeMode="contain"
      source={meeroThinkAgainFrames[frameIndex]}
      style={style}
    />
  );
}
