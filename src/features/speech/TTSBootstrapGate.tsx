import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { ModelDownloadScreen } from '@/src/components/speech/ModelDownloadScreen';

import type { Supertonic3ModelManifest } from './supertonic3Manifest';
import type {
  Supertonic3DownloadProgress,
  Supertonic3ModelStatus,
} from './supertonic3ModelStore';

export type TtsBootstrapPhase =
  | 'checking'
  | 'downloading'
  | 'verifying'
  | 'preparing'
  | 'ready'
  | 'failed';

type TtsDownloadingBootstrapState = {
  phase: 'downloading';
  canEnterApp: false;
  progress?: Supertonic3DownloadProgress;
};

type TtsVerifyingBootstrapState = {
  phase: 'verifying';
  canEnterApp: false;
  progress?: Supertonic3DownloadProgress;
};

type TtsPreparingBootstrapState = {
  phase: 'preparing';
  canEnterApp: false;
  progress?: Supertonic3DownloadProgress;
};

export type TtsBootstrapState =
  | { phase: 'checking'; canEnterApp: false }
  | TtsVerifyingBootstrapState
  | TtsPreparingBootstrapState
  | TtsDownloadingBootstrapState
  | {
      phase: 'failed';
      canEnterApp: false;
      errorMessage: string;
      progress?: Supertonic3DownloadProgress;
    }
  | { phase: 'ready'; canEnterApp: true };

export type TtsBootstrapEvent =
  | { type: 'download-progress'; progress: Supertonic3DownloadProgress }
  | { type: 'verifying' }
  | { type: 'preparing' }
  | { type: 'ready' }
  | { type: 'failed'; errorMessage: string };

export interface TtsBootstrapModelDependencies {
  manifest: Supertonic3ModelManifest;
  modelStore: {
    deleteModel(manifest: Supertonic3ModelManifest): Promise<void>;
    downloadModel(
      manifest: Supertonic3ModelManifest,
      onProgress: (progress: Supertonic3DownloadProgress) => void,
    ): Promise<void>;
    getModelRootUri(manifest: Supertonic3ModelManifest): string | null;
    getStatus(manifest: Supertonic3ModelManifest): Promise<Supertonic3ModelStatus>;
  };
}

export interface TtsBootstrapRuntimeDependencies {
  loadModelDependencies(): Promise<TtsBootstrapModelDependencies>;
  nativeRuntime: {
    isSupported(): boolean;
    getModelStatus(
      rootUri: string,
      manifest: Supertonic3ModelManifest,
    ): Promise<Supertonic3ModelStatus>;
    prepareTts(rootUri: string): Promise<void>;
  };
  shouldBlockUnsupportedRuntime?: boolean;
}

interface RunTtsBootstrapOptions {
  dispatch(event: TtsBootstrapEvent): void;
  isActive(): boolean;
  loadDependencies(): Promise<TtsBootstrapRuntimeDependencies>;
}

function getBootstrapProgress(state: TtsBootstrapState) {
  return 'progress' in state ? state.progress : undefined;
}

function preserveProgress(progress?: Supertonic3DownloadProgress) {
  return progress ? { progress } : {};
}

export function reduceTtsBootstrapState(
  _state: TtsBootstrapState,
  event: Extract<TtsBootstrapEvent, { type: 'download-progress' }>,
): TtsDownloadingBootstrapState;
export function reduceTtsBootstrapState(
  _state: TtsBootstrapState,
  event: Extract<TtsBootstrapEvent, { type: 'verifying' }>,
): Extract<TtsBootstrapState, { phase: 'verifying' }>;
export function reduceTtsBootstrapState(
  _state: TtsBootstrapState,
  event: Extract<TtsBootstrapEvent, { type: 'preparing' }>,
): Extract<TtsBootstrapState, { phase: 'preparing' }>;
export function reduceTtsBootstrapState(
  _state: TtsBootstrapState,
  event: Extract<TtsBootstrapEvent, { type: 'ready' }>,
): Extract<TtsBootstrapState, { phase: 'ready' }>;
export function reduceTtsBootstrapState(
  _state: TtsBootstrapState,
  event: TtsBootstrapEvent,
): TtsBootstrapState;
export function reduceTtsBootstrapState(
  _state: TtsBootstrapState,
  event: TtsBootstrapEvent,
): TtsBootstrapState {
  if (event.type === 'download-progress') {
    return { phase: 'downloading', canEnterApp: false, progress: event.progress };
  }
  if (event.type === 'verifying') {
    return {
      phase: 'verifying',
      canEnterApp: false,
      ...preserveProgress(getBootstrapProgress(_state)),
    };
  }
  if (event.type === 'preparing') {
    return {
      phase: 'preparing',
      canEnterApp: false,
      ...preserveProgress(getBootstrapProgress(_state)),
    };
  }
  if (event.type === 'ready') return { phase: 'ready', canEnterApp: true };
  return {
    phase: 'failed',
    canEnterApp: false,
    errorMessage: event.errorMessage,
    ...preserveProgress(getBootstrapProgress(_state)),
  };
}

export function getDownloadPercent(progress?: Supertonic3DownloadProgress) {
  if (!progress || progress.totalBytes <= 0) return 0;
  return Math.max(
    0,
    Math.min(100, Math.round((progress.downloadedBytes / progress.totalBytes) * 100)),
  );
}

