# Supertonic 2 iOS Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add iOS-first on-device Supertonic 2 TTS with first-launch model download that blocks app entry until the model is downloaded, verified, and prepared.

**Architecture:** A React bootstrap gate blocks the Expo Router stack until a model store verifies the downloaded Supertonic 2 files and an iOS Expo module prepares the ONNX runtime. JavaScript owns manifest-driven download progress with `expo-file-system`; the native module owns checksum/status, ONNX session loading, synthesis, and WAV output. Quest screens use a speech service so existing UI does not call native code directly.

**Tech Stack:** Expo 56, React Native 0.85, TypeScript, Vitest, Expo Modules API, Swift, ONNX Runtime Swift Package Manager, `expo-file-system`, `expo-audio`.

---

## File Structure

- `tools/build_supertonic2_manifest.py`: Generates a versioned manifest from Hugging Face file metadata and local downloads.
- `src/features/speech/supertonic2ModelManifest.json`: Runtime model manifest consumed by JS and passed to native checks.
- `src/features/speech/supertonic2Manifest.ts`: Typed manifest exports and URL helpers.
- `src/features/speech/supertonic2Manifest.test.ts`: Manifest shape and URL tests.
- `src/features/speech/supertonic2ModelStore.ts`: JS download orchestration, local path planning, status mapping.
- `src/features/speech/supertonic2ModelStore.test.ts`: Unit tests using an injected file-system port.
- `src/features/speech/supertonic2Native.ts`: TypeScript wrapper around the iOS Expo module with platform gating.
- `src/features/speech/supertonic2Native.test.ts`: Native wrapper tests with injected module mocks.
- `src/features/speech/supertonic2Speech.ts`: Quest-facing `speakQuestText()` queue and playback handoff.
- `src/features/speech/supertonic2Speech.test.ts`: Queue, fallback, and generated URI tests.
- `src/components/speech/ModelDownloadScreen.tsx`: Blocking child-friendly model download UI.
- `src/features/speech/TTSBootstrapGate.tsx`: Root gate that downloads, verifies, prepares, and renders children only when ready.
- `src/features/speech/TTSBootstrapGate.test.ts`: Pure state-machine tests for bootstrap transitions.
- `app/_layout.tsx`: Wraps `RootLayoutNav` in the gate after fonts load.
- `app/quest-play.tsx`: Uses runtime TTS from the existing speaker button for instruction text when no static sound is present.
- `modules/supertonic2-runtime/package.json`: Local Expo module package.
- `modules/supertonic2-runtime/expo-module.config.json`: Expo autolinking metadata.
- `modules/supertonic2-runtime/src/index.ts`: JS export for the native module.
- `modules/supertonic2-runtime/ios/Supertonic2RuntimeModule.swift`: Expo module API.
- `modules/supertonic2-runtime/ios/Supertonic2RuntimeSupport.swift`: Status, checksum, file location, and synthesis service glue.
- `modules/supertonic2-runtime/ios/Supertonic2Helper.swift`: Adapted Supertonic Swift ONNX helper.
- `plugins/with-supertonic2-ios-runtime.js`: Config plugin that adds the ONNX Runtime SPM dependency to the iOS project.
- `plugins/with-supertonic2-ios-runtime.test.js`: Static tests for plugin idempotence and app config wiring.
- `app.json`: Registers the local plugin.
- `package.json`: Adds direct dependencies and scripts for manifest generation and iOS verification.

## Task 1: Manifest Generator And Typed Manifest

**Files:**
- Create: `tools/build_supertonic2_manifest.py`
- Create: `src/features/speech/supertonic2ModelManifest.json`
- Create: `src/features/speech/supertonic2Manifest.ts`
- Create: `src/features/speech/supertonic2Manifest.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing manifest tests**

Create `src/features/speech/supertonic2Manifest.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import manifestJson from './supertonic2ModelManifest.json';
import {
  getSupertonic2DownloadTotalBytes,
  getSupertonic2RequiredFiles,
  supertonic2ModelManifest,
} from './supertonic2Manifest';

describe('supertonic2 model manifest', () => {
  it('pins the approved Supertonic 2 revision', () => {
    expect(supertonic2ModelManifest.modelId).toBe('Supertone/supertonic-2');
    expect(supertonic2ModelManifest.revision).toBe(
      '75e6727618a02f323c720cba9478152d4bc16ca4',
    );
  });

  it('contains the minimum runtime files with sha256 checksums', () => {
    const files = getSupertonic2RequiredFiles();
    const paths = files.map((file) => file.path).sort();

    expect(paths).toEqual([
      'onnx/duration_predictor.onnx',
      'onnx/text_encoder.onnx',
      'onnx/tts.json',
      'onnx/unicode_indexer.json',
      'onnx/vector_estimator.onnx',
      'onnx/vocoder.onnx',
      'voice_styles/F1.json',
    ]);
    expect(files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256))).toBe(true);
    expect(files.every((file) => file.bytes > 0)).toBe(true);
  });

  it('uses stable Hugging Face resolve URLs for development downloads', () => {
    for (const file of supertonic2ModelManifest.files) {
      expect(file.url).toBe(
        `https://huggingface.co/${supertonic2ModelManifest.modelId}/resolve/${supertonic2ModelManifest.revision}/${file.path}`,
      );
    }
  });

  it('reports total download bytes', () => {
    const expected = manifestJson.files.reduce((sum, file) => sum + file.bytes, 0);
    expect(getSupertonic2DownloadTotalBytes()).toBe(expected);
  });
});
```

- [ ] **Step 2: Run the manifest tests to verify they fail**

Run:

```bash
rtk npm test -- src/features/speech/supertonic2Manifest.test.ts
```

Expected: FAIL because `supertonic2Manifest.ts` and the JSON manifest do not exist.

- [ ] **Step 3: Add the manifest generator**

Create `tools/build_supertonic2_manifest.py`:

```python
#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from urllib.request import urlopen

