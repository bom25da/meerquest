#!/usr/bin/env python3
"""Generate MeerQuest voice assets with Supertonic 2."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

MODEL_NAME = "supertonic-2"
SUPPORTED_LANGUAGES = ("ko", "en", "es", "pt", "fr")
VOICE_NAMES = ("F1", "F2", "F3", "F4", "F5", "M1", "M2", "M3", "M4", "M5")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Generate Expo-ready WAV voice assets with the Hugging Face "
            "Supertone/supertonic-2 model."
        )
    )
    parser.add_argument("--text", required=True, help="Text to synthesize.")
    parser.add_argument(
        "--output",
        required=True,
        help="Output .wav path, normally under assets/audio/voice/.",
    )
    parser.add_argument(
        "--lang",
        choices=SUPPORTED_LANGUAGES,
        default="ko",
        help="Language code for Supertonic 2. Default: ko.",
    )
    parser.add_argument(
        "--voice",
        choices=VOICE_NAMES,
        default="F1",
        help="Built-in voice style. Default: F1.",
    )
    parser.add_argument(
        "--custom-style-path",
        default=None,
        help="Optional custom voice style JSON path. Overrides --voice.",
    )
    parser.add_argument(
        "--steps",
        type=int,
        default=8,
        help="Synthesis quality steps. Default: 8.",
    )
    parser.add_argument(
        "--speed",
        type=float,
        default=1.05,
        help="Speech speed from 0.7 to 2.0. Default: 1.05.",
    )
    parser.add_argument(
        "--max-chunk-length",
        type=int,
        default=None,
        help="Maximum characters per chunk. Default: Supertonic auto setting.",
    )
    parser.add_argument(
        "--silence-duration",
        type=float,
        default=0.3,
        help="Silence between chunks in seconds. Default: 0.3.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print resolved settings without importing Supertonic or loading the model.",
    )
    parser.add_argument("--verbose", action="store_true", help="Show Supertonic progress output.")
    return parser.parse_args()


def build_summary(args: argparse.Namespace) -> dict[str, Any]:
    output = Path(args.output)
    cache_dir = os.environ.get("SUPERTONIC_CACHE_DIR", str(Path.home() / ".cache" / "supertonic2"))
    return {
        "cacheDir": cache_dir,
        "customStylePath": args.custom_style_path,
        "lang": args.lang,
        "model": MODEL_NAME,
        "output": str(output),
        "silenceDuration": args.silence_duration,
        "speed": args.speed,
        "steps": args.steps,
        "voice": args.voice,
    }


def validate_output_path(output: Path) -> None:
    if output.suffix.lower() != ".wav":
        raise ValueError("Supertonic writes WAV files. Use an output path ending in .wav.")


def generate_audio(args: argparse.Namespace) -> dict[str, Any]:
    output = Path(args.output)
    validate_output_path(output)

    try:
        from supertonic import TTS
    except ImportError as exc:
        raise RuntimeError(
            "Missing Supertonic dependencies. Run: "
            "python3 -m pip install -r tools/supertonic2_requirements.txt"
        ) from exc

    tts = TTS(model=MODEL_NAME, auto_download=True)
    if args.custom_style_path:
        voice_style = tts.get_voice_style_from_path(args.custom_style_path)
    else:
        voice_style = tts.get_voice_style(args.voice)

    wav, duration = tts.synthesize(
        text=args.text,
        voice_style=voice_style,
        total_steps=args.steps,
        speed=args.speed,
        max_chunk_length=args.max_chunk_length,
        silence_duration=args.silence_duration,
        lang=args.lang,
        verbose=args.verbose,
    )
    tts.save_audio(wav, str(output))

    summary = build_summary(args)
    summary["durationSeconds"] = float(duration[0])
    summary["sampleRate"] = tts.sample_rate
    return summary


def main() -> int:
    args = parse_args()
    summary = build_summary(args)

    if args.dry_run:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 0

    try:
        result = generate_audio(args)
    except Exception as exc:
        print(f"supertonic-2 generation failed: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
