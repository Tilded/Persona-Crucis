# Persona Crucis

A browser-only tarot-to-character workshop. Tarot supplies symbolic creative material; an external AI helps develop the character; the application organizes, reviews, and prepares separate GobboNet character-editor fields.

## Product principles

- Static HTML, CSS, and JavaScript. No Python server, database, local model, API key, or account connection.
- Commercial AI is used through deliberate copy-and-paste prompts. The user chooses the provider and model.
- Tarot interpretation is symbolic and non-deterministic. It does not diagnose the user or dictate a character's personality.
- The visual theme is Counter-Enlightenment / High Traditionalism inspired. It affects presentation only and must never appear as an instruction in character-generation prompts.
- Character content, the human-readable Character Bible, and GobboNet editor fields are separate layers.
- Incomplete information remains incomplete. The app must not invent facts to fill fields.
- The final stage is a manual field sheet. It does not rely on GobboNet's generic card importer to distribute unrelated fields.

## Run

Open index.html in a modern desktop browser. GitHub Pages can host the repository directly. All work stays in browser local storage unless the user downloads or copies it.

## Current implementation

- Celtic Cross spread with 78-card RWS name list and reproducible seeded draws.
- Reader notes and editable card/orientation selections.
- Copy-ready staged AI prompts for interpretation, character development, Bible assembly, and GobboNet field conversion.
- Browser-side draft persistence.
- Field-by-field GobboNet setup sheet with separate copyable boxes for Writing Style, Personality, Greeting, Alternative Greetings, Starting Lore, Lore Summary Prompt, RAG Storybook, Carousel Prompts, and Custom Code.
- Conservative mapping for GobboNet-native JSON and Tavern-style source cards; unsupported prose remains in Storybook rather than being guessed into operational fields.
- Always-on context estimate and duplicate-field warnings.
- Optional GobboNet JSON backup; manual field-by-field setup remains the primary workflow.

## Data and compatibility

The field contract follows GobboNet's native card editor and runtime behavior. See docs/reference/gobbonet-compatibility.md for field purposes, injection cadence, manual setup, and version-sensitive details. The export is a focused character-card backup, not a GobboNet runtime-framework installer.

## Privacy

No content is transmitted by Persona Crucis. When the user copies a prompt into a commercial AI service, that service's own privacy and data policies apply. Drafts are stored locally in the current browser profile. Clearing browser site data may erase them; use the project export/backup regularly.
