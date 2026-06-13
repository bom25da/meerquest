# meerquest
MeerQuest is an educational app for children that makes learning feel like an adventure through interactive quests, playful challenges, and progress-based activities.

## Supertonic 3 voice assets

Use the pinned Supertonic 3 helper to generate local voice files for Expo:

```bash
python3 -m venv .venv-supertonic3
source .venv-supertonic3/bin/activate
npm run voice:setup
npm run voice:supertonic3 -- --text "미어루가 기다려요." --output assets/audio/voice/meero-waits.wav
```

The helper uses `TTS(model="supertonic-3")`, defaults to Korean (`--lang ko`) and the F2 female/youthful character voice, and downloads the model to `~/.cache/supertonic3` on first use. Generated `.wav` files can be referenced from the app like the existing files under `assets/audio/`.
