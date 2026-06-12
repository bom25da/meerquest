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

interface DownloadResult {
  status: number;
}

export interface Supertonic2FileSystemPort {
  storageDirectory: string | null;
  deleteAsync(uri: string, options?: { idempotent?: boolean }): Promise<void>;
  getInfoAsync(uri: string): Promise<FileInfo>;
  makeDirectoryAsync(uri: string, options?: { intermediates?: boolean }): Promise<void>;
  downloadAsync(
    url: string,
    destination: string,
    onProgress: (event: DownloadProgressEvent) => void,
  ): Promise<void>;
}

const defaultFileSystemPort: Supertonic2FileSystemPort = {
  storageDirectory: FileSystem.cacheDirectory ?? FileSystem.documentDirectory,
  deleteAsync: FileSystem.deleteAsync,
  getInfoAsync: FileSystem.getInfoAsync,
  makeDirectoryAsync: FileSystem.makeDirectoryAsync,
  downloadAsync: async (url, destination, onProgress) => {
    const download = FileSystem.createDownloadResumable(url, destination, {}, onProgress);
    const result = await download.downloadAsync();
    assertSuccessfulDownloadResult(result);
  },
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
  if (!port.storageDirectory) return null;
  return joinUri(port.storageDirectory, `supertonic2/${manifest.revision}`);
}

function getCurrentFileDownloadedBytes(
  file: Supertonic2ManifestFile,
  event: DownloadProgressEvent,
) {
  if (
    event.totalBytesExpectedToWrite > 0 &&
    event.totalBytesWritten >= event.totalBytesExpectedToWrite
  ) {
    return file.bytes;
  }

  return Math.min(event.totalBytesWritten, file.bytes);
}

function assertSuccessfulDownloadResult(result: DownloadResult | null | undefined) {
  if (!result) {
    throw new Error('Supertonic 2 model download did not complete.');
  }

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Supertonic 2 model download failed with HTTP status ${result.status}.`);
  }
}

function getFileSizeDescription(size: number | undefined) {
  return typeof size === 'number' ? `${size} bytes` : 'unknown size';
}

async function assertDownloadedFile(
  port: Supertonic2FileSystemPort,
  destination: string,
  file: Supertonic2ManifestFile,
) {
  const info = await port.getInfoAsync(destination);

  if (!info.exists) {
    throw new Error(`Supertonic 2 downloaded file is missing: ${file.path}.`);
  }

  if (info.size !== file.bytes) {
    throw new Error(
      `Supertonic 2 downloaded file size mismatch for ${file.path}: expected ${file.bytes} bytes, got ${getFileSizeDescription(info.size)}.`,
    );
  }
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
        const info = await port.getInfoAsync(
          joinUri(port.storageDirectory!, getDownloadedRelativePath(manifest, file)),
        );
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
      if (!port.storageDirectory) {
        throw new Error('Supertonic 2 model storage is unavailable.');
      }

      const totalBytes = manifest.files.reduce((sum, file) => sum + file.bytes, 0);
      let completedBytes = 0;

      for (const [index, file] of manifest.files.entries()) {
        const relativePath = getDownloadedRelativePath(manifest, file);
        const destination = joinUri(port.storageDirectory, relativePath);
        const parent = destination.slice(0, destination.lastIndexOf('/'));
        await port.makeDirectoryAsync(parent, { intermediates: true });
        await port.downloadAsync(file.url, destination, (event) => {
          onProgress({
            downloadedBytes: completedBytes + getCurrentFileDownloadedBytes(file, event),
            totalBytes,
            fileIndex: index + 1,
            fileCount: manifest.files.length,
          });
        });
        await assertDownloadedFile(port, destination, file);
        onProgress({
          downloadedBytes: completedBytes + file.bytes,
          totalBytes,
          fileIndex: index + 1,
          fileCount: manifest.files.length,
        });
        completedBytes += file.bytes;
      }
    },

    async deleteModel(manifest: Supertonic2ModelManifest) {
      const rootUri = getModelRootUri(port, manifest);
      if (!rootUri) return;

      await port.deleteAsync(rootUri, { idempotent: true });
    },
  };
}

export const supertonic2ModelStore = createSupertonic2ModelStore();
