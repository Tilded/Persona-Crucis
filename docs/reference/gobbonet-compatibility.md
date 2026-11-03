# GobboNet compatibility

## Card field mapping

This project follows the field map already established and tested in the user's Mara Sayegh project. The generated character package uses these GobboNet card fields:

| GobboNet field | Generated content |
|---|---|
| id | Stable slug from character name |
| name | Display name |
| desc | Compact description |
| writingStyle | Primary operational prompt |
| personality | Compact identity and temperament |
| greeting | Opening message |
| altGreetingsEnabled, altGreetings | Optional alternate openings |
| startingLore | Short always-on background |
| loreEnabled | Enabled |
| loreModelFile | Empty, uses default model |
| loreCustomPrompt, lorePrompt | Custom summary instructions and text |
| ragStorybook | Detailed retrieval-oriented reference |
| memoryFiles | Empty array in the initial package |
| customCode | Empty string |
| customCodeEnabled | False |
| thinkingEnabled | False by default |
| `carouselEnabled`, `carouselPrompts`, `carouselMode` | Per-turn character nudges, enabled when generated lines exist, random by default |
| sampling fields | Conservative creative defaults |

The card also includes a simple icon string and display colors. Avatar is omitted until the user supplies an image or a future image-generation stage creates one.

## Why custom code is disabled

GobboNet deliberately forces imported customCodeEnabled to false. Do not silently switch it on in an exported card. The user must review any extension and explicitly enable it after import.

The package includes an optional generic continuity extension under optional_extensions/gobbonet_continuity.js. It uses GobboNet's context hook, periodic maintenance callback, persistent store, save method, and model ask interface. A mock host test covers hook registration, context injection, exact-quote validation, commitment acceptance, diary/episode writes, and no-op handling. It has not yet been live-tested in the user's installed GobboNet build.

The card itself still has an empty customCode field and customCodeEnabled=false. To use the extension, review the source, paste it into the card's Custom Code field, enable Custom Code manually, and test with a disposable character. The Mara project is a reference for hook patterns and state authority, not code to copy wholesale into this new project.

## Field separation

- Writing Style is not Personality.
- Starting Lore is not the RAG Storybook.
- Lore Prompt is not the running thread summary.
- Storybook is reference material, not a mutable memory log.
- Continuity state is not automatically written merely because a JSON template exists.

This prevents duplicated prompts and competing sources of current truth.

## Import steps

1. Unzip the export.
2. In GobboNet, open the character editor and import the gobbonet_character.json file using the character import workflow supported by your installed version.
3. Review the display name, Writing Style, Personality, greeting, Starting Lore, and RAG Storybook.
4. Save the card.
5. The optional extension is not installed automatically. To test it, inspect optional_extensions/gobbonet_continuity.js, paste it into Custom Code, save, then enable Custom Code manually. Start with a disposable character and inspect the console for its ready message.

GobboNet's exact editor labels can change between versions. Consult the installed version's own interface rather than assuming that every historical field label remains identical.


## Carousel Lines

Carousel Lines are a separate GobboNet card feature, not part of the continuity script. GobboNet chooses one non-empty line on each assistant turn (random or sequential) and adds it as a hidden prompt nudge. Tarot Character Studio generates 8-12 lines from the completed character bible, not directly from isolated card keywords. Each line starts with "This turn, " and is limited to 100 characters. The export maps these to the native card fields `carouselEnabled`, `carouselPrompts` (newline-separated), and `carouselMode`.

These nudges should colour attention or conversational stance lightly. They must not create events, dictate opinions, force topics, or override the character core instructions. They are not memories and do not change continuity state.