MODEL_ID = "Supertone/supertonic-2"
REVISION = "75e6727618a02f323c720cba9478152d4bc16ca4"
REQUIRED_FILES = [
    "onnx/tts.json",
    "onnx/unicode_indexer.json",
    "onnx/duration_predictor.onnx",
    "onnx/text_encoder.onnx",
    "onnx/vector_estimator.onnx",
    "onnx/vocoder.onnx",
    "voice_styles/F1.json",
]


def download_bytes(relative_path: str) -> bytes:
    url = f"https://huggingface.co/{MODEL_ID}/resolve/{REVISION}/{relative_path}"
    with urlopen(url) as response:
        return response.read()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        default="src/features/speech/supertonic2ModelManifest.json",
    )
    args = parser.parse_args()
    files = []

    for relative_path in REQUIRED_FILES:
        payload = download_bytes(relative_path)
        files.append(
            {
                "path": relative_path,
                "bytes": len(payload),
                "sha256": hashlib.sha256(payload).hexdigest(),
                "url": f"https://huggingface.co/{MODEL_ID}/resolve/{REVISION}/{relative_path}",
            }
        )

    manifest = {
        "modelId": MODEL_ID,
        "revision": REVISION,
        "files": files,
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Generate the real manifest**

Run:

```bash
rtk python3 tools/build_supertonic2_manifest.py
```

Expected: `src/features/speech/supertonic2ModelManifest.json` is created with seven files, positive byte counts, and SHA-256 strings.

- [ ] **Step 5: Add typed manifest helpers**

Create `src/features/speech/supertonic2Manifest.ts`:

```ts
import manifestJson from './supertonic2ModelManifest.json';

export interface Supertonic2ManifestFile {
  path: string;
  bytes: number;
  sha256: string;
  url: string;
}

export interface Supertonic2ModelManifest {
  modelId: 'Supertone/supertonic-2';
  revision: '75e6727618a02f323c720cba9478152d4bc16ca4';
  files: Supertonic2ManifestFile[];
}

export const supertonic2ModelManifest = manifestJson as Supertonic2ModelManifest;

export function getSupertonic2RequiredFiles() {
  return [...supertonic2ModelManifest.files];
}

export function getSupertonic2DownloadTotalBytes() {
  return supertonic2ModelManifest.files.reduce((sum, file) => sum + file.bytes, 0);
}
```

- [ ] **Step 6: Add package script**

Modify `package.json` scripts:

```json
"model:supertonic2-manifest": "python3 tools/build_supertonic2_manifest.py"
```

- [ ] **Step 7: Run the manifest tests to verify they pass**

Run:

```bash
rtk npm test -- src/features/speech/supertonic2Manifest.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
rtk git add tools/build_supertonic2_manifest.py src/features/speech/supertonic2ModelManifest.json src/features/speech/supertonic2Manifest.ts src/features/speech/supertonic2Manifest.test.ts package.json package-lock.json
rtk git commit -m "feat: add supertonic2 model manifest"
```

## Task 2: JavaScript Model Store And Downloader

**Files:**
- Create: `src/features/speech/supertonic2ModelStore.ts`
- Create: `src/features/speech/supertonic2ModelStore.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Add direct dependency on `expo-file-system`**

Run:

```bash
rtk npx expo install expo-file-system
```

Expected: `package.json` includes `expo-file-system` and `package-lock.json` is updated. The package already exists transitively in the current lockfile, but this makes it an explicit runtime dependency.

- [ ] **Step 2: Write failing model store tests**

Create `src/features/speech/supertonic2ModelStore.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

import type { Supertonic2ModelManifest } from './supertonic2Manifest';
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
      getDownloadedRelativePath(manifest, { path: 'onnx/tts.json', bytes: 1, sha256: 'c'.repeat(64), url: 'x' }),
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
```

- [ ] **Step 3: Run model store tests to verify they fail**

Run:

```bash
rtk npm test -- src/features/speech/supertonic2ModelStore.test.ts
```

Expected: FAIL because `supertonic2ModelStore.ts` does not exist.

- [ ] **Step 4: Implement model store**

Create `src/features/speech/supertonic2ModelStore.ts`:

```ts
import * as FileSystem from 'expo-file-system/legacy';

import type { Supertonic2ManifestFile, Supertonic2ModelManifest } from './supertonic2Manifest';

export type Supertonic2ModelStatus =
  | { state: 'ready'; revision: string; rootUri: string }
  | { state: 'missing' | 'invalid'; reason?: string; revision?: string; rootUri?: string };

export interface Supertonic2DownloadProgress {
  downloadedBytes: number;
  totalBytes: number;
  fileIndex: number;
  fileCount: number;
}

interface FileInfo {
  exists: boolean;
  size?: number;
}

interface DownloadProgressEvent {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}

export interface Supertonic2FileSystemPort {
  documentDirectory: string | null;
  getInfoAsync(uri: string): Promise<FileInfo>;
  makeDirectoryAsync(uri: string, options?: { intermediates?: boolean }): Promise<void>;
  downloadAsync(
    url: string,
    destination: string,
    onProgress: (event: DownloadProgressEvent) => void,
  ): Promise<void>;
}

const defaultFileSystemPort: Supertonic2FileSystemPort = {
  documentDirectory: FileSystem.documentDirectory,
  getInfoAsync: FileSystem.getInfoAsync,
  makeDirectoryAsync: FileSystem.makeDirectoryAsync,
  downloadAsync: (url, destination, onProgress) =>
    new Promise((resolve, reject) => {
      const download = FileSystem.createDownloadResumable(url, destination, {}, onProgress);
      download.downloadAsync().then(() => resolve()).catch(reject);
    }),
};

export function getDownloadedRelativePath(
  manifest: Supertonic2ModelManifest,
  file: Supertonic2ManifestFile,
) {
  return `supertonic2/${manifest.revision}/${file.path}`;
}

function joinUri(base: string, relativePath: string) {
  return `${base.replace(/\/$/, '')}/${relativePath}`;
}

function getModelRootUri(port: Supertonic2FileSystemPort, manifest: Supertonic2ModelManifest) {
  if (!port.documentDirectory) return null;
  return joinUri(port.documentDirectory, `supertonic2/${manifest.revision}`);
}

export function createSupertonic2ModelStore(port = defaultFileSystemPort) {
  return {
    getModelRootUri: (manifest: Supertonic2ModelManifest) => getModelRootUri(port, manifest),

    async getStatus(manifest: Supertonic2ModelManifest): Promise<Supertonic2ModelStatus> {
      const rootUri = getModelRootUri(port, manifest);
      if (!rootUri) {
        return { state: 'missing', reason: 'document-directory-unavailable' };
      }

      for (const file of manifest.files) {
        const info = await port.getInfoAsync(joinUri(port.documentDirectory!, getDownloadedRelativePath(manifest, file)));
        if (!info.exists) return { state: 'missing', revision: manifest.revision, rootUri };
        if (typeof info.size === 'number' && info.size !== file.bytes) {
          return { state: 'invalid', reason: 'size-mismatch', revision: manifest.revision, rootUri };
        }
      }

      return { state: 'ready', revision: manifest.revision, rootUri };
    },

    async downloadModel(
      manifest: Supertonic2ModelManifest,
      onProgress: (progress: Supertonic2DownloadProgress) => void,
    ) {
      if (!port.documentDirectory) {
        throw new Error('Supertonic 2 model storage is unavailable.');
      }

      const totalBytes = manifest.files.reduce((sum, file) => sum + file.bytes, 0);
      let completedBytes = 0;

      for (const [index, file] of manifest.files.entries()) {
        const relativePath = getDownloadedRelativePath(manifest, file);
        const destination = joinUri(port.documentDirectory, relativePath);
        const parent = destination.slice(0, destination.lastIndexOf('/'));
        await port.makeDirectoryAsync(parent, { intermediates: true });
        await port.downloadAsync(file.url, destination, (event) => {
          onProgress({
            downloadedBytes: completedBytes + event.totalBytesWritten,
            totalBytes,
            fileIndex: index + 1,
            fileCount: manifest.files.length,
          });
        });
        completedBytes += file.bytes;
      }
    },
  };
}

export const supertonic2ModelStore = createSupertonic2ModelStore();
```

- [ ] **Step 5: Run model store tests to verify they pass**

Run:

```bash
rtk npm test -- src/features/speech/supertonic2ModelStore.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
rtk git add package.json package-lock.json src/features/speech/supertonic2ModelStore.ts src/features/speech/supertonic2ModelStore.test.ts
rtk git commit -m "feat: add supertonic2 model store"
```

## Task 3: Native Runtime Wrapper And Platform Gate

**Files:**
- Create: `src/features/speech/supertonic2Native.ts`
- Create: `src/features/speech/supertonic2Native.test.ts`

- [ ] **Step 1: Write failing native wrapper tests**

Create `src/features/speech/supertonic2Native.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

import {
  createSupertonic2NativeRuntime,
  isSupertonic2RuntimeSupported,
} from './supertonic2Native';

describe('supertonic2 native runtime wrapper', () => {
  it('only supports iOS with an installed native module', () => {
    expect(isSupertonic2RuntimeSupported('ios', {})).toBe(false);
    expect(isSupertonic2RuntimeSupported('android', { prepareTts: vi.fn() })).toBe(false);
    expect(isSupertonic2RuntimeSupported('ios', { prepareTts: vi.fn() })).toBe(true);
  });

  it('passes model root and synthesis options to native', async () => {
    const nativeModule = {
      getModelStatus: vi.fn(async () => ({ state: 'ready', revision: 'abc' })),
      prepareTts: vi.fn(async () => undefined),
      synthesizeToFile: vi.fn(async () => ({ uri: 'file:///speech.wav', durationSeconds: 1.2 })),
    };
    const runtime = createSupertonic2NativeRuntime({
      nativeModule,
      platformOS: 'ios',
    });

    await runtime.prepareTts('file:///docs/supertonic2/rev');
    const result = await runtime.synthesizeToFile('안녕', { lang: 'ko', voice: 'F1' });

    expect(nativeModule.prepareTts).toHaveBeenCalledWith('file:///docs/supertonic2/rev');
    expect(nativeModule.synthesizeToFile).toHaveBeenCalledWith('안녕', {
      lang: 'ko',
      voice: 'F1',
      speed: 1.05,
      steps: 4,
    });
    expect(result.uri).toBe('file:///speech.wav');
  });
});
```

- [ ] **Step 2: Run native wrapper tests to verify they fail**

Run:

```bash
rtk npm test -- src/features/speech/supertonic2Native.test.ts
```

Expected: FAIL because `supertonic2Native.ts` does not exist.

- [ ] **Step 3: Implement native wrapper**

Create `src/features/speech/supertonic2Native.ts`:

```ts
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

type NativeModuleLike = {
  getModelStatus?: (rootUri: string, manifest: unknown) => Promise<unknown>;
  prepareTts?: (rootUri: string) => Promise<void>;
  synthesizeToFile?: (
    text: string,
    options: { lang: 'ko' | 'en'; voice: 'F1'; speed: number; steps: number },
  ) => Promise<{ uri: string; durationSeconds: number }>;
};

export interface Supertonic2SynthesisOptions {
  lang?: 'ko' | 'en';
  voice?: 'F1';
  speed?: number;
  steps?: number;
}

export function isSupertonic2RuntimeSupported(
  platformOS = Platform.OS,
  nativeModule: NativeModuleLike | null = requireOptionalNativeModule('Supertonic2Runtime'),
) {
  return platformOS === 'ios' && typeof nativeModule?.prepareTts === 'function';
}

export function createSupertonic2NativeRuntime({
  nativeModule = requireOptionalNativeModule('Supertonic2Runtime') as NativeModuleLike | null,
  platformOS = Platform.OS,
}: {
  nativeModule?: NativeModuleLike | null;
  platformOS?: string;
} = {}) {
  return {
    isSupported: () => isSupertonic2RuntimeSupported(platformOS, nativeModule),

    async getModelStatus(rootUri: string, manifest: unknown) {
      if (!isSupertonic2RuntimeSupported(platformOS, nativeModule)) {
        return { state: 'missing', reason: 'runtime-unavailable' };
      }
      return nativeModule!.getModelStatus!(rootUri, manifest);
    },

    async prepareTts(rootUri: string) {
      if (!isSupertonic2RuntimeSupported(platformOS, nativeModule)) {
        throw new Error('Supertonic 2 native runtime is unavailable on this platform.');
      }
      await nativeModule!.prepareTts!(rootUri);
    },

    async synthesizeToFile(text: string, options: Supertonic2SynthesisOptions = {}) {
      if (!isSupertonic2RuntimeSupported(platformOS, nativeModule)) {
        throw new Error('Supertonic 2 native runtime is unavailable on this platform.');
      }
      return nativeModule!.synthesizeToFile!(text, {
        lang: options.lang ?? 'ko',
        voice: options.voice ?? 'F1',
        speed: options.speed ?? 1.05,
        steps: options.steps ?? 4,
      });
    },
  };
}

export const supertonic2NativeRuntime = createSupertonic2NativeRuntime();
```

- [ ] **Step 4: Run native wrapper tests**

Run:

```bash
rtk npm test -- src/features/speech/supertonic2Native.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
rtk git add src/features/speech/supertonic2Native.ts src/features/speech/supertonic2Native.test.ts
rtk git commit -m "feat: add supertonic2 native runtime wrapper"
```

## Task 4: Blocking Bootstrap Gate And Download UI

**Files:**
- Create: `src/features/speech/TTSBootstrapGate.tsx`
- Create: `src/features/speech/TTSBootstrapGate.test.ts`
- Create: `src/components/speech/ModelDownloadScreen.tsx`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Write failing bootstrap state tests**

Create `src/features/speech/TTSBootstrapGate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  getBootstrapMessage,
  getDownloadPercent,
  reduceTtsBootstrapState,
  type TtsBootstrapState,
} from './TTSBootstrapGate';

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
    const next = reduceTtsBootstrapState({ phase: 'preparing', canEnterApp: false }, { type: 'ready' });
    expect(next).toEqual({ phase: 'ready', canEnterApp: true });
  });

  it('keeps app blocked after failure and exposes retry copy', () => {
    const next = reduceTtsBootstrapState({ phase: 'downloading', canEnterApp: false }, {
      type: 'failed',
      errorMessage: 'network',
    });
    expect(next.canEnterApp).toBe(false);
    expect(getBootstrapMessage(next)).toBe('목소리 보물을 다시 준비해볼게요.');
  });
});
```

- [ ] **Step 2: Run bootstrap tests to verify they fail**

Run:

```bash
rtk npm test -- src/features/speech/TTSBootstrapGate.test.ts
```

Expected: FAIL because the gate module does not exist.

- [ ] **Step 3: Implement the state helpers and gate**

Create `src/features/speech/TTSBootstrapGate.tsx` with these exported helpers and the component:

```tsx
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { ModelDownloadScreen } from '@/src/components/speech/ModelDownloadScreen';
import { supertonic2ModelManifest } from './supertonic2Manifest';
import {
  supertonic2ModelStore,
  type Supertonic2DownloadProgress,
} from './supertonic2ModelStore';
import { supertonic2NativeRuntime } from './supertonic2Native';

