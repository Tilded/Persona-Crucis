# GobboNet compatibility and manual field map

This project targets the native GobboNet character-card model. The final stage is a **field-by-field manual setup sheet**. It does not ask the user to import a generated card into GobboNet. Copy each text box into the matching field in the GobboNet character editor.

The source of truth for runtime behavior is the current GobboNet implementation, especially js/08-rag.js, js/15-cards.js, js/16-card-io.js, and js/07-prompt.js. Recheck these files when GobboNet changes version.

## Actual card destinations

| GobboNet editor field / card property | Correct content | Runtime behavior |
|---|---|---|
| Name / name | Character's display name | Card identity |
| Description / desc | Optional short card metadata | Not the character's main prompt |
| Writing Style / writingStyle | Operational instructions: voice, output format, conversational conduct, factual integrity, boundaries and relationship pacing | Sent every turn; primary operational directive, placed late among system blocks |
| Personality / personality | Compact identity, stable background, temperament, values and contradictions | Sent persistently every turn in current GobboNet source |
| Greeting / greeting | First message for a new conversation | Opening message only |
| Alternative Greetings / altGreetings + altGreetingsEnabled | Distinct alternative opening messages | Used only when selecting an opening |
| Starting Lore / startingLore | Minimum initial premise facts that genuinely need to remain always available | Sent every turn only while Lore System is enabled; may be blank |
| Lore System / loreEnabled | Enable or disable native conversation compression | Controls rolling thread-summary behavior and whether Starting Lore is included |
| Edit the lore summary prompt / loreCustomPrompt | Whether to override GobboNet's built-in compression prompt | Does not create an ordinary-turn prompt |
| Lore Summary Prompt / lorePrompt | Instructions for summarising new conversation messages during compression | Used only during compression, not on ordinary chat turns |
| RAG Storybook / ragStorybook | Detailed, retrieval-friendly reference: biography, work, setting, relationships, routines, interests, values and unresolved facts | Relevant excerpts are retrieved on demand; the full Storybook is not automatically frontloaded |
| Plain-text fires on / ragWordsToFire | Threshold from 1 to 5 matching words | Controls plain-text Storybook entry matching; default is 1 |
| Memory Files / memoryFiles | Optional separate .md / .txt reference files | Retrieved as files; not the Lore System summary and not a prose prompt field |
| Carousel Prompt / carouselPrompts, carouselEnabled, carouselMode | Optional short, distinct per-response nudges | At most one line is injected per response when explicitly enabled; random or sequential |
| Custom Code / customCode, customCodeEnabled | Optional reviewed JavaScript | Executable hooks; keep empty and disabled unless the author deliberately supplies a script |
| Thinking / thinkingEnabled | Optional per-card reasoning setting | Generation setting, not character prose |

## Keep the content in one proper home

### Writing Style

This is not a second Character Bible. It should contain instructions about how the model writes and interacts: message style, voice execution, length, conversational judgment, factual integrity, agency, boundaries and relationship pacing.

Do not put the full biography, physical description, job history, family, interests, values catalogue or Storybook here. Avoid repeating the Personality field.

### Personality

This is the compact answer to who the character is: identity, stable background, temperament, values, motives and meaningful contradictions. It is not a list of output-format rules. Do not repeat the Writing Style text.

GobboNet's current upstream code injects Personality persistently every turn. Earlier builds used a different reminder cadence; verify the installed version rather than assuming historical behavior.

### Starting Lore

This is the smallest useful always-on premise. It is not the whole biography, the Character Bible, or a duplicate Storybook. Leaving it blank is valid and intentional when no extra premise needs to be frontloaded.

### RAG Storybook

This is where the detailed reference belongs. GobboNet parses it into named or plain-text entries and retrieves relevant parts. Use clear headings and self-contained sections. Keep detailed facts here, but do not repeat the compact Personality block or operational Writing Style instructions. Do not copy the entire Storybook into always-on fields.

### Lore Summary Prompt

This is only for GobboNet's native compression pass over older messages. It is not a lorebook, a character summary, a memory-writer script, or an always-on system prompt. Leave the custom-prompt toggle off when GobboNet's built-in summary instructions are sufficient.

### Carousel

Carousel is optional. Leave it disabled by default. If the author deliberately enables it, use a small set of short, non-duplicative nudges. Never use it to repeat the Writing Style or Personality fields, create events, dictate opinions or force topics.

### Custom Code and Memory Files

