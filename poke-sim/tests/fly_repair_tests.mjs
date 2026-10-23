import assert from 'node:assert/strict';
import {test} from 'node:test';
import {assess} from '../tools/probe-fly-repair.mjs';
for(const row of assess(process.env.CHAMPIONS_REFERENCE_SIM))test(row.case_id.replace('ASSESS','REPAIR')+' '+row.input.side+' '+row.input.move,()=>{
 assert.deepEqual(row.candidate,row.reference,'exact charge, HP, PP and item observations');
});
