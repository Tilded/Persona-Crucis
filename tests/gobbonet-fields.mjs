import assert from "node:assert/strict";
import fs from "node:fs";
const app=fs.readFileSync("app.js","utf8");
const html=fs.readFileSync("index.html","utf8");
const engine=fs.readFileSync("soul-engine.js","utf8");
const contract=fs.readFileSync("docs/reference/gobbonet-compatibility.md","utf8");
const schema=JSON.parse(fs.readFileSync("docs/reference/gobbonet-generation.schema.json","utf8"));
const sample=JSON.parse(fs.readFileSync("examples/iris-vale-gobbonet-card.json","utf8"));
const tavernV2=JSON.parse(fs.readFileSync("exports/iris-vale-sillytavern-v2.json","utf8"));
const tavernV3=JSON.parse(fs.readFileSync("exports/iris-vale-sillytavern-v3.json","utf8"));
const chirper=JSON.parse(fs.readFileSync("data/chirper-seeds.json","utf8"));
const sampleGobbo=sample.data.extensions.gobbonet;
const sampleWriting=sample.data.description;
const samplePersonality=sample.data.personality;
const exampleCarousel=sampleGobbo.carouselPrompts.split("\n");
assert.deepEqual(sampleGobbo.soulConfig.openThreads,[
 "Her old toaster has tripped the kitchen breaker repeatedly; diagnosis is unfinished.",
 "She has ordered a replacement handle for her brass kettle and is waiting for the parcel."
],"Example openThreads must be concrete, with a specific referent and current status.");
assert.ok(sampleGobbo.customCode.includes("soul-engine.js v1"),"Example Custom Code must stamp Soul Engine v1.");
assert.equal((sampleWriting.match(/^User:/gm)||[]).length,5,"Example fixture must contain exactly five exchanges");
assert.ok(sampleWriting.includes("Examples show tone only. Never repeat them or write a speaker label."));
assert.ok(sampleWriting.includes("When someone is vulnerable"));
assert.ok(sampleWriting.includes("make you tea")&&sampleWriting.includes("Come sit with me"),"At least two sample exchanges must demonstrate warmth or play");
for(const word of ["practical","useful","functional"]){
 const count=(sampleWriting+" "+samplePersonality).match(new RegExp("\\b"+word+"\\b","gi"))||[];
 assert.ok(count.length<=2,"Repeated adjective limit exceeded: "+word);
}
assert.ok(exampleCarousel.length>=12&&exampleCarousel.length<=20);
assert.ok(exampleCarousel.filter(line=>/unrelated|absurdity|personal taste|pleasant sound|purely for pleasure|silly makes you laugh|aesthetic preference|playful disagreement/i.test(line)).length>=3,"Sample Carousel must redirect away from Iris's dominant trait");
assert.ok(exampleCarousel.every(line=>!/\b(work|workplace|job|task|tasks|duties|productivity)\b/i.test(line)),"Sample Carousel must not mention work or tasks");
assert.ok(sampleGobbo.ragStorybook.includes("swims twice a week")&&sampleGobbo.ragStorybook.includes("amateur astronomy")&&sampleGobbo.ragStorybook.includes("odd postcards"),"Sample character must have three non-occupational interests");
for(const field of ["writing_style","personality","greeting","alternate_greetings","starting_lore","lore_prompt","storybook","carousel_prompts","custom_code"])
 assert.ok(app.includes('["'+field+'"')||app.includes('"'+field+'"'),"Missing authoring field: "+field);
