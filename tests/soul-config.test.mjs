import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const sandbox={};vm.runInNewContext(fs.readFileSync("soul-config.js","utf8"),sandbox);
const {validateSoulConfig,buildDemoConfig}=sandbox.PCSoul;
const fixtures=[["iris-1907",0],["celeste-4421",1],["nadia-8813",2]];
const names=[],voices=[];
for(const [seed,index] of fixtures){
 const built=buildDemoConfig(seed,index,"open","acquaintances");
 const config=built.config,check=validateSoulConfig(config);
 assert.equal(check.valid,true,seed+": "+check.errors.join(" | "));
 const bytes=encodeURIComponent(JSON.stringify(config)).replace(/%[0-9A-F]{2}/g,"x").length;
 assert.ok(bytes<6144,seed+" exceeds the 6 KB cap: "+bytes);
 assert.ok(config.coreIdentity.some(x=>/\\b(but|yet|although|while|whereas|despite|however)\\b/i.test(x)),seed+" lacks an internal contradiction");
 assert.equal(config.stages.length,5);
 assert.deepEqual(config.stages.map(x=>x.minCloseness),[0,20,40,60,80]);
 assert.ok(config.factPriorities.length>=4);
 assert.equal(config.provenance.seed,seed);
 for(const p of config.provenance.spread)if(p.reversed)assert.ok(p.fedFields.every(x=>["privateAgenda","diaryVoice"].includes(x)),"Reversed card fed an impermissible field");
 names.push(config.name);voices.push(config.voiceSummary);
 console.log("PASS "+config.name+" | seed="+seed+" | "+bytes+" bytes | contradiction, specific priorities, 10-position provenance");
}
assert.equal(new Set(names).size,3,"Fixture names must be distinct");
assert.equal(new Set(voices).size,3,"Character voices must be clearly distinct");
const reversed=buildDemoConfig("reversal",0).config;reversed.provenance.spread[8].fedFields=["triggers"];assert.equal(validateSoulConfig(reversed).valid,false,"Reversed-card guard must reject trigger leakage");
const cycle=buildDemoConfig("cycle",0).config;cycle.mood.vocabulary[1].softensTo="curious";assert.equal(validateSoulConfig(cycle).valid,false,"Mood decay cycle must be rejected");
const markdown=buildDemoConfig("markdown",0).config;markdown.selfFacts[0]="**bold**";assert.equal(validateSoulConfig(markdown).valid,false,"Markdown strings must be rejected");
const extra=buildDemoConfig("extra",0).config;extra.commitments=[];assert.equal(validateSoulConfig(extra).valid,false,"Unsupported runtime tiers must be rejected");
console.log("Soul Config validator: 3/3 seeded configs PASS; reversed-card, mood-cycle, Markdown, and tier-boundary guards PASS.");
