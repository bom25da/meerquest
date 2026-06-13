import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Supertonic3ModelManifest } from './supertonic3Manifest';

const fileSystemMock = vi.hoisted(() => ({
  cacheDirectory: 'file:///cache/',
  createDownloadResumable: vi.fn(),
  deleteAsync: vi.fn(),
  documentDirectory: 'file:///docs/',
  getInfoAsync: vi.fn(),
  makeDirectoryAsync: vi.fn(),
}));

vi.mock('expo-file-system/legacy', () => fileSystemMock);

import {
  createSupertonic3ModelStore,
  getDownloadedRelativePath,
} from './supertonic3ModelStore';

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

const testRevision = '3cadd1ee6394adea1bd021217a0e650ede09a323';
const testModelRootUri = `file:///docs/supertonic3/${testRevision}`;
const testTtsFileUri = `${testModelRootUri}/onnx/tts.json`;
const testVoiceStyleFileUri = `${testModelRootUri}/voice_styles/F1.json`;

const manifest: Supertonic3ModelManifest = {
  modelId: 'Supertone/supertonic-3',
  revision: testRevision,
  files: [ttsFile, voiceStyleFile],
};

const singleFileManifest: Supertonic3ModelManifest = {
  ...manifest,
  files: [ttsFile],
};

