import { describe, expect, it } from 'vitest';

import manifestJson from './supertonic3ModelManifest.json';
import {
  getSupertonic3DownloadTotalBytes,
  getSupertonic3RequiredFiles,
  supertonic3ModelManifest,
  supertonic3SupportedVoices,
} from './supertonic3Manifest';

describe('supertonic3 model manifest', () => {
  it('pins the approved Supertonic 3 revision', () => {
    expect(supertonic3ModelManifest.modelId).toBe('Supertone/supertonic-3');
    expect(supertonic3ModelManifest.revision).toBe(
      '3cadd1ee6394adea1bd021217a0e650ede09a323',
    );
  });

  it('defines the supported Supertonic 3 preset voices', () => {
    expect(supertonic3SupportedVoices).toEqual([
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
    ]);
  });

  it('contains the minimum runtime files and voice presets with sha256 checksums', () => {
    const files = getSupertonic3RequiredFiles();
    const paths = files.map((file) => file.path).sort();

    expect(paths).toEqual([
      'onnx/duration_predictor.onnx',
      'onnx/text_encoder.onnx',
      'onnx/tts.json',
      'onnx/unicode_indexer.json',
      'onnx/vector_estimator.onnx',
      'onnx/vocoder.onnx',
      'voice_styles/F1.json',
      'voice_styles/F2.json',
      'voice_styles/F3.json',
      'voice_styles/F4.json',
      'voice_styles/F5.json',
      'voice_styles/M1.json',
      'voice_styles/M2.json',
      'voice_styles/M3.json',
      'voice_styles/M4.json',
      'voice_styles/M5.json',
    ]);
    expect(files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256))).toBe(true);
    expect(files.every((file) => file.bytes > 0)).toBe(true);
  });

  it('uses stable Hugging Face resolve URLs for development downloads', () => {
    for (const file of supertonic3ModelManifest.files) {
      expect(file.url).toBe(
        `https://huggingface.co/${supertonic3ModelManifest.modelId}/resolve/${supertonic3ModelManifest.revision}/${file.path}`,
      );
    }
  });

  it('reports total download bytes', () => {
    const expected = manifestJson.files.reduce((sum, file) => sum + file.bytes, 0);
    expect(getSupertonic3DownloadTotalBytes()).toBe(expected);
  });
});
