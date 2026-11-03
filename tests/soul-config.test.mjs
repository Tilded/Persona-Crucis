import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const sandbox={};vm.runInNewContext(fs.readFileSync("soul-config.js","utf8"),sandbox);
const {validateSoulConfig,buildDemoConfig}=sandbox.PCSoul;
for(const [seed,index] of [["iris-1907",0],["celeste-4421",1],["nadia-8813",2]]){const c=buildDemoConfig(seed,index,"open","acquaintances");const r=validateSoulConfig(c);assert.equal(r.valid,true,seed+": "+r.errors.join(" | "));}
const reversed=buildDemoConfig("reversal",0);reversed.provenance.spread[8].fedFields=["triggers"];assert.equal(validateSoulConfig(reversed).valid,false);
const cycle=buildDemoConfig("cycle",0);cycle.mood.vocabulary[1].softensTo="curious";assert.equal(validateSoulConfig(cycle).valid,false);
console.log("Soul config validator: 3/3 seeded configs PASS; reversed-card guard PASS; mood-cycle guard PASS.");