export function getBootstrapMessage(state: TtsBootstrapState) {
  if (state.phase === 'checking') return '미어루의 목소리를 확인하고 있어요.';
  if (state.phase === 'downloading') return '목소리 보물을 가져오고 있어요.';
  if (state.phase === 'verifying') return '목소리 보물을 살펴보고 있어요.';
  if (state.phase === 'preparing') return '미어루가 말할 준비를 하고 있어요.';
  if (state.phase === 'failed') return '목소리 보물을 다시 준비해볼게요.';
  return '준비됐어요.';
}

export async function loadTtsBootstrapDependencies(): Promise<TtsBootstrapRuntimeDependencies> {
  const { supertonic3NativeRuntime } = await import('./supertonic3Native');

  return {
    nativeRuntime: supertonic3NativeRuntime,
    shouldBlockUnsupportedRuntime: Platform.OS === 'ios',
    loadModelDependencies: async () => {
      const [{ supertonic3ModelManifest }, { supertonic3ModelStore }] = await Promise.all([
        import('./supertonic3Manifest'),
        import('./supertonic3ModelStore'),
      ]);

      return {
        manifest: supertonic3ModelManifest,
        modelStore: supertonic3ModelStore,
      };
    },
  };
}

async function downloadAndVerifyModel({
  dispatchIfActive,
  isActive,
  manifest,
  modelStore,
}: {
  dispatchIfActive(event: TtsBootstrapEvent): void;
  isActive(): boolean;
  manifest: Supertonic3ModelManifest;
  modelStore: TtsBootstrapModelDependencies['modelStore'];
}) {
  await modelStore.downloadModel(manifest, (progress) =>
    dispatchIfActive({ type: 'download-progress', progress }),
  );
  if (!isActive()) return null;

  dispatchIfActive({ type: 'verifying' });
  const checkedStatus = await modelStore.getStatus(manifest);
  if (!isActive()) return null;

  if (checkedStatus.state !== 'ready') {
    throw new Error(checkedStatus.reason ?? 'model-verification-failed');
  }

  return checkedStatus.rootUri;
}

export async function runTtsBootstrap({
  dispatch,
  isActive,
  loadDependencies,
}: RunTtsBootstrapOptions) {
  const dispatchIfActive = (event: TtsBootstrapEvent) => {
    if (isActive()) {
      dispatch(event);
    }
  };

  try {
    const { loadModelDependencies, nativeRuntime, shouldBlockUnsupportedRuntime } =
      await loadDependencies();
    if (!isActive()) return;

    if (!nativeRuntime.isSupported()) {
      if (shouldBlockUnsupportedRuntime) {
        dispatchIfActive({
          type: 'failed',
          errorMessage: 'supertonic3-runtime-unavailable',
        });
        return;
      }

      dispatchIfActive({ type: 'ready' });
      return;
    }

    const { manifest, modelStore } = await loadModelDependencies();
    if (!isActive()) return;

    const localStatus = await modelStore.getStatus(manifest);
    if (!isActive()) return;

    let rootUri = localStatus.rootUri ?? modelStore.getModelRootUri(manifest);

    if (localStatus.state !== 'ready') {
      rootUri = await downloadAndVerifyModel({
        dispatchIfActive,
        isActive,
        manifest,
        modelStore,
      });
      if (!rootUri) return;
    }

    if (!rootUri) {
      throw new Error('model-root-unavailable');
    }

    dispatchIfActive({ type: 'verifying' });
    const nativeStatus = await nativeRuntime.getModelStatus(rootUri, manifest);
    if (!isActive()) return;

    if (nativeStatus.state !== 'ready') {
      await modelStore.deleteModel(manifest);
      if (!isActive()) return;

      rootUri = await downloadAndVerifyModel({
        dispatchIfActive,
        isActive,
        manifest,
        modelStore,
      });
      if (!rootUri) return;

      dispatchIfActive({ type: 'verifying' });
      const repairedNativeStatus = await nativeRuntime.getModelStatus(rootUri, manifest);
      if (!isActive()) return;

      if (repairedNativeStatus.state !== 'ready') {
        throw new Error(repairedNativeStatus.reason ?? 'native-model-verification-failed');
      }
      rootUri = repairedNativeStatus.rootUri ?? rootUri;
    } else {
      rootUri = nativeStatus.rootUri ?? rootUri;
    }

    dispatchIfActive({ type: 'preparing' });
    await nativeRuntime.prepareTts(rootUri);
    dispatchIfActive({ type: 'ready' });
  } catch (error) {
    if (!isActive()) return;

    dispatch({
      type: 'failed',
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
  }
}

export function TTSBootstrapGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TtsBootstrapState>({
    phase: 'checking',
    canEnterApp: false,
  });
  const bootstrapRunIdRef = useRef(0);

  const dispatch = useCallback((event: TtsBootstrapEvent) => {
    setState((current) => reduceTtsBootstrapState(current, event));
  }, []);

  const bootstrap = useCallback(() => {
    const runId = bootstrapRunIdRef.current + 1;
    bootstrapRunIdRef.current = runId;
    setState({ phase: 'checking', canEnterApp: false });

    void runTtsBootstrap({
      dispatch,
      isActive: () => bootstrapRunIdRef.current === runId,
      loadDependencies: loadTtsBootstrapDependencies,
    });
  }, [dispatch]);

  useEffect(() => {
    bootstrap();

    return () => {
      bootstrapRunIdRef.current += 1;
    };
  }, [bootstrap]);

  if (state.canEnterApp) {
    return <>{children}</>;
  }

  return (
    <ModelDownloadScreen
      message={getBootstrapMessage(state)}
      onRetry={state.phase === 'failed' ? bootstrap : undefined}
      percent={getDownloadPercent(getBootstrapProgress(state))}
      phase={state.phase}
    />
  );
}
