# MeerQuest Agent Rules

## Skill Routing

### Image Generation

- When creating, editing, localizing, extracting, or deriving raster image assets, use the `imagegen` skill first.
- Read `$CODEX_HOME/skills/imagegen/SKILL.md` before image work when the current session has not already loaded it.
- Prefer the built-in `image_gen` tool. Use the imagegen CLI fallback only when the user explicitly asks for CLI mode.
- For local image edits through the built-in path, inspect the target image with `view_image` first so the image is available in context.
- Generated project assets must be copied from `$CODEX_HOME/generated_images/...` into this repository, normally under `assets/images/...`.
- Do not leave a project-referenced asset only in `$CODEX_HOME/generated_images`.
- Do not overwrite an existing asset unless the user explicitly asks for replacement; otherwise create a clear sibling filename.
- Report the final workspace path and the final prompt/intent for any generated asset.
- Prefer live React Native text for labels that may change. Do not bake dynamic UI text into images unless the user explicitly requests image text.

### UI/UX Design And Implementation

- When designing, creating, improving, refactoring, or reviewing UI/UX, use the `ui-ux-pro-max` skill first.
- Read `$CODEX_HOME/skills/ui-ux-pro-max/SKILL.md` before UI/UX work when the current session has not already loaded it.
- For React Native implementation guidance, query the skill data when useful:

```bash
python3 "$CODEX_HOME/skills/ui-ux-pro-max/scripts/search.py" "<query>" --stack react-native -n 3
```

- For broad screen or product direction, query a design system recommendation when useful:

```bash
python3 "$CODEX_HOME/skills/ui-ux-pro-max/scripts/search.py" "<product and audience>" --design-system -p "MeerQuest" -f markdown
```

- Prioritize these UI checks from the skill for MeerQuest work:
  - Accessibility: labels for icon buttons, readable contrast, meaningful alt/accessibility labels.
  - Touch: child-friendly large targets, `Pressable`, adequate spacing, obvious press feedback.
  - Layout: landscape/tablet-safe responsive layout, safe-area awareness, no cropped text.
  - Typography: use the project font path and avoid text clipping.
  - Animation: purposeful, short, interruptible, and not blocking input.

## Project Context

- MeerQuest is an Expo React Native educational app for preschool children.
- Keep the visual language playful, warm, mascot-led, and child-friendly.
- The app is currently landscape-oriented and should work well on tablets.
- Prefer stable reusable UI components for shared quest controls, HUDs, navigation, and category cards.
- Keep dynamic values such as quest titles, star counts, progress, and labels as code-rendered text.
- Use bitmap assets for rich illustrated scenes and characters, and code-native UI for interactive or frequently changing elements.

## Verification

- After changing UI code, run at least:

```bash
rtk npm run typecheck
rtk npm test
```

- When asset references or Expo bundling may be affected, also run:

```bash
rtk npx expo export --platform ios --output-dir /tmp/meerquest-export-check
```
