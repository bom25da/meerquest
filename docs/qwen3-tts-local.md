# Qwen3-TTS Local Voice Generation

Qwen3-TTS is wired into MeerQuest as a developer-side local WAV generation tool. It is not part of the shipped app runtime.

## Recommended Environment

The `qwen-tts` package declares Python `>=3.9`, but the official Qwen3-TTS README recommends a fresh Python 3.12 environment. The npm setup script uses `uv` to create an ignored `.venv-qwen3-tts` environment.

```bash
npm run voice:qwen3:setup
```

The first real generation can download large Hugging Face model weights into the local Hugging Face cache.

If you already have a separate environment, point the generator at it:

```bash
QWEN3_TTS_PYTHON=/path/to/python npm run voice:qwen3 -- --dry-run \
  --text "오늘도 같이 탐험하자." \
  --output assets/audio/voice/qwen3-home-entry.wav
```

## Default Korean Female Voice

The default mode uses the smaller CustomVoice checkpoint and the Korean female `Sohee` speaker.

```bash
npm run voice:qwen3 -- \
  --text "오늘도 같이 탐험하자." \
  --output assets/audio/voice/qwen3-home-entry.wav
```

Preview settings without importing Qwen3-TTS or loading weights:

```bash
npm run voice:qwen3 -- \
  --dry-run \
  --text "오늘도 같이 탐험하자." \
  --output assets/audio/voice/qwen3-home-entry.wav
```

## Style Instructions

Use `--instruct` to guide tone when the selected model supports it.

The reusable MeerQuest child adventure preset is documented in `docs/voice-style-presets.md` as `meerquest_child_adventure`.

```bash
npm run voice:qwen3 -- \
  --text "오늘도 같이 탐험하자." \
  --output assets/audio/voice/qwen3-home-entry.wav \
  --instruct "밝고 따뜻한 한국어 여성 내레이터, 유아 교육 앱에 어울리게 또박또박 말해줘."
```

For free-form voice design:

```bash
npm run voice:qwen3 -- \
  --mode voice-design \
  --text "오늘도 같이 탐험하자." \
  --output assets/audio/voice/qwen3-designed-home-entry.wav
```

## Voice Clone Safety

Voice cloning is blocked unless `--confirm-voice-rights` is passed. Only use this mode when MeerQuest owns or has written permission for the reference voice and recording.

```bash
npm run voice:qwen3 -- \
  --mode voice-clone \
  --text "오늘도 같이 탐험하자." \
  --output assets/audio/voice/qwen3-clone-home-entry.wav \
  --ref-audio private/reference-voice.wav \
  --ref-text "참조 음성의 정확한 대사" \
  --confirm-voice-rights
```

Do not commit private reference recordings or cloned speaker prompts.
