# Persona Crucis

A browser-only tarot-to-character workshop. Tarot supplies symbolic creative material; an external AI helps develop the character; the application organizes, reviews, and exports the finished GobboNet character card.

## Product principles

- Static HTML, CSS, and JavaScript. No Python server, database, local model, API key, or account connection.
- Commercial AI is used through deliberate copy-and-paste prompts. The user chooses the provider and model.
- Tarot interpretation is symbolic and non-deterministic. It does not diagnose the user or dictate a character's personality.
- The visual theme is Counter-Enlightenment / High Traditionalism inspired. It affects presentation only and must never appear as an instruction in character-generation prompts.
- Character content, the human-readable Character Bible, and GobboNet export are separate layers.
- Incomplete information remains incomplete. The app must not invent facts to fill required fields.

## Run

Open `index.html` in a modern desktop browser. GitHub Pages can host the repository directly. All work stays in browser local storage unless the user downloads or copies it.

## Current implementation

- Celtic Cross spread with 78-card RWS name list and reproducible seeded draws.
- Reader notes and editable card/orientation selections.
- Copy-ready staged AI prompts for interpretation, character development, Bible assembly, and GobboNet conversion.
- Browser-side draft persistence.
- Character Bible / GobboNet field editor with raw JSON import and validation.
- GobboNet JSON export.

## Data and compatibility

The GobboNet export shape is based on the existing Tarot Character Studio compatibility contract. It is intentionally a focused character-card export, not a GobboNet runtime-framework installer. The existing schemas, prompts, tarot assets, and field mapping notes are retained as reference material in `docs/reference/`.

## Privacy

No content is transmitted by Persona Crucis. When the user copies a prompt into a commercial AI service, that service's own privacy and data policies apply. Drafts are stored locally in the current browser profile. Clearing browser site data may erase them; use the project export/backup regularly.