Custom Code is executable JavaScript, not prose. Persona Crucis stamps the reviewed Soul Engine source after the serialized SOUL_CONFIG block. The engine uses GobboNet’s documented custom-code hooks and keeps runtime state in gobbo.store.soul. GobboNet imports Custom Code disabled; inspect the stamped source and enable it manually in the character editor. Memory Files are separate attachments; they are not interchangeable with Starting Lore, Storybook or the running thread summary.

## Context-cost rule

Writing Style and Personality are sent every turn. Starting Lore is also sent every turn when Lore System is enabled. These are the fields that create persistent frontloaded character context.

The Storybook is retrieved in relevant excerpts. The Lore Summary Prompt is used only during compression. Carousel contributes at most one short line when enabled. Do not move detailed reference material into always-on fields to make the card appear more complete.

Persona Crucis displays an approximate always-on token estimate before export. It is an estimate, not a tokenizer measurement.

## Mara Sayegh reference audit

The current and archived Mara Sayegh GobboNet card copies were checked as separate examples. Their field lengths show the intended structure:

| Field | Current card | Archived card |
|---|---:|---:|
| Writing Style | 4,534 characters | 6,237 characters |
| Personality | 661 characters | 1,034 characters |
| Starting Lore | Empty | Empty |
| RAG Storybook | 9,143 characters | 9,143 characters |
| Lore Summary Prompt | 1,872 characters | 1,876 characters |

The two versions do not place the full Character Bible into Writing Style and Personality. They keep the Storybook separate and leave Starting Lore empty. Some concepts recur across the operational and personality text, so Persona Crucis applies a stricter boundary: Writing Style describes how the character writes and interacts; Personality describes who the character is. The detailed reference remains in Storybook.

This is a field-structure reference, not a request to copy Mara's biography, voice or scripts into a new character.

## Manual setup procedure

1. Open the character editor in GobboNet.
2. Copy the Persona Crucis Writing Style / System Prompt box into GobboNet's Writing Style field.
3. Copy the Personality box into Personality.
4. Copy Greeting and Alternative Greetings into their separate fields. Enable Alternative Greetings only when you want them used.
5. Copy Starting Lore only if it contains a short, genuinely necessary premise. Leave the GobboNet field empty when Persona Crucis shows it empty.
6. Copy the Lore Summary Prompt only if the custom-prompt toggle is enabled. Otherwise leave GobboNet's built-in prompt in place.
7. Copy the detailed reference into RAG Storybook. Set the plain-text trigger threshold deliberately; 1 is GobboNet's default.
8. Leave Carousel disabled unless you deliberately want one hidden nudge per response.
9. Review the stamped Soul Engine source in Custom Code. Imported cards arrive with it disabled; enable it manually only after reviewing the code.
10. Save the card, reopen it, and verify that the fields stayed separate.

The downloadable JSON is a backup artifact. It is not the primary installation instruction and the user should not be told to rely on a generic card importer to distribute these fields.


## Character Card JSON import contract (verified against GobboNet `js/16-card-io.js`)

Persona Crucis exports one standard Character Card V3 JSON object:

- Root: `spec: "chara_card_v3"`, `spec_version: "3.0"`, and `data`.
- `data.description` carries Writing Style; `data.personality` carries Personality; `data.first_mes` carries Greeting; `data.alternate_greetings` carries the alternate openings.
- GobboNet-specific data travels under `data.extensions.gobbonet`. The current importer reads `ragStorybook`, `ragWordsToFire`, `memoryFiles`, `customCode`, and `lorePrompt` from this namespace.
- The importer deliberately disables imported Custom Code, regardless of the file's `customCodeEnabled` value. The stamped Soul Engine remains in the extension payload; review it and enable it manually in GobboNet.
- The current JSON importer does not restore every GobboNet-native field from the extension. In particular, Carousel settings (`carouselEnabled`, `carouselMode`, `carouselPrompts`), card colors, sampling settings, `thinkingEnabled`, context-budget overrides, the supplied card ID, and an avatar embedded as a JSON data URI are retained in the extension payload but are not applied by the current importer. The importer generates a new ID, uses its default avatar, and inherits its own default for settings it does not map. Use the accompanying field sheet to apply those settings manually where needed.
- The current importer also constructs its internal Writing Style by concatenating V3 `description` and `personality`, while separately preserving Personality. This duplicates Personality in the imported Writing Style field. This is behavior in GobboNet's importer, not a Persona Crucis export-envelope issue; Persona Crucis does not modify GobboNet.

Do not wrap a card in a custom `characterCards` array or a `gobbonet_export` envelope. Those are not recognized by the current importer.
