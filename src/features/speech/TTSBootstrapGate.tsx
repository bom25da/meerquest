import { useCallback, useEffect, useState, type ReactNode } from 'react';

import type { Supertonic2DownloadProgress } from './supertonic2ModelStore';

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

export type TtsBootstrapState =
  | { phase: 'checking' | 'verifying' | 'preparing'; canEnterApp: false }
  | TtsDownloadingBootstrapState
  | { phase: 'failed'; canEnterApp: false; errorMessage: string }
  | { phase: 'ready'; canEnterApp: true };

export type TtsBootstrapEvent =
  | { type: 'download-progress'; progress: Supertonic2DownloadProgress }
  | { type: 'verifying' }
  | { type: 'preparing' }
  | { type: 'ready' }
  | { type: 'failed'; errorMessage: string };

type ModelDownloadScreenComponent =
  typeof import('@/src/components/speech/ModelDownloadScreen').ModelDownloadScreen;

export function reduceTtsBootstrapState(
  _state: TtsBootstrapState,
  event: Extract<TtsBootstrapEvent, { type: 'download-progress' }>,
): TtsDownloadingBootstrapState;
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
  if (event.type === 'verifying') return { phase: 'verifying', canEnterApp: false };
  if (event.type === 'preparing') return { phase: 'preparing', canEnterApp: false };
  if (event.type === 'ready') return { phase: 'ready', canEnterApp: true };
  return { phase: 'failed', canEnterApp: false, errorMessage: event.errorMessage };
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

export function TTSBootstrapGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TtsBootstrapState>({
    phase: 'checking',
    canEnterApp: false,
  });
  const [DownloadScreen, setDownloadScreen] = useState<ModelDownloadScreenComponent | null>(null);

  const dispatch = useCallback((event: TtsBootstrapEvent) => {
    setState((current) => reduceTtsBootstrapState(current, event));
  }, []);

  const bootstrap = useCallback(async () => {
    setState({ phase: 'checking', canEnterApp: false });

    try {
      const { supertonic2NativeRuntime } = await import('./supertonic2Native');

      if (!supertonic2NativeRuntime.isSupported()) {
        dispatch({ type: 'ready' });
        return;
      }

      const [{ supertonic2ModelManifest }, { supertonic2ModelStore }] = await Promise.all([
        import('./supertonic2Manifest'),
        import('./supertonic2ModelStore'),
      ]);

      const localStatus = await supertonic2ModelStore.getStatus(supertonic2ModelManifest);
      let rootUri =
        localStatus.rootUri ?? supertonic2ModelStore.getModelRootUri(supertonic2ModelManifest);

      if (localStatus.state !== 'ready') {
        await supertonic2ModelStore.downloadModel(supertonic2ModelManifest, (progress) =>
          dispatch({ type: 'download-progress', progress }),
        );
        dispatch({ type: 'verifying' });
        const checkedStatus = await supertonic2ModelStore.getStatus(supertonic2ModelManifest);
        if (checkedStatus.state !== 'ready') {
          throw new Error(checkedStatus.reason ?? 'model-verification-failed');
        }
        rootUri = checkedStatus.rootUri;
      }

      if (!rootUri) {
        throw new Error('model-root-unavailable');
      }

      dispatch({ type: 'preparing' });
      await supertonic2NativeRuntime.prepareTts(rootUri);
      dispatch({ type: 'ready' });
    } catch (error) {
      dispatch({
        type: 'failed',
        errorMessage: error instanceof Error ? error.message : 'unknown',
      });
    }
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    void import('@/src/components/speech/ModelDownloadScreen').then(({ ModelDownloadScreen }) => {
      if (isMounted) {
        setDownloadScreen(() => ModelDownloadScreen);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (state.canEnterApp) {
    return <>{children}</>;
  }

  if (!DownloadScreen) {
    return null;
  }

  return (
    <DownloadScreen
      message={getBootstrapMessage(state)}
      onRetry={state.phase === 'failed' ? bootstrap : undefined}
      percent={getDownloadPercent(state.phase === 'downloading' ? state.progress : undefined)}
      phase={state.phase}
    />
  );
}
