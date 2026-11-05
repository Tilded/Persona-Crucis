import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const sandbox={};vm.runInNewContext(fs.readFileSync("soul-config.js","utf8"),sandbox);
const {validateSoulConfig,buildDemoConfig}=sandbox.PCSoul;
const fixtures=[["iris-1907",0],["celeste-4421",1],["nadia-8813",2]];
const names=[],voices=[],prioritySets=[];
for(const [seed,index] of fixtures){
 const built=buildDemoConfig(seed,index,"open","acquaintances");
 const config=built.config,check=validateSoulConfig(config);
 assert.equal(check.valid,true,seed+": "+check.errors.join(" | "));
 const bytes=Buffer.byteLength(JSON.stringify(config),"utf8");
 assert.ok(config.coreIdentity.some(x=>/\b(but|yet|although|while|whereas|despite|however)\b/i.test(x)),seed+" lacks an internal contradiction");
 assert.equal(config.stages.length,5);
 assert.deepEqual(Array.from(config.stages,x=>x.minCloseness),[0,20,40,60,80]);
 assert.ok(config.factPriorities.length>=4);
 assert.equal(config.provenance.seed,seed);
 for(const p of config.provenance.spread)if(p.reversed)assert.ok(p.fedFields.every(x=>["privateAgenda","diaryVoice"].includes(x)),"Reversed card fed an impermissible field");
 names.push(config.name);voices.push(config.voiceSummary);prioritySets.push(JSON.stringify(config.factPriorities));
 console.log("PASS "+config.name+" | seed="+seed+" | "+bytes+" bytes | contradiction, specific priorities, 10-position provenance");
}
assert.equal(new Set(names).size,3,"Fixture names must be distinct");
assert.equal(new Set(voices).size,3,"Character voices must be clearly distinct");
assert.equal(new Set(prioritySets).size,3,"Fact priorities must be character-specific across the three fixtures");
const reversed=buildDemoConfig("reversal",0).config;reversed.provenance.spread[8].reversed=true;reversed.provenance.spread[8].fedFields=["triggers"];assert.equal(validateSoulConfig(reversed).valid,false,"Reversed-card guard must reject trigger leakage");
const cycle=buildDemoConfig("cycle",0).config;cycle.mood.vocabulary[0].softensTo="irritated";cycle.mood.vocabulary[1].softensTo="curious";assert.equal(validateSoulConfig(cycle).valid,false,"Mood decay cycle must be rejected");
const markdown=buildDemoConfig("markdown",0).config;markdown.selfFacts[0]="**bold**";assert.equal(validateSoulConfig(markdown).valid,false,"Markdown strings must be rejected");
const extra=buildDemoConfig("extra",0).config;extra.commitments=[];assert.equal(validateSoulConfig(extra).valid,false,"Unsupported runtime tiers must be rejected");
const named=buildDemoConfig("named-entity",0).config;named.selfFacts[0]="She had lunch with Taylor Swift yesterday.";assert.equal(validateSoulConfig(named).valid,false,"Real-world named entities in selfFacts must be rejected");
const leadingName=buildDemoConfig("leading-entity",0).config;leadingName.selfFacts[0]="Kyoto has narrow lanes and crowded stations.";assert.equal(validateSoulConfig(leadingName).valid,false,"A leading real-world place name must be rejected");
const italic=buildDemoConfig("italic-markdown",0).config;italic.selfFacts[0]="She prefers *quiet* rooms after work.";assert.equal(validateSoulConfig(italic).valid,false,"Italic Markdown must be rejected");

const badMood=buildDemoConfig("bad-mood",0).config;badMood.mood.extra="not allowed";assert.equal(validateSoulConfig(badMood).valid,false,"Unknown mood fields must be rejected");
const badTrigger=buildDemoConfig("bad-trigger",0).config;badTrigger.triggers[0].emotion="not-in-vocabulary";assert.equal(validateSoulConfig(badTrigger).valid,false,"Trigger emotions must belong to the mood vocabulary");
const badBaseline=buildDemoConfig("bad-baseline",0).config;badBaseline.mood.baseline="not-in-vocabulary";assert.equal(validateSoulConfig(badBaseline).valid,false,"Mood baseline must be a vocabulary label");
const badSoftens=buildDemoConfig("bad-softens",0).config;badSoftens.mood.vocabulary[0].softensTo="not-in-vocabulary";assert.equal(validateSoulConfig(badSoftens).valid,false,"Mood softening targets must be valid vocabulary labels or baseline");

