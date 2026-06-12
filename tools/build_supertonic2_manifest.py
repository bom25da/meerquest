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