export type TtsBootstrapPhase = 'checking' | 'downloading' | 'verifying' | 'preparing' | 'ready' | 'failed';

export type TtsBootstrapState =
  | { phase: 'checking' | 'verifying' | 'preparing'; canEnterApp: false }
  | { phase: 'downloading'; canEnterApp: false; progress: Supertonic2DownloadProgress }
  | { phase: 'failed'; canEnterApp: false; errorMessage: string }
  | { phase: 'ready'; canEnterApp: true };

export type TtsBootstrapEvent =
  | { type: 'download-progress'; progress: Supertonic2DownloadProgress }
  | { type: 'verifying' }
  | { type: 'preparing' }
  | { type: 'ready' }
  | { type: 'failed'; errorMessage: string };

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
  return Math.max(0, Math.min(100, Math.round((progress.downloadedBytes / progress.totalBytes) * 100)));
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
  const [state, setState] = useState<TtsBootstrapState>({ phase: 'checking', canEnterApp: false });

  const dispatch = useCallback((event: TtsBootstrapEvent) => {
    setState((current) => reduceTtsBootstrapState(current, event));
  }, []);

  const bootstrap = useCallback(async () => {
    setState({ phase: 'checking', canEnterApp: false });

    try {
      if (!supertonic2NativeRuntime.isSupported()) {
        dispatch({ type: 'ready' });
        return;
      }

      const localStatus = await supertonic2ModelStore.getStatus(supertonic2ModelManifest);
      let rootUri = localStatus.rootUri ?? supertonic2ModelStore.getModelRootUri(supertonic2ModelManifest);

      if (localStatus.state !== 'ready') {
        await supertonic2ModelStore.downloadModel(supertonic2ModelManifest, (progress) =>
          dispatch({ type: 'download-progress', progress }),
        );
        dispatch({ type: 'verifying' });
        const checkedStatus = await supertonic2ModelStore.getStatus(supertonic2ModelManifest);
        rootUri = checkedStatus.rootUri;
        if (checkedStatus.state !== 'ready' || !rootUri) {
          throw new Error(checkedStatus.reason ?? 'model-verification-failed');
        }
      }

      dispatch({ type: 'preparing' });
      await supertonic2NativeRuntime.prepareTts(rootUri!);
      dispatch({ type: 'ready' });
    } catch (error) {
      dispatch({ type: 'failed', errorMessage: error instanceof Error ? error.message : 'unknown' });
    }
  }, [dispatch]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (state.canEnterApp) {
    return <>{children}</>;
  }

  return (
    <ModelDownloadScreen
      message={getBootstrapMessage(state)}
      onRetry={state.phase === 'failed' ? bootstrap : undefined}
      percent={getDownloadPercent(state.phase === 'downloading' ? state.progress : undefined)}
      phase={state.phase}
    />
  );
}
```

- [ ] **Step 4: Implement the download screen**

Create `src/components/speech/ModelDownloadScreen.tsx`:

```tsx
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/src/components/AppText';
import { MeerkatMascot } from '@/src/components/MeerkatMascot';
import { colors } from '@/src/theme/colors';
import type { TtsBootstrapPhase } from '@/src/features/speech/TTSBootstrapGate';

