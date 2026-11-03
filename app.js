(() => {
"use strict";
const $ = id => document.getElementById(id);
const STORE = "persona-crucis-draft-v1";
const cardFields = [
  ["writing_style","Writing Style / System Prompt","Operational instructions only: voice, output format, interaction rules, factual integrity and boundaries. Sent every turn."],
  ["personality","Personality","Compact identity and temperament: who the character is, stable background, values and contradictions. Sent every turn. No writing instructions."],
  ["greeting","Greeting","The opening message for a new conversation only."],
  ["alternate_greetings","Alternative Greetings","Alternative opening messages, separated by a blank line. Used only when selected as a greeting."],
  ["starting_lore","Starting Lore","Only essential initial premise facts. Sent every turn when Lore System is enabled. Leave blank if nothing needs to be always present."],
  ["lore_prompt","Lore Summary Prompt","Used only when GobboNet compresses older conversation messages. Optional custom override; not an ordinary-turn prompt."],
  ["storybook","RAG Storybook","Detailed character reference. GobboNet retrieves relevant parts on demand; do not duplicate this entire text in always-on fields."],
  ["carousel_prompts","Carousel Prompts","Optional short per-response nudges. One line may be injected per response only when Carousel is enabled. Leave blank and disabled by default."],
  ["custom_code","Custom Code","Executable JavaScript, not prose. Keep blank unless a script is intentionally supplied and reviewed."]
];
let data={cards:[],positions:[],spread:[],step:0,promptKind:"concept",card:{display_name:"",description:"",writing_style:"",personality:"",greeting:"",alternate_greetings:[],starting_lore:"",lore_prompt:"",storybook:"",carousel_prompts:[],custom_code:""},sourceText:"",directionResponse:"",directionOptions:[],selectedDirectionIndex:-1,directionNotes:"",memoryFiles:[],gobboSettings:{loreEnabled:true,loreCustomPrompt:false,altGreetingsEnabled:false,carouselEnabled:false,carouselMode:"random",ragWordsToFire:1,customCodeEnabled:false,thinkingEnabled:false},preferences:{nsfw:false,gender:"any",genderOther:"",communicationStyle:"text"}};
let toastTimer;
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2400)}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function readGobboSettings(){
 const d=data.gobboSettings||{};
 return {
  loreEnabled:$("loreEnabled")?$("loreEnabled").checked:d.loreEnabled!==false,
  loreCustomPrompt:$("loreCustomPrompt")?$("loreCustomPrompt").checked:!!d.loreCustomPrompt,
  altGreetingsEnabled:$("altGreetingsEnabled")?$("altGreetingsEnabled").checked:!!d.altGreetingsEnabled,
  carouselEnabled:$("carouselEnabled")?$("carouselEnabled").checked:!!d.carouselEnabled,
  carouselMode:$("carouselMode")?$("carouselMode").value:(d.carouselMode||"random"),
  ragWordsToFire:$("ragWordsToFire")?Number($("ragWordsToFire").value||1):(d.ragWordsToFire||1),
  customCodeEnabled:$("customCodeEnabled")?$("customCodeEnabled").checked:false,
  thinkingEnabled:$("thinkingEnabled")?$("thinkingEnabled").checked:!!d.thinkingEnabled
 };
}
function save(){
 data.preferences={nsfw:$("nsfwToggle").checked,gender:$("genderPreference").value,genderOther:$("genderOther").value,communicationStyle:document.querySelector('input[name="communicationStyle"]:checked')?.value||"text"};
 data.gobboSettings=readGobboSettings();
 data.directionResponse=$("directionResponse").value;data.directionNotes=$("directionNotes").value;data.gobboOutput=$("gobboOutput").value;data.brief=$("brief").value;data.readingOutput=$("readingOutput").value;data.characterOutput=$("characterOutput").value;data.characterName=$("characterName").value;data.rawImport=$("rawImport").value;data.exportName=$("exportName").value;
 const fields={...(data.fields||{})};cardFields.forEach(([k])=>{const e=$("field_"+k);if(e)fields[k]=e.value});data.fields=fields;
 try{localStorage.setItem(STORE,JSON.stringify(data))}catch(e){toast("Browser storage is full. Download a backup.")}
}
function load(){
 try{
  const saved=JSON.parse(localStorage.getItem(STORE)||"null");
  if(saved){
   data={...data,...saved};
   data.gobboSettings={...data.gobboSettings,...(saved.gobboSettings||{})};
   $("brief").value=data.brief||"";$("readingOutput").value=data.readingOutput||"";$("characterOutput").value=data.characterOutput||"";$("gobboOutput").value=data.gobboOutput||"";$("directionResponse").value=data.directionResponse||"";$("directionNotes").value=data.directionNotes||"";$("characterName").value=data.characterName||"";$("rawImport").value=data.rawImport||"";$("exportName").value=data.exportName||"";
   const p=data.preferences||{};$("nsfwToggle").checked=!!p.nsfw;$("genderPreference").value=p.gender||"any";$("genderOther").value=p.genderOther||"";$("genderOther").hidden=$("genderPreference").value!=="other";const g=data.gobboSettings||{};$("loreEnabled").checked=g.loreEnabled!==false;$("loreCustomPrompt").checked=!!g.loreCustomPrompt;$("altGreetingsEnabled").checked=!!g.altGreetingsEnabled;$("carouselEnabled").checked=!!g.carouselEnabled;$("carouselMode").value=g.carouselMode||"random";$("ragWordsToFire").value=String(g.ragWordsToFire||1);$("customCodeEnabled").checked=!!g.customCodeEnabled;$("thinkingEnabled").checked=!!g.thinkingEnabled;
   const style=p.communicationStyle||"text";const radio=document.querySelector('input[name="communicationStyle"][value="'+style+'"]');if(radio)radio.checked=true;$("nsfwLabel").textContent=p.nsfw?"On · NSFW permitted":"Off · SFW";
  }
 }catch(e){}
}
function seededRandom(seed){let h=2166136261;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function draw(){const seed=Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);const rand=seededRandom(seed);const pool=[...data.cards];data.spread=data.positions.map((p,i)=>{const ix=Math.floor(rand()*pool.length);const card=pool.splice(ix,1)[0];return{position:i+1,label:p.label,meaning:p.meaning,card,orientation:rand()>.5?"upright":"reversed",note:""}});data.seed=seed;renderSpread();$("spreadStatus").textContent="Ten unique cards drawn. Seed: "+seed;save();toast("The spread has been drawn.")}
function renderSpread(){const grid=$("spreadGrid");grid.innerHTML=data.positions.map((p,i)=>{const s=data.spread[i]||{card:"",orientation:"upright",note:""};return `<article class="spread-card"><div class="spread-num">${String(i+1).padStart(2,"0")}</div><div><h4>${escapeHtml(p.label)}</h4><p>${escapeHtml(p.meaning)}</p><div class="spread-controls"><select data-card="${i}" aria-label="Card for ${escapeHtml(p.label)}"><option value="">Choose a card</option>${data.cards.map(c=>`<option ${c===s.card?"selected":""}>${escapeHtml(c)}</option>`).join("")}</select><select data-orientation="${i}" aria-label="Orientation"><option value="upright" ${s.orientation==="upright"?"selected":""}>Upright</option><option value="reversed" ${s.orientation==="reversed"?"selected":""}>Reversed</option></select></div></div><textarea data-note="${i}" placeholder="Reader's note (optional)" aria-label="Reader note">${escapeHtml(s.note||"")}</textarea></article>`}).join("");grid.querySelectorAll("[data-card]").forEach(e=>e.addEventListener("change",()=>{data.spread[+e.dataset.card].card=e.value;save()}));grid.querySelectorAll("[data-orientation]").forEach(e=>e.addEventListener("change",()=>{data.spread[+e.dataset.orientation].orientation=e.value;save()}));grid.querySelectorAll("[data-note]").forEach(e=>e.addEventListener("input",()=>{data.spread[+e.dataset.note].note=e.value;save()}))}
function spreadText(){return data.spread.map(s=>`${s.position}. ${s.label}\nCard: ${s.card||"[not selected]"} — ${s.orientation}\nPosition meaning: ${s.meaning}\nReader's note: ${s.note||"None"}`).join("\n\n")}
function readingPrompt(){return `You are the interpretive analyst for a tarot-based creative project. Treat this Celtic Cross as symbolic creative material, not diagnosis, prediction, or a deterministic personality test.

USER'S CREATIVE BRIEF:
${$("brief").value||"No additional brief supplied."}

THE SPREAD:
${spreadText()}

METHOD:
- Interpret each card through its position, orientation, and the spread as a whole.
- Identify patterns, echoes, tensions, and contradictions. Preserve ambiguity where more than one reading is plausible.
- Do not mechanically assign traits to cards. A symbol may become a value, conflict, environment, habit, professional question, fear, strength, or circumstance.
- Position 10 is a possible direction if current patterns continue, never fate.
- Distinguish the reader's notes from your own interpretation.
- Do not infer facts about the user, diagnose anyone, or assume the eventual character's gender, age, history, or relationship with the user.
- The visual design of the application is irrelevant to the reading. Do not use its aesthetic or theme as character inspiration.

OUTPUT:
Return a clear, detailed interpretation with: (1) whole-spread synthesis, (2) all ten position interpretations, (3) cross-card patterns, (4) productive contradictions, (5) three genuinely distinct character directions with tradeoffs, and (6) guardrails against unsupported assumptions. Conclude by recommending one direction without pretending it is the only valid one.`}
function preferenceText(){const p=data.preferences||{};const gender=p.gender||"any";return [
"NSFW: "+(p.nsfw?"ON — mature adult themes are permitted, never compulsory.":"OFF — keep the character and generated material SFW; no sexual or explicit content."),
"Gender: "+(gender==="any"?"No preference; do not assume prematurely.":gender==="other"?(p.genderOther||"Another identity, details unspecified."):gender.charAt(0).toUpperCase()+gender.slice(1)+"."),
"Communication: "+((p.communicationStyle||"text")==="text"?"Text-message / AIM style: direct conversational messages, no routine roleplay actions, stage directions, or scene narration.":"Traditional roleplay: natural scene-aware prose, actions, and descriptive narration are permitted.")
].join("\n")}
function conceptPrompt(){return `You are proposing character directions for a fictional adult character, using the tarot interpretation only as symbolic creative material.
 
CREATIVE BRIEF:
${$("brief").value||"No additional brief supplied."}

TAROT INTERPRETATION:
${$("readingOutput").value||"[No interpretation supplied.]"} 

AUTHOR'S NAME PREFERENCE:
${$("characterName").value.trim()||"No name supplied. Do not require a name."}

AUTHOR PREFERENCES:
${preferenceText()}

Create exactly THREE genuinely distinct, viable character directions. Each should interpret the source differently without mechanically assigning traits to cards. Each direction should describe a coherent person with a plausible life, central tension, temperament, work or occupation only where supported, relationships, interests, and narrative potential. Do not invent real-world factual references, institutions, publications, or historical specifics. Preserve unknowns as unknown. The site's visual theme is irrelevant and must not influence character creation.

Return JSON only, with this exact shape and exactly three items:
{
  "directions": [
    {"title":"Short distinguishing title","direction":"A substantial but concise description of this character direction."},
    {"title":"Short distinguishing title","direction":"A substantial but concise description of this character direction."},
    {"title":"Short distinguishing title","direction":"A substantial but concise description of this character direction."}
  ]
}
Do not include Markdown fences, commentary, or any additional keys.`}
function biblePrompt(){return `Turn the following established character material into a complete, human-readable Character Bible. Do not redesign the character or add unsupported facts.

AUTHOR-SELECTED CHARACTER DIRECTION:
${selectedDirectionText()||"[No direction selected. Do not assume a choice; preserve the source material as supplied.]"}

AUTHOR NOTES / ADJUSTMENTS:
${$("directionNotes").value||"None supplied."}

ADDITIONAL WORKING MATERIAL:
${$("characterOutput").value||"[No additional working material supplied.]"}

AUTHOR PREFERENCES:
${preferenceText()}

Respect the author-selected direction and notes above. Treat the selected direction as the author's chosen foundation, not an instruction to invent missing facts. Preserve established facts, voice, contradictions, agency, boundaries, relationships, and independent life. A selected communication format must be reflected clearly in Voice and Conversation; NSFW Off excludes sexual / explicit content, while NSFW On permits mature adult themes but does not make them mandatory. Do not invent a name when the author left it blank. Organize the Bible under these headings: Core Identity; Appearance; Biography; Psychology and Values; Contradictions; Daily Life; Relationships; Agency and Boundaries; Voice and Conversation; Interests and Tastes; Narrative Threads; Tarot Design Trace; Unresolved / Unspecified Details.

Rules:
- The character is an adult.
- Never invent user statements, shared history, real-world factual references, or missing biography details.
- Do not resolve contradictions by choosing one side unless the source explicitly resolves them.
- Keep unknown details explicitly unknown.
- The tarot trace records design influence, not destiny.
- The site's visual theme is irrelevant to the character's content.

Return the full Bible in readable Markdown. Avoid padding. Make every section useful and internally consistent.`}
function gobboPrompt(){
 return [
 "Convert the Character Bible below into separate GobboNet editor fields. This is a field-mapping task, not a card dump. The Bible is the sole source of truth. Do not invent facts to fill empty fields.",
 "",
 "CHARACTER BIBLE:",
 $("characterOutput").value||"[Paste the complete Character Bible here.]",
 "",
 "AUTHOR PREFERENCES:",
 preferenceText(),
 "",
 "Return one valid JSON object with exactly these fields:",
 "{",
 '  "display_name":"",',
 '  "writing_style":"",',
 '  "personality":"",',
 '  "greeting":"",',
 '  "alternate_greetings":[],',
 '  "starting_lore":"",',
 '  "lore_prompt":"",',
 '  "storybook":"",',
 '  "carousel_prompts":[]',
 "}",
 "",
 "STRICT FIELD BOUNDARIES:",
 "- writing_style: operational instructions only. Include voice, message format, response length, conversational conduct, factual integrity, boundaries and relationship pacing. Do not put biography, appearance, work history, interests, values lists or the full character concept here.",
 "- personality: concise identity and temperament only. Include established identity, compact background, stable traits, values, motives and defining contradictions. Do not include formatting instructions, prompt rules or repeated writing_style text.",
 "- greeting: one natural opening message.",
 "- alternate_greetings: optional array of distinct alternative opening messages. Use [] if none are needed.",
 "- starting_lore: only the minimum premise facts that genuinely must be present on every turn. It may be an empty string. Do not copy the biography or Storybook here.",
 "- lore_prompt: optional instructions ONLY for summarising older conversation messages when GobboNet's Lore System compresses history. It is not character lore, not a system prompt and not a second writing_style. Use an empty string when the built-in GobboNet summary prompt is sufficient.",
 "- storybook: the detailed reference library. Preserve the useful Character Bible material here in well-labelled, self-contained sections: biography, appearance, work, setting, relationships, routines, interests, values, current threads and unresolved facts. GobboNet retrieves relevant parts on demand; it does not need to be repeated in always-on fields.",
 "- carousel_prompts: optional array of short, distinct per-response nudges. Use [] by default. Never restate the writing_style or personality. Do not generate generic filler just to populate this field.",
 "",
 "NON-NEGOTIABLE RULES:",
 "- Every fact has one primary destination. Do not copy the same paragraph or list into multiple fields.",
 "- Keep writing_style and personality clearly different in purpose and wording. If a point belongs in both, keep only the operational instruction in writing_style and the underlying stable fact in personality.",
 "- Never duplicate the full Character Bible in writing_style, personality or starting_lore. Its detailed reference belongs in storybook.",
 "- Do not invent a name, history, real-world reference, relationship event, setting detail or preference. Preserve unknowns as unknown.",
 "- Keep starting_lore empty when no short always-on premise is necessary.",
 "- Keep lore_prompt empty when the built-in GobboNet summary prompt is adequate.",
 "- Do not generate JavaScript or Custom Code. Persona Crucis leaves Custom Code empty and disabled unless the author supplies a reviewed script separately.",
 "- Carousel is optional and disabled by default. Do not produce 8–12 repetitive reminders.",
 "- NSFW Off means SFW. NSFW On permits mature adult themes but does not require them. Respect the selected communication format.",
 "- The site's visual theme is irrelevant and must not influence character creation.",
 "- Return JSON only. No Markdown fences, explanations, additional keys or commentary."
 ].join("\n");
}
function selectedDirectionText(){const d=data.directionOptions?.[data.selectedDirectionIndex];return d?d.title+"\n"+d.direction:""}
function renderDirectionOptions(){const wrap=$("directionOptions");if(!wrap)return;const options=data.directionOptions||[];wrap.innerHTML=options.map((d,i)=>`<label class="direction-option ${data.selectedDirectionIndex===i?"selected":""}"><input type="radio" name="selectedDirection" value="${i}" ${data.selectedDirectionIndex===i?"checked":""}><span class="direction-number">0${i+1}</span><span class="direction-copy"><strong>${escapeHtml(d.title)}</strong><span>${escapeHtml(d.direction)}</span></span></label>`).join("");wrap.querySelectorAll('input[name="selectedDirection"]').forEach(input=>input.addEventListener("change",()=>{data.selectedDirectionIndex=Number(input.value);renderDirectionOptions();updatePrompts();save();toast("Direction selected. It will guide the Character Bible prompt.")}));$("directionStatus").textContent=options.length===3?(data.selectedDirectionIndex>=0?"Three directions loaded · one selected.":"Three directions loaded · choose one."):"No suggestions loaded."}
function loadDirections(){let raw=$("directionResponse").value.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");let parsed;try{parsed=JSON.parse(raw)}catch(e){toast("Could not read JSON. Ask the AI to return the exact JSON format shown in the prompt.");return}if(!parsed||!Array.isArray(parsed.directions)||parsed.directions.length!==3||parsed.directions.some(d=>!d||typeof d.title!=="string"||typeof d.direction!=="string"||!d.title.trim()||!d.direction.trim())){toast("The response must contain exactly three directions, each with a title and description.");return}data.directionOptions=parsed.directions.map(d=>({title:d.title.trim(),direction:d.direction.trim()}));data.selectedDirectionIndex=-1;renderDirectionOptions();save();toast("Three directions loaded. Select one below.")}
function updatePrompts(){const rp=readingPrompt();$("readingPrompt").value=rp;const kind=data.promptKind||"concept";$("characterPrompt").value=kind==="concept"?conceptPrompt():kind==="bible"?biblePrompt():gobboPrompt();const titles={concept:["PROMPT II-A","Develop a character direction"],bible:["PROMPT II-B","Assemble the Character Bible"],gobbo:["PROMPT II-C","Prepare GobboNet fields"]};$("stageLabel").textContent=titles[kind][0];$("stageTitle").textContent=titles[kind][1];document.querySelectorAll(".prompt-tab").forEach(b=>b.classList.toggle("active",b.dataset.kind===kind));document.querySelector('[data-panel="2"] .copy-btn').dataset.prompt=kind}
function showStep(n){data.step=n;document.querySelectorAll(".work-panel").forEach(p=>p.classList.toggle("active",+p.dataset.panel===n));document.querySelectorAll(".step").forEach(b=>b.classList.toggle("active",+b.dataset.step===n));if(n===1||n===2)updatePrompts();if(n===2)$("gobboHandoff").hidden=(data.promptKind||"concept")!=="gobbo";if(n===3)renderFields();save()}
function setPromptKind(kind){if(kind==="bible"&&(data.directionOptions||[]).length===3&&data.selectedDirectionIndex<0){toast("Select one of the three character directions before assembling the Bible.");return}data.promptKind=kind;updatePrompts();$("gobboHandoff").hidden=kind!=="gobbo";save()}
function alternateGreetingArray(value){
 if(Array.isArray(value))return value.map(x=>String(x||"").trim()).filter(Boolean);
 return String(value||"").split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
}
function fieldValue(key){const el=$("field_"+key);return el?el.value:(data.card[key]||"")}
function readCard(){
 const card={display_name:$("exportName").value.trim(),description:data.card.description||""};
 cardFields.forEach(([key])=>{
  const val=fieldValue(key).trim();
  if(key==="alternate_greetings")card[key]=alternateGreetingArray(val);
  else if(key==="carousel_prompts")card[key]=val.split("\n").map(x=>x.trim()).filter(Boolean);
  else card[key]=val;
 });
 return card;
}
function updateContextEstimate(){
 const get=k=>fieldValue(k);
 const settings=readGobboSettings();
 const always=get("writing_style").length+get("personality").length+(settings.loreEnabled?get("starting_lore").length:0);
 const tokens=Math.ceil(always/4);
 const storybookTokens=Math.ceil(get("storybook").length/4);
 const el=$("contextEstimate");
 if(!el)return;
 el.textContent="Approximate always-on character context: "+tokens.toLocaleString()+" tokens (Writing Style + Personality"+(settings.loreEnabled?" + Starting Lore":"; Starting Lore disabled") + "). Storybook: about "+storybookTokens.toLocaleString()+" tokens in the library, retrieved in relevant excerpts rather than sent in full. Lore Summary Prompt is used only during compression; Carousel adds at most one short line when enabled.";
 el.className="context-estimate"+(tokens>5000?" high":tokens>2500?" elevated":"");
}
function renderFields(){
 const wrap=$("exportFields");
 wrap.innerHTML=cardFields.map(([key,label,help])=>{
  let val=data.fields?.[key]??data.card[key]??"";
  if(key==="alternate_greetings"&&Array.isArray(val))val=val.join("\n\n");
  if(key==="carousel_prompts"&&Array.isArray(val))val=val.join("\n");
  const full=["writing_style","personality","starting_lore","lore_prompt","storybook","carousel_prompts","custom_code"].includes(key);
  return '<div class="export-field '+(full?"full":"")+'"><div class="field-head"><label class="field-label" for="field_'+key+'">'+label+'<span>'+help+'</span></label><button class="button ghost field-copy" type="button" data-copy-field="'+key+'">Copy field</button></div><textarea id="field_'+key+'" data-field="'+key+'" placeholder="Leave blank when no content belongs in this field.">'+escapeHtml(val)+'</textarea></div>';
 }).join("");
 $("exportName").value=data.exportName||data.characterName||data.card.display_name||"";
 const g=data.gobboSettings||{};
 $("loreEnabled").checked=g.loreEnabled!==false;
 $("loreCustomPrompt").checked=!!g.loreCustomPrompt;
 $("altGreetingsEnabled").checked=g.altGreetingsEnabled!==false;
 $("carouselEnabled").checked=!!g.carouselEnabled;
 $("carouselMode").value=g.carouselMode||"random";
 $("ragWordsToFire").value=String(g.ragWordsToFire||1);
 $("customCodeEnabled").checked=!!g.customCodeEnabled;
 $("thinkingEnabled").checked=!!g.thinkingEnabled;
 wrap.querySelectorAll("textarea").forEach(e=>e.addEventListener("input",()=>{save();updateContextEstimate()}));
 wrap.querySelectorAll("[data-copy-field]").forEach(b=>b.addEventListener("click",()=>copyField(b.dataset.copyField)));
 updateContextEstimate();
 renderMemoryFileNote();
}
async function copyField(key){
 const el=$("field_"+key);if(!el)return;
 const text=el.value;
 try{await navigator.clipboard.writeText(text);toast("Copied "+key.replaceAll("_"," ")+" field.")}
 catch(e){el.focus();el.select();document.execCommand("copy");toast("Copied field text.")}
}
function renderMemoryFileNote(){
 const el=$("memoryFileNote");if(!el)return;
 const files=Array.isArray(data.memoryFiles)?data.memoryFiles:[];
 el.textContent=files.length?"Memory Files preserved from source: "+files.map(f=>f.name||"unnamed file").join(", ")+". Attach these files separately in GobboNet's Memory Files section.":"Memory Files: none. No separate attachments are needed for this character.";
}
function wordSimilarity(a,b){
 const A=new Set(String(a||"").toLowerCase().match(/[a-z0-9']+/g)||[]);
 const B=new Set(String(b||"").toLowerCase().match(/[a-z0-9']+/g)||[]);
 if(!A.size||!B.size)return 0;
 let same=0;A.forEach(w=>{if(B.has(w))same++});
 return same/(A.size+B.size-same);
}
function validateCard(){
 const c=readCard(),settings=readGobboSettings(),issues=[],warnings=[];
 ["writing_style","personality","greeting"].forEach(k=>{if(!c[k])issues.push("Missing "+k.replaceAll("_"," ")+".")});
 if(settings.loreCustomPrompt&&!c.lore_prompt)issues.push("Custom Lore Summary Prompt is enabled but its text box is empty.");
 if(settings.altGreetingsEnabled&&!c.alternate_greetings.length)issues.push("Alternative Greetings is enabled but no alternate greetings are present.");
 if(settings.carouselEnabled&&!c.carousel_prompts.length)issues.push("Carousel is enabled but no prompt lines are present.");
 if(c.carousel_prompts.length>12)issues.push("Carousel has more than 12 lines; keep the optional nudges concise.");
 c.carousel_prompts.forEach((line,i)=>{if(line&&!line.startsWith("This turn, "))issues.push("Carousel line "+(i+1)+" must begin “This turn, ”.");if(line.length>100)issues.push("Carousel line "+(i+1)+" exceeds 100 characters.")});
 if(settings.customCodeEnabled&&!c.custom_code)issues.push("Custom Code is enabled but the code field is empty.");
 const overlap=wordSimilarity(c.writing_style,c.personality);
 if(overlap>0.78)warnings.push("Writing Style and Personality are unusually similar. Separate operational instructions from identity and temperament before export.");
 const sameParagraphs=(a,b)=>{
  const aa=String(a||"").split(/\n\s*\n/).map(x=>x.trim().toLowerCase().replace(/\s+/g," ")).filter(x=>x.length>50);
  const bb=new Set(String(b||"").split(/\n\s*\n/).map(x=>x.trim().toLowerCase().replace(/\s+/g," ")).filter(x=>x.length>50));
  return aa.filter(x=>bb.has(x)).length;
 };
 if(sameParagraphs(c.writing_style,c.personality)||sameParagraphs(c.personality,c.writing_style))warnings.push("One or more substantial paragraphs appear in both Writing Style and Personality.");
 if(sameParagraphs(c.starting_lore,c.storybook)||sameParagraphs(c.storybook,c.starting_lore))warnings.push("Starting Lore repeats material already in the Storybook. Keep only the minimum always-on premise in Starting Lore.");
 const alwaysTokens=Math.ceil((c.writing_style.length+c.personality.length+(settings.loreEnabled?c.starting_lore.length:0))/4);
 if(alwaysTokens>2500)warnings.push("Always-on character context is approximately "+alwaysTokens.toLocaleString()+" tokens. Reduce duplication and move detailed reference material into the RAG Storybook.");
 if(alwaysTokens>5000)warnings.push("Always-on context is very large. GobboNet sends Writing Style and Personality every turn, and Starting Lore every turn while Lore System is enabled.");
 const box=$("validation");
 box.className="validation "+(issues.length?"invalid":warnings.length?"warning":"valid");
 box.innerHTML=(issues.length?'<strong>'+issues.length+' item(s) to fix.</strong>':warnings.length?'<strong>Field checks passed with '+warnings.length+' warning(s).</strong>':'<strong>Field checks passed.</strong>')+'<span>'+issues.concat(warnings).map(escapeHtml).join(" ")+'</span>';
 updateContextEstimate();save();return{card:c,issues,warnings};
}
function mapImported(){
 const raw=$("rawImport").value.trim();if(!raw){toast("Paste a Bible, dossier, or JSON first.");return}
 data.sourceText=raw;
 let obj=null;try{obj=JSON.parse(raw)}catch(e){}
 const parsed=obj!==null;
 let src=obj;
 if(src&&typeof src==="object"&&src.card)src=src.card;
 if(src&&typeof src==="object"&&src.gobbonet_character)src=src.gobbonet_character;
 if(src&&typeof src==="object"&&src.character_card)src=src.character_card;
 if(src&&typeof src==="object"&&src.data&&typeof src.data==="object")src=src.data;
 if(src&&typeof src==="object"&&src.character_bible)src=src.character_bible;
 else if(src&&typeof src==="object"&&src.character&&src.character.identity)src=src.character;
 const isObject=src&&typeof src==="object"&&!Array.isArray(src);
 const pick=(o,...keys)=>{for(const k of keys)if(o&&typeof o[k]==="string"&&o[k].trim())return o[k];return""};
 const ext=isObject&&src.extensions&&src.extensions.gobbonet?src.extensions.gobbonet:{};
 const isGobboNative=isObject&&["writingStyle","writing_style","startingLore","starting_lore","ragStorybook","storybook","lorePrompt","lore_prompt","carouselPrompts","carousel_prompts","customCode","custom_code"].some(k=>Object.prototype.hasOwnProperty.call(src,k));
 const next={display_name:"",description:"",writing_style:"",personality:"",greeting:"",alternate_greetings:[],starting_lore:"",lore_prompt:"",storybook:"",carousel_prompts:[],custom_code:""};
 let settings={loreEnabled:true,loreCustomPrompt:false,altGreetingsEnabled:false,carouselEnabled:false,carouselMode:"random",ragWordsToFire:1,customCodeEnabled:false,thinkingEnabled:false};
 let memoryFiles=[];
 if(isGobboNative){
  next.display_name=pick(src,"name","display_name");
  next.description=pick(src,"desc","description");
  next.writing_style=pick(src,"writingStyle","writing_style");
  next.personality=pick(src,"personality");
  next.greeting=pick(src,"greeting","first_mes");
  next.alternate_greetings=alternateGreetingArray(src.altGreetings||src.alternate_greetings);
  next.starting_lore=pick(src,"startingLore","starting_lore");
  next.lore_prompt=pick(src,"lorePrompt","lore_prompt")||pick(ext,"lorePrompt");
  next.storybook=pick(src,"ragStorybook","storybook")||pick(ext,"ragStorybook");
  const cp=src.carouselPrompts??src.carousel_prompts;
  next.carousel_prompts=Array.isArray(cp)?cp.map(String):typeof cp==="string"?cp.split("\n").map(x=>x.trim()).filter(Boolean):[];
  next.custom_code=pick(src,"customCode","custom_code")||pick(ext,"customCode");
  settings.loreEnabled=src.loreEnabled!==false;
  settings.loreCustomPrompt=typeof src.loreCustomPrompt==="boolean"?src.loreCustomPrompt:!!next.lore_prompt;
  settings.altGreetingsEnabled=typeof src.altGreetingsEnabled==="boolean"?src.altGreetingsEnabled:next.alternate_greetings.length>0;
  settings.carouselEnabled=!!src.carouselEnabled;
  settings.carouselMode=src.carouselMode==="sequential"?"sequential":"random";
  settings.ragWordsToFire=Number(src.ragWordsToFire||ext.ragWordsToFire||1);
  settings.thinkingEnabled=!!src.thinkingEnabled;
  memoryFiles=Array.isArray(src.memoryFiles)?src.memoryFiles:(Array.isArray(ext.memoryFiles)?ext.memoryFiles:[]);
 }else if(isObject&&(["name","description","personality","first_mes","system_prompt","scenario","mes_example","character_book"].some(k=>Object.prototype.hasOwnProperty.call(src,k)))){
  next.display_name=pick(src,"name","nickname");
  next.description=pick(src,"creator_notes");
  next.writing_style=[pick(src,"system_prompt"),pick(src,"post_history_instructions")].filter(Boolean).join("\n\n");
  next.personality=pick(src,"personality");
  next.greeting=pick(src,"first_mes");
  next.alternate_greetings=alternateGreetingArray(src.alternate_greetings||src.group_only_greetings);
  next.starting_lore=pick(src,"scenario");
  const extStory=pick(ext,"ragStorybook");
  const parts=[];
  if(extStory)parts.push(extStory);
  const description=pick(src,"description");
  if(description)parts.push("# Character Description\n\n"+description);
  const examples=pick(src,"mes_example");
  if(examples)parts.push("# Example Dialogue\n\n"+examples);
  const book=src.character_book;
  if(book&&Array.isArray(book.entries)){
   const entries=book.entries.filter(e=>e&&e.enabled!==false&&typeof e.content==="string"&&e.content.trim());
   if(entries.length)parts.push("# Imported Character Book\n\n"+entries.map(e=>{
    const keys=Array.isArray(e.keys)?e.keys.filter(Boolean):[];
    const title=(e.name||e.comment||keys.join(", ")||"Lore entry").trim();
    return "# "+title+(keys.length?", ["+keys.join(", ")+"]":"")+"\n\n"+e.content.trim();
   }).join("\n\n"));
  }
  next.storybook=parts.join("\n\n");
  next.lore_prompt=pick(ext,"lorePrompt");
  next.custom_code=pick(ext,"customCode");
  const cp=pick(ext,"carouselPrompts");
  next.carousel_prompts=cp?cp.split("\n").map(x=>x.trim()).filter(Boolean):[];
  memoryFiles=Array.isArray(ext.memoryFiles)?ext.memoryFiles:[];
  settings.loreEnabled=true;
  settings.loreCustomPrompt=!!next.lore_prompt;
  settings.altGreetingsEnabled=next.alternate_greetings.length>0;
  settings.carouselEnabled=false;
  settings.customCodeEnabled=false;
 }else if(!parsed){
  next.storybook="Imported source dossier:\n\n"+raw;
 }else if(isObject&&(src.identity||src.biography||src.psychology||src.character_bible)){
  next.display_name=pick(src,"name","display_name");
  next.storybook=JSON.stringify(src,null,2);
 }else if(isObject){
  next.display_name=pick(src,"name","display_name");
  next.storybook=JSON.stringify(src,null,2);
 }else{
  next.storybook=String(src??raw);
 }
 if(!next.storybook&&obj&&typeof obj==="object"&&obj.character_bible)next.storybook=typeof obj.character_bible==="string"?obj.character_bible:JSON.stringify(obj.character_bible,null,2);
 if(!next.display_name)next.display_name=data.card.display_name||"";
 data.card={...data.card,...next};
 data.gobboSettings={...settings,customCodeEnabled:false};
 data.memoryFiles=memoryFiles;
 data.fields={};
 if(data.card.display_name)data.characterName=data.card.display_name;
 $("characterName").value=data.characterName||"";
 $("exportName").value=data.card.display_name||data.characterName||"";
 renderFields();validateCard();save();
 toast(isGobboNative?"GobboNet-native fields mapped separately. Copy each field into its matching GobboNet editor section; this did not import anything into GobboNet.": "Source material mapped conservatively. Descriptive material was kept in Storybook rather than guessed into operational fields.");
}
function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportCard(){
 const result=validateCard();if(result.issues.length){toast("Resolve required fields before export.");return}
 const card=result.card,settings=readGobboSettings();
 const slug=card.display_name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"unnamed-character";
 const gobbo={
  id:slug,name:card.display_name||"Unnamed",desc:card.description,
  writingStyle:card.writing_style,personality:card.personality,greeting:card.greeting,
  altGreetingsEnabled:settings.altGreetingsEnabled,altGreetings:card.alternate_greetings.join("\n\n"),
  startingLore:card.starting_lore,loreEnabled:settings.loreEnabled,loreModelFile:"",
  loreCustomPrompt:settings.loreCustomPrompt,lorePrompt:card.lore_prompt,
  ragStorybook:card.storybook,ragWordsToFire:Math.min(5,Math.max(1,Math.round(settings.ragWordsToFire)||1)),
  carouselEnabled:settings.carouselEnabled,carouselPrompts:card.carousel_prompts.join("\n"),
  carouselMode:settings.carouselMode,carouselIndex:0,
  memoryFiles:data.memoryFiles||[],customCode:card.custom_code,customCodeEnabled:settings.customCodeEnabled&&!!card.custom_code,
  thinkingEnabled:settings.thinkingEnabled,temperature:0.78,minP:0.05,topK:50,topP:0.95,repeatPenalty:1.08,repeatLastN:96,
  icon:"✦",textColor:"#e8e1d5",dialogColor:"#c7a674"
 };
 download("PersonaCrucis_"+slug+"_GobboNet_Field_Backup.json",JSON.stringify(gobbo,null,2),"application/json");
 download("PersonaCrucis_"+slug+"_Field_Sheet_and_Source.txt",["PERSONA CRUCIS — GOBBONET FIELD SHEET","",...cardFields.map(([k,label])=>label+"\n"+(typeof card[k]==="string"?card[k]:Array.isArray(card[k])?card[k].join("\n\n"):"")),"","ORIGINAL SOURCE","",data.sourceText||"",""].join("\n\n"),"text/plain");
 toast("Field backup and copy-ready field sheet downloaded. Use the text boxes for manual GobboNet setup.");
}
function initTheme(){const saved=localStorage.getItem("persona-crucis-theme");const theme=saved==="dark"?"dark":"light";document.documentElement.dataset.theme=theme;const btn=$("themeToggle");const sync=()=>{const dark=document.documentElement.dataset.theme==="dark";btn.setAttribute("aria-pressed",String(dark));btn.setAttribute("aria-label",dark?"Switch to light mode":"Switch to dark mode");btn.querySelector(".theme-icon").textContent=dark?"☀":"☾";btn.querySelector(".theme-label").textContent=dark?"Light mode":"Dark mode"};sync();btn.addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;localStorage.setItem("persona-crucis-theme",next);sync()})}
function initEvents(){ $("drawBtn").addEventListener("click",draw);$("newSeedBtn").addEventListener("click",draw);$("clearSpreadBtn").addEventListener("click",()=>{data.spread=data.positions.map((p,i)=>({position:i+1,label:p.label,meaning:p.meaning,card:"",orientation:"upright",note:""}));renderSpread();$("spreadStatus").textContent="Spread cleared.";save()});$("toInterpret").addEventListener("click",()=>{if(data.spread.some(s=>!s.card)){toast("Choose a card for all ten positions.");return}showStep(1)});$("toCharacter").addEventListener("click",()=>{if(!$("readingOutput").value.trim()){toast("Paste an interpretation first, or enter your own notes.");return}showStep(2)});$("toExport").addEventListener("click",()=>{if(!$("characterOutput").value.trim()&&!$("rawImport").value.trim()){toast("Add character material or import an existing Bible.");return}if(data.promptKind!=="gobbo"){toast("Open 03 · GobboNet fields and run the final conversion first.");setPromptKind("gobbo");return}const result=$("gobboOutput").value.trim();if(!result){toast("Paste the GobboNet JSON result into the separate box above.");return}let parsed;try{parsed=JSON.parse(result)}catch(e){toast("That result is not valid JSON. Ask the AI to return the JSON object only.");return}if(!parsed||typeof parsed!=="object"||Array.isArray(parsed)){toast("The result must be one JSON object.");return}$("rawImport").value=result;mapImported();showStep(3)});document.querySelectorAll(".step").forEach(b=>b.addEventListener("click",()=>{const n=+b.dataset.step;if(n===3){if(data.step!==2&&data.step!==3){setPromptKind("gobbo");showStep(2);toast("Run the GobboNet fields prompt here, then paste its JSON result below.");return}$("toExport").click();return}showStep(n)}));document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>showStep(+b.dataset.back)));document.querySelectorAll(".prompt-tab").forEach(b=>b.addEventListener("click",()=>setPromptKind(b.dataset.kind)));document.querySelectorAll(".copy-btn").forEach(b=>b.addEventListener("click",async()=>{const kind=b.dataset.prompt;const text=kind==="reading"?readingPrompt():kind==="concept"?conceptPrompt():kind==="bible"?biblePrompt():gobboPrompt();try{await navigator.clipboard.writeText(text);toast("Prompt copied. Paste it into your AI service.")}catch(e){const ta=document.createElement("textarea");ta.value=text;document.body.append(ta);ta.select();document.execCommand("copy");ta.remove();toast("Prompt copied.")}}));["brief","readingOutput","characterOutput","gobboOutput","characterName","rawImport","exportName","genderOther","directionResponse","directionNotes"].forEach(id=>$(id).addEventListener("input",()=>{save();if(id==="directionNotes")updatePrompts()}));$("nsfwToggle").addEventListener("change",()=>{$("nsfwLabel").textContent=$("nsfwToggle").checked?"On · NSFW permitted":"Off · SFW";save()});$("genderPreference").addEventListener("change",()=>{$("genderOther").hidden=$("genderPreference").value!=="other";save()});document.querySelectorAll('input[name="communicationStyle"]').forEach(e=>e.addEventListener("change",save));$("loadDirections").addEventListener("click",loadDirections);renderDirectionOptions();$("mapImport").addEventListener("click",mapImported);$("importFile").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;$("rawImport").value=await f.text();save();mapImported()});$("validateBtn").addEventListener("click",()=>{const r=validateCard();toast(r.issues.length?r.issues.length+" item(s) need attention.":"Card checks passed.")});$("downloadBtn").addEventListener("click",exportCard);document.querySelectorAll("[data-gobbo-setting]").forEach(e=>e.addEventListener("change",()=>{save();updateContextEstimate()}))}
async function init(){const t=window.PC_TAROT;if(!t)throw new Error("Tarot data did not load.");data.cards=t.cards;data.positions=t.positions;data.spread=t.positions.map((p,i)=>({position:i+1,label:p.label,meaning:p.meaning,card:"",orientation:"upright",note:""}));load();if(data.spread.length!==10)data.spread=t.positions.map((p,i)=>({position:i+1,label:p.label,meaning:p.meaning,card:"",orientation:"upright",note:""}));renderSpread();initTheme();initEvents();showStep(data.step||0);if(data.seed)$("spreadStatus").textContent="Saved spread · seed "+data.seed;else $("spreadStatus").textContent="The spread is waiting to be drawn."}
init().catch(e=>{console.error(e);$("spreadStatus").textContent="Could not load tarot data. Open this site through GitHub Pages or a local static server."});
})();