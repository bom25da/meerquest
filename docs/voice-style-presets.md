# MeerQuest Voice Style Presets

## `meerquest_child_adventure`

Use this preset for short Korean prompts spoken by a childlike adventure companion.

### Current Reference Asset

- Asset: `assets/audio/voice/home-child-explore.wav`
- Reference line: `오늘도 같이 탐험해보자!`
- Current file format: WAV, mono, 24 kHz, 16-bit PCM
- Current duration: about 1.94 seconds
- Source model path: Qwen3-TTS `voice-design`
- Do not recreate this preset with Supertonic unless explicitly requested.

### Voice Direction

- Korean child voice
- Bright and cheerful
- Warm, short, and friendly
- Sounds like a friend inviting the child into an adventure
- Clear preschool-app diction
- Avoid dramatic acting, adult narrator tone, whispering, or exaggerated character voices

### Qwen3 Prompt

```text
밝고 명랑한 한국어 아이 목소리. 유아 교육 앱에서 친구가 모험을 권하듯 또박또박, 짧고 따뜻하게 말해줘.
```

### Generation Command Template

```bash
npm run voice:qwen3 -- \
  --mode voice-design \
  --language Korean \
  --text "<KOREAN_TEXT>" \
  --output assets/audio/voice/<asset-name>.wav \
  --instruct "밝고 명랑한 한국어 아이 목소리. 유아 교육 앱에서 친구가 모험을 권하듯 또박또박, 짧고 따뜻하게 말해줘."
```

### Quality Check

Qwen3 `voice-design` can add unwanted syllables before a short Korean line. Always check the rendered WAV before shipping it.

For the current reference asset, the first generation included an unwanted prefix transcribed as `팬자다베지`. The committed file trims the first 1.18 seconds from that generation so the line starts at `오늘도`.

Checklist for future lines:

- The audio starts directly with the intended line.
- There are no unknown syllables before or after the line.
- The spoken text matches the script closely.
- The final file remains under `assets/audio/voice/`.
- The app references the committed asset, not a temporary `/tmp` file.

Optional ASR sanity check:

```bash
/tmp/meerquest-qwen3-tts/bin/python - <<'PY'
import soundfile as sf
from transformers import pipeline

path = 'assets/audio/voice/<asset-name>.wav'
audio, sample_rate = sf.read(path)
asr = pipeline('automatic-speech-recognition', model='openai/whisper-small')
print(asr(
    {'array': audio, 'sampling_rate': sample_rate},
    generate_kwargs={'language': 'korean', 'task': 'transcribe'},
))
PY
```
