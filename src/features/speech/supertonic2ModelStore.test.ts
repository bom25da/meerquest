import { describe, expect, it, vi } from 'vitest';

import type { Supertonic2ModelManifest } from './supertonic2Manifest';

vi.mock('expo-file-system/legacy', () => ({
  createDownloadResumable: vi.fn(),
  documentDirectory: null,
  getInfoAsync: vi.fn(),
  makeDirectoryAsync: vi.fn(),
}));

import {
  createSupertonic2ModelStore,
  getDownloadedRelativePath,
} from './supertonic2ModelStore';

const manifest: Supertonic2ModelManifest = {
  modelId: 'Supertone/supertonic-2',
  revision: '75e6727618a02f323c720cba9478152d4bc16ca4',
  files: [
    {
      path: 'onnx/tts.json',
      bytes: 10,
      sha256: 'a'.repeat(64),
      url: 'https://example.test/onnx/tts.json',
    },
    {
      path: 'voice_styles/F1.json',
      bytes: 20,
      sha256: 'b'.repeat(64),
      url: 'https://example.test/voice_styles/F1.json',
    },
  ],
};

describe('supertonic2 model store', () => {
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
      getInfoAsync: vi.fn(async () => ({ exists: false })),
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
    expect(progress).toEqual([5, 10, 15, 30]);
  });
});
