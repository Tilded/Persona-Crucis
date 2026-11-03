# Unified Character Package Contract

**Contract version:** 1.0.0  
**Character Bible schema:** 1.0  
**Status:** Character package, runtime context/update attachment, optional module selection, and cross-platform export implemented. Live GobboNet installation remains unverified.

## Authority

The canonical character-authored source is the Tarot Character Studio Character Bible schema at `generator/schemas/character.schema.json`. The package envelope in `contracts/character-package.schema.json` gives that Bible a stable identity and declares which runtime capabilities the exported character opts into.

ArcanaPersona is a feature source, not a second authority for character canon or runtime state. Its legacy `SoulMemorySystem`, prewritten diary entries, and turn-count affinity stages are not imported into this contract.

## Package envelope

A package contains:

- `contract_version`: this envelope's version, independently versioned from the Bible.
- `character_id`: stable machine identifier. It is not a display name and must not change when the character's name changes.
- `display_name`: presentation name.
- `bible_schema_version` and `character_bible`: the complete authored Bible validated against the existing Character Bible schema.
- `runtime`: explicit opt-in to GobboNet Social Framework modules and privacy boundaries.
- `created_at`: optional ISO-8601 package creation timestamp.

The schema deliberately rejects unknown envelope and runtime fields. Additions require a contract version decision rather than silently changing the meaning of an existing package.

## GobboNet attachment

The export includes a separate `gobbonet_character_attachment.js` file. It registers the versioned package, attaches the bounded continuity context to GobboNet's `context` hook, and runs a conservative maintenance proposal every six message cycles using GobboNet's local `ask` function. The Social Framework validates each proposal before storage.

The attachment is deliberately not placed in the exported card's `customCode` field. That field remains empty and `customCodeEnabled` remains false. After installing the framework core, selected specialists, and package adapter as Global Mods, the user reviews and manually pastes the generated attachment into the card's Custom Code field. This avoids silently executing scripts during import.

## Runtime module selection

Tarot Character Studio always includes `social_core`. The package editor enables `intellectual_continuity` and `personal_life_continuity` by default, and allows either specialist to be disabled independently. The selected list is saved with the local draft and written to the package manifest. The export server rejects unknown modules, duplicates, and profiles that omit the required core.

The Social Framework adapter must have every selected specialist script loaded before registration. A package that opts into a module that is unavailable fails clearly; it is not silently downgraded.

## Ownership boundaries

| Information | Authority / owner | Runtime treatment |
|---|---|---|
| Identity, biography, psychology, voice, boundaries, authored goals | Character Bible | Read-only authored baseline |
| Tarot spread and interpretation trace | Character Bible | Design provenance; not runtime state |
| User facts | Character + conversation thread | Exact quotation from a user-authored message |
| Commitments | Character + conversation thread | Explicit status transitions with user evidence |
| Relationship state | Character + conversation thread | Evolving state; never turn-count progression |
| Private memories and diary reflections | Owning character | Never implicitly visible to another character |
| Intellectual positions | Owning character, character-wide | Evidence-backed create/reaffirm/qualify/revise history |
| Character private-life threads | Owning character, character-wide | Character-authored evidence; not user facts |
| Shared events | Explicit participant set | Visible only to named participants |

## Storage and migration

The package is an authoring/export artifact, not a database dump. The Social Framework stores runtime state separately. Importing a package must register a stable character ID and runtime module choices; it must not overwrite existing continuity records or copy the entire Bible into browser storage.

The Social Framework currently uses browser `localStorage`; GobboNet card-specific scripts use `gobbo.store`. These are not interchangeable. The current export does not synchronize these stores or migrate the existing Mara engine. A later migration must be explicit, reversible, and backed up. A later migration must be explicit, reversible, and backed up.

## Compatibility rules

1. A runtime may ignore an optional specialist module it does not support, but must report that omission.
2. A runtime must reject an unsupported major contract version.
3. Missing mutable state means retain the Bible baseline; it does not authorize invented changes.
4. Runtime state may supersede only the mutable dimension it explicitly owns. It cannot rewrite stable identity, hard boundaries, or unrelated canon.
5. No relationship, memory, or event is shared merely because characters use the same framework.

## Implemented acceptance (Stages 1–2)

- The package envelope is machine-readable and references the existing Bible schema.
- The runtime adapter accepts only supported contract versions and module names.
- Registering a package creates/returns the framework character facade without copying or rewriting Bible content.
- Existing character registration and continuity APIs remain backward-compatible.
- Tarot Character Studio assigns and persists a stable package ID, validates the complete package envelope during export, and includes the manifest plus both schemas in the ZIP.
- Export validation rejects missing/unstable IDs and mismatched Bible/card names.
