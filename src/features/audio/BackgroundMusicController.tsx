import { useEffect } from 'react';

import { createBackgroundMusicService } from './backgroundMusic';

const backgroundMusicSource = require('../../../assets/audio/background.mp3');
const backgroundMusicService = createBackgroundMusicService({
  source: backgroundMusicSource,
});

export function BackgroundMusicController() {
  useEffect(() => {
    void backgroundMusicService.start();

    return () => {
      backgroundMusicService.stop();
    };
  }, []);

  return null;
}