export function ModelDownloadScreen({
  message,
  onRetry,
  percent,
  phase,
}: {
  message: string;
  onRetry?: () => void;
  percent: number;
  phase: TtsBootstrapPhase;
}) {
  const showProgress = phase === 'downloading';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <MeerkatMascot mood={phase === 'failed' ? 'thinking' : 'greeting'} />
        <Text style={styles.title}>미어퀘스트 준비 중</Text>
        <Text accessibilityLiveRegion="polite" style={styles.message}>
          {message}
        </Text>
        <View accessibilityLabel={`준비 ${percent}퍼센트`} style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${showProgress ? percent : 8}%` }]} />
        </View>
        {onRetry ? (
          <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    alignItems: 'center',
    flex: 1,
    gap: 18,
    justifyContent: 'center',
    paddingHorizontal: 56,
  },
  title: { color: colors.ink, fontSize: 34, textAlign: 'center' },
  message: { color: colors.muted, fontSize: 22, textAlign: 'center' },
  progressTrack: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 4,
    height: 30,
    overflow: 'hidden',
    width: '68%',
  },
  progressFill: {
    backgroundColor: colors.green,
    borderRadius: 999,
    height: '100%',
    minWidth: 24,
  },
  retryButton: {
    backgroundColor: colors.orange,
    borderColor: colors.white,
    borderRadius: 20,
    borderWidth: 4,
    minHeight: 56,
    minWidth: 160,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: colors.white, fontSize: 24, textAlign: 'center' },
});
```

- [ ] **Step 5: Wrap the root layout**

Modify `app/_layout.tsx`:

```tsx
import { TTSBootstrapGate } from '@/src/features/speech/TTSBootstrapGate';
```

Change the loaded return:

```tsx
return (
  <TTSBootstrapGate>
    <RootLayoutNav />
  </TTSBootstrapGate>
);
```

- [ ] **Step 6: Run bootstrap tests and typecheck**

Run:

```bash
rtk npm test -- src/features/speech/TTSBootstrapGate.test.ts
rtk npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit**

```bash
rtk git add app/_layout.tsx src/components/speech/ModelDownloadScreen.tsx src/features/speech/TTSBootstrapGate.tsx src/features/speech/TTSBootstrapGate.test.ts
rtk git commit -m "feat: block app while preparing supertonic2"
```

## Task 5: Expo Module Scaffold And iOS Build Plugin

**Files:**
- Create: `modules/supertonic2-runtime/package.json`
- Create: `modules/supertonic2-runtime/expo-module.config.json`
- Create: `modules/supertonic2-runtime/src/index.ts`
- Create: `modules/supertonic2-runtime/ios/Supertonic2RuntimeModule.swift`
- Create: `plugins/with-supertonic2-ios-runtime.js`
- Create: `plugins/with-supertonic2-ios-runtime.test.js`
- Modify: `app.json`
- Modify: `package.json`

- [ ] **Step 1: Write failing plugin tests**

Create `plugins/with-supertonic2-ios-runtime.test.js`:

```js
import fs from 'node:fs';

import { describe, expect, it } from 'vitest';

import supertonic2IosRuntime from './with-supertonic2-ios-runtime.js';

describe('supertonic2 iOS runtime config', () => {
  it('registers the config plugin in app.json', () => {
    const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    expect(appConfig.expo.plugins).toContain('./plugins/with-supertonic2-ios-runtime.js');
  });

  it('exports the SPM constants used by the plugin', () => {
    expect(supertonic2IosRuntime.ONNX_RUNTIME_SPM_URL).toBe(
      'https://github.com/microsoft/onnxruntime-swift-package-manager.git',
    );
    expect(supertonic2IosRuntime.ONNX_RUNTIME_PRODUCT).toBe('onnxruntime');
  });
});
```

- [ ] **Step 2: Run plugin tests to verify they fail**

Run:

```bash
rtk npm test -- plugins/with-supertonic2-ios-runtime.test.js
```

Expected: FAIL because the plugin file and app config entry do not exist.

- [ ] **Step 3: Add local module package**

Create `modules/supertonic2-runtime/package.json`:

```json
{
  "name": "supertonic2-runtime",
  "version": "0.0.1",
  "main": "src/index.ts",
  "private": true
}
```

Create `modules/supertonic2-runtime/expo-module.config.json`:

```json
{
  "platforms": ["ios"],
  "ios": {
    "modules": ["Supertonic2RuntimeModule"]
  }
}
```

Create `modules/supertonic2-runtime/src/index.ts`:

```ts
import { requireNativeModule } from 'expo-modules-core';

export default requireNativeModule('Supertonic2Runtime');
```

- [ ] **Step 4: Add the initial Swift module**

Create `modules/supertonic2-runtime/ios/Supertonic2RuntimeModule.swift`:

```swift
import ExpoModulesCore

public class Supertonic2RuntimeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Supertonic2Runtime")

    AsyncFunction("getModelStatus") { (rootUri: String, manifest: [String: Any]) -> [String: Any] in
      return ["state": "missing", "reason": "native-status-not-implemented"]
    }

    AsyncFunction("prepareTts") { (rootUri: String) in
      throw Supertonic2RuntimeError("Supertonic 2 runtime preparation is not implemented yet.")
    }

    AsyncFunction("synthesizeToFile") { (text: String, options: [String: Any]) -> [String: Any] in
      throw Supertonic2RuntimeError("Supertonic 2 synthesis is not implemented yet.")
    }
  }
}

