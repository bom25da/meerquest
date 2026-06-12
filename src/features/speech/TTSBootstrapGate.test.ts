import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

vi.mock('@/src/components/speech/ModelDownloadScreen', () => ({
  ModelDownloadScreen: () => null,
}));

import {
  getBootstrapMessage,
  getDownloadPercent,
  reduceTtsBootstrapState,
  runTtsBootstrap,
  type TtsBootstrapModelDependencies,
  type TtsBootstrapRuntimeDependencies,
  type TtsBootstrapEvent,
  type TtsBootstrapState,
} from './TTSBootstrapGate';
import type { Supertonic2ModelManifest } from './supertonic2Manifest';
import type {
  Supertonic2DownloadProgress,
  Supertonic2ModelStatus,
} from './supertonic2ModelStore';

const manifest: Supertonic2ModelManifest = {
  modelId: 'Supertone/supertonic-2',
  revision: '75e6727618a02f323c720cba9478152d4bc16ca4',
  files: [],
};

const completeProgress: Supertonic2DownloadProgress = {
  downloadedBytes: 100,
  totalBytes: 100,
  fileIndex: 7,
  fileCount: 7,
};

function createBootstrapRunnerHarness({
  downloadModel,
  getModelRootUri,
  nativeStatuses = [
    { state: 'ready', revision: manifest.revision, rootUri: 'file:///docs/supertonic2/rev' },
  ],
  isSupported,
  getModelStatus,
  prepareTts,
  statuses = [
    { state: 'ready', revision: manifest.revision, rootUri: 'file:///docs/supertonic2/rev' },
  ],
}: {
  downloadModel?: TtsBootstrapModelDependencies['modelStore']['downloadModel'];
  getModelRootUri?: TtsBootstrapModelDependencies['modelStore']['getModelRootUri'];
  nativeStatuses?: Supertonic2ModelStatus[];
  isSupported?: TtsBootstrapRuntimeDependencies['nativeRuntime']['isSupported'];
  getModelStatus?: (
    rootUri: string,
    manifest: Supertonic2ModelManifest,
  ) => Promise<Supertonic2ModelStatus>;
  prepareTts?: TtsBootstrapRuntimeDependencies['nativeRuntime']['prepareTts'];
  statuses?: Supertonic2ModelStatus[];
} = {}) {
  const dispatch = vi.fn();
  const statusQueue = [...statuses];
  const lastStatus = statuses[statuses.length - 1];
  const nativeStatusQueue = [...nativeStatuses];
  const lastNativeStatus = nativeStatuses[nativeStatuses.length - 1];
  const modelStore = {
    downloadModel: vi.fn(downloadModel ?? (async () => undefined)),
    getModelRootUri: vi.fn(
      getModelRootUri ??
        ((_manifest: Supertonic2ModelManifest) => 'file:///docs/supertonic2/rev'),
    ),
    getStatus: vi.fn(async () => statusQueue.shift() ?? lastStatus),
  } satisfies TtsBootstrapModelDependencies['modelStore'];
  const nativeRuntime = {
    isSupported: vi.fn(isSupported ?? (() => true)),
    getModelStatus: vi.fn(
      getModelStatus ?? (async () => nativeStatusQueue.shift() ?? lastNativeStatus),
    ),
    prepareTts: vi.fn(prepareTts ?? (async () => undefined)),
  } satisfies TtsBootstrapRuntimeDependencies['nativeRuntime'];
  const loadModelDependencies = vi.fn(async () => ({ manifest, modelStore }));
  const loadDependencies = vi.fn(
    async () =>
      ({
        loadModelDependencies,
        nativeRuntime,
      }) satisfies TtsBootstrapRuntimeDependencies,
  );

  return { dispatch, loadDependencies, loadModelDependencies, modelStore, nativeRuntime };
}

function getDispatchedEvents(dispatch: ReturnType<typeof vi.fn>) {
  return dispatch.mock.calls.map(([event]) => event as TtsBootstrapEvent);
}

