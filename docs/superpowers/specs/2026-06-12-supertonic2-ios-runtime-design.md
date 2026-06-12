# Supertonic 2 iOS Runtime Design

Date: 2026-06-12
Status: Ready for user review

## Goal

MeerQuest will support on-device text-to-speech on iOS using the Supertonic 2 ONNX model. The app will not bundle the model in the app binary. On first launch, the app will block entry, download the model, verify it, prepare the iOS runtime, and only then render the main app.

## Scope

This first milestone is iOS-only. Android support is intentionally out of scope and will be designed after the iOS path is working.

The app must:

- Download Supertonic 2 model files on first launch.
- Store model files in persistent app storage.
- Verify model version and file integrity before use.
- Initialize the local iOS ONNX TTS runtime before entering the app.
- Block app entry until the model is ready.
- Show a child-friendly MeerQuest download screen with progress and retry.
- Provide a small TypeScript API for status, download, preparation, and synthesis.

The app does not need to:

- Support Android runtime TTS in this milestone.
- Support arbitrary user voice cloning.
- Stream partial audio while synthesis is still running.
- Expose Supertonic settings in the child-facing UI.
- Replace existing pre-generated audio assets immediately.

## External Model

The target model is `Supertone/supertonic-2` from Hugging Face.

Known fixed settings:

- Model name: `supertonic-2`
- Revision: `75e6727618a02f323c720cba9478152d4bc16ca4`
- Supported languages for this milestone: `ko`, `en`
- Primary app language: `ko`
- Built-in default voice: `F1`

The manifest must identify every required model file. At minimum:

- `onnx/tts.json`
- `onnx/unicode_indexer.json`
- `onnx/duration_predictor.onnx`
- `onnx/text_encoder.onnx`
- `onnx/vector_estimator.onnx`
- `onnx/vocoder.onnx`
- `voice_styles/F1.json`

Additional voice styles can be added later by manifest version.

## Architecture

The feature has four layers:

1. React bootstrap gate
2. Model download and manifest verifier
3. iOS native Supertonic runtime module
4. Quest-facing speech service

### React Bootstrap Gate

`TTSBootstrapGate` wraps the app root in `app/_layout.tsx`. It runs before the router renders child screens.

State flow:

1. Check whether iOS runtime TTS is enabled.
2. Ask the native module for model status.
3. If ready, initialize the TTS runtime.
4. If missing or invalid, show the download screen.
5. Download the model with progress.
6. Verify the manifest and checksums.
7. Initialize the runtime.
8. Render the main app only after success.

The gate is blocking. The home screen and quest screens are not reachable until this flow completes.

### Download Screen

The native splash screen remains static and short-lived. Dynamic progress is shown by a React Native screen after JavaScript loads.

The screen uses MeerQuest visual language:

- Warm background matching the existing splash color.
- Mascot-led status copy.
- Large progress bar usable in landscape tablet layout.
- Concise status states: preparing, downloading, checking, ready, failed.
- Retry button on failure.

The screen should not show technical model names to children. Technical details can be logged for development.

### Manifest Verifier

The app reads a versioned manifest from the repository. The manifest includes:

- Model id
- Revision
- File list
- File sizes
- SHA-256 checksums
- Download URLs
- Local relative paths

Download is considered complete only when every file exists and matches its checksum. A partial or corrupt download is treated as invalid and retried.

The implementation may download files directly from Hugging Face during development. Before production release, a stable CDN mirror should be preferred for speed, rate limits, and URL control.

### iOS Native Runtime

The first implementation uses an iOS native module or Expo module, backed by ONNX Runtime. It adapts Supertonic's official iOS/Swift ONNX example to this app.

The native module owns:

- Locating model files in persistent storage.
- Loading ONNX sessions.
- Loading voice style JSON.
- Preprocessing text with language tokens.
- Running the Supertonic inference pipeline.
- Writing synthesized speech to a temporary WAV file.

The JavaScript API should be small:

```ts
type SupertonicModelStatus =
  | { state: 'ready'; revision: string }
  | { state: 'missing' | 'invalid'; revision?: string; reason?: string };

type SupertonicDownloadProgress = {
  downloadedBytes: number;
  totalBytes: number;
  fileIndex: number;
  fileCount: number;
};

getModelStatus(): Promise<SupertonicModelStatus>;
downloadModel(onProgress: (progress: SupertonicDownloadProgress) => void): Promise<void>;
prepareTts(): Promise<void>;
synthesizeToFile(text: string, options?: { lang?: 'ko' | 'en'; voice?: 'F1'; speed?: number; steps?: number }): Promise<{ uri: string; durationSeconds: number }>;
```

The default synthesis settings should be conservative:

- `lang`: `ko`
- `voice`: `F1`
- `steps`: 4 for first integration, then raise after device testing
- `speed`: `1.05`

### Quest-Facing Speech Service

React components should not call the native module directly. A TypeScript service provides:

- Feature detection for iOS only.
- A no-op or "unavailable" result on unsupported platforms.
- Request serialization so only one synthesis job runs at a time.
- Cleanup of temporary generated audio files where appropriate.

Existing static `expo-audio` playback can remain. Runtime-generated speech can reuse `expo-audio` by playing the generated WAV file URI.

## Data Flow

First launch:

1. `app/_layout.tsx` renders `TTSBootstrapGate`.
2. Gate calls `getModelStatus()`.
3. Native module reports `missing`.
4. Gate renders `ModelDownloadScreen`.
5. Gate calls `downloadModel()`.
6. Downloader writes files to persistent storage.
7. Verifier checks SHA-256 for every file.
8. Gate calls `prepareTts()`.
9. Native module loads ONNX sessions and default voice style.
10. Gate renders the existing app stack.

Speech request:

1. A quest or app service requests speech for text.
2. TypeScript service queues the request.
3. Native module synthesizes and writes a WAV file.
4. JavaScript receives the WAV URI.
5. `expo-audio` plays the file.

## Error Handling

Download failures:

- Show retry.
- Preserve successfully downloaded files only if their checksum matches.
- Recheck local files before retrying.

Corrupt files:

- Delete or overwrite invalid files.
- Show retry.

Unsupported platform:

- For this milestone, Android and web return unavailable.
- The iOS bootstrap gate should be platform-gated so unsupported platforms are not blocked during development.

Runtime initialization failure:

- Show retry.
- Log technical details.
- Do not enter the app until fixed on iOS.

Low storage:

- Treat as download failure.
- Show a friendly retry/error message.

## Testing

Unit tests:

- Manifest parsing and status classification.
- Checksum validation.
- Bootstrap state transitions.
- Platform gating.
- Download progress formatting.

Native/iOS verification:

- Build iOS with the native module.
- Launch with no model files and confirm blocking download screen.
- Confirm progress updates.
- Confirm app entry after successful verification and preparation.
- Confirm relaunch skips download.
- Corrupt one file and confirm invalid status plus retry.
- Synthesize a short Korean sentence and play it.

Project verification:

```bash
rtk npm run typecheck
rtk npm test
rtk npx expo export --platform ios --output-dir /tmp/meerquest-export-check
```

Native build verification will be added once the iOS module exists.

## Implementation Decisions

The first implementation will:

- Use Hugging Face download URLs during development.
- Store the model manifest as JSON in the repository so JavaScript and native code can share the same metadata.
- Use an Expo module for the iOS runtime bridge, matching the app's Expo workflow.
- Keep the production CDN decision out of the first implementation. Before App Store release, the same manifest format can point to a stable CDN mirror without changing app behavior.

The user-approved behavior is iOS-first, first-launch download, full app entry blocked until the model is ready.
