import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const contract = fs.readFileSync("docs/reference/gobbonet-compatibility.md", "utf8");
const schema = JSON.parse(fs.readFileSync("docs/reference/gobbonet-generation.schema.json", "utf8"));

for (const field of [
  "writing_style", "personality", "greeting", "alternate_greetings",
  "starting_lore", "lore_prompt", "storybook", "carousel_prompts", "custom_code"
]) assert.ok(app.includes('["' + field + '"') || app.includes('"' + field + '"'), "Missing field: " + field);

assert.match(app, /writingStyle","writing_style"/, "Native GobboNet and authoring snake_case fields must both be recognized");
assert.match(app, /pick\(src,"system_prompt"\),pick\(src,"post_history_instructions"\)/, "Tavern operational instructions must map to Writing Style");
assert.doesNotMatch(app, /pick\(src,"lorePrompt","lore_prompt","post_history_instructions"\)/, "Post-history instructions must never be misrouted to Lore Summary Prompt");
assert.match(app, /# Example Dialogue\\n\\n"\+examples/, "Example dialogue must be labelled when preserved in Storybook");
assert.match(app, /\["writing_style","personality","greeting"\]/, "Starting Lore and Storybook must not be mandatory non-empty fields");
assert.match(app, /carouselEnabled:false/, "Carousel must default to disabled");
assert.match(app, /settings\.carouselEnabled=false/, "Imported cards without explicit Carousel opt-in must remain disabled");
assert.match(app, /customCodeEnabled:false/, "Imported Custom Code must remain disabled");
assert.match(app, /data-copy-field/, "Every text destination must have a field-copy control");
assert.match(app, /Approximate always-on character context/, "The UI must show always-on context cost");
assert.match(app, /carouselEnabled:settings\.carouselEnabled/, "Export must respect the explicit Carousel toggle");
assert.match(app, /loreEnabled:settings\.loreEnabled/, "Export must respect the explicit Lore System toggle");
assert.match(app, /loreCustomPrompt:settings\.loreCustomPrompt/, "Export must respect the custom Lore Prompt toggle");

for (const id of ["loreEnabled","loreCustomPrompt","altGreetingsEnabled","carouselEnabled","carouselMode","ragWordsToFire","customCodeEnabled","thinkingEnabled","contextEstimate","memoryFileNote"]) {
  assert.ok(html.includes('id="' + id + '"'), "Missing GobboNet setting/control: " + id);
}
assert.match(html, /This page does not import a card into GobboNet/, "The final page must state that it is a manual field sheet");
assert.ok(contract.includes("Personality persistently every turn"), "Compatibility notes must document current Personality injection behavior");
assert.ok(contract.includes("manual setup sheet"), "Compatibility notes must define manual setup as primary");

assert.equal(schema.properties.carousel_prompts.maxItems, 12);
assert.equal(schema.properties.carousel_prompts.minItems, undefined, "Carousel is optional and has no minimum line count");
assert.equal(schema.properties.starting_lore.type, "string", "Starting Lore may be empty");
assert.equal(schema.properties.lore_prompt.type, "string", "Custom Lore Summary Prompt may be empty");

console.log("GobboNet field contract checks passed.");
