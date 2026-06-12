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
