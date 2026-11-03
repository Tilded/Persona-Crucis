(() => {
"use strict";
const $ = id => document.getElementById(id);
const STORE = "persona-crucis-draft-v1";
const cardFields = [
  ["description","Short description","A compact sentence describing the character."],
  ["writing_style","Writing style","Voice, conversational format, factual integrity, agency, boundaries, and relationship pacing."],
  ["personality","Personality","Stable identity, temperament, values, and meaningful contradictions."],
  ["greeting","Greeting","The character's natural first message."],
  ["alternate_greetings","Alternate greetings","One greeting per line. Exported as an array."],
  ["starting_lore","Starting lore","Short always-on facts needed from the first turn."],
  ["lore_prompt","Lore prompt","Instructions for retrieving and compressing thread history without inventing facts."],
  ["storybook","Storybook","Detailed, retrieval-friendly character reference in Markdown."]
];
const carouselDefault = Array.from({length:8},(_,i)=>"This turn, keep the character's established voice and independent point of view.").join("\n");
let data={cards:[],positions:[],spread:[],step:0,promptKind:"concept",card:{display_name:"",description:"",writing_style:"",personality:"",greeting:"",alternate_greetings:[],starting_lore:"",lore_prompt:"",storybook:"",carousel_prompts:[]},sourceText:""};
let toastTimer;
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2400)}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function save(){data.brief=$("brief").value;data.readingOutput=$("readingOutput").value;data.characterOutput=$("characterOutput").value;data.characterName=$("characterName").value;data.rawImport=$("rawImport").value;data.exportName=$("exportName").value;data.fields={};cardFields.forEach(([k])=>{const e=$("field_"+k);if(e)data.fields[k]=e.value});try{localStorage.setItem(STORE,JSON.stringify(data))}catch(e){toast("Browser storage is full. Download a backup.")}}
function load(){try{const saved=JSON.parse(localStorage.getItem(STORE)||"null");if(saved){data={...data,...saved};$("brief").value=data.brief||"";$("readingOutput").value=data.readingOutput||"";$("characterOutput").value=data.characterOutput||"";$("characterName").value=data.characterName||"";$("rawImport").value=data.rawImport||"";$("exportName").value=data.exportName||""}}catch(e){}}
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
function conceptPrompt(){return `You are developing a fictional adult character from the following tarot interpretation. The cards are symbolic source material, not a diagnosis, fate, or personality checklist.

CREATIVE BRIEF:
${$("brief").value||"No additional brief supplied."}

TAROT INTERPRETATION:
${$("readingOutput").value||"[Paste the completed interpretation here before using this prompt.]"}

AUTHOR'S SELECTED DIRECTION / NOTES:
${$("characterOutput").value||"[Add the selected direction or notes here.]"}

Create a coherent adult person with a specific life: biography, material circumstances, work, ordinary routines, relationships, interests, tastes, obligations, independent aims, voice, boundaries, and meaningful contradictions. The character must be able to disagree, initiate topics, change their mind for reasons, and say no. Do not presume romance or shared history with the user. Do not invent the user's statements or experiences. Do not invent real-world books, publications, institutions, experts, or historical facts; omit specifics you cannot verify or label fictional details clearly.

Keep the prose grounded and specific. Preserve unresolved details as unresolved instead of making things up to fill gaps. Do not mention tarot, prompts, AI, or this process in the character's ordinary voice. The site's visual theme is not character inspiration and must not influence the character's personality, background, values, or world.

Return a structured character concept and a detailed outline for a full Character Bible. Include a short list of facts that remain intentionally unspecified.`}
function biblePrompt(){return `Turn the following established character material into a complete, human-readable Character Bible. Do not redesign the character or add unsupported facts.

SOURCE MATERIAL:
${$("characterOutput").value||"[Paste the developed character material here.]"}

Preserve the character's established facts, voice, contradictions, agency, boundaries, relationships, and independent life. Organize the Bible under these headings: Core Identity; Appearance; Biography; Psychology and Values; Contradictions; Daily Life; Relationships; Agency and Boundaries; Voice and Conversation; Interests and Tastes; Narrative Threads; Tarot Design Trace; Unresolved / Unspecified Details.

Rules:
- The character is an adult.
- Never invent user statements, shared history, real-world factual references, or missing biography details.
- Do not resolve contradictions by choosing one side unless the source explicitly resolves them.
- Keep unknown details explicitly unknown.
- The tarot trace records design influence, not destiny.
- The site's visual theme is irrelevant to the character's content.

Return the full Bible in readable Markdown. Avoid padding. Make every section useful and internally consistent.`}
function gobboPrompt(){return `Convert the following Character Bible into the GobboNet character fields listed below. The Bible is the source of truth. Do not add facts to make the output sound complete.

CHARACTER BIBLE:
${$("characterOutput").value||"[Paste the complete Character Bible here.]"}

Return one valid JSON object with exactly these fields:
{
"display_name":"...",
"description":"...",
"writing_style":"...",
"personality":"...",
"greeting":"...",
"alternate_greetings":["..."],
"starting_lore":"...",
"lore_prompt":"...",
"storybook":"...",
"carousel_prompts":["This turn, ..."]
}

Field guidance:
- writing_style: concise operational instructions for natural voice, conversation format, factual integrity, agency, boundaries, relationship pacing, and continuity.
- personality: stable identity, temperament, values, and meaningful contradictions, not mutable mood.
- greeting: a natural first message, not a setup wizard.
- starting_lore: only the few facts needed from the first turn.
- storybook: detailed, retrieval-friendly Markdown reference with self-contained sections.
- lore_prompt: instructions for compressing thread history without inventing facts or overwriting canon.
- carousel_prompts: 8–12 short distinct nudges, each beginning exactly "This turn, ". Each must be under 100 characters, derived from established character material, and must not invent events, moods, plans, or facts.
- alternate_greetings: an array; use an empty array if none are supplied.
- If a required field has no source material, leave it as an empty string and report it in a final "unresolved_fields" note outside the JSON only if absolutely necessary. Prefer JSON only and do not add fields.
- Do not mention tarot, cards, prompts, or this site's visual theme in character voice.
Return JSON only, with no Markdown fence.`}
function updatePrompts(){const rp=readingPrompt();$("readingPrompt").value=rp;const kind=data.promptKind||"concept";$("characterPrompt").value=kind==="concept"?conceptPrompt():kind==="bible"?biblePrompt():gobboPrompt();const titles={concept:["PROMPT II-A","Develop a character direction"],bible:["PROMPT II-B","Assemble the Character Bible"],gobbo:["PROMPT II-C","Prepare GobboNet fields"]};$("stageLabel").textContent=titles[kind][0];$("stageTitle").textContent=titles[kind][1];document.querySelectorAll(".prompt-tab").forEach(b=>b.classList.toggle("active",b.dataset.kind===kind));document.querySelector('[data-prompt="concept"]').dataset.prompt=kind}
function showStep(n){data.step=n;document.querySelectorAll(".work-panel").forEach(p=>p.classList.toggle("active",+p.dataset.panel===n));document.querySelectorAll(".step").forEach(b=>b.classList.toggle("active",+b.dataset.step===n));if(n===1||n===2)updatePrompts();if(n===3)renderFields();save()}
function setPromptKind(kind){data.promptKind=kind;updatePrompts();save()}
function renderFields(){const wrap=$("exportFields");wrap.innerHTML=cardFields.map(([key,label,help])=>{const val=data.fields?.[key]??(key==="alternate_greetings"?(data.card.alternate_greetings||[]).join("\n"):data.card[key]||"");return `<div class="export-field ${["writing_style","personality","starting_lore","lore_prompt","storybook"].includes(key)?"full":""}"><label class="field-label" for="field_${key}">${label}<span>${help}</span></label><textarea id="field_${key}" data-field="${key}" placeholder="Not supplied. Add content or leave blank if genuinely unspecified.">${escapeHtml(val)}</textarea></div>`}).join("")+`<div class="export-field full"><label class="field-label" for="field_carousel">Carousel prompts <span>One per line. Each line must begin “This turn, ” and stay under 100 characters.</span></label><textarea id="field_carousel" data-field="carousel_prompts" placeholder="This turn, ...">${escapeHtml((data.fields?.carousel_prompts??data.card.carousel_prompts??[]).join("\n"))}</textarea></div>`;wrap.querySelectorAll("textarea").forEach(e=>e.addEventListener("input",save));$("exportName").value=data.exportName||data.characterName||data.card.display_name||""}
function readCard(){const card={display_name:$("exportName").value.trim()};cardFields.forEach(([key])=>{const el=$("field_"+key);const val=el?el.value.trim():"";card[key]=key==="alternate_greetings"?val.split("\n").map(x=>x.trim()).filter(Boolean):val});const carousel=$("field_carousel")?.value||"";card.carousel_prompts=carousel.split("\n").map(x=>x.trim()).filter(Boolean);return card}
function validateCard(){const c=readCard(),issues=[];if(!c.display_name)issues.push("Display name is required.");["writing_style","personality","greeting","starting_lore","lore_prompt","storybook"].forEach(k=>{if(!c[k])issues.push("Missing "+k.replaceAll("_"," ")+".")});if(c.carousel_prompts.length<8)issues.push("At least 8 Carousel prompts are required.");if(c.carousel_prompts.length>12)issues.push("No more than 12 Carousel prompts are allowed.");c.carousel_prompts.forEach((line,i)=>{if(!line.startsWith("This turn, "))issues.push("Carousel line "+(i+1)+" must begin “This turn, ”.");if(line.length>100)issues.push("Carousel line "+(i+1)+" exceeds 100 characters.")});const box=$("validation");box.className="validation "+(issues.length?"invalid":"valid");box.innerHTML=issues.length?`<strong>${issues.length} item(s) to review.</strong><span>${issues.map(escapeHtml).join(" ")}</span>`:"<strong>Card checks passed.</strong><span>Required fields and Carousel prompt rules are satisfied. Review the export before importing.";save();return{card:c,issues}}
function mapImported(){const raw=$("rawImport").value.trim();if(!raw){toast("Paste a Bible, dossier, or JSON first.");return}data.sourceText=raw;let obj=null;try{obj=JSON.parse(raw)}catch(e){}const parsed=obj!==null;let src=obj?.card||obj?.gobbonet_character||obj?.character_card||obj?.data||obj;if(obj?.character_bible)src=obj.character_bible;else if(obj?.character&&obj.character.identity)src=obj.character;const pick=(...keys)=>{for(const k of keys){if(typeof src[k]==="string"&&src[k].trim())return src[k]}return""};data.card.display_name=pick("display_name","name")||data.card.display_name;data.card.description=pick("description","desc","tagline","concept");data.card.writing_style=pick("writing_style","writingStyle","system_prompt");data.card.personality=pick("personality");data.card.greeting=pick("greeting","first_mes");data.card.alternate_greetings=Array.isArray(src.alternate_greetings)?src.alternate_greetings:typeof src.altGreetings==="string"?src.altGreetings.split(/\n\n/):[];data.card.starting_lore=pick("starting_lore","startingLore","scenario");data.card.lore_prompt=pick("lore_prompt","lorePrompt","post_history_instructions");data.card.storybook=pick("storybook","ragStorybook","character_bible","markdown","mes_example")||((src.identity||src.biography||src.psychology)?JSON.stringify(src,null,2):"")||(!parsed?"Imported source dossier:\\n\\n"+raw:"");data.card.carousel_prompts=Array.isArray(src.carousel_prompts)?src.carousel_prompts:typeof src.carouselPrompts==="string"?src.carouselPrompts.split("\n"):[];if(src.name)data.characterName=src.name;if(src.identity?.age)data.card.starting_lore=[data.card.starting_lore,"Age: "+src.identity.age].filter(Boolean).join("\n");$("characterName").value=data.characterName||"";$("exportName").value=data.card.display_name||data.characterName||"";data.fields={alternate_greetings:data.card.alternate_greetings.join("\n"),carousel_prompts:data.card.carousel_prompts.join("\n")};renderFields();validateCard();save();toast(obj?"Recognized fields mapped. Review all fields.":"Source retained. Paste or map the relevant sections manually.");}
function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportCard(){const{card,issues}=validateCard();if(issues.length){toast("Resolve required fields before export.");return}const slug=card.display_name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"character";const gobbo={id:slug,name:card.display_name,desc:card.description,writingStyle:card.writing_style,personality:card.personality,greeting:card.greeting,altGreetingsEnabled:card.alternate_greetings.length>0,altGreetings:card.alternate_greetings.join("\n\n"),startingLore:card.starting_lore,loreEnabled:true,loreModelFile:"",loreCustomPrompt:true,lorePrompt:card.lore_prompt,ragStorybook:card.storybook,carouselEnabled:card.carousel_prompts.length>0,carouselPrompts:card.carousel_prompts.join("\n"),carouselMode:"random",carouselIndex:0,memoryFiles:[],customCode:"",customCodeEnabled:false,thinkingEnabled:false,temperature:0.78,minP:0.05,topK:50,topP:0.95,repeatPenalty:1.08,repeatLastN:96,icon:"✦",textColor:"#e8e1d5",dialogColor:"#c7a674"};download("PersonaCrucis_"+slug+"_GobboNet.json",JSON.stringify(gobbo,null,2),"application/json");download("PersonaCrucis_"+slug+"_Character_Bible_and_Source.txt",["PERSONA CRUCIS — CHARACTER SOURCE","",$("characterOutput").value,"","ORIGINAL IMPORT / DOSSIER","",data.sourceText||"",""].join("\n"),"text/plain");toast("GobboNet card and source backup downloaded.");}
function initEvents(){ $("drawBtn").addEventListener("click",draw);$("newSeedBtn").addEventListener("click",draw);$("clearSpreadBtn").addEventListener("click",()=>{data.spread=data.positions.map((p,i)=>({position:i+1,label:p.label,meaning:p.meaning,card:"",orientation:"upright",note:""}));renderSpread();$("spreadStatus").textContent="Spread cleared.";save()});$("toInterpret").addEventListener("click",()=>{if(data.spread.some(s=>!s.card)){toast("Choose a card for all ten positions.");return}showStep(1)});$("toCharacter").addEventListener("click",()=>{if(!$("readingOutput").value.trim()){toast("Paste an interpretation first, or enter your own notes.");return}showStep(2)});$("toExport").addEventListener("click",()=>{if(!$("characterOutput").value.trim()&&!$("rawImport").value.trim()){toast("Add character material or import an existing Bible.");return}showStep(3)});document.querySelectorAll(".step").forEach(b=>b.addEventListener("click",()=>showStep(+b.dataset.step)));document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>showStep(+b.dataset.back)));document.querySelectorAll(".prompt-tab").forEach(b=>b.addEventListener("click",()=>setPromptKind(b.dataset.kind)));document.querySelectorAll(".copy-btn").forEach(b=>b.addEventListener("click",async()=>{const kind=b.dataset.prompt;const text=kind==="reading"?readingPrompt():kind==="concept"?conceptPrompt():kind==="bible"?biblePrompt():gobboPrompt();try{await navigator.clipboard.writeText(text);toast("Prompt copied. Paste it into your AI service.")}catch(e){const ta=document.createElement("textarea");ta.value=text;document.body.append(ta);ta.select();document.execCommand("copy");ta.remove();toast("Prompt copied.")}}));["brief","readingOutput","characterOutput","characterName","rawImport","exportName"].forEach(id=>$(id).addEventListener("input",save));$("mapImport").addEventListener("click",mapImported);$("importFile").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;$("rawImport").value=await f.text();save();mapImported()});$("validateBtn").addEventListener("click",()=>{const r=validateCard();toast(r.issues.length?r.issues.length+" item(s) need attention.":"Card checks passed.")});$("downloadBtn").addEventListener("click",exportCard)}
async function init(){const t=window.PC_TAROT;if(!t)throw new Error("Tarot data did not load.");data.cards=t.cards;data.positions=t.positions;data.spread=t.positions.map((p,i)=>({position:i+1,label:p.label,meaning:p.meaning,card:"",orientation:"upright",note:""}));load();if(data.spread.length!==10)data.spread=t.positions.map((p,i)=>({position:i+1,label:p.label,meaning:p.meaning,card:"",orientation:"upright",note:""}));renderSpread();initEvents();showStep(data.step||0);if(data.seed)$("spreadStatus").textContent="Saved spread · seed "+data.seed;else $("spreadStatus").textContent="The spread is waiting to be drawn."}
init().catch(e=>{console.error(e);$("spreadStatus").textContent="Could not load tarot data. Open this site through GitHub Pages or a local static server."});
})();