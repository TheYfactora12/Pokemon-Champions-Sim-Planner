import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {digest} from './bounded-assertions.mjs';
import {INDEX} from './bounded-register.mjs';
import {CURRENT_ANCHORS,readCurrentBoundedEntry} from './current-bounded-core.mjs';

// Explicit enrollment of a reviewed capture, never implicit execution or approval.
export function enrollCurrent(root,captureIndex,reviewFile){
 const capture=JSON.parse(fs.readFileSync(captureIndex)),originalReview=fs.readFileSync(reviewFile);
 const review=JSON.parse(originalReview),base='source/bounded-assertions/reviews/'+digest(originalReview),pending=new Map();
 const put=(name,bytes)=>{pending.set(name,bytes);return {path:name,sha256:digest(bytes)};};
 put(base+'/original-review.json',originalReview);
 review.evidence=review.evidence.map(ref=>{
  assert(!path.isAbsolute(ref.path)&&!ref.path.split(/[\\/]/).includes('..'),'Unsafe independent evidence path');
  const bytes=fs.readFileSync(path.join(path.dirname(reviewFile),ref.path));assert.equal(digest(bytes),ref.sha256);
  return {...put(base+'/'+path.basename(ref.path),bytes),role:ref.role};
 });
 const reviewRef=put(base+'/review.json',Buffer.from(JSON.stringify(review,null,2)+'\n'));
 const anchors=fs.existsSync(path.join(root,CURRENT_ANCHORS))?JSON.parse(fs.readFileSync(path.join(root,CURRENT_ANCHORS))):{schema_version:'current-bounded-review-anchors-v1',reviews:[]};
 if(!anchors.reviews.some(ref=>ref.path===reviewRef.path))anchors.reviews.push(reviewRef);
 put(CURRENT_ANCHORS,Buffer.from(JSON.stringify(anchors,null,2)+'\n'));
 const read=name=>{assert(!path.isAbsolute(name)&&!name.split(/[\\/]/).includes('..'),'Unsafe capture path');return pending.get(name)||fs.readFileSync(path.join(root,name));};
 const load=ref=>{const bytes=read(ref.path);assert.equal(digest(bytes),ref.sha256,'Capture/review content mismatch');return bytes;};
 const provenance=JSON.parse(load(capture.provenance));
 const entries=capture.entries.map(entry=>({...entry,simulator_commit:provenance.runtime_source_commit,reference_pin:provenance.reference.source_attribution_commit,independent_review:reviewRef}));
 assert.equal(new Set(entries.map(entry=>entry.assertion_id)).size,entries.length,'Duplicate capture assertion');
 for(const entry of entries)assert.equal(readCurrentBoundedEntry(root,entry,{read,load}).status,'passed_declared_scope','Cannot enroll stale/invalid capture');
 const index=JSON.parse(fs.readFileSync(path.join(root,INDEX)));
 for(const entry of entries){const prior=index.assertions.find(row=>row.assertion_id===entry.assertion_id);if(prior)assert.deepEqual(prior,entry,'Review a new versioned assertion instead of overwriting');else index.assertions.push(entry);}
 // Immutable review bytes first; validated pointers last. Failed validation writes nothing.
 for(const [name,bytes]of pending){if(name===CURRENT_ANCHORS)continue;const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});if(fs.existsSync(file))assert.deepEqual(fs.readFileSync(file),bytes,'Immutable review differs');else fs.writeFileSync(file,bytes);}
 fs.writeFileSync(path.join(root,CURRENT_ANCHORS),pending.get(CURRENT_ANCHORS));
 fs.writeFileSync(path.join(root,INDEX),JSON.stringify(index,null,2)+'\n');
 return {enrolled:entries.length,review:reviewRef};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [root,capture,review]=process.argv.slice(2);assert(root&&capture&&review,'Usage: enroll-current-bounded.mjs ROOT CAPTURE_INDEX REVIEW_FILE');
 console.log(JSON.stringify(enrollCurrent(path.resolve(root),path.resolve(capture),path.resolve(review))));
}
