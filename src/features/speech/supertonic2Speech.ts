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
  deleteFile?: (uri: string) => Promise<void>;
  configureAudio?: () => Promise<void>;
}

export function createSupertonic2SpeechService({
  configureAudio,
  runtime,
  createPlayer,
  deleteFile,
}: SpeechServicePorts = {}) {
  let queue = Promise.resolve();
  const configurePlayback =
    configureAudio ?? (createPlayer ? noopConfigureAudio : configureSpeechPlaybackAudio);
  const cleanupFile = deleteFile ?? deleteTemporarySpeechFile;

  return {
    async speakText(text: string, options: Supertonic2SynthesisOptions = {}) {
      const activeRuntime = await resolveRuntime(runtime);

      if (!activeRuntime.isSupported()) {
        return { status: 'unavailable' as const };
      }

      const playback = queue.then(async () => {
        let player: Player | undefined;
        let generatedUri: string | undefined;

        try {
          await configurePlayback();
          const result = await activeRuntime.synthesizeToFile(text, options);
          generatedUri = result.uri;
          player = createPlayer ? createPlayer(result.uri) : await createExpoAudioPlayer(result.uri);

          player.play();

          return {
            cleanupDelayMs: getCleanupDelayMs(result.durationSeconds),
            generatedUri: result.uri,
            player,
            status: 'played' as const,
          };
        } catch {
          removePlayer(player);
          await cleanupGeneratedFile(cleanupFile, generatedUri);
          return { status: 'unavailable' as const };
        }
      });
      queue = playback
        .then(async (result) => {
          if (result.status === 'played') {
            await cleanupPlayer(result.player, result.generatedUri, result.cleanupDelayMs, cleanupFile);
          }
        })
        .catch(() => undefined);

      const result = await playback;
      return { status: result.status };
    },
  };
}

async function cleanupPlayer(
  player: Player,
  generatedUri: string,
  delayMs: number,
  deleteFile: (uri: string) => Promise<void>,
) {
  await wait(delayMs);
  removePlayer(player);
  await cleanupGeneratedFile(deleteFile, generatedUri);
}

function getCleanupDelayMs(durationSeconds: number) {
  return Math.max(1000, durationSeconds * 1000 + 500);
}

async function createExpoAudioPlayer(uri: string) {
  const { createAudioPlayer } = await import('expo-audio');
  return createAudioPlayer({ uri }, { keepAudioSessionActive: true, updateInterval: 1000 });
}

async function configureSpeechPlaybackAudio() {
  const { setAudioModeAsync } = await import('expo-audio');
  await setAudioModeAsync({ playsInSilentMode: true });
}

async function noopConfigureAudio() {}

async function deleteTemporarySpeechFile(uri: string) {
  const FileSystem = await import('expo-file-system/legacy');
  await FileSystem.deleteAsync(uri, { idempotent: true });
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

async function cleanupGeneratedFile(
  deleteFile: (uri: string) => Promise<void>,
  generatedUri?: string,
) {
  if (!generatedUri) return;

  try {
    await deleteFile(generatedUri);
  } catch {
    // Temporary file cleanup should never poison the speech queue.
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