const badStages=buildDemoConfig("bad-stages",0).config;badStages.stages[2].minCloseness=10;assert.equal(validateSoulConfig(badStages).valid,false,"Stage thresholds must ascend from zero");
const vagueThread=buildDemoConfig("vague-thread",0).config;vagueThread.openThreads[0]="A personal project might move forward soon.";assert.equal(validateSoulConfig(vagueThread).valid,false,"Vague or hedged openThreads must be rejected");
const statuslessThread=buildDemoConfig("statusless-thread",0).config;statuslessThread.openThreads[0]="Her brass kettle is an interesting object.";assert.equal(validateSoulConfig(statuslessThread).valid,false,"OpenThreads must state concrete progress or status");
const abstractThread=buildDemoConfig("abstract-thread",0).config;abstractThread.openThreads[0]="The project is underway.";assert.equal(validateSoulConfig(abstractThread).valid,false,"OpenThreads must identify a concrete referent, not an abstract placeholder");

const exported=JSON.parse(fs.readFileSync("examples/iris-vale-gobbonet-card.json","utf8"));
const exportedSoul=exported.data.extensions.gobbonet.soulConfig;
assert.equal(validateSoulConfig(exportedSoul).valid,true,"The example exported card must contain a valid Soul Config");
assert.equal(exportedSoul.name,exported.data.name);
assert.equal(exported.data.extensions.gobbonet.seed,exportedSoul.provenance.seed);
assert.equal(exported.data.extensions.gobbonet.customCode.includes("/* SOUL_CONFIG_START */"),true);
assert.equal(exported.data.extensions.gobbonet.card,undefined,"Do not duplicate the full GobboNet payload under extensions.gobbonet.card");
const stampedCode=exported.data.extensions.gobbonet.customCode;
const hookHandlers={};
const mockThread={id:"soul-ci-thread",personaName:"Test User",messages:[
 {role:"user",content:"I enjoy quiet evenings and tea.",timestamp:Date.now()-1000},
 {role:"assistant",content:"That sounds peaceful.",timestamp:Date.now()-500}
]};
const engineLogs=[],askCalls=[];
const mockGobbo={
 thread:mockThread,store:{},
 log(...args){engineLogs.push(args.join(" "))},save(){},note(){},
 on(name,fn){hookHandlers[name]=fn},
 every(interval,fn){this.periodic=fn},
 async ask(prompt,options){askCalls.push({prompt,options});return askCalls.length===1?"NONE":"MOOD: SAME | 0\nCLOSER: 0"}
};
const previousSoul=globalThis.soul;
try{
 delete globalThis.soul;
 new Function("gobbo",stampedCode)(mockGobbo);
 assert.equal(typeof hookHandlers.context,"function","Context hook must register.");
 assert.equal(typeof hookHandlers.activate,"function","Activate hook must register.");
 assert.equal(typeof mockGobbo.periodic,"function","Periodic pass must register.");
 hookHandlers.activate();
 assert.equal(typeof globalThis.soul.runPassNow,"function","Console API must be exposed.");
 const contextMessages=mockThread.messages.map(m=>({...m}));
 hookHandlers.context({thread:mockThread,messages:contextMessages});
 assert.ok(contextMessages.some(m=>m.role==="system"&&m.content.startsWith("[SOUL STATE]")),"Context hook must inject the tagged state block.");
 await globalThis.soul.runPassNow();
 assert.equal(mockGobbo.store.soul.v,1,"Engine must initialize persisted state.");
 assert.equal(askCalls.length,2,"Background pass must run extraction and state calls.");
 hookHandlers.deactivate();
 assert.equal(globalThis.soul,undefined,"Deactivation must remove the console API.");
}finally{
 if(previousSoul===undefined)delete globalThis.soul;else globalThis.soul=previousSoul;
}
assert.ok(engineLogs.some(x=>x.includes("soul-engine v1 loaded for Iris Vale")),"Engine must log successful startup.");
console.log("PASS stamped Soul Engine executes, registers hooks, injects state, persists, and tears down with mock gobbo.");
console.log("Soul Config validator: 3/3 seeded configs PASS; reversed-card, mood-chain, Markdown, named-entity, trigger, stage, and tier-boundary guards PASS.");