struct Supertonic2RuntimeError: Error, CustomStringConvertible {
  let description: String

  init(_ description: String) {
    self.description = description
  }
}
```

- [ ] **Step 5: Add the config plugin**

Create `plugins/with-supertonic2-ios-runtime.js`:

```js
const { withDangerousMod } = require('@expo/config-plugins');

const ONNX_RUNTIME_SPM_URL = 'https://github.com/microsoft/onnxruntime-swift-package-manager.git';
const ONNX_RUNTIME_PRODUCT = 'onnxruntime';

function withSupertonic2IosRuntime(config) {
  return withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      return modConfig;
    },
  ]);
}

module.exports = withSupertonic2IosRuntime;
module.exports.ONNX_RUNTIME_SPM_URL = ONNX_RUNTIME_SPM_URL;
module.exports.ONNX_RUNTIME_PRODUCT = ONNX_RUNTIME_PRODUCT;
```

Modify `app.json` plugins:

```json
"./plugins/with-supertonic2-ios-runtime.js"
```

Modify `package.json` dependencies:

```json
"supertonic2-runtime": "file:modules/supertonic2-runtime"
```

- [ ] **Step 6: Run install and plugin tests**

Run:

```bash
rtk npm install
rtk npm test -- plugins/with-supertonic2-ios-runtime.test.js
rtk npm run typecheck
```

Expected: tests and typecheck exit 0.

- [ ] **Step 7: Run iOS export smoke check**

Run:

```bash
rtk npx expo export --platform ios --output-dir /tmp/meerquest-export-check
```

Expected: export exits 0. Native compilation is not proven by this step.

- [ ] **Step 8: Commit**

```bash
rtk git add app.json package.json package-lock.json modules/supertonic2-runtime plugins/with-supertonic2-ios-runtime.js plugins/with-supertonic2-ios-runtime.test.js
rtk git commit -m "feat: scaffold supertonic2 ios module"
```

## Task 6: Native Status, Checksum, Prepare, And Synthesis

**Files:**
- Create: `modules/supertonic2-runtime/ios/Supertonic2RuntimeSupport.swift`
- Create: `modules/supertonic2-runtime/ios/Supertonic2Helper.swift`
- Modify: `modules/supertonic2-runtime/ios/Supertonic2RuntimeModule.swift`
- Modify: `plugins/with-supertonic2-ios-runtime.js`

- [ ] **Step 1: Add plugin implementation for ONNX Runtime SPM**

Update `plugins/with-supertonic2-ios-runtime.js` to patch `ios/MeerQuest.xcodeproj/project.pbxproj`. The implementation must be idempotent and add:

```pbxproj
XCRemoteSwiftPackageReference "onnxruntime-swift-package-manager"
XCSwiftPackageProductDependency "onnxruntime"
```

Use these exact constants from the plugin exports:

```js
const ONNX_RUNTIME_SPM_URL = 'https://github.com/microsoft/onnxruntime-swift-package-manager.git';
const ONNX_RUNTIME_PRODUCT = 'onnxruntime';
const ONNX_RUNTIME_MIN_VERSION = '1.16.0';
```

- [ ] **Step 2: Extend plugin tests**

Modify `plugins/with-supertonic2-ios-runtime.test.js`:

```js
it('keeps package insertion idempotent', () => {
  const pbxproj = [
    '/* Begin XCRemoteSwiftPackageReference section */',
    '/* End XCRemoteSwiftPackageReference section */',
    'packageReferences = (',
    ');',
  ].join('\n');

  const once = supertonic2IosRuntime.addOnnxRuntimeSwiftPackage(pbxproj);
  const twice = supertonic2IosRuntime.addOnnxRuntimeSwiftPackage(once);

  expect((twice.match(/onnxruntime-swift-package-manager/g) ?? []).length).toBe(1);
  expect((twice.match(/XCSwiftPackageProductDependency/g) ?? []).length).toBe(1);
});
```

- [ ] **Step 3: Run plugin tests**

Run:

```bash
rtk npm test -- plugins/with-supertonic2-ios-runtime.test.js
```

Expected: PASS.

- [ ] **Step 4: Add native support types**

Create `modules/supertonic2-runtime/ios/Supertonic2RuntimeSupport.swift`:

```swift
import CryptoKit
import Foundation
import OnnxRuntimeBindings

