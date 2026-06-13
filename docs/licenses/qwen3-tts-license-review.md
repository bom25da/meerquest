# Qwen3-TTS License Review

Date: 2026-06-13

## Scope

MeerQuest uses Supertonic 3 as the in-app iOS speech runtime. Qwen3-TTS is added only as a developer-side local voice asset generation tool through `tools/qwen3_tts.py`.

This means the shipped app does not currently bundle or download Qwen3-TTS model weights, the `qwen-tts` Python package, PyTorch, or related runtime dependencies.

## License Finding

The Qwen3-TTS GitHub repository is licensed under Apache-2.0. The `qwen-tts` PyPI package also declares Apache-2.0. The checked Hugging Face model cards for these Qwen3-TTS checkpoints report `apache-2.0`:

- `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice`
- `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice`
- `Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign`
- `Qwen/Qwen3-TTS-12Hz-0.6B-Base`

Apache-2.0 permits commercial use, modification, distribution, and private use, subject to notice, copyright, license, and patent-related conditions.

## Rights Constraints

The model license is not the only rights layer. Voice cloning with a real reference recording can involve separate consent, likeness, privacy, performer, and recording rights. MeerQuest must only use reference audio when the project owns or has written permission for both the voice and the recording.

To reduce accidental misuse, `tools/qwen3_tts.py` blocks `voice-clone` mode unless `--confirm-voice-rights` is explicitly passed.

## Distribution Guidance

- Generated WAV files may be committed to `assets/audio/voice/` only after confirming the text, voice source, and recording rights are appropriate for commercial distribution.
- If Qwen3-TTS model weights or runtime packages are ever shipped with the app, include Apache-2.0 notices and revisit app-store privacy, size, and performance constraints.
- Do not commit private reference voice recordings or cloned speaker prompts to the repository.

## Sources Checked

- https://github.com/QwenLM/Qwen3-TTS
- https://github.com/QwenLM/Qwen3-TTS/blob/main/LICENSE
- https://pypi.org/project/qwen-tts/
- https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
