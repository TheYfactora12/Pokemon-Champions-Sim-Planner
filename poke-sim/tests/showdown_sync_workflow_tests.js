'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const workflowPath = path.join(ROOT, '..', '.github', 'workflows', 'showdown-sync.yml');

let pass = 0;
let fail = 0;

function T(name, fn) {
  try {
    fn();
    console.log('  PASS', name);
    pass += 1;
  } catch (err) {
    console.log('  FAIL', name, '-', err.message);
    fail += 1;
  }
}

function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

console.log('\n=== Showdown sync workflow tests ===\n');

T('1. workflow runs daily and supports manual dispatch', () => {
  const yaml = fs.readFileSync(workflowPath, 'utf8');
  truthy(yaml.includes("cron: '30 13 * * *'"), 'daily schedule missing');
  truthy(yaml.includes('workflow_dispatch:'), 'manual dispatch missing');
});

T('2. workflow evaluates change summary before any Supabase write', () => {
  const yaml = fs.readFileSync(workflowPath, 'utf8');
  truthy(yaml.includes('Evaluate Showdown changes'), 'change evaluation step missing');
  truthy(yaml.includes('change_check.outputs.has_changes == \'true\''), 'write gate missing');
  truthy(yaml.includes('Skip DB writes when nothing changed'), 'skip step missing');
  truthy(yaml.includes('change_summary.json'), 'change summary artifact missing');
});

T('3. scheduled runs auto-promote approved rows after change checks', () => {
  const yaml = fs.readFileSync(workflowPath, 'utf8');
  truthy(yaml.includes('github.event_name == \'schedule\''), 'scheduled approved path missing');
  truthy(yaml.includes('steps.change_check.outputs.has_changes == \'true\''), 'approved write should still require changes');
  truthy(yaml.includes('github.event.inputs.approve == \'true\''), 'manual approve gate missing');
  truthy(yaml.includes('--approve'), 'approved promotion should use approved writer path');
  truthy(yaml.includes('github.event_name == \'workflow_dispatch\' && github.event.inputs.write_db == \'true\' && github.event.inputs.approve != \'true\''), 'manual unapproved path missing');
});

console.log('\nShowdown sync workflow:', pass + ' pass, ' + fail + ' fail\n');
if (fail > 0) process.exit(1);
