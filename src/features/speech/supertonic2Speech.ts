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

let queue = Promise.resolve();

export function createSupertonic2SpeechService({
  runtime,
  createPlayer,
}: SpeechServicePorts = {}) {
  return {
    async speakText(text: string, options: Supertonic2SynthesisOptions = {}) {
      const activeRuntime = runtime ?? (await getDefaultRuntime());

      if (!activeRuntime.isSupported()) {
        return { status: 'unavailable' as const };
      }

      queue = queue.then(async () => {
        const result = await activeRuntime.synthesizeToFile(text, options);
        const player = createPlayer
          ? createPlayer(result.uri)
          : await createExpoAudioPlayer(result.uri);

        player.play();
        cleanupPlayer(player, getCleanupDelayMs(result.durationSeconds));
      });

      await queue;
      return { status: 'played' as const };
    },
  };
}

function cleanupPlayer(player: Player, delayMs: number) {
  if (!player.remove) {
    return;
  }

  if (delayMs <= 0) {
    player.remove();
    return;
  }

  setTimeout(() => player.remove?.(), delayMs);
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

export const supertonic2SpeechService = createSupertonic2SpeechService();
