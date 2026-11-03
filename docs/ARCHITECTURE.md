# Architecture and design boundaries

## Product boundary

Persona Crucis is a static browser application. It does not run, host, proxy, or call an AI model. The user chooses an external AI service and transfers prompts and responses by copy and paste. The application never needs an API key.

## Runtime

- `index.html`: application shell and four-step workshop.
- `styles.css`: visual system and responsive layout.
- `app.js`: seeded tarot draw, prompt assembly, local draft persistence, import mapping, field validation, and download.
- `data/tarot.js`: bundled 78-card name list and editable Celtic Cross position definitions.
- `docs/reference/`: retained source schemas, prompts, and GobboNet compatibility notes.

The application can be opened directly from disk because all runtime data is bundled as JavaScript. It can also be hosted on GitHub Pages. No build step is required.

## The four movements

1. **Spread:** user question, ten unique cards, orientation, reader notes.
2. **Interpretation:** prompt assembled from the spread; AI response pasted back.
3. **Character:** staged prompts for concept, Bible assembly, and GobboNet field conversion. A single working-material area is intentionally used so the user can carry forward the latest complete source without juggling a dozen intermediate documents.
4. **Final card:** import existing material, review editable GobboNet fields, validate, and download.

## Content ownership

- Tarot data provides the symbolic starting point.
- The external AI drafts interpretations and character material.
- The author decides what becomes canon.
- Persona Crucis organizes content and maps it to the GobboNet export structure.

The UI theme is never included in character prompts as creative direction. Prompt text explicitly excludes visual-theme influence. The design system must not leak into the character's biography, values, personality, voice, or setting.

## Data integrity

- Unknown facts should remain unknown.
- Imported source text is retained in the browser draft and included in the source backup download.
- Existing JSON imports map recognized GobboNet fields; unrecognized content remains in the raw import area and should be reviewed manually.
- The final exporter writes the GobboNet card shape and keeps Custom Code empty and disabled. It does not silently install scripts or activate runtime behavior.
- Validation is intentionally transparent and local. It checks the card fields this exporter depends on; it does not claim to prove character quality or compatibility with every GobboNet version.

## Persistence and privacy

Drafts use browser `localStorage`. There is no cloud sync. Users should download a source backup before clearing browser data or changing devices. Copying a prompt into a commercial AI service sends that prompt to that provider under its own terms; Persona Crucis itself does not transmit the user's dossier.

## Visual direction

The Counter-Enlightenment / High Traditionalism reference is strictly an interface art direction: Romanticism, Gothic Revival, Neoclassicism, antique paper, deep wine, oak green, aged brass, engraved ornament, restrained arches, archival typography, and melancholic texture. It is not a worldview instruction and must not shape generated character content.