describe('supertonic3 model store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fileSystemMock.getInfoAsync.mockResolvedValue({ exists: true, size: ttsFile.bytes });
    fileSystemMock.makeDirectoryAsync.mockResolvedValue(undefined);
    fileSystemMock.createDownloadResumable.mockReturnValue({
      downloadAsync: vi.fn(async () => ({
        headers: {},
        status: 200,
        uri: testTtsFileUri,
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
    ).toBe(`supertonic3/${testRevision}/onnx/tts.json`);
  });

  it('reports missing when the document directory is unavailable', async () => {
    const store = createSupertonic3ModelStore({
      storageDirectory: null,
      deleteAsync: vi.fn(),
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
    const downloadedDestinations = new Set<string>();
    const store = createSupertonic3ModelStore({
      storageDirectory: 'file:///docs/',
      deleteAsync: vi.fn(),
      getInfoAsync: vi.fn(async (uri: string) => ({
        exists: downloadedDestinations.has(uri),
        size: uri.endsWith('voice_styles/F1.json') ? voiceStyleFile.bytes : ttsFile.bytes,
      })),
      makeDirectoryAsync: vi.fn(async () => undefined),
      downloadAsync: vi.fn(async (url: string, destination: string, onProgress) => {
        downloaded.push(`${url} -> ${destination}`);
        onProgress({ totalBytesWritten: 5, totalBytesExpectedToWrite: 10 });
        onProgress({ totalBytesWritten: 10, totalBytesExpectedToWrite: 10 });
        downloadedDestinations.add(destination);
      }),
    });

    await store.downloadModel(manifest, (event) => progress.push(event.downloadedBytes));

    expect(downloaded).toEqual([
      `https://example.test/onnx/tts.json -> ${testTtsFileUri}`,
      `https://example.test/voice_styles/F1.json -> ${testVoiceStyleFileUri}`,
    ]);
    expect(progress).toEqual([5, 10, 10, 15, 30, 30]);
  });

  it('skips existing files that already match the manifest size', async () => {
    const progress: number[] = [];
    const downloaded: string[] = [];
    const downloadedDestinations = new Set<string>([testTtsFileUri]);
    const store = createSupertonic3ModelStore({
      storageDirectory: 'file:///docs/',
      deleteAsync: vi.fn(),
      getInfoAsync: vi.fn(async (uri: string) => ({
        exists: downloadedDestinations.has(uri),
        size: uri.endsWith('voice_styles/F1.json') ? voiceStyleFile.bytes : ttsFile.bytes,
      })),
      makeDirectoryAsync: vi.fn(async () => undefined),
      downloadAsync: vi.fn(async (url: string, destination: string, onProgress) => {
        downloaded.push(`${url} -> ${destination}`);
        onProgress({ totalBytesWritten: 5, totalBytesExpectedToWrite: 20 });
        onProgress({ totalBytesWritten: 20, totalBytesExpectedToWrite: 20 });
        downloadedDestinations.add(destination);
      }),
    });

    await store.downloadModel(manifest, (event) => progress.push(event.downloadedBytes));

    expect(downloaded).toEqual([
      `https://example.test/voice_styles/F1.json -> ${testVoiceStyleFileUri}`,
    ]);
    expect(progress).toEqual([10, 15, 30, 30]);
  });

  it('throws when the default download completes without a result', async () => {
    fileSystemMock.getInfoAsync.mockResolvedValue({ exists: false });
    fileSystemMock.createDownloadResumable.mockReturnValue({
      downloadAsync: vi.fn(async () => undefined),
    });

    await expect(
      createSupertonic3ModelStore().downloadModel(singleFileManifest, vi.fn()),
    ).rejects.toThrow('Supertonic 3 model download did not complete.');
  });

  it('throws when the default download returns a non-2xx status', async () => {
    fileSystemMock.getInfoAsync.mockResolvedValue({ exists: false });
    fileSystemMock.createDownloadResumable.mockReturnValue({
      downloadAsync: vi.fn(async () => ({
        headers: {},
        status: 500,
        uri: testTtsFileUri,
      })),
    });

    await expect(
      createSupertonic3ModelStore().downloadModel(singleFileManifest, vi.fn()),
    ).rejects.toThrow('Supertonic 3 model download failed with HTTP status 500.');
  });

  it('throws when a downloaded file is missing after download', async () => {
    const store = createSupertonic3ModelStore({
      storageDirectory: 'file:///docs/',
      deleteAsync: vi.fn(),
      getInfoAsync: vi.fn(async () => ({ exists: false })),
      makeDirectoryAsync: vi.fn(async () => undefined),
      downloadAsync: vi.fn(async () => undefined),
    });

    await expect(store.downloadModel(singleFileManifest, vi.fn())).rejects.toThrow(
      'Supertonic 3 downloaded file is missing: onnx/tts.json.',
    );
  });

  it('throws when a downloaded file size differs from the manifest', async () => {
    const store = createSupertonic3ModelStore({
      storageDirectory: 'file:///docs/',
      deleteAsync: vi.fn(),
      getInfoAsync: vi.fn(async () => ({ exists: true, size: 9 })),
      makeDirectoryAsync: vi.fn(async () => undefined),
      downloadAsync: vi.fn(async () => undefined),
    });

    await expect(store.downloadModel(singleFileManifest, vi.fn())).rejects.toThrow(
      'Supertonic 3 downloaded file size mismatch for onnx/tts.json: expected 10 bytes, got 9 bytes.',
    );
  });

  it('reports final progress after each file when native progress is not emitted', async () => {
    const progress: number[] = [];
    const downloadedDestinations = new Set<string>();
    const store = createSupertonic3ModelStore({
      storageDirectory: 'file:///docs/',
      deleteAsync: vi.fn(),
      getInfoAsync: vi.fn(async (uri: string) => ({
        exists: downloadedDestinations.has(uri),
        size: uri.endsWith('voice_styles/F1.json') ? voiceStyleFile.bytes : ttsFile.bytes,
      })),
      makeDirectoryAsync: vi.fn(async () => undefined),
      downloadAsync: vi.fn(async (_url: string, destination: string) => {
        downloadedDestinations.add(destination);
      }),
    });

    await store.downloadModel(manifest, (event) => progress.push(event.downloadedBytes));

    expect(progress).toEqual([10, 30]);
  });

  it('deletes the revisioned model directory idempotently for repair downloads', async () => {
    const deleteAsync = vi.fn(async () => undefined);
    const store = createSupertonic3ModelStore({
      storageDirectory: 'file:///docs/',
      deleteAsync,
      getInfoAsync: vi.fn(),
      makeDirectoryAsync: vi.fn(),
      downloadAsync: vi.fn(),
    });

    await store.deleteModel(manifest);

    expect(deleteAsync).toHaveBeenCalledWith(
      testModelRootUri,
      { idempotent: true },
    );
  });
});