describe('TTS bootstrap gate state', () => {
  it('blocks the app while downloading', () => {
    const initial: TtsBootstrapState = { phase: 'checking', canEnterApp: false };
    const next = reduceTtsBootstrapState(initial, {
      type: 'download-progress',
      progress: { downloadedBytes: 25, totalBytes: 100, fileIndex: 1, fileCount: 7 },
    });

    expect(next).toEqual({
      phase: 'downloading',
      canEnterApp: false,
      progress: { downloadedBytes: 25, totalBytes: 100, fileIndex: 1, fileCount: 7 },
    });
    expect(getDownloadPercent(next.progress)).toBe(25);
  });

  it('allows app entry only after preparation succeeds', () => {
    const next = reduceTtsBootstrapState(
      { phase: 'preparing', canEnterApp: false },
      { type: 'ready' },
    );
    expect(next).toEqual({ phase: 'ready', canEnterApp: true });
  });

  it('keeps app blocked after failure and exposes retry copy', () => {
    const next = reduceTtsBootstrapState(
      { phase: 'downloading', canEnterApp: false },
      {
        type: 'failed',
        errorMessage: 'network',
      },
    );
    expect(next.canEnterApp).toBe(false);
    expect(getBootstrapMessage(next)).toBe('목소리 보물을 다시 준비해볼게요.');
  });

  it('preserves download progress through verification and preparation', () => {
    const downloading = reduceTtsBootstrapState(
      { phase: 'checking', canEnterApp: false },
      { type: 'download-progress', progress: completeProgress },
    );
    const verifying = reduceTtsBootstrapState(downloading, { type: 'verifying' });
    const preparing = reduceTtsBootstrapState(verifying, { type: 'preparing' });

    expect(verifying).toEqual({
      phase: 'verifying',
      canEnterApp: false,
      progress: completeProgress,
    });
    expect(preparing).toEqual({
      phase: 'preparing',
      canEnterApp: false,
      progress: completeProgress,
    });
    expect(getDownloadPercent(preparing.progress)).toBe(100);
  });

  it('keeps every non-ready phase blocked', () => {
    const initial: TtsBootstrapState = { phase: 'checking', canEnterApp: false };
    const blockedEvents: TtsBootstrapEvent[] = [
      {
        type: 'download-progress',
        progress: { downloadedBytes: 25, totalBytes: 100, fileIndex: 1, fileCount: 7 },
      },
      { type: 'verifying' },
      { type: 'preparing' },
      { type: 'failed', errorMessage: 'network' },
    ];

    for (const event of blockedEvents) {
      expect(reduceTtsBootstrapState(initial, event).canEnterApp).toBe(false);
    }

    expect(reduceTtsBootstrapState(initial, { type: 'ready' }).canEnterApp).toBe(true);
  });

  it('returns zero percent for missing progress and zero totals', () => {
    expect(getDownloadPercent()).toBe(0);
    expect(
      getDownloadPercent({ downloadedBytes: 50, totalBytes: 0, fileIndex: 1, fileCount: 7 }),
    ).toBe(0);
  });

  it('clamps download percent into display bounds', () => {
    expect(
      getDownloadPercent({ downloadedBytes: 150, totalBytes: 100, fileIndex: 1, fileCount: 7 }),
    ).toBe(100);
    expect(
      getDownloadPercent({ downloadedBytes: -25, totalBytes: 100, fileIndex: 1, fileCount: 7 }),
    ).toBe(0);
  });

  it('renders the download screen synchronously when blocked', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/features/speech/TTSBootstrapGate.tsx'),
      'utf8',
    );

    expect(source).toContain(
      "import { ModelDownloadScreen } from '@/src/components/speech/ModelDownloadScreen';",
    );
    expect(source).not.toContain('setDownloadScreen');
    expect(source).not.toContain('return null;');
  });
});

