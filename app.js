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
  ["carousel_prompts","Carousel Prompts","12–20 short character-specific behavioral texture lines. One line is injected per response."],
  ["custom_code","Custom Code","Executable JavaScript, not prose. Persona Crucis stamps the Soul Engine after SOUL_CONFIG; review it before enabling after import."]
];
let data={cards:[],positions:[],spread:[],step:0,promptKind:"concept",seed:"",soulConfig:null,soulConfigRaw:"",relationshipTrack:"open",startingFamiliarity:"acquaintances",nativeCardExtras:{},card:{display_name:"",description:"",writing_style:"",personality:"",greeting:"",alternate_greetings:[],starting_lore:"",lore_prompt:"",storybook:"",carousel_prompts:[],custom_code:""},sourceText:"",directionResponse:"",directionOptions:[],selectedDirectionIndex:-1,directionNotes:"",memoryFiles:[],gobboSettings:{loreEnabled:true,loreCustomPrompt:true,altGreetingsEnabled:true,carouselEnabled:true,carouselMode:"random",ragWordsToFire:1,customCodeEnabled:false,thinkingEnabled:false},preferences:{nsfw:false,gender:"any",genderOther:"",communicationStyle:"text"}};
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
 data.relationshipTrack=$("relationshipTrack")?.value||data.relationshipTrack||"open";data.startingFamiliarity=$("startingFamiliarity")?.value||data.startingFamiliarity||"acquaintances";data.soulConfigRaw=$("soulConfigOutput")?.value||data.soulConfigRaw||"";
 data.preferences={nsfw:$("nsfwToggle").checked,gender:$("genderPreference").value,genderOther:$("genderOther").value,communicationStyle:document.querySelector('input[name="communicationStyle"]:checked')?.value||"text"};
 data.gobboSettings=readGobboSettings();
 data.directionResponse=$("directionResponse").value;data.directionNotes=$("directionNotes").value;data.gobboOutput=$("gobboOutput").value;data.soulConfigRaw=$("soulConfigOutput")?.value||data.soulConfigRaw||"";data.brief=$("brief").value;data.readingOutput=$("readingOutput").value;data.characterOutput=$("characterOutput").value;data.characterName=$("characterName").value;data.rawImport=$("rawImport").value;data.exportName=$("exportName").value;
 const fields={...(data.fields||{})};cardFields.forEach(([k])=>{const e=$("field_"+k);if(e)fields[k]=e.value});data.fields=fields;
 try{localStorage.setItem(STORE,JSON.stringify(data))}catch(e){toast("Browser storage is full. Download a backup.")}
}
function load(){
 try{
  const saved=JSON.parse(localStorage.getItem(STORE)||"null");
  if(saved){
   data={...data,...saved};
   data.gobboSettings={...data.gobboSettings,...(saved.gobboSettings||{})};
   $("relationshipTrack").value=data.relationshipTrack||"open";$("startingFamiliarity").value=data.startingFamiliarity||"acquaintances";$("soulConfigOutput").value=data.soulConfigRaw||"";$("seedInput").value=data.seed||"";$("brief").value=data.brief||"";$("readingOutput").value=data.readingOutput||"";$("characterOutput").value=data.characterOutput||"";$("gobboOutput").value=data.gobboOutput||"";$("directionResponse").value=data.directionResponse||"";$("directionNotes").value=data.directionNotes||"";$("characterName").value=data.characterName||"";$("rawImport").value=data.rawImport||"";$("exportName").value=data.exportName||"";
   const p=data.preferences||{};$("nsfwToggle").checked=!!p.nsfw;$("genderPreference").value=p.gender||"any";$("genderOther").value=p.genderOther||"";$("genderOther").hidden=$("genderPreference").value!=="other";const g=data.gobboSettings||{};$("loreEnabled").checked=g.loreEnabled!==false;$("loreCustomPrompt").checked=g.loreCustomPrompt!==false;$("altGreetingsEnabled").checked=g.altGreetingsEnabled!==false;$("carouselEnabled").checked=g.carouselEnabled!==false;$("carouselMode").value=g.carouselMode||"random";$("ragWordsToFire").value=String(g.ragWordsToFire||1);$("customCodeEnabled").checked=!!g.customCodeEnabled;$("thinkingEnabled").checked=!!g.thinkingEnabled;
   const style=p.communicationStyle||"text";const radio=document.querySelector('input[name="communicationStyle"][value="'+style+'"]');if(radio)radio.checked=true;$("nsfwLabel").textContent=p.nsfw?"On · NSFW permitted":"Off · SFW";
  }
 }catch(e){}
}
function seededRandom(seed){let h=2166136261;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function invalidateSoulConfig(){
 data.soulConfig=null;data.soulConfigRaw="";
 const out=$("soulConfigOutput");if(out)out.value="";
 const box=$("soulValidation");if(box){box.className="validation";box.innerHTML="<strong>Card or spread changed.</strong><span>Generate a fresh Soul Config from the updated card and spread.</span>"}
}

function draw(){invalidateSoulConfig();const seed=$("seedInput")?.value.trim()||Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);data.seed=seed;if($("seedInput"))$("seedInput").value=seed;const rand=seededRandom(seed);const pool=[...data.cards];data.spread=data.positions.map((p,i)=>{const ix=Math.floor(rand()*pool.length);const card=pool.splice(ix,1)[0];return{position:i+1,label:p.label,meaning:p.meaning,card,orientation:rand()>.5?"upright":"reversed",note:""}});data.seed=seed;renderSpread();$("spreadStatus").textContent="Ten unique cards drawn. Seed: "+seed;save();toast("The spread has been drawn.")}
function renderSpread(){const grid=$("spreadGrid");grid.innerHTML=data.positions.map((p,i)=>{const s=data.spread[i]||{card:"",orientation:"upright",note:""};return `<article class="spread-card"><div class="spread-num">${String(i+1).padStart(2,"0")}</div><div><h4>${escapeHtml(p.label)}</h4><p>${escapeHtml(p.meaning)}</p><div class="spread-controls"><select data-card="${i}" aria-label="Card for ${escapeHtml(p.label)}"><option value="">Choose a card</option>${data.cards.map(c=>`<option ${c===s.card?"selected":""}>${escapeHtml(c)}</option>`).join("")}</select><select data-orientation="${i}" aria-label="Orientation"><option value="upright" ${s.orientation==="upright"?"selected":""}>Upright</option><option value="reversed" ${s.orientation==="reversed"?"selected":""}>Reversed</option></select></div></div><textarea data-note="${i}" placeholder="Reader's note (optional)" aria-label="Reader note">${escapeHtml(s.note||"")}</textarea></article>`}).join("");grid.querySelectorAll("[data-card]").forEach(e=>e.addEventListener("change",()=>{data.spread[+e.dataset.card].card=e.value;invalidateSoulConfig();save()}));grid.querySelectorAll("[data-orientation]").forEach(e=>e.addEventListener("change",()=>{data.spread[+e.dataset.orientation].orientation=e.value;invalidateSoulConfig();save()}));grid.querySelectorAll("[data-note]").forEach(e=>e.addEventListener("input",()=>{data.spread[+e.dataset.note].note=e.value;invalidateSoulConfig();save()}))}
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
"Relationship track: "+(data.relationshipTrack||"open")+". Starting familiarity: "+(data.startingFamiliarity||"acquaintances")+". These are explicit author choices, never tarot-derived.",
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
 "Convert the completed Character Bible into a complete GobboNet character card. Treat the Bible and spread as the sole sources of character facts. This is the first generation stage after the Bible; soulConfig is generated separately afterward from this finished card plus the spread.",
 "",
 "CHARACTER BIBLE:",
 $("characterOutput").value||"[Paste the complete Character Bible here.]",
 "",
 "TAROT SPREAD / PROVENANCE:",
 spreadText(),
 "",
 "AUTHOR PREFERENCES:",
 preferenceText(),
 "",
 "Return one strict JSON object containing the complete GobboNet native card field set listed below. This is card generation stage one. soulConfig is generated in the separate second stage. Do not add an _import marker or any unsupported keys.",
 "",
 "CARD CONTENT RULES:",
 "- name: established character name. id must be its lowercase hyphenated slug. avatar must be the exact placeholder string APP_GENERATES_JPEG_AVATAR; the application replaces it with a data:image/jpeg;base64 URI. Never invent base64.",
 "- writingStyle: max 700 tokens. Use sections VOICE, CHARACTER, DISAGREEMENT, EXAMPLE EXCHANGES, INTEGRITY. Include exactly five short example exchanges. At least two exchanges must show genuine warmth or play, not only competence, advice, or guarded banter. Immediately under EXAMPLE EXCHANGES add this exact rule:",
 "Examples show tone only. Never repeat them or write a speaker label.",
 "- writingStyle vulnerability rule: Include one concise, explicit one-line rule for how the character responds when the user is vulnerable: acknowledge and listen before offering advice or trying to fix anything; offer company or space without pressure. Include up to four short integrity rules: never invent user statements/shared history; no invented real-world factual references; reply text only; do not discuss setup unless asked. Do not put memory, scripts, scores, or relationship mechanics here. Across writingStyle and personality combined, use each of the words \"practical\", \"useful\", and \"functional\" no more than twice; prefer varied, character-specific language over adjective repetition.",
 "- personality: max 100 words, compact stable identity and temperament only. Do not restate the writingStyle or recycle its signature adjectives.",
 "- greeting plus 3–5 altGreetings, respecting the chosen starting familiarity and relationship track. altGreetingsEnabled is true.",
 "- lorePrompt: conversation-compression instructions only, templated with the exact character name and {{user}}. Preserve user-confirmed facts and the character's own fictional continuity separately. It is not an ordinary-turn system prompt.",
 "- ragStorybook: exactly 20 self-contained retrieval topics, each formatted as '# --- NAME: topic ---' then 'name_topic_tags: tag [1.0], tag, tag' then plain prose paragraphs. Cover family; work; appearance; temperament and contradictions; values and conflict; interests and ordinary life; relationship baseline with user; conversation rules; tools and work surfaces; current repairs or concrete open threads; food and kitchen habits; home and domestic details; plants or outdoor space; sensory environment; each major non-work interest as its own topic; personal organisation; rest and solitude; help, dependence and trust; and social boundaries. Split broad topics where necessary so the final count is exactly 20. Keep every entry retrieval-sized, fact-grounded, and internally consistent. Do not invent specific relatives, addresses, named venues, schedules, possessions, credentials, or events to pad the count. Unknown details remain unknown. Put detailed reference here, not in always-on Writing Style or Personality.",
 "- startingLore: empty string. loreEnabled true, loreCustomPrompt true, loreModelFile empty string. memoryFiles is an empty array.",
 "- carouselPrompts: 12–20 lines, one per line. Every line uses the same frame 'This turn, ...'. Each is a behavioral texture only: texting rhythm, verbal habit, or small physical habit. No emotions, no mood references, no topic obsessions, no contradictions. Max 20 words per line. Distinct and character-specific. At least three lines must deliberately redirect away from the character’s dominant trait or habitual conversational mode toward unrelated curiosity, play, sensory attention, personal taste, or ordinary leisure. None of the carousel lines may mention the character’s occupation, workplace, work, jobs, tasks, duties, productivity, or getting things done.",
 "- factPriorities are not part of the card; they are generated in the second-stage soulConfig and must be character-specific.",
 "- background, textColor, dialogColor: three distinct, accessible hex colors suited to this character's own presentation, not the site's visual theme.\n- Use exactly these sampling and behavior defaults: temperature 0.82, minP 0.06, topK 40, topP 0.92, repeatPenalty 1.08, repeatLastN 64, xtcProbability 0, xtcThreshold 0.1, dryMultiplier 0, bannedPhrases empty, customCode empty, customCodeEnabled true, contextLimit 0, smartLimitEnabled false, smartLimitTokens 300, thinkingEnabled false, contextInputPercent/contextReplyPercent/contextLandPercent/contextKeepPercent null, logitBiasStrength -20, carouselEnabled true, carouselMode random. The application stamps the actual customCode engine wrapper during export.",
 "- Do not copy any source-card import marker. Do not invent real-world people, books, brands, institutions, citations, or user history.",
 "",
 "Return JSON only, no Markdown fences or commentary, using exactly these content fields:",
 '{"name":"","id":"","avatar":"APP_GENERATES_JPEG_AVATAR","writingStyle":"","personality":"","loreEnabled":true,"loreModelFile":"","loreCustomPrompt":true,"lorePrompt":"","startingLore":"","ragStorybook":"","memoryFiles":[],"greeting":"","altGreetingsEnabled":true,"altGreetings":[],"background":"#000000","textColor":"#ffffff","dialogColor":"#888888","temperature":0.82,"minP":0.06,"topK":40,"topP":0.92,"repeatPenalty":1.08,"repeatLastN":64,"xtcProbability":0,"xtcThreshold":0.1,"dryMultiplier":0,"bannedPhrases":"","customCode":"","customCodeEnabled":true,"contextLimit":0,"smartLimitEnabled":false,"smartLimitTokens":300,"thinkingEnabled":false,"contextInputPercent":null,"contextReplyPercent":null,"contextLandPercent":null,"contextKeepPercent":null,"logitBiasStrength":-20,"carouselEnabled":true,"carouselMode":"random","carouselPrompts":""}',
 ].join("\n");
}function selectedDirectionText(){const d=data.directionOptions?.[data.selectedDirectionIndex];return d?d.title+"\n"+d.direction:""}
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
 wrap.querySelectorAll("textarea").forEach(e=>e.addEventListener("input",()=>{invalidateSoulConfig();save();updateContextEstimate()}));
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
 if(Math.ceil(c.writing_style.length/4)>700)issues.push("Writing Style exceeds the approximate 700-token limit.");
 if(c.personality.split(/\s+/).filter(Boolean).length>100)issues.push("Personality exceeds 100 words.");
 const storyEntries=c.storybook.split(/^# --- /m).slice(1);
 if(storyEntries.length!==8)issues.push("RAG Storybook must contain exactly eight topic entries.");
 storyEntries.forEach((entry,i)=>{const lines=entry.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(!lines[0]||!lines[0].endsWith(" ---"))issues.push("RAG Storybook entry "+(i+1)+" has an invalid heading.");if(!lines[1]||!/^[a-z0-9_]+_tags:\s*.+$/i.test(lines[1]))issues.push("RAG Storybook entry "+(i+1)+" is missing its weighted tag line.");if(lines.length<3)issues.push("RAG Storybook entry "+(i+1)+" needs plain prose.");});
 const colors=data.nativeCardExtras||{};
 ["background","textColor","dialogColor"].forEach(k=>{if(typeof colors[k]!=="string"||!/^#[0-9a-f]{6}$/i.test(colors[k]))issues.push("Missing valid character-specific hex color: "+k+".")});

 if(settings.loreCustomPrompt&&!c.lore_prompt)issues.push("Custom Lore Summary Prompt is enabled but its text box is empty.");
 if(settings.altGreetingsEnabled&&(c.alternate_greetings.length<3||c.alternate_greetings.length>5))issues.push("Alternative Greetings must contain 3–5 openings.");
 if(settings.carouselEnabled&&!c.carousel_prompts.length)issues.push("Carousel is enabled but no prompt lines are present.");
 if(c.carousel_prompts.length<12||c.carousel_prompts.length>20)issues.push("Carousel must contain 12–20 behavioral texture lines.");
 c.carousel_prompts.forEach((line,i)=>{if(line&&!line.startsWith("This turn, "))issues.push("Carousel line "+(i+1)+" must begin “This turn, ”.");if(line.trim().split(/\s+/).length>20)issues.push("Carousel line "+(i+1)+" exceeds 20 words.")});
 if(settings.customCodeEnabled&&!c.custom_code)issues.push("Custom Code is enabled but the code field is empty.");
 const overlap=wordSimilarity(c.writing_style,c.personality);
 if(overlap>0.78)warnings.push("Writing Style and Personality are unusually similar. Separate operational instructions from identity and temperament before export.");
 const sameParagraphs=(a,b)=>{
  const aa=String(a||"").split(/\n\s*\n/).map(x=>x.trim().toLowerCase().replace(/\s+/g," ")).filter(x=>x.length>50);
  const bb=new Set(String(b||"").split(/\n\s*\n/).map(x=>x.trim().toLowerCase().replace(/\s+/g," ")).filter(x=>x.length>50));
  return aa.filter(x=>bb.has(x)).length;
 };
 const duplicatePairs=[["Writing Style","Personality",c.writing_style,c.personality],["Writing Style","RAG Storybook",c.writing_style,c.storybook],["Personality","RAG Storybook",c.personality,c.storybook],["Starting Lore","RAG Storybook",c.starting_lore,c.storybook]];
 duplicatePairs.forEach(pair=>{if(sameParagraphs(pair[2],pair[3])||sameParagraphs(pair[3],pair[2]))warnings.push(pair[0]+" repeats one or more substantial paragraphs in "+pair[1]+". Give each fact one primary home and remove copied blocks.");});
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
 invalidateSoulConfig();data.nativeCardExtras={};data.sourceText=raw;let obj=null;try{obj=JSON.parse(raw)}catch(e){}
 const parsed=obj!==null;let src=obj;
 if(src&&typeof src==="object"&&Array.isArray(src.characterCards))src=src.characterCards[0]||{};
 if(src&&typeof src==="object"&&src.card)src=src.card;
 if(src&&typeof src==="object"&&src.gobbonet_character)src=src.gobbonet_character;
 if(src&&typeof src==="object"&&src.character_card)src=src.character_card;
 if(src&&typeof src==="object"&&src.data&&typeof src.data==="object")src=src.data;
 if(src&&typeof src==="object"&&src.extensions&&src.extensions.gobbonet&&src.extensions.gobbonet.card&&typeof src.extensions.gobbonet.card==="object")src=src.extensions.gobbonet.card;
 if(src&&typeof src==="object"&&src.character_bible)src=src.character_bible;
 else if(src&&typeof src==="object"&&src.character&&src.character.identity)src=src.character;
 const isObject=src&&typeof src==="object"&&!Array.isArray(src),pick=(o,...keys)=>{for(const k of keys)if(o&&typeof o[k]==="string"&&o[k].trim())return o[k];return""};
 const ext=isObject&&src.extensions&&src.extensions.gobbonet?src.extensions.gobbonet:{};
 const isGobboNative=isObject&&["writingStyle","writing_style","startingLore","starting_lore","ragStorybook","storybook","lorePrompt","lore_prompt","carouselPrompts","carousel_prompts","customCode","custom_code"].some(k=>Object.prototype.hasOwnProperty.call(src,k));
 const next={display_name:"",description:"",writing_style:"",personality:"",greeting:"",alternate_greetings:[],starting_lore:"",lore_prompt:"",storybook:"",carousel_prompts:[],custom_code:""};
 let settings={loreEnabled:true,loreCustomPrompt:false,altGreetingsEnabled:false,carouselEnabled:false,carouselMode:"random",ragWordsToFire:1,customCodeEnabled:false,thinkingEnabled:false},memoryFiles=[];
 if(isGobboNative){
  data.nativeCardExtras={background:src.background,textColor:src.textColor,dialogColor:src.dialogColor};
  next.display_name=pick(src,"name","display_name");next.description=pick(src,"desc","description");
  next.writing_style=pick(src,"writingStyle","writing_style");next.personality=pick(src,"personality");next.greeting=pick(src,"greeting","first_mes");
  next.alternate_greetings=alternateGreetingArray(src.altGreetings||src.alternate_greetings);next.starting_lore=pick(src,"startingLore","starting_lore");
  next.lore_prompt=pick(src,"lorePrompt","lore_prompt")||pick(ext,"lorePrompt");next.storybook=pick(src,"ragStorybook","storybook")||pick(ext,"ragStorybook");
  const cp=src.carouselPrompts??src.carousel_prompts;next.carousel_prompts=Array.isArray(cp)?cp.map(String):typeof cp==="string"?cp.split("\n").map(x=>x.trim()).filter(Boolean):[];
  next.custom_code=pick(src,"customCode","custom_code")||pick(ext,"customCode");
  settings.loreEnabled=src.loreEnabled!==false;settings.loreCustomPrompt=typeof src.loreCustomPrompt==="boolean"?src.loreCustomPrompt:!!next.lore_prompt;
  settings.altGreetingsEnabled=typeof src.altGreetingsEnabled==="boolean"?src.altGreetingsEnabled:next.alternate_greetings.length>0;
  settings.carouselEnabled=!!src.carouselEnabled;settings.carouselMode=src.carouselMode==="sequential"?"sequential":"random";
  settings.ragWordsToFire=Number(src.ragWordsToFire||ext.ragWordsToFire||1);settings.thinkingEnabled=!!src.thinkingEnabled;
  memoryFiles=Array.isArray(src.memoryFiles)?src.memoryFiles:(Array.isArray(ext.memoryFiles)?ext.memoryFiles:[]);
 }else if(isObject&&(["name","description","personality","first_mes","system_prompt","scenario","mes_example","character_book"].some(k=>Object.prototype.hasOwnProperty.call(src,k)))){
  next.display_name=pick(src,"name","nickname");next.description=pick(src,"creator_notes");
  next.writing_style=[pick(src,"system_prompt"),pick(src,"post_history_instructions")].filter(Boolean).join("\n\n");
  next.personality=pick(src,"personality");next.greeting=pick(src,"first_mes");next.alternate_greetings=alternateGreetingArray(src.alternate_greetings||src.group_only_greetings);
  next.starting_lore=pick(src,"scenario");const parts=[],extStory=pick(ext,"ragStorybook");if(extStory)parts.push(extStory);
  const description=pick(src,"description");if(description)parts.push("# Character Description\n\n"+description);
  const examples=pick(src,"mes_example");if(examples)parts.push("# Example Dialogue\n\n"+examples);
  const book=src.character_book;if(book&&Array.isArray(book.entries)){const entries=book.entries.filter(e=>e&&e.enabled!==false&&typeof e.content==="string"&&e.content.trim());if(entries.length)parts.push("# Imported Character Book\n\n"+entries.map(e=>{const keys=Array.isArray(e.keys)?e.keys.filter(Boolean):[];const title=(e.name||e.comment||keys.join(", ")||"Lore entry").trim();return "# "+title+(keys.length?", ["+keys.join(", ")+"]":"")+"\n\n"+e.content.trim()}).join("\n\n"))}
  next.storybook=parts.join("\n\n");next.lore_prompt=pick(ext,"lorePrompt");next.custom_code=pick(ext,"customCode");
  const cp=pick(ext,"carouselPrompts");next.carousel_prompts=cp?cp.split("\n").map(x=>x.trim()).filter(Boolean):[];
  memoryFiles=Array.isArray(ext.memoryFiles)?ext.memoryFiles:[];settings.loreEnabled=true;settings.loreCustomPrompt=!!next.lore_prompt;settings.altGreetingsEnabled=next.alternate_greetings.length>0;settings.carouselEnabled=false;settings.customCodeEnabled=false;
 }else if(!parsed)next.storybook="Imported source dossier:\n\n"+raw;
 else if(isObject){next.display_name=pick(src,"name","display_name");next.storybook=JSON.stringify(src,null,2)}
 else next.storybook=String(src??raw);
 if(!next.display_name)next.display_name=data.card.display_name||"";
 data.card={...data.card,...next};data.gobboSettings={...settings,customCodeEnabled:false};data.memoryFiles=memoryFiles;data.fields={};
 if(data.card.display_name)data.characterName=data.card.display_name;
 $("characterName").value=data.characterName||"";$("exportName").value=data.card.display_name||data.characterName||"";
 renderFields();validateCard();save();
 toast(isGobboNative?"GobboNet-native fields mapped. Generate the Soul Config from this completed card next.":"Source material mapped conservatively. Descriptive material was kept in Storybook.");
}function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function maraLorePromptTemplate(name){
 return ("Create one new continuity entry from the newest conversation messages only.\n\nRecord the most important concrete detail likely to matter later: a user-stated preference, decision, plan, date, time, place, promise, ongoing project, meaningful shared event, or explicit relationship change.\n\nRules:\n- Write one complete sentence in the past tense, under 20 words.\n- Prioritise facts explicitly stated by {{user}} and concrete shared events.\n- Distinguish a suggestion, an accepted proposal, a fully confirmed arrangement, and a completed event. Do not upgrade one status into another.\n- A user's general acceptance of a day or time period does not establish a venue or exact time. Record only the logistics explicitly agreed in the messages.\n- If a venue, date, or exact time was not explicitly established, leave it out. Never supply a plausible missing detail.\n- Use only details present in the messages. Do not invent, infer, embellish, or resolve ambiguity.\n- Do not record "+name+"'s biography, personality, family history, work, interests, improvised anecdotes, or unsupported claims about herself.\n- Do not attribute "+name+"'s preferences, experiences, or opinions to {{user}}.\n- Do not infer expertise, motives, commitments, romantic interest, or consent.\n- Do not record ordinary banter, greetings, generic compliments, transient moods, or a vague description of the conversation's theme.\n- Do not repeat information already present in the existing summary.\n- Do not use headings, labels, Markdown, bullets, quotation marks, or commentary.\n- If no concrete new information is worth retaining, output exactly: SKIP\n\nExample: if "+name+" suggests meeting and {{user}} accepts the general plan without agreeing to a venue or exact time, record only the agreed arrangement.\n\nOutput the sentence alone.");
}

function exportCard(){
 const result=validateCard();if(result.issues.length){toast("Resolve required fields before export.");return}
 const soulResult=parseSoulConfig();if(!soulResult.valid){$("soulValidation").textContent=soulResult.errors.join(" · ");$("soulValidation").className="validation invalid";toast("A valid Soul Config is required before export.");return}
 const card=result.card,soul=soulResult.config;data.soulConfig=soul;data.soulConfigRaw=$("soulConfigOutput").value;save();
 const slug=card.display_name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"unnamed-character";
 const colors=data.nativeCardExtras||{};
 const avatar="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AT//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Ap//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IT//2Q==";
 const lorePrompt=maraLorePromptTemplate(card.display_name||"the character");
 if(!window.PC_SOUL_ENGINE_SOURCE||!window.PC_SOUL_ENGINE_SOURCE.includes("soul-engine v1")){toast("Soul Engine source did not load. Use the hosted site or serve the project over HTTP before exporting.");return}
 const engine=window.PC_SOUL_ENGINE_SOURCE.trim();
 const customCode="/* SOUL_CONFIG_START */\nvar SOUL_CONFIG = "+JSON.stringify(soul,null,2)+";\n/* SOUL_CONFIG_END */\n\n"+engine+"\n";
 const gobbo={
  name:card.display_name||"Unnamed",id:slug,avatar,writingStyle:card.writing_style,personality:card.personality,
  loreEnabled:true,loreModelFile:"",loreCustomPrompt:true,lorePrompt,startingLore:"",
  ragStorybook:card.storybook,memoryFiles:[],greeting:card.greeting,altGreetingsEnabled:true,
  altGreetings:card.alternate_greetings.join("\n\n"),
  background:colors.background||"#292722",textColor:colors.textColor||"#e9e4d9",dialogColor:colors.dialogColor||"#b9aa8b",
  temperature:0.82,minP:0.06,topK:40,topP:0.92,repeatPenalty:1.08,repeatLastN:64,
  xtcProbability:0,xtcThreshold:0.1,dryMultiplier:0,bannedPhrases:"",
  customCode,customCodeEnabled:true,contextLimit:0,smartLimitEnabled:false,smartLimitTokens:300,
  thinkingEnabled:false,contextInputPercent:null,contextReplyPercent:null,contextLandPercent:null,contextKeepPercent:null,
  logitBiasStrength:-20,carouselEnabled:true,carouselMode:"random",carouselPrompts:card.carousel_prompts.join("\n"),ragWordsToFire:1
 };
 const v3={
  spec:"chara_card_v3",spec_version:"3.0",
  data:{
   name:gobbo.name,description:gobbo.writingStyle,personality:gobbo.personality,scenario:"",
   first_mes:gobbo.greeting,mes_example:"",creator_notes:"Generated with Persona Crucis.",
   system_prompt:"",post_history_instructions:"",alternate_greetings:card.alternate_greetings,
   tags:["Persona Crucis"],creator:"Persona Crucis",character_version:"1.0",
   avatar:gobbo.avatar,id:gobbo.id,
   extensions:{gobbonet:{...(({writingStyle,personality,...rest})=>rest)(gobbo),seed:data.seed,soulConfig:soul}},
   group_only_greetings:[],assets:[{type:"icon",uri:"ccdefault:",name:"main",ext:"png"}],
   creation_date:Date.now(),modification_date:Date.now()
  }
 };
 download("PersonaCrucis_"+slug+"_GobboNet.json",JSON.stringify(v3,null,2),"application/json");
 const manualKeys=["background","textColor","dialogColor","temperature","minP","topK","topP","repeatPenalty","repeatLastN","xtcProbability","xtcThreshold","dryMultiplier","bannedPhrases","loreEnabled","loreModelFile","loreCustomPrompt","altGreetingsEnabled","carouselEnabled","carouselMode","carouselPrompts","ragWordsToFire","customCodeEnabled","contextLimit","smartLimitEnabled","smartLimitTokens","thinkingEnabled","contextInputPercent","contextReplyPercent","contextLandPercent","contextKeepPercent","logitBiasStrength"];
 const manualSettings=manualKeys.map(k=>k+": "+JSON.stringify(gobbo[k])).join("\n");
 download("PersonaCrucis_"+slug+"_Field_Sheet_and_Source.txt",["PERSONA CRUCIS — GOBBONET FIELD SHEET","",...cardFields.map(([k,label])=>label+"\n"+(k==="custom_code"?customCode:k==="lore_prompt"?lorePrompt:typeof card[k]==="string"?card[k]:Array.isArray(card[k])?card[k].join("\n\n"):"")),"","GOBBONET SETTINGS — APPLY MANUALLY WHERE THE CURRENT IMPORTER DOES NOT RESTORE THEM","The Character Card V3 JSON is importable. GobboNet currently ignores several native settings in JSON extensions. Custom Code is always imported disabled; enable it manually after review.","",manualSettings,"","SOUL CONFIG",JSON.stringify(soul,null,2),"","ORIGINAL SOURCE",data.sourceText||""].join("\n\n"),"text/plain");
 $("customCodeReminder").hidden=false;
 toast("GobboNet V3 card exported. Import it, then enable Custom Code manually.");
}
function initTheme(){const saved=localStorage.getItem("persona-crucis-theme");const theme=saved==="dark"?"dark":"light";document.documentElement.dataset.theme=theme;const btn=$("themeToggle");const sync=()=>{const dark=document.documentElement.dataset.theme==="dark";btn.setAttribute("aria-pressed",String(dark));btn.setAttribute("aria-label",dark?"Switch to light mode":"Switch to dark mode");btn.querySelector(".theme-icon").textContent=dark?"☀":"☾";btn.querySelector(".theme-label").textContent=dark?"Light mode":"Dark mode"};sync();btn.addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;localStorage.setItem("persona-crucis-theme",next);sync()})}
function soulPrompt(){
 const c=readCard(),name=c.display_name||$("exportName").value.trim()||"the character";
 const spread=data.spread.map((s,i)=>({position:i+1,label:s.label,meaning:s.meaning,card:s.card,orientation:s.orientation,readerNote:s.note||""}));
 const mapping=[
 "1 Significator / Present: foundational identity, active demeanor, daily-life tone → coreIdentity and stances.",
 "2 Challenge / Fatal Flaw: recurring vice, paradox, friction → coreIdentity, stances, and cooling/irritating triggers.",
 "3 Foundation / Childhood Root: formative background and emotional programming → coreIdentity, selfFacts, diaryVoice.",
 "4 Recent Past: receding event or influence → openThreads and selfFacts.",
 "5 Crown / Aspiration: conscious ideal and moral compass → stances and privateAgenda.wants.",
 "6 Immediate Future: emerging encounter or scenario backdrop → openThreads and closenessPace.",
 "7 Self / Internal Stance: private self-perception → coreIdentity, baseline mood, diaryVoice.",
 "8 Environment / Social Stance: family, work, social setting, external expectations → stances, triggers, selfFacts.",
 "9 Hopes & Fears / Hidden Soft Spot: tenderness, desire, defensive fear → triggers, mood, privateAgenda.",
 "10 Outcome / Culmination: likely long-term transformation, not fate → stages, closenessPace, privateAgenda."
 ].join("\n");
 return "Generate the second-stage soulConfig for this already-finished character card. Do not rewrite the card. Return strict JSON only.\n\nFINISHED GOBBONET CARD:\n"+JSON.stringify({name,writingStyle:c.writing_style,personality:c.personality,greeting:c.greeting,altGreetings:c.alternate_greetings,ragStorybook:c.storybook,carouselPrompts:c.carousel_prompts},null,2)+"\n\nTAROT SPREAD:\n"+JSON.stringify(spread,null,2)+"\n\nPOSITION MAPPING (preserve ArcanaPersona's meanings):\n"+mapping+"\n\nAUTHOR-CHOSEN RELATIONSHIP SETTINGS:\nrelationshipTrack="+data.relationshipTrack+"\nstartingFamiliarity="+data.startingFamiliarity+"\nThese two values are author inputs, not tarot-derived. closenessPace is tarot-derived. The ten position labels and meanings above are the original ArcanaPersona definitions, not a generic Celtic Cross substitution.\n\nSEED: "+(data.seed||"missing seed")+"\n\nRULES:\n- Exactly two tiers: FROZEN coreIdentity + seeded stances; TEMPORARY mood. Do not add opinion ledgers, commitments, HUD/state tags, topic files, or proactive-texting fields.\n- Every coreIdentity contains a real internal contradiction. Create 4–8 stances, at least two that can disagree with a typical user.\n- Use 5 stages at minCloseness 0,20,40,60,80.\n- mood vocabulary has 8–12 labels; each expression describes how that emotion appears in texting. Every softensTo chain terminates at the literal token baseline, with no cycles. mood.baseline must be a vocabulary label.\n- 6–10 triggers; every trigger.emotion is a vocabulary label.\n- 8–14 concrete, mundane selfFacts about the character only. No real-world named entities, books, brands, public figures, citations, or institutions.\n- 0–4 openThreads. Every thread must identify a specific concrete referent (named object, person, or place) and state its actual progress or current status. No vague placeholders or hypothetical future events. privateAgenda has secret, wants, avoids. diaryVoice max 40 words. factPriorities 4–8 highly specific categories of user information this particular character notices, not generic boilerplate.\n- closenessPace slow|normal|fast. relationshipTrack and startingFamiliarity must exactly preserve the author choices above.\n- Provenance has the exact seed, generatorVersion, and ten spread records. Use each spread entry’s exact position label in position, its exact card name, reversed=true only when orientation is reversed, and an explicit fedFields array.\n- Reversed/buried cards feed ONLY privateAgenda and diaryVoice. This rule overrides every upright position mapping. For every reversed position, fedFields may contain only privateAgenda and diaryVoice. Never let reversed cards influence coreIdentity, stances, mood, triggers, stages, selfFacts, openThreads, or closenessPace.\n- Use the existing position meanings above. If a position has no mapping, use the ordinary Celtic Cross meaning only as fallback.\n- No Markdown, no commentary, no extra keys. Keep every string within the supplied schema word limits.\n\nJSON schema: {schemaVersion:1,name,voiceSummary,screenName?,relationshipTrack,startingFamiliarity,closenessPace,coreIdentity:[3-5 strings max 20 words],stances:[4-8 {topic,stance,why,firmness:soft|firm}],stages:[exactly 5 {name,minCloseness,behavior max 30 words,opens max 20 words}],mood:{baseline,volatility:1-5,decay:slow|normal|fast,vocabulary:[8-12 {label,expression max 15 words,softensTo: vocabulary label or baseline}]},triggers:[6-10 {when,effect:warms|cools|irritates|delights|unsettles,emotion}],selfFacts:[8-14 strings max 20 words],openThreads:[0-4 strings],privateAgenda:{secret,wants,avoids max 30 words each},diaryVoice max 40 words,factPriorities:[4-8 strings max 12 words],provenance:{seed,generatorVersion,spread:[10 {position,card,reversed,fedFields}]}}";
}
function parseSoulConfig(){
 let raw=$("soulConfigOutput").value.trim();if(!raw)return{valid:false,errors:["Paste the second-stage soulConfig JSON first."]};
 raw=raw.replace(/^\x60{3}(?:json)?\s*/i,"").replace(/\s*\x60{3}$/,"");
 let config;try{config=JSON.parse(raw)}catch(e){return{valid:false,errors:["Invalid JSON: "+e.message]}};
 const check=window.PCSoul?.validateSoulConfig(config)||{valid:false,errors:["Soul validator did not load."]};
 if(config.name!==readCard().display_name)check.errors.push("soulConfig.name does not match the completed card name.");
 if(config.relationshipTrack!==data.relationshipTrack)check.errors.push("relationshipTrack does not match the author-selected UI value.");
 if(config.startingFamiliarity!==data.startingFamiliarity)check.errors.push("startingFamiliarity does not match the author-selected UI value.");
 if(String(config.provenance?.seed)!==String(data.seed))check.errors.push("provenance.seed does not match the saved spread seed.");
 if(Array.isArray(config.provenance?.spread))data.spread.forEach((s,i)=>{const p=config.provenance.spread[i];if(!p||p.card!==s.card)check.errors.push("provenance.spread["+i+"].card does not match the current spread.");if(!p||p.reversed!==(s.orientation==="reversed"))check.errors.push("provenance.spread["+i+"].reversed does not match the current spread.");if(p&&p.position!==s.label)check.errors.push("provenance.spread["+i+"].position does not match the current ArcanaPersona position.");});
 return{...check,config};
}
function validateSoulConfigUI(){
 const result=parseSoulConfig(),box=$("soulValidation");
 box.className="validation "+(result.valid?"valid":"invalid");
 box.innerHTML=(result.valid?"<strong>Soul Config passed.</strong>":"<strong>Soul Config rejected.</strong>")+"<span>"+result.errors.map(escapeHtml).join(" · ")+"</span>";
 if(result.valid){data.soulConfig=result.config;data.soulConfigRaw=$("soulConfigOutput").value;save()}
 return result;
}

function initEvents(){ $("drawBtn").addEventListener("click",draw);$("newSeedBtn").addEventListener("click",()=>{$("seedInput").value="";draw()});$("clearSpreadBtn").addEventListener("click",()=>{invalidateSoulConfig();data.spread=data.positions.map((p,i)=>({position:i+1,label:p.label,meaning:p.meaning,card:"",orientation:"upright",note:""}));renderSpread();$("spreadStatus").textContent="Spread cleared.";save()});$("toInterpret").addEventListener("click",()=>{if(data.spread.some(s=>!s.card)){toast("Choose a card for all ten positions.");return}showStep(1)});$("toCharacter").addEventListener("click",()=>{if(!$("readingOutput").value.trim()){toast("Paste an interpretation first, or enter your own notes.");return}showStep(2)});$("toExport").addEventListener("click",()=>{if(!$("characterOutput").value.trim()&&!$("rawImport").value.trim()){toast("Add character material or import an existing Bible.");return}if(data.promptKind!=="gobbo"){toast("Open 03 · GobboNet fields and run the final conversion first.");setPromptKind("gobbo");return}const result=$("gobboOutput").value.trim();if(!result){toast("Paste the GobboNet JSON result into the separate box above.");return}let parsed;try{parsed=JSON.parse(result)}catch(e){toast("That result is not valid JSON. Ask the AI to return the JSON object only.");return}if(!parsed||typeof parsed!=="object"||Array.isArray(parsed)){toast("The result must be one JSON object.");return}$("rawImport").value=result;mapImported();showStep(3)});document.querySelectorAll(".step").forEach(b=>b.addEventListener("click",()=>{const n=+b.dataset.step;if(n===3){if(data.step!==2&&data.step!==3){setPromptKind("gobbo");showStep(2);toast("Run the GobboNet fields prompt here, then paste its JSON result below.");return}$("toExport").click();return}showStep(n)}));document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>showStep(+b.dataset.back)));document.querySelectorAll(".prompt-tab").forEach(b=>b.addEventListener("click",()=>setPromptKind(b.dataset.kind)));document.querySelectorAll(".copy-btn").forEach(b=>b.addEventListener("click",async()=>{const kind=b.dataset.prompt;const text=kind==="reading"?readingPrompt():kind==="concept"?conceptPrompt():kind==="bible"?biblePrompt():gobboPrompt();try{await navigator.clipboard.writeText(text);toast("Prompt copied. Paste it into your AI service.")}catch(e){const ta=document.createElement("textarea");ta.value=text;document.body.append(ta);ta.select();document.execCommand("copy");ta.remove();toast("Prompt copied.")}}));["brief","readingOutput","characterOutput","gobboOutput","characterName","rawImport","exportName","genderOther","directionResponse","directionNotes","soulConfigOutput"].forEach(id=>$(id).addEventListener("input",()=>{save();if(id==="directionNotes")updatePrompts()}));["relationshipTrack","startingFamiliarity"].forEach(id=>$(id).addEventListener("change",()=>{invalidateSoulConfig();save()}));$("nsfwToggle").addEventListener("change",()=>{$("nsfwLabel").textContent=$("nsfwToggle").checked?"On · NSFW permitted":"Off · SFW";save()});$("genderPreference").addEventListener("change",()=>{$("genderOther").hidden=$("genderPreference").value!=="other";save()});document.querySelectorAll('input[name="communicationStyle"]').forEach(e=>e.addEventListener("change",save));$("loadDirections").addEventListener("click",loadDirections);renderDirectionOptions();$("mapImport").addEventListener("click",mapImported);$("importFile").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;$("rawImport").value=await f.text();save();mapImported()});$("validateBtn").addEventListener("click",()=>{const r=validateCard();toast(r.issues.length?r.issues.length+" item(s) need attention.":"Card checks passed.")});$("downloadBtn").addEventListener("click",exportCard);$("copySoulPrompt").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(soulPrompt());toast("Soul Config prompt copied.")}catch(e){toast("Clipboard unavailable. Select and copy the prompt text.")}});$("validateSoulBtn").addEventListener("click",validateSoulConfigUI);document.querySelectorAll("[data-gobbo-setting]").forEach(e=>e.addEventListener("change",()=>{save();updateContextEstimate()}))}
async function loadSoulEngineSource(){
 try{const response=await fetch("soul-engine.js");if(!response.ok)throw new Error("Could not read soul-engine.js");const source=await response.text();if(!source.trim())throw new Error("soul-engine.js is empty");window.PC_SOUL_ENGINE_SOURCE=source.trim()}
 catch(e){window.PC_SOUL_ENGINE_SOURCE="";console.warn("Soul Engine source unavailable; export is disabled until the source can be loaded.",e)}
}
async function init(){await loadSoulEngineSource();const t=window.PC_TAROT;if(!t)throw new Error("Tarot data did not load.");data.cards=t.cards;data.positions=t.positions;data.spread=t.positions.map((p,i)=>({position:i+1,label:p.label,meaning:p.meaning,card:"",orientation:"upright",note:""}));load();if(data.spread.length!==10)data.spread=t.positions.map((p,i)=>({position:i+1,label:p.label,meaning:p.meaning,card:"",orientation:"upright",note:""}));renderSpread();initTheme();initEvents();showStep(data.step||0);if(data.seed)$("spreadStatus").textContent="Saved spread · seed "+data.seed;else $("spreadStatus").textContent="The spread is waiting to be drawn."}
init().catch(e=>{console.error(e);$("spreadStatus").textContent="Could not load tarot data. Open this site through GitHub Pages or a local static server."});
})()
