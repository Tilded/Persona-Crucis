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

This is where the detailed reference belongs. GobboNet parses it into named or plain-text entries and retrieves relevant parts. Use clear headings and self-contained sections. Do not copy the entire Storybook into Writing Style, Personality or Starting Lore.

### Lore Summary Prompt

This is only for GobboNet's native compression pass over older messages. It is not a lorebook, a character summary, a memory-writer script, or an always-on system prompt. Leave the custom-prompt toggle off when GobboNet's built-in summary instructions are sufficient.

### Carousel

Carousel is optional. Leave it disabled by default. If the author deliberately enables it, use a small set of short, non-duplicative nudges. Never use it to repeat the Writing Style or Personality fields, create events, dictate opinions or force topics.

### Custom Code and Memory Files

Custom Code is executable JavaScript, not prose. Persona Crucis does not generate or enable scripts. Imported code is preserved for reference but remains disabled. Memory Files are separate attachments; they are not interchangeable with Starting Lore, Storybook or the running thread summary.

## Context-cost rule

Writing Style and Personality are sent every turn. Starting Lore is also sent every turn when Lore System is enabled. These are the fields that create persistent frontloaded character context.

The Storybook is retrieved in relevant excerpts. The Lore Summary Prompt is used only during compression. Carousel contributes at most one short line when enabled. Do not move detailed reference material into always-on fields to make the card appear more complete.

Persona Crucis displays an approximate always-on token estimate before export. It is an estimate, not a tokenizer measurement.

## Manual setup procedure

1. Open the character editor in GobboNet.
2. Copy the Persona Crucis Writing Style / System Prompt box into GobboNet's Writing Style field.
3. Copy the Personality box into Personality.
4. Copy Greeting and Alternative Greetings into their separate fields. Enable Alternative Greetings only when you want them used.
5. Copy Starting Lore only if it contains a short, genuinely necessary premise. Leave the GobboNet field empty when Persona Crucis shows it empty.
6. Copy the Lore Summary Prompt only if the custom-prompt toggle is enabled. Otherwise leave GobboNet's built-in prompt in place.
7. Copy the detailed reference into RAG Storybook. Set the plain-text trigger threshold deliberately; 1 is GobboNet's default.
8. Leave Carousel disabled unless you deliberately want one hidden nudge per response.
9. Leave Custom Code empty and disabled unless you have separately reviewed a script.
10. Save the card, reopen it, and verify that the fields stayed separate.

The downloadable JSON is a backup artifact. It is not the primary installation instruction and the user should not be told to rely on a generic card importer to distribute these fields.