describe('TTS bootstrap runner', () => {
  it('bypasses model work when the native runtime is unsupported', async () => {
    const { dispatch, loadDependencies, loadModelDependencies, modelStore, nativeRuntime } =
      createBootstrapRunnerHarness({ isSupported: vi.fn(() => false) });

    await runTtsBootstrap({
      dispatch,
      isActive: () => true,
      loadDependencies,
    });

    expect(nativeRuntime.isSupported).toHaveBeenCalledOnce();
    expect(loadModelDependencies).not.toHaveBeenCalled();
    expect(modelStore.getStatus).not.toHaveBeenCalled();
    expect(modelStore.downloadModel).not.toHaveBeenCalled();
    expect(getDispatchedEvents(dispatch)).toEqual([{ type: 'ready' }]);
  });

  it('prepares an already-ready local model and dispatches ready', async () => {
    const { dispatch, loadDependencies, modelStore, nativeRuntime } = createBootstrapRunnerHarness();

    await runTtsBootstrap({
      dispatch,
      isActive: () => true,
      loadDependencies,
    });

    expect(modelStore.downloadModel).not.toHaveBeenCalled();
    expect(nativeRuntime.getModelStatus).toHaveBeenCalledWith(
      'file:///docs/supertonic2/rev',
      manifest,
    );
    expect(nativeRuntime.prepareTts).toHaveBeenCalledWith('file:///docs/supertonic2/rev');
    expect(nativeRuntime.getModelStatus.mock.invocationCallOrder[0]).toBeLessThan(
      nativeRuntime.prepareTts.mock.invocationCallOrder[0],
    );
    expect(getDispatchedEvents(dispatch)).toEqual([
      { type: 'verifying' },
      { type: 'preparing' },
      { type: 'ready' },
    ]);
  });

  it('dispatches failed and does not prepare when native status is invalid', async () => {
    const { dispatch, loadDependencies, nativeRuntime } = createBootstrapRunnerHarness({
      nativeStatuses: [
        {
          state: 'invalid',
          reason: 'sha256-mismatch',
          revision: manifest.revision,
          rootUri: 'file:///docs/supertonic2/rev',
        },
      ],
    });

    await runTtsBootstrap({
      dispatch,
      isActive: () => true,
      loadDependencies,
    });

    expect(nativeRuntime.getModelStatus).toHaveBeenCalledWith(
      'file:///docs/supertonic2/rev',
      manifest,
    );
    expect(nativeRuntime.prepareTts).not.toHaveBeenCalled();
    expect(getDispatchedEvents(dispatch)).toEqual([
      { type: 'verifying' },
      { type: 'failed', errorMessage: 'sha256-mismatch' },
    ]);
  });

  it('downloads, verifies, prepares, and dispatches phases in order for a missing model', async () => {
    const { dispatch, loadDependencies, modelStore, nativeRuntime } = createBootstrapRunnerHarness({
      downloadModel: async (_manifestArg, onProgress) => {
        onProgress(completeProgress);
      },
      statuses: [
        { state: 'missing', revision: manifest.revision, rootUri: 'file:///docs/supertonic2/rev' },
        { state: 'ready', revision: manifest.revision, rootUri: 'file:///docs/supertonic2/rev' },
      ],
    });

    await runTtsBootstrap({
      dispatch,
      isActive: () => true,
      loadDependencies,
    });

    expect(modelStore.downloadModel).toHaveBeenCalledOnce();
    expect(modelStore.getStatus).toHaveBeenCalledTimes(2);
    expect(nativeRuntime.getModelStatus).toHaveBeenCalledWith(
      'file:///docs/supertonic2/rev',
      manifest,
    );
    expect(nativeRuntime.prepareTts).toHaveBeenCalledWith('file:///docs/supertonic2/rev');
    expect(modelStore.getStatus.mock.invocationCallOrder[1]).toBeLessThan(
      nativeRuntime.getModelStatus.mock.invocationCallOrder[0],
    );
    expect(nativeRuntime.getModelStatus.mock.invocationCallOrder[0]).toBeLessThan(
      nativeRuntime.prepareTts.mock.invocationCallOrder[0],
    );
    expect(getDispatchedEvents(dispatch)).toEqual([
      { type: 'download-progress', progress: completeProgress },
      { type: 'verifying' },
      { type: 'verifying' },
      { type: 'preparing' },
      { type: 'ready' },
    ]);
  });

  it('dispatches failed and remains blocked when verification fails', async () => {
    const { dispatch, loadDependencies } = createBootstrapRunnerHarness({
      downloadModel: async (_manifestArg, onProgress) => {
        onProgress(completeProgress);
      },
      statuses: [
        { state: 'missing', revision: manifest.revision, rootUri: 'file:///docs/supertonic2/rev' },
        {
          state: 'invalid',
          reason: 'size-mismatch',
          revision: manifest.revision,
          rootUri: 'file:///docs/supertonic2/rev',
        },
      ],
    });

    await runTtsBootstrap({
      dispatch,
      isActive: () => true,
      loadDependencies,
    });

    const finalState = getDispatchedEvents(dispatch).reduce<TtsBootstrapState>(
      reduceTtsBootstrapState,
      { phase: 'checking', canEnterApp: false },
    );

    expect(getDispatchedEvents(dispatch)).toEqual([
      { type: 'download-progress', progress: completeProgress },
      { type: 'verifying' },
      { type: 'failed', errorMessage: 'size-mismatch' },
    ]);
    expect(finalState).toMatchObject({
      phase: 'failed',
      canEnterApp: false,
      errorMessage: 'size-mismatch',
    });
  });

  it('ignores stale progress and errors after a run becomes inactive', async () => {
    let active = true;
    const { dispatch, loadDependencies } = createBootstrapRunnerHarness({
      downloadModel: async (_manifestArg, onProgress) => {
        active = false;
        onProgress(completeProgress);
        throw new Error('network');
      },
      statuses: [
        { state: 'missing', revision: manifest.revision, rootUri: 'file:///docs/supertonic2/rev' },
      ],
    });

    await runTtsBootstrap({
      dispatch,
      isActive: () => active,
      loadDependencies,
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('ignores stale completion after a run becomes inactive', async () => {
    let active = true;
    const { dispatch, loadDependencies } = createBootstrapRunnerHarness({
      prepareTts: vi.fn(async () => {
        active = false;
      }),
    });

    await runTtsBootstrap({
      dispatch,
      isActive: () => active,
      loadDependencies,
    });

    expect(getDispatchedEvents(dispatch)).toEqual([{ type: 'verifying' }, { type: 'preparing' }]);
  });
});
