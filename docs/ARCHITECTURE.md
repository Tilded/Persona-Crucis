# Architecture and design boundaries

## Product boundary

Persona Crucis is a static browser application. It does not run, host, proxy, or call an AI model. The user chooses an external AI service and transfers prompts and responses by copy and paste. The application never needs an API key.

## Runtime

- index.html: application shell and four-stage workflow.
- styles.css: visual system and responsive layout.
- app.js: seeded tarot draw, prompt assembly, local draft persistence, source mapping, GobboNet field separation, validation, and downloads.
- data/tarot.js: bundled 78-card name list and editable Celtic Cross position definitions.
- docs/reference/: schemas, prompts, and GobboNet compatibility notes.

The application can be opened directly from disk because all runtime data is bundled as JavaScript. It can also be hosted on GitHub Pages. No build step is required.

## The four movements

1. Spread: user question, ten unique cards, orientation, reader notes.
2. Interpretation: prompt assembled from the spread; AI response pasted back.
3. Character: staged prompts for concept, Bible assembly, and GobboNet field conversion. A single working-material area is intentionally used so the user can carry forward the latest complete source without juggling intermediate documents.
4. Final field sheet: source material is mapped conservatively into separate GobboNet editor destinations. Every destination has its own editable, copyable text box. The user pastes each field into the matching GobboNet editor section; the app does not rely on a generic card import.

## Content ownership

- Tarot data provides the symbolic starting point.
- The external AI drafts interpretations and character material.
- The author decides what becomes canon.
- Persona Crucis organizes content and maps it to the GobboNet export structure.

The UI theme is never included in character prompts as creative direction. Prompt text explicitly excludes visual-theme influence. The design system must not leak into the character's biography, values, personality, voice, or setting.

## GobboNet field boundaries

- Writing Style: operational instructions, sent every turn.
- Personality: compact identity and temperament, sent persistently every turn in current upstream GobboNet.
- Starting Lore: minimal always-on premise, sent when Lore System is enabled; may be blank.
- RAG Storybook: detailed reference, retrieved in relevant excerpts rather than frontloaded in full.
- Lore Summary Prompt: used only during conversation compression.
- Carousel: optional one-line-per-response nudge, disabled by default.
- Custom Code: executable JavaScript, empty and disabled unless the author separately supplies and reviews a script.
- Memory Files: separate retrievable attachments, not a replacement for any of the above.

These distinctions are version-sensitive. See docs/reference/gobbonet-compatibility.md and recheck GobboNet source when its runtime changes.

## Data integrity

- Unknown facts should remain unknown.
- Imported source text is retained in the browser draft and included in the source backup.
- Native GobboNet fields are mapped directly. Tavern-style fields are mapped conservatively: operational instructions to Writing Style, personality to Personality, scenario to Starting Lore, and descriptive/lore/example material to Storybook.
- A source field is never silently copied into multiple always-on destinations.
- Custom Code is preserved when present but imported code is always disabled.
- Validation checks required operational fields, field overlap, and approximate always-on token cost. It does not claim to prove character quality or compatibility with every GobboNet version.

## Persistence and privacy

Drafts use browser localStorage. There is no cloud sync. Users should download a source backup before clearing browser data or changing devices. Copying a prompt into a commercial AI service sends that prompt to that provider under its own terms; Persona Crucis itself does not transmit the user's dossier.

## Visual direction

The Counter-Enlightenment / High Traditionalism reference is strictly an interface art direction: Romanticism, Gothic Revival, Neoclassicism, antique paper, deep wine, oak green, aged brass, engraved ornament, restrained arches, archival typography, and melancholic texture. It is not a worldview instruction and must not shape generated character content.
