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
