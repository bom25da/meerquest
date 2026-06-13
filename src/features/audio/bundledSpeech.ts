type BundledSpeechSource = string | number | { uri: string };

interface BundledSpeechPlayer {
  play(): void;
  remove?: () => void;
}

interface BundledSpeechPorts {
  cleanupDelayMs?: number;
  configureAudio?: () => Promise<void>;
  createPlayer?: (source: BundledSpeechSource) => Promise<BundledSpeechPlayer>;
}

export function createBundledSpeechService({
  cleanupDelayMs = 4200,
  configureAudio = configureBundledSpeechAudio,
  createPlayer = createExpoBundledSpeechPlayer,
}: BundledSpeechPorts = {}) {
  return {
    async play(source: BundledSpeechSource) {
      let player: BundledSpeechPlayer | undefined;

      try {
        await configureAudio();
        player = await createPlayer(source);
        player.play();
        await wait(cleanupDelayMs);
        removePlayer(player);
        return { status: 'played' as const };
      } catch {
        removePlayer(player);
        return { status: 'unavailable' as const };
      }
    },
  };
}

async function configureBundledSpeechAudio() {
  const { setAudioModeAsync } = await import('expo-audio');
  await setAudioModeAsync({ playsInSilentMode: true });
}

async function createExpoBundledSpeechPlayer(source: BundledSpeechSource) {
  const { createAudioPlayer } = await import('expo-audio');
  return createAudioPlayer(source, {
    keepAudioSessionActive: true,
    updateInterval: 1000,
  });
}

function removePlayer(player?: BundledSpeechPlayer) {
  try {
    player?.remove?.();
  } catch {
    // A failed cleanup should not prevent future speech playback.
  }
}

function wait(delayMs: number) {
  if (delayMs <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export const bundledSpeechService = createBundledSpeechService();