struct Supertonic2ManifestFile {
  let path: String
  let bytes: Int
  let sha256: String
}

final class Supertonic2RuntimeService {
  private var env: ORTEnv?
  private var textToSpeech: TextToSpeech?
  private var rootURL: URL?

  func status(rootUri: String, manifest: [String: Any]) throws -> [String: Any] {
    let root = try fileURL(from: rootUri)
    let files = try manifestFiles(from: manifest)
    for file in files {
      let url = root.appendingPathComponent(file.path)
      guard FileManager.default.fileExists(atPath: url.path) else {
        return ["state": "missing", "reason": "file-missing", "revision": manifest["revision"] ?? ""]
      }
      let attributes = try FileManager.default.attributesOfItem(atPath: url.path)
      if let size = attributes[.size] as? NSNumber, size.intValue != file.bytes {
        return ["state": "invalid", "reason": "size-mismatch", "revision": manifest["revision"] ?? ""]
      }
      if try sha256(url: url) != file.sha256 {
        return ["state": "invalid", "reason": "sha256-mismatch", "revision": manifest["revision"] ?? ""]
      }
    }
    return ["state": "ready", "revision": manifest["revision"] ?? ""]
  }

  func prepare(rootUri: String) throws {
    let root = try fileURL(from: rootUri)
    let onnxDir = root.appendingPathComponent("onnx", isDirectory: true).path
    let runtimeEnv = try ORTEnv(loggingLevel: .warning)
    env = runtimeEnv
    textToSpeech = try loadTextToSpeech(onnxDir, false, runtimeEnv)
    rootURL = root
  }

