# meerquest
MeerQuest is an educational app for children that makes learning feel like an adventure through interactive quests, playful challenges, and progress-based activities.

## Supertonic 2 voice assets

Use the pinned Supertonic 2 helper to generate local voice files for Expo:

```bash
python3 -m venv .venv-supertonic2
source .venv-supertonic2/bin/activate
npm run voice:setup
npm run voice:supertonic2 -- --text "미어루가 기다려요." --output assets/audio/voice/meero-waits.wav
```

The helper uses `TTS(model="supertonic-2")`, defaults to Korean (`--lang ko`) and voice `F1`, and downloads the model to `~/.cache/supertonic2` on first use. Generated `.wav` files can be referenced from the app like the existing files under `assets/audio/`.
