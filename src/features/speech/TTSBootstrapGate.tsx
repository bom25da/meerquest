import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { ModelDownloadScreen } from '@/src/components/speech/ModelDownloadScreen';

import type { Supertonic2ModelManifest } from './supertonic2Manifest';
import type {
  Supertonic2DownloadProgress,
  Supertonic2ModelStatus,
} from './supertonic2ModelStore';

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
  progress?: Supertonic2DownloadProgress;
};

type TtsVerifyingBootstrapState = {
  phase: 'verifying';
  canEnterApp: false;
  progress?: Supertonic2DownloadProgress;
};

type TtsPreparingBootstrapState = {
  phase: 'preparing';
  canEnterApp: false;
  progress?: Supertonic2DownloadProgress;
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
      progress?: Supertonic2DownloadProgress;
    }
  | { phase: 'ready'; canEnterApp: true };

export type TtsBootstrapEvent =
  | { type: 'download-progress'; progress: Supertonic2DownloadProgress }
  | { type: 'verifying' }
  | { type: 'preparing' }
  | { type: 'ready' }
  | { type: 'failed'; errorMessage: string };

export interface TtsBootstrapModelDependencies {
  manifest: Supertonic2ModelManifest;
  modelStore: {
    downloadModel(
      manifest: Supertonic2ModelManifest,
      onProgress: (progress: Supertonic2DownloadProgress) => void,
    ): Promise<void>;
    getModelRootUri(manifest: Supertonic2ModelManifest): string | null;
    getStatus(manifest: Supertonic2ModelManifest): Promise<Supertonic2ModelStatus>;
  };
}

export interface TtsBootstrapRuntimeDependencies {
  loadModelDependencies(): Promise<TtsBootstrapModelDependencies>;
  nativeRuntime: {
    isSupported(): boolean;
    getModelStatus(
      rootUri: string,
      manifest: Supertonic2ModelManifest,
    ): Promise<Supertonic2ModelStatus>;
    prepareTts(rootUri: string): Promise<void>;
  };
}

interface RunTtsBootstrapOptions {
  dispatch(event: TtsBootstrapEvent): void;
  isActive(): boolean;
  loadDependencies(): Promise<TtsBootstrapRuntimeDependencies>;
}

function getBootstrapProgress(state: TtsBootstrapState) {
  return 'progress' in state ? state.progress : undefined;
}

function preserveProgress(progress?: Supertonic2DownloadProgress) {
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

export function getDownloadPercent(progress?: Supertonic2DownloadProgress) {
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
  const { supertonic2NativeRuntime } = await import('./supertonic2Native');

  return {
    nativeRuntime: supertonic2NativeRuntime,
    loadModelDependencies: async () => {
      const [{ supertonic2ModelManifest }, { supertonic2ModelStore }] = await Promise.all([
        import('./supertonic2Manifest'),
        import('./supertonic2ModelStore'),
      ]);

      return {
        manifest: supertonic2ModelManifest,
        modelStore: supertonic2ModelStore,
      };
    },
  };
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
    const { loadModelDependencies, nativeRuntime } = await loadDependencies();
    if (!isActive()) return;

    if (!nativeRuntime.isSupported()) {
      dispatchIfActive({ type: 'ready' });
      return;
    }

    const { manifest, modelStore } = await loadModelDependencies();
    if (!isActive()) return;

    const localStatus = await modelStore.getStatus(manifest);
    if (!isActive()) return;

    let rootUri = localStatus.rootUri ?? modelStore.getModelRootUri(manifest);

    if (localStatus.state !== 'ready') {
      await modelStore.downloadModel(manifest, (progress) =>
        dispatchIfActive({ type: 'download-progress', progress }),
      );
      if (!isActive()) return;

      dispatchIfActive({ type: 'verifying' });
      const checkedStatus = await modelStore.getStatus(manifest);
      if (!isActive()) return;

      if (checkedStatus.state !== 'ready') {
        throw new Error(checkedStatus.reason ?? 'model-verification-failed');
      }
      rootUri = checkedStatus.rootUri;
    }

    if (!rootUri) {
      throw new Error('model-root-unavailable');
    }

    dispatchIfActive({ type: 'verifying' });
    const nativeStatus = await nativeRuntime.getModelStatus(rootUri, manifest);
    if (!isActive()) return;

    if (nativeStatus.state !== 'ready') {
      throw new Error(nativeStatus.reason ?? 'native-model-verification-failed');
    }
    rootUri = nativeStatus.rootUri ?? rootUri;

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