  func synthesize(text: String, options: [String: Any]) throws -> [String: Any] {
    guard let rootURL, let textToSpeech else {
      throw Supertonic2RuntimeError("Supertonic 2 runtime is not prepared.")
    }
    let lang = options["lang"] as? String ?? "ko"
    let voice = options["voice"] as? String ?? "F1"
    let speed = options["speed"] as? Double ?? 1.05
    let steps = options["steps"] as? Int ?? 4
    let voiceURL = rootURL.appendingPathComponent("voice_styles/\(voice).json")
    let style = try loadVoiceStyle([voiceURL.path], verbose: false)
    let result = try textToSpeech.call(text, lang, style, steps, speed: Float(speed), silenceDuration: 0.3)
    let outputURL = FileManager.default.temporaryDirectory.appendingPathComponent("supertonic2-\(UUID().uuidString).wav")
    try writeWavFile(outputURL.path, result.wav, textToSpeech.sampleRate)
    return ["uri": outputURL.absoluteString, "durationSeconds": Double(result.duration)]
  }
}

private func fileURL(from uri: String) throws -> URL {
  guard let url = URL(string: uri), url.isFileURL else {
    throw Supertonic2RuntimeError("Expected a file URL for Supertonic 2 model root.")
  }
  return url
}

private func manifestFiles(from manifest: [String: Any]) throws -> [Supertonic2ManifestFile] {
  guard let files = manifest["files"] as? [[String: Any]] else {
    throw Supertonic2RuntimeError("Supertonic 2 manifest is missing files.")
  }
  return try files.map { item in
    guard
      let path = item["path"] as? String,
      let bytes = item["bytes"] as? Int,
      let sha256 = item["sha256"] as? String
    else {
      throw Supertonic2RuntimeError("Supertonic 2 manifest file entry is malformed.")
    }
    return Supertonic2ManifestFile(path: path, bytes: bytes, sha256: sha256)
  }
}

private func sha256(url: URL) throws -> String {
  let handle = try FileHandle(forReadingFrom: url)
  defer { try? handle.close() }
  var hasher = SHA256()
  while autoreleasepool(invoking: {
    let data = handle.readData(ofLength: 1024 * 1024)
    if data.isEmpty { return false }
    hasher.update(data: data)
    return true
  }) {}
  return hasher.finalize().map { String(format: "%02x", $0) }.joined()
}
```

- [ ] **Step 5: Copy and adapt Supertonic Swift helper**

Create `modules/supertonic2-runtime/ios/Supertonic2Helper.swift` from the official `swift/Sources/Helper.swift` source in `supertone-inc/supertonic`, keeping:

- `UnicodeProcessor`
- `Config`
- `VoiceStyleData`
- `Style`
- `TextToSpeech`
- `loadCfgs`
- `loadVoiceStyle`
- `loadTextToSpeech`
- `writeWavFile`
- text preprocessing and chunking helpers

Apply these app-specific changes:

```swift
let AVAILABLE_LANGS = ["en", "ko"]
```

and keep the Korean chunk length branch:

```swift
let maxLen = (lang == "ko") ? 120 : 300
```

- [ ] **Step 6: Wire the module to the service**

Replace `modules/supertonic2-runtime/ios/Supertonic2RuntimeModule.swift` with:

```swift
import ExpoModulesCore

public class Supertonic2RuntimeModule: Module {
  private let service = Supertonic2RuntimeService()

  public func definition() -> ModuleDefinition {
    Name("Supertonic2Runtime")

    AsyncFunction("getModelStatus") { (rootUri: String, manifest: [String: Any]) -> [String: Any] in
      return try service.status(rootUri: rootUri, manifest: manifest)
    }

    AsyncFunction("prepareTts") { (rootUri: String) in
      try service.prepare(rootUri: rootUri)
    }

    AsyncFunction("synthesizeToFile") { (text: String, options: [String: Any]) -> [String: Any] in
      return try service.synthesize(text: text, options: options)
    }
  }
}

struct Supertonic2RuntimeError: Error, CustomStringConvertible {
  let description: String

  init(_ description: String) {
    self.description = description
  }
}
```

- [ ] **Step 7: Run JS tests and iOS prebuild**

Run:

```bash
rtk npm test -- plugins/with-supertonic2-ios-runtime.test.js src/features/speech/supertonic2Native.test.ts
rtk npx expo prebuild --platform ios --no-install
```

Expected: tests pass, prebuild exits 0, and the iOS project contains the ONNX Runtime SPM package reference.

- [ ] **Step 8: Run iOS native build**

Run:

```bash
rtk npx expo run:ios --no-build-cache
```

Expected: iOS build succeeds. If no simulator is available, record the simulator error and run:

```bash
rtk xcodebuild -workspace ios/MeerQuest.xcworkspace -scheme MeerQuest -configuration Debug -sdk iphonesimulator -derivedDataPath /tmp/meerquest-derived-data build
```

Expected: Swift compiles and links with ONNX Runtime.

- [ ] **Step 9: Commit**

```bash
rtk git add modules/supertonic2-runtime/ios plugins/with-supertonic2-ios-runtime.js plugins/with-supertonic2-ios-runtime.test.js ios package.json package-lock.json
rtk git commit -m "feat: implement supertonic2 ios runtime"
```

## Task 7: Quest-Facing Speech Service

**Files:**
- Create: `src/features/speech/supertonic2Speech.ts`
- Create: `src/features/speech/supertonic2Speech.test.ts`
- Modify: `app/quest-play.tsx`

- [ ] **Step 1: Write failing speech service tests**

Create `src/features/speech/supertonic2Speech.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

import { createSupertonic2SpeechService } from './supertonic2Speech';

