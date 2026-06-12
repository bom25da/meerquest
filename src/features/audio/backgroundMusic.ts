export const BACKGROUND_MUSIC_VOLUME = 0.16;

type BackgroundMusicSource = string | number | { uri: string };

interface BackgroundMusicPlayer {
  loop: boolean;
  play(): void;
  remove?: () => void;
  volume: number;
}

interface BackgroundMusicPorts {
  configureAudio?: () => Promise<void>;
  createPlayer?: (source: BackgroundMusicSource) => Promise<BackgroundMusicPlayer>;
  source: BackgroundMusicSource;
}

export function createBackgroundMusicService({
  configureAudio = configureBackgroundAudio,
  createPlayer = createExpoBackgroundPlayer,
  source,
}: BackgroundMusicPorts) {
  let player: BackgroundMusicPlayer | null = null;
  let starting: Promise<{ status: 'playing' | 'unavailable' }> | null = null;

  return {
    async start() {
      if (player) {
        player.play();
        return { status: 'playing' as const };
      }

      if (starting) {
        return starting;
      }

      starting = (async () => {
        try {
          await configureAudio();
          const nextPlayer = await createPlayer(source);
          nextPlayer.loop = true;
          nextPlayer.volume = BACKGROUND_MUSIC_VOLUME;
          nextPlayer.play();
          player = nextPlayer;
          return { status: 'playing' as const };
        } catch {
          return { status: 'unavailable' as const };
        } finally {
          starting = null;
        }
      })();

      return starting;
    },

    stop() {
      try {
        player?.remove?.();
      } catch {
        // Background music cleanup should not affect app navigation.
      } finally {
        player = null;
      }
    },
  };
}

async function configureBackgroundAudio() {
  const { setAudioModeAsync } = await import('expo-audio');
  await setAudioModeAsync({
    interruptionMode: 'mixWithOthers',
    playsInSilentMode: true,
  });
}

async function createExpoBackgroundPlayer(source: BackgroundMusicSource) {
  const { createAudioPlayer } = await import('expo-audio');
  return createAudioPlayer(source, { keepAudioSessionActive: true, updateInterval: 1000 });
}
