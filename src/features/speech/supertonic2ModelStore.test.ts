import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Supertonic2ModelManifest } from './supertonic2Manifest';

const fileSystemMock = vi.hoisted(() => ({
  createDownloadResumable: vi.fn(),
  documentDirectory: 'file:///docs/',
  getInfoAsync: vi.fn(),
  makeDirectoryAsync: vi.fn(),
}));

vi.mock('expo-file-system/legacy', () => fileSystemMock);

import {
  createSupertonic2ModelStore,
  getDownloadedRelativePath,
} from './supertonic2ModelStore';

const ttsFile = {
  path: 'onnx/tts.json',
  bytes: 10,
  sha256: 'a'.repeat(64),
  url: 'https://example.test/onnx/tts.json',
};

const voiceStyleFile = {
  path: 'voice_styles/F1.json',
  bytes: 20,
  sha256: 'b'.repeat(64),
  url: 'https://example.test/voice_styles/F1.json',
};

const manifest: Supertonic2ModelManifest = {
  modelId: 'Supertone/supertonic-2',
  revision: '75e6727618a02f323c720cba9478152d4bc16ca4',
  files: [ttsFile, voiceStyleFile],
};

const singleFileManifest: Supertonic2ModelManifest = {
  ...manifest,
  files: [ttsFile],
};

describe('supertonic2 model store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fileSystemMock.getInfoAsync.mockResolvedValue({ exists: true, size: ttsFile.bytes });
    fileSystemMock.makeDirectoryAsync.mockResolvedValue(undefined);
    fileSystemMock.createDownloadResumable.mockReturnValue({
      downloadAsync: vi.fn(async () => ({
        headers: {},
        status: 200,
        uri: 'file:///docs/supertonic2/75e6727618a02f323c720cba9478152d4bc16ca4/onnx/tts.json',
      })),
    });
  });

  it('maps manifest paths into the revisioned local model directory', () => {
    expect(
      getDownloadedRelativePath(manifest, {
        path: 'onnx/tts.json',
        bytes: 1,
        sha256: 'c'.repeat(64),
        url: 'x',
      }),
    ).toBe('supertonic2/75e6727618a02f323c720cba9478152d4bc16ca4/onnx/tts.json');
  });

  it('reports missing when the document directory is unavailable', async () => {
    const store = createSupertonic2ModelStore({
      documentDirectory: null,
      getInfoAsync: vi.fn(),
      makeDirectoryAsync: vi.fn(),
      downloadAsync: vi.fn(),
    });

    await expect(store.getStatus(manifest)).resolves.toEqual({
      state: 'missing',
      reason: 'document-directory-unavailable',
    });
  });

  it('downloads files in manifest order and reports aggregate progress', async () => {
    const progress: number[] = [];
    const downloaded: string[] = [];
    const store = createSupertonic2ModelStore({
      documentDirectory: 'file:///docs/',
      getInfoAsync: vi.fn(async (uri: string) => ({
        exists: true,
        size: uri.endsWith('voice_styles/F1.json') ? voiceStyleFile.bytes : ttsFile.bytes,
      })),
      makeDirectoryAsync: vi.fn(async () => undefined),
      downloadAsync: vi.fn(async (url: string, destination: string, onProgress) => {
        downloaded.push(`${url} -> ${destination}`);
        onProgress({ totalBytesWritten: 5, totalBytesExpectedToWrite: 10 });
        onProgress({ totalBytesWritten: 10, totalBytesExpectedToWrite: 10 });
      }),
    });

    await store.downloadModel(manifest, (event) => progress.push(event.downloadedBytes));

    expect(downloaded).toEqual([
      'https://example.test/onnx/tts.json -> file:///docs/supertonic2/75e6727618a02f323c720cba9478152d4bc16ca4/onnx/tts.json',
      'https://example.test/voice_styles/F1.json -> file:///docs/supertonic2/75e6727618a02f323c720cba9478152d4bc16ca4/voice_styles/F1.json',
    ]);
    expect(progress).toEqual([5, 10, 10, 15, 30, 30]);
  });

  it('throws when the default download completes without a result', async () => {
    fileSystemMock.createDownloadResumable.mockReturnValue({
      downloadAsync: vi.fn(async () => undefined),
    });

    await expect(
      createSupertonic2ModelStore().downloadModel(singleFileManifest, vi.fn()),
    ).rejects.toThrow('Supertonic 2 model download did not complete.');
  });

  it('throws when the default download returns a non-2xx status', async () => {
    fileSystemMock.createDownloadResumable.mockReturnValue({
      downloadAsync: vi.fn(async () => ({
        headers: {},
        status: 500,
        uri: 'file:///docs/supertonic2/75e6727618a02f323c720cba9478152d4bc16ca4/onnx/tts.json',
      })),
    });

    await expect(
      createSupertonic2ModelStore().downloadModel(singleFileManifest, vi.fn()),
    ).rejects.toThrow('Supertonic 2 model download failed with HTTP status 500.');
  });

  it('throws when a downloaded file is missing after download', async () => {
    const store = createSupertonic2ModelStore({
      documentDirectory: 'file:///docs/',
      getInfoAsync: vi.fn(async () => ({ exists: false })),
      makeDirectoryAsync: vi.fn(async () => undefined),
      downloadAsync: vi.fn(async () => undefined),
    });

    await expect(store.downloadModel(singleFileManifest, vi.fn())).rejects.toThrow(
      'Supertonic 2 downloaded file is missing: onnx/tts.json.',
    );
  });

  it('throws when a downloaded file size differs from the manifest', async () => {
    const store = createSupertonic2ModelStore({
      documentDirectory: 'file:///docs/',
      getInfoAsync: vi.fn(async () => ({ exists: true, size: 9 })),
      makeDirectoryAsync: vi.fn(async () => undefined),
      downloadAsync: vi.fn(async () => undefined),
    });

    await expect(store.downloadModel(singleFileManifest, vi.fn())).rejects.toThrow(
      'Supertonic 2 downloaded file size mismatch for onnx/tts.json: expected 10 bytes, got 9 bytes.',
    );
  });

  it('reports final progress after each file when native progress is not emitted', async () => {
    const progress: number[] = [];
    const store = createSupertonic2ModelStore({
      documentDirectory: 'file:///docs/',
      getInfoAsync: vi.fn(async (uri: string) => ({
        exists: true,
        size: uri.endsWith('voice_styles/F1.json') ? voiceStyleFile.bytes : ttsFile.bytes,
      })),
      makeDirectoryAsync: vi.fn(async () => undefined),
      downloadAsync: vi.fn(async () => undefined),
    });

    await store.downloadModel(manifest, (event) => progress.push(event.downloadedBytes));

    expect(progress).toEqual([10, 30]);
  });
});