describe('supertonic2 speech service', () => {
  it('returns unavailable when runtime support is absent', async () => {
    const service = createSupertonic2SpeechService({
      runtime: { isSupported: () => false, synthesizeToFile: vi.fn() },
      createPlayer: vi.fn(),
    });

    await expect(service.speakText('안녕')).resolves.toEqual({ status: 'unavailable' });
  });

  it('synthesizes and plays one request at a time', async () => {
    const play = vi.fn();
    const remove = vi.fn();
    const service = createSupertonic2SpeechService({
      runtime: {
        isSupported: () => true,
        synthesizeToFile: vi.fn(async (text: string) => ({
          uri: `file:///${text}.wav`,
          durationSeconds: 0.1,
        })),
      },
      createPlayer: vi.fn(() => ({ play, remove })),
    });

    await expect(service.speakText('미어루')).resolves.toEqual({ status: 'played' });
    expect(play).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run speech service tests to verify they fail**

Run:

```bash
rtk npm test -- src/features/speech/supertonic2Speech.test.ts
```

Expected: FAIL because `supertonic2Speech.ts` does not exist.

- [ ] **Step 3: Implement speech service**

Create `src/features/speech/supertonic2Speech.ts`:

```ts
import { supertonic2NativeRuntime, type Supertonic2SynthesisOptions } from './supertonic2Native';

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
  runtime = supertonic2NativeRuntime,
  createPlayer,
}: SpeechServicePorts = {}) {
  return {
    async speakText(text: string, options: Supertonic2SynthesisOptions = {}) {
      if (!runtime.isSupported()) {
        return { status: 'unavailable' as const };
      }

      queue = queue.then(async () => {
        const result = await runtime.synthesizeToFile(text, options);
        const player = createPlayer
          ? createPlayer(result.uri)
          : await createExpoAudioPlayer(result.uri);
        player.play();
        setTimeout(() => player.remove?.(), Math.max(1000, result.durationSeconds * 1000 + 500));
      });

      await queue;
      return { status: 'played' as const };
    },
  };
}

async function createExpoAudioPlayer(uri: string) {
  const { createAudioPlayer } = await import('expo-audio');
  return createAudioPlayer({ uri }, { keepAudioSessionActive: true, updateInterval: 1000 });
}

export const supertonic2SpeechService = createSupertonic2SpeechService();
```

- [ ] **Step 4: Connect the quest speaker button**

Modify `app/quest-play.tsx`:

```ts
import { supertonic2SpeechService } from '@/src/features/speech/supertonic2Speech';
```

Change:

```ts
const soundPressHandler = step.soundAsset ? handleSoundPress : undefined;
```

to:

```ts
const soundPressHandler = handleSoundPress;
```

Update `handleSoundPress`:

```ts
async function handleSoundPress() {
  if (step.soundAsset) {
    const didPlaySound = await playOptionalQuestSound(step.soundAsset);

    if (!didPlaySound) {
      setFeedbackMessage('소리 기능은 앱을 새로 설치한 뒤 들을 수 있어요.');
    }
    return;
  }

  const result = await supertonic2SpeechService.speakText(step.instructionText, {
    lang: 'ko',
    voice: 'F1',
  });

  if (result.status === 'unavailable') {
    setFeedbackMessage('미어루 목소리를 준비한 뒤 들을 수 있어요.');
  }
}
```

- [ ] **Step 5: Run speech tests and existing quest tests**

Run:

```bash
rtk npm test -- src/features/speech/supertonic2Speech.test.ts src/components/quest/meeroDigPeekAnimation.test.ts
rtk npm run typecheck
```

Expected: tests and typecheck exit 0.

- [ ] **Step 6: Commit**

```bash
rtk git add app/quest-play.tsx src/features/speech/supertonic2Speech.ts src/features/speech/supertonic2Speech.test.ts
rtk git commit -m "feat: read quest prompts with supertonic2"
```

## Task 8: End-To-End Verification

**Files:**
- Modify only if verification exposes a defect in files from earlier tasks.

- [ ] **Step 1: Run full JS verification**

Run:

```bash
rtk npm run typecheck
rtk npm test
```

Expected: both commands exit 0; Vitest reports all files passing.

- [ ] **Step 2: Run Expo iOS export**

Run:

```bash
rtk npx expo export --platform ios --output-dir /tmp/meerquest-export-check
```

Expected: export exits 0.

- [ ] **Step 3: Run native iOS build**

Run:

```bash
rtk xcodebuild -workspace ios/MeerQuest.xcworkspace -scheme MeerQuest -configuration Debug -sdk iphonesimulator -derivedDataPath /tmp/meerquest-derived-data build
```

Expected: build exits 0.

- [ ] **Step 4: Device or simulator smoke test**

Run:

```bash
rtk npx expo run:ios
```

Expected:

- First launch shows the blocking MeerQuest preparation screen.
- Progress advances while the seven manifest files download.
- The app enters the home screen after verification and preparation.
- Relaunch skips the download screen.
- Opening a quest and pressing the speaker button reads the instruction text when the step has no static `soundAsset`.
- The language animal-sound quest still plays the static dog bark for `soundAsset: 'dog-bark'`.

- [ ] **Step 5: Final commit for verification fixes**

If Step 1-4 required fixes, commit them:

```bash
rtk git add app.json app/_layout.tsx app/quest-play.tsx package.json package-lock.json ios modules/supertonic2-runtime plugins/with-supertonic2-ios-runtime.js plugins/with-supertonic2-ios-runtime.test.js src/components/speech/ModelDownloadScreen.tsx src/features/speech tools/build_supertonic2_manifest.py
rtk git commit -m "fix: stabilize supertonic2 ios runtime"
```

If no fixes were required, do not create an empty commit.

## Self-Review

- Spec coverage: iOS-first, first-launch download, full app block, model verification, native prepare, synthesis, and quest speech are covered by Tasks 1-8.
- Placeholder scan: no task relies on undefined behavior; production CDN is excluded from the first implementation and the development manifest uses Hugging Face URLs.
- Type consistency: the public JS surface consistently uses `getModelStatus`, `downloadModel`, `prepareTts`, `synthesizeToFile`, `Supertonic2DownloadProgress`, and `Supertonic2ModelStatus`.
