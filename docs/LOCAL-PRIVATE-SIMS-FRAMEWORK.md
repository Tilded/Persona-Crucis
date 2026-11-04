# Local Private Sims Framework

Persona Crucis is the character-authoring workshop described in this document.

Persona Crucis is a private, browser-based character workshop and local-companion authoring toolkit. It combines symbolic character development, a structured Character Bible, GobboNet field preparation, and portable Tavern character-card exports.

The design goal is a believable cast with independent lives, durable preferences, imperfect memories, boundaries, and room to change. The author remains in control. Tarot is creative source material, not a deterministic personality machine.

## What runs locally
- The workshop is static HTML, CSS, and JavaScript. It has no application server, database, account system, or built-in AI endpoint.
- Drafts remain in the current browser profile unless the author exports or copies them.
- GobboNet can run local GGUF models through a local inference backend.
- The Soul Engine runs as GobboNet Custom Code and stores its state in GobboNet's local character/thread storage.
- A local embedding service and local embedding model can support retrieval without sending character material to a hosted embedding API.
- SillyTavern-compatible Character Card V2 and V3 exports are portable files; the card itself does not require a Persona Crucis account.

## The offline boundary
**The runtime can be local and offline after software and model files have been downloaded. The complete authoring workflow is not automatically 100% offline.**

Persona Crucis currently prepares prompts for a deliberate copy-and-paste workflow. If those prompts are sent to a hosted AI service, that service receives the pasted material and its own privacy policy applies. For a fully local authoring session, use a local model interface and keep prompt exchange on the same machine. No hosted generation endpoint is built into Persona Crucis.

Downloading the application, GobboNet, model weights, and any local embedding model requires a network connection at least once. Offline operation means no network is needed during the local session after those dependencies are installed.

## Core principles
- **Private by default:** no telemetry or automatic content upload is implemented by the static workshop.
- **Local ownership:** character files, exports, and runtime state remain under the user's control.
- **No invented shared history:** characters may develop their own fictional lives, but must not fabricate what the user said, did, promised, or agreed to.
- **Factual restraint:** real-world titles, people, institutions, and citations are not improvised to fill a conversational gap.
- **Retrieval, not frontloading:** detailed biography belongs in a Storybook/character book and should be retrieved when relevant, not pasted into every prompt.
- **Distinct layers:** Writing Style controls conduct; Personality describes identity; Starting Lore is minimal; the Storybook holds detailed reference; runtime state is separate.
- **Human authorship:** the user reviews generated content and chooses what becomes canon.

## Components
### Persona Crucis Workshop
A static browser application for tarot interpretation, character development, Character Bible assembly, Soul Config generation, and GobboNet field conversion. The visual theme is presentation only; it does not instruct the model to create characters with a particular ideology or temperament.

### GobboNet runtime
GobboNet is the local chat frontend/runtime. Persona Crucis prepares character fields and a reviewed Custom Code payload; it does not modify GobboNet itself. Imported Custom Code should be inspected and enabled manually in the character editor.

### Soul Engine
The Soul Engine is a separate runtime script. It maintains a constrained character-state model and injects a compact state block into conversation context. Its source is kept separate from generated character configuration so that the runtime can be reviewed and versioned independently.

### Character books and retrieval
The Storybook is divided into small, named topics. GobboNet's retrieval layer can select relevant entries. SillyTavern exports use a standard character_book structure with individual entries, rather than placing the entire biography in always-on prompts.

### Chirper content seeds
Chirper post collections are optional fictional content seeds. They are not an autonomous social network, do not post to external services, and do not create a posting scheduler by themselves. A compatible local runtime script must decide when and how to use them.

## Installation and use
1. Download or clone the Persona Crucis repository.
2. Serve the static workshop over HTTP or use its configured hosted static deployment. A direct file:// launch cannot load the separate Soul Engine source and export is intentionally blocked.
3. Create or import a character and review the generated fields.
4. For local authoring, use a local model interface rather than pasting prompts into a hosted service.
5. Run GobboNet with the desired local GGUF model and local inference backend.
6. Configure local retrieval and embedding services with model/context settings that fit available hardware.
7. Import or manually install the character fields. Review Custom Code before enabling it.
8. Keep independent backups of character cards, Storybooks, and runtime state.

## Compatibility and limitations
- GobboNet's card importer may not apply every GobboNet-specific setting from a Character Card V3 extension. Check the field map and manually apply unsupported settings.
- SillyTavern V2/V3 exports preserve standard character-card fields and the character book. GobboNet-only runtime code and settings are not part of those portable exports.
- Model quality, context limits, VRAM, embedding dimensions, and inference-server limits depend on the local hardware and backend configuration.
- A successful mocked engine test is not the same as a live GobboNet integration test. Verify the installed runtime after updates.
- Offline privacy depends on the user keeping model endpoints, embeddings, and authoring workflows local. A hosted AI service is not offline.

## Privacy checklist
- Use local model weights and a local inference endpoint.
- Use a local embedding model and local vector storage.
- Do not paste private character material into hosted services if the goal is fully local operation.
- Keep GobboNet and model-server network exposure restricted to the local machine or trusted LAN.
- Back up exported character cards and configuration files.
- Review third-party plugins and scripts before enabling them.

## Repository map
- app.js, index.html, styles.css: static workshop.
- soul-config.js: Soul Config schema and validation.
- soul-engine.js: separate GobboNet runtime engine.
- examples/: reference character cards.
- exports/: portable SillyTavern character cards.
- data/: optional Chirper content seeds.
- docs/: compatibility, installation, and operational notes.

This project is a local-first toolkit, not a hosted companion service. It does not promise that every stage of content creation is offline unless the user also keeps the model used for generation on-device.
