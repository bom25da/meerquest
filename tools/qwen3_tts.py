#!/usr/bin/env python3
"""Generate MeerQuest voice assets with Qwen3-TTS."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

LICENSE = "Apache-2.0"
CUSTOM_VOICE_MODEL = "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice"
VOICE_DESIGN_MODEL = "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign"
VOICE_CLONE_MODEL = "Qwen/Qwen3-TTS-12Hz-0.6B-Base"
DEFAULT_LANGUAGE = "Korean"
DEFAULT_SPEAKER = "Sohee"
DEFAULT_VOICE_DESIGN_INSTRUCT = (
    "Warm Korean female narrator for a preschool adventure app; bright, friendly, "
    "clear, and gentle."
)
SUPPORTED_LANGUAGES = (
    "Auto",
    "Chinese",
    "English",
    "Japanese",
    "Korean",
    "German",
    "French",
    "Russian",
    "Portuguese",
    "Spanish",
    "Italian",
)
SUPPORTED_CUSTOM_VOICE_SPEAKERS = (
    "Vivian",
    "Serena",
    "Uncle_Fu",
    "Dylan",
    "Eric",
    "Ryan",
    "Aiden",
    "Ono_Anna",
    "Sohee",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Generate Expo-ready WAV voice assets with Qwen3-TTS. "
            f"Qwen3-TTS code, package, and released model checkpoints are {LICENSE}."
        )
    )
    parser.add_argument("--text", required=True, help="Text to synthesize.")
    parser.add_argument(
        "--output",
        required=True,
        help="Output .wav path, normally under assets/audio/voice/.",
    )
    parser.add_argument(
        "--mode",
        choices=("custom-voice", "voice-design", "voice-clone"),
        default="custom-voice",
        help="Qwen3-TTS generation mode. Default: custom-voice.",
    )
    parser.add_argument(
        "--model",
        default=None,
        help="Optional Hugging Face model id or local model directory. Defaults by mode.",
    )
    parser.add_argument(
        "--language",
        choices=SUPPORTED_LANGUAGES,
        default=DEFAULT_LANGUAGE,
        help="Qwen3-TTS language name. Default: Korean.",
    )
    parser.add_argument(
        "--speaker",
        choices=SUPPORTED_CUSTOM_VOICE_SPEAKERS,
        default=DEFAULT_SPEAKER,
        help="CustomVoice speaker preset. Default: Sohee.",
    )
    parser.add_argument(
        "--instruct",
        default=None,
        help=(
            "Optional natural-language style instruction for CustomVoice or VoiceDesign. "
            "VoiceDesign uses a warm MeerQuest Korean narrator instruction by default."
        ),
    )
    parser.add_argument(
        "--ref-audio",
        default=None,
        help="Reference audio path/URL/base64 for voice-clone mode.",
    )
    parser.add_argument(
        "--ref-text",
        default=None,
        help="Transcript for --ref-audio in voice-clone mode.",
    )
    parser.add_argument(
        "--x-vector-only-mode",
        action="store_true",
        help="Use only speaker embedding for voice-clone mode; ref text is not required.",
    )
    parser.add_argument(
        "--confirm-voice-rights",
        action="store_true",
        help=(
            "Required for voice-clone mode. Confirms you own or have written permission "
            "to use the reference voice and recording."
        ),
    )
    parser.add_argument(
        "--device-map",
        default=os.environ.get("QWEN3_TTS_DEVICE_MAP", "auto"),
        help="Device map passed to Qwen3TTSModel.from_pretrained. Default: auto.",
    )
    parser.add_argument(
        "--dtype",
        choices=("auto", "bfloat16", "float16", "float32"),
        default=os.environ.get("QWEN3_TTS_DTYPE", "auto"),
        help="Torch dtype for model loading. Default: auto.",
    )
    parser.add_argument(
        "--attn-implementation",
        choices=("default", "sdpa", "eager", "flash_attention_2"),
        default=os.environ.get("QWEN3_TTS_ATTN", "default"),
        help="Optional attention implementation. Default: package/model default.",
    )
    parser.add_argument(
        "--max-new-tokens",
        type=int,
        default=None,
        help="Optional Transformers generation cap.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print resolved settings without importing Qwen3-TTS or loading a model.",
    )
    return parser.parse_args()


def get_default_model(mode: str) -> str:
    if mode == "voice-design":
        return VOICE_DESIGN_MODEL
    if mode == "voice-clone":
        return VOICE_CLONE_MODEL
    return CUSTOM_VOICE_MODEL


def get_instruct(args: argparse.Namespace) -> str | None:
    if args.instruct:
        return args.instruct
    if args.mode == "voice-design":
        return DEFAULT_VOICE_DESIGN_INSTRUCT
    return None


def build_summary(args: argparse.Namespace) -> dict[str, Any]:
    cache_dir = os.environ.get("HF_HOME", str(Path.home() / ".cache" / "huggingface"))
    return {
        "attnImplementation": args.attn_implementation,
        "cacheDir": cache_dir,
        "deviceMap": args.device_map,
        "dtype": args.dtype,
        "instruct": get_instruct(args),
        "language": args.language,
        "license": LICENSE,
        "mode": args.mode,
        "model": args.model or get_default_model(args.mode),
        "output": str(Path(args.output)),
        "refAudio": args.ref_audio,
        "speaker": args.speaker if args.mode == "custom-voice" else None,
        "voiceRightsConfirmed": bool(args.confirm_voice_rights),
    }


def validate_args(args: argparse.Namespace) -> None:
    output = Path(args.output)
    if output.suffix.lower() != ".wav":
        raise ValueError("Qwen3-TTS helper writes WAV files. Use an output path ending in .wav.")

    if args.mode == "voice-clone":
        if not args.confirm_voice_rights:
            raise ValueError(
                "Voice cloning requires --confirm-voice-rights because reference voices and "
                "recordings can carry separate consent, likeness, privacy, and recording rights."
            )
        if not args.ref_audio:
            raise ValueError("Voice cloning requires --ref-audio.")
        if not args.ref_text and not args.x_vector_only_mode:
            raise ValueError("Voice cloning requires --ref-text unless --x-vector-only-mode is set.")


def resolve_torch_dtype(torch_module: Any, dtype: str) -> Any | None:
    if dtype == "auto":
        return None
    return getattr(torch_module, dtype)


def build_model_kwargs(args: argparse.Namespace, torch_module: Any) -> dict[str, Any]:
    kwargs: dict[str, Any] = {"device_map": args.device_map}
    dtype = resolve_torch_dtype(torch_module, args.dtype)
    if dtype is not None:
        kwargs["dtype"] = dtype
    if args.attn_implementation != "default":
        kwargs["attn_implementation"] = args.attn_implementation
    return kwargs


def build_generation_kwargs(args: argparse.Namespace) -> dict[str, Any]:
    kwargs: dict[str, Any] = {}
    if args.max_new_tokens is not None:
        kwargs["max_new_tokens"] = args.max_new_tokens
    return kwargs


def generate_audio(args: argparse.Namespace) -> dict[str, Any]:
    validate_args(args)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    try:
        import soundfile as sf
        import torch
        from qwen_tts import Qwen3TTSModel
    except ImportError as exc:
        raise RuntimeError(
            "Missing Qwen3-TTS dependencies. Run: "
            "python3 -m pip install -r tools/qwen3_tts_requirements.txt"
        ) from exc

    model = Qwen3TTSModel.from_pretrained(
        args.model or get_default_model(args.mode),
        **build_model_kwargs(args, torch),
    )
    generation_kwargs = build_generation_kwargs(args)

    if args.mode == "voice-design":
        wavs, sample_rate = model.generate_voice_design(
            text=args.text,
            language=args.language,
            instruct=get_instruct(args),
            **generation_kwargs,
        )
    elif args.mode == "voice-clone":
        wavs, sample_rate = model.generate_voice_clone(
            text=args.text,
            language=args.language,
            ref_audio=args.ref_audio,
            ref_text=args.ref_text,
            x_vector_only_mode=args.x_vector_only_mode,
            **generation_kwargs,
        )
    else:
        custom_voice_kwargs = {
            "text": args.text,
            "language": args.language,
            "speaker": args.speaker,
            **generation_kwargs,
        }
        instruct = get_instruct(args)
        if instruct:
            custom_voice_kwargs["instruct"] = instruct
        wavs, sample_rate = model.generate_custom_voice(**custom_voice_kwargs)

    sf.write(str(output), wavs[0], sample_rate)

    summary = build_summary(args)
    summary["durationSeconds"] = len(wavs[0]) / float(sample_rate)
    summary["sampleRate"] = sample_rate
    return summary


def main() -> int:
    args = parse_args()
    try:
        validate_args(args)
    except ValueError as exc:
        print(f"qwen3-tts generation blocked: {exc}", file=sys.stderr)
        return 1

    if args.dry_run:
        print(json.dumps(build_summary(args), ensure_ascii=False, indent=2))
        return 0

    try:
        result = generate_audio(args)
    except Exception as exc:
        print(f"qwen3-tts generation failed: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