assert.match(app,/writingStyle","writing_style"/);
assert.match(app,/pick\(src,"system_prompt"\),pick\(src,"post_history_instructions"\)/);
assert.doesNotMatch(app,/pick\(src,"lorePrompt","lore_prompt","post_history_instructions"\)/);
assert.match(app,/carouselEnabled:true/);
assert.match(app,/settings\.carouselEnabled=false/);
assert.match(app,/customCodeEnabled:false/);
assert.match(app,/customCodeEnabled:true/);
assert.match(app,/loreEnabled:true/);
assert.match(app,/loreCustomPrompt:true/);
assert.match(app,/altGreetingsEnabled:true/);
assert.match(app,/carouselMode:"random"/);
assert.match(app,/At least two exchanges must show genuine warmth or play/,"Examples must include warmth or play.");
assert.match(app,/Examples show tone only\. Never repeat them or write a speaker label\\./,"Example exchanges must be explicitly tone-only and unlabeled.");
assert.match(app,/one concise, explicit one-line rule for how the character responds when the user is vulnerable/,"Writing Style must define a vulnerability response.");
assert.match(app,/each of the words "practical", "useful", and "functional" no more than twice/,"Avoid adjective fixation across always-on fields.");
assert.match(app,/2–3 specific interests outside the character’s occupation/,"Every character needs interests beyond their occupation.");
assert.match(app,/At least three lines must deliberately redirect away from the character’s dominant trait/,"Carousel must counterbalance the dominant trait.");
assert.match(app,/None of the carousel lines may mention the character’s occupation, workplace, work, jobs, tasks, duties, productivity, or getting things done/,"Carousel must stay clear of work and task references.");

assert.match(app,/SOUL_CONFIG_START/);
assert.match(app,/spec:"chara_card_v3",spec_version:"3\.0"/,"Export must use GobboNet's supported Character Card V3 wrapper");
assert.ok(app.includes("extensions:{gobbonet:{...(({writingStyle,personality,...rest})=>rest)(gobbo),seed:data.seed,soulConfig:soul}}"),"Keep native settings without duplicating Writing Style or Personality");
assert.doesNotMatch(app,/characterCards:\[gobbo\]/,"Do not use the unsupported characterCards array wrapper");
assert.match(app,/maraLorePromptTemplate/);
assert.match(app,/name:card\.display_name\|\|\"Unnamed\",id:slug/);
assert.match(app,/const avatar="data:image\/jpeg;base64,/);
assert.match(app,/ragStorybook:card\.storybook/);
assert.match(app,/carouselPrompts:card\.carousel_prompts\.join/);
assert.match(app,/Soul Engine source did not load/);
assert.match(app,/window\.PC_SOUL_ENGINE_SOURCE=""/);
assert.match(app,/const engine=window\.PC_SOUL_ENGINE_SOURCE\.trim\(\)/);
assert.match(engine,/soul-engine v1/);
assert.match(engine,/gobbo\.on\("context"/);
assert.match(engine,/gobbo\.every\(PASS_EVERY/);
assert.match(html,/relationshipTrack/);
assert.match(html,/startingFamiliarity/);
assert.match(html,/copySoulPrompt/);
assert.match(html,/soulValidation/);
assert.match(html,/customCodeReminder/);
assert.ok(html.indexOf('src="soul-config.js"')<html.indexOf('src="app.js"'));
assert.match(app,/fetch\("soul-engine\.js"\)/,"Generator must load the replaceable engine as source text, not execute it.");
assert.ok(contract.includes("Personality persistently every turn"));
assert.ok(contract.includes("manual setup sheet"));
assert.equal(schema.properties.carousel_prompts.minItems,12);
assert.equal(schema.properties.carousel_prompts.maxItems,20);
assert.equal(schema.properties.starting_lore.type,"string");
assert.equal(schema.properties.lore_prompt.type,"string");
assert.equal(tavernV2.spec,"chara_card_v2");
assert.equal(tavernV2.spec_version,"2.0");
assert.equal(tavernV2.data.character_book.entries.length,20);
assert.equal(tavernV3.spec,"chara_card_v3");
assert.equal(tavernV3.spec_version,"3.0");
assert.equal(tavernV3.data.character_book.entries.length,20);
for(const [handle,expected] of [["spareparts",50],["mothhour",50],["lastcall",50]]){
 assert.equal(chirper.characters[handle].posts.length,expected,handle+" must have fifty Chirper seed posts");
 assert.ok(chirper.characters[handle].posts.every(post=>post.text.startsWith(handle+": ")),handle+" posts must use their character handle");
}
assert.equal(chirper.runtimeTarget.storePath,"gobbo.store.chirper.timeline");
assert.equal(chirper.runtimeTarget.suggestedCadence,"gobbo.every(45m)");
assert.equal(sample.spec,"chara_card_v3");
assert.equal(sample.spec_version,"3.0");
for(const field of ["name","id","avatar","loreEnabled","loreModelFile","loreCustomPrompt","lorePrompt","startingLore","ragStorybook","memoryFiles","greeting","altGreetingsEnabled","altGreetings","background","textColor","dialogColor","temperature","minP","topK","topP","repeatPenalty","repeatLastN","xtcProbability","xtcThreshold","dryMultiplier","bannedPhrases","customCode","customCodeEnabled","contextLimit","smartLimitEnabled","smartLimitTokens","thinkingEnabled","contextInputPercent","contextReplyPercent","contextLandPercent","contextKeepPercent","logitBiasStrength","carouselEnabled","carouselMode","carouselPrompts"])
 assert.ok(Object.hasOwn(sampleGobbo,field),"Example card is missing "+field);
assert.ok(sample.data.avatar.startsWith("data:image/jpeg;base64,"));
assert.ok(sample.data.description.length>0);
assert.ok(sample.data.personality.length>0);
assert.equal(Object.hasOwn(sampleGobbo,"writingStyle"),false);
assert.equal(Object.hasOwn(sampleGobbo,"personality"),false);
assert.equal(sampleGobbo.id,"iris-vale");
assert.equal(sampleGobbo.carouselEnabled,true);
assert.equal(sampleGobbo.carouselMode,"random");
assert.equal(sampleGobbo.customCodeEnabled,true);
assert.ok(sampleGobbo.customCode.includes("/* SOUL_CONFIG_START */"));
assert.ok(sampleGobbo.customCode.includes(engine.trim()),"The exported Custom Code must stamp the complete Soul Engine source.");
assert.equal(sampleGobbo.customCode, "/* SOUL_CONFIG_START */\nvar SOUL_CONFIG = "+JSON.stringify(sampleGobbo.soulConfig,null,2)+";\n/* SOUL_CONFIG_END */\n\n"+engine.trim()+"\n");

// Execute the exact stamped Custom Code with GobboNet documented API mocked.
const hookHandlers={};
const mockThread={id:"ci-thread",personaName:"Test User",messages:[
 {role:"user",content:"I enjoy quiet evenings and tea.",timestamp:Date.now()-1000},
 {role:"assistant",content:"That sounds peaceful.",timestamp:Date.now()-500}
]};
const askCalls=[];
const mockGobbo={
 thread:mockThread,store:{},save(){},log(){},note(){},
 on(name,fn){hookHandlers[name]=fn;},
 every(interval,fn){this.periodic=fn;},
 async ask(prompt,options){askCalls.push({prompt,options});return askCalls.length===1?"NONE":"MOOD: SAME | 0\nCLOSER: 0";}
};
const previousSoul=globalThis.soul;
try {
 delete globalThis.soul;
 new Function("gobbo",sampleGobbo.customCode)(mockGobbo);
 assert.equal(typeof hookHandlers.context,"function","Stamped engine must register context hook.");
 assert.equal(typeof hookHandlers.activate,"function","Stamped engine must register activate hook.");
 assert.equal(typeof mockGobbo.periodic,"function","Stamped engine must register periodic background pass.");
 hookHandlers.activate();
 assert.equal(typeof globalThis.soul.runPassNow,"function","Soul console API must be exposed on activation.");
 const contextMessages=mockThread.messages.map(m=>({...m}));
 hookHandlers.context({thread:mockThread,messages:contextMessages});
 assert.ok(contextMessages.some(m=>m.role==="system"&&m.content.startsWith("[SOUL STATE]")),"Engine must inject its tagged state block before the user message.");
 await globalThis.soul.runPassNow();
 assert.equal(mockGobbo.store.soul.v,1,"Background pass must initialize persisted Soul state.");
 assert.equal(askCalls.length,2,"Background pass should make extraction and state calls.");
 hookHandlers.deactivate();
 assert.equal(globalThis.soul,undefined,"Deactivation must remove the console API.");
} finally {
 if(previousSoul===undefined) delete globalThis.soul; else globalThis.soul=previousSoul;
}
assert.equal(sampleGobbo.ragStorybook.split(/^# --- /m).length-1,20,"Example Storybook must contain exactly twenty retrieval topics.");
assert.equal(sampleGobbo.carouselPrompts.split("\n").length,12);
assert.ok(!Object.hasOwn(sampleGobbo,"_import"));

console.log("GobboNet field contract checks passed: full fields, Character Card V3 wrapper, complete Soul Engine stamping, and import reminder.");
