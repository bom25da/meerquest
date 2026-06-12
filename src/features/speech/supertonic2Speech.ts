import type { Supertonic2SynthesisOptions } from './supertonic2Native';

interface RuntimePort {
  isSupported(): boolean;
  synthesizeToFile(
    text: string,
    options?: Supertonic2SynthesisOptions,
  ): Promise<{ uri: string; durationSeconds: number }>;
}

interface Player {
  play(): void;
  remove?: () => void;
}

interface SpeechServicePorts {
  runtime?: RuntimePort;
  createPlayer?: (uri: string) => Player;
}

export function createSupertonic2SpeechService({
  runtime,
  createPlayer,
}: SpeechServicePorts = {}) {
  let queue = Promise.resolve();

  return {
    async speakText(text: string, options: Supertonic2SynthesisOptions = {}) {
      const activeRuntime = await resolveRuntime(runtime);

      if (!activeRuntime.isSupported()) {
        return { status: 'unavailable' as const };
      }

      const playback = queue.then(async () => {
        let player: Player | undefined;

        try {
          const result = await activeRuntime.synthesizeToFile(text, options);
          player = createPlayer ? createPlayer(result.uri) : await createExpoAudioPlayer(result.uri);

          player.play();

          return {
            cleanupDelayMs: getCleanupDelayMs(result.durationSeconds),
            player,
            status: 'played' as const,
          };
        } catch {
          removePlayer(player);
          return { status: 'unavailable' as const };
        }
      });
      queue = playback
        .then(async (result) => {
          if (result.status === 'played') {
            await cleanupPlayer(result.player, result.cleanupDelayMs);
          }
        })
        .catch(() => undefined);

      const result = await playback;
      return { status: result.status };
    },
  };
}

async function cleanupPlayer(player: Player, delayMs: number) {
  await wait(delayMs);
  removePlayer(player);
}

function getCleanupDelayMs(durationSeconds: number) {
  return Math.max(1000, durationSeconds * 1000 + 500);
}

async function createExpoAudioPlayer(uri: string) {
  const { createAudioPlayer } = await import('expo-audio');
  return createAudioPlayer({ uri }, { keepAudioSessionActive: true, updateInterval: 1000 });
}

async function getDefaultRuntime() {
  const { supertonic2NativeRuntime } = await import('./supertonic2Native');
  return supertonic2NativeRuntime;
}

async function resolveRuntime(runtime?: RuntimePort) {
  if (runtime) {
    return runtime;
  }

  try {
    return await getDefaultRuntime();
  } catch {
    return {
      isSupported: () => false,
      synthesizeToFile: async () => {
        throw new Error('Supertonic 2 runtime is unavailable.');
      },
    };
  }
}

function removePlayer(player?: Player) {
  try {
    player?.remove?.();
  } catch {
    // Playback cleanup should never prevent future speech requests.
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

export const supertonic2SpeechService = createSupertonic2SpeechService();
