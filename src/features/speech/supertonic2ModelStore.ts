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
          joinUri(port.documentDirectory!, getDownloadedRelativePath(manifest, file)),
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
            downloadedBytes: completedBytes + getCurrentFileDownloadedBytes(file, event),
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
