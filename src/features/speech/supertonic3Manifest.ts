import manifestJson from './supertonic3ModelManifest.json';

export const supertonic3SupportedVoices = [
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'M1',
  'M2',
  'M3',
  'M4',
  'M5',
] as const;

export type Supertonic3Voice = (typeof supertonic3SupportedVoices)[number];

export interface Supertonic3ManifestFile {
  path: string;
  bytes: number;
  sha256: string;
  url: string;
}

export interface Supertonic3ModelManifest {
  modelId: 'Supertone/supertonic-3';
  revision: '3cadd1ee6394adea1bd021217a0e650ede09a323';
  files: Supertonic3ManifestFile[];
}

export const supertonic3ModelManifest = manifestJson as Supertonic3ModelManifest;

export function getSupertonic3RequiredFiles() {
  return [...supertonic3ModelManifest.files];
}

export function getSupertonic3DownloadTotalBytes() {
  return supertonic3ModelManifest.files.reduce((sum, file) => sum + file.bytes, 0);
}
