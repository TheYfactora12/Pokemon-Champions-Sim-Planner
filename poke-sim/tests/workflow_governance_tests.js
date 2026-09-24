const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const ci = read('.github/workflows/ci.yml');
const pages = read('.github/workflows/pages.yml');
const news = read('.github/workflows/news-feed-sync.yml');

let pass = 0;
function check(name, condition) {
  if (!condition) throw new Error(name);
  pass += 1;
}

check('CI live writes use isolated test-project secrets', /SUPABASE_TEST_URL/.test(ci) && /SUPABASE_TEST_ANON_KEY/.test(ci));
check('CI cleanup runs even after failure', /Clean up isolated Supabase test data[\s\S]*if: always\(\)/.test(ci));
check('CI installs locked dependencies once per test job', (ci.match(/\bnpm ci\b/g) || []).length === 1);
check('CI cleanup requires a completed dependency install', /if: always\(\) && steps\.dependencies\.outcome == 'success'/.test(ci));
check('CI cleanup is skipped for mock-only runs', /steps\.suite\.outputs\.live_db == 'true'/.test(ci) && /echo "live_db=true" >> "\$GITHUB_OUTPUT"/.test(ci));
check('CI shared-project users are serialized without cancelling active jobs', /concurrency:[\s\S]*champions-supabase-test-project[\s\S]*cancel-in-progress: false/.test(ci));
check('CI does not mutate an unused credential-injected deployment bundle', !/html = html\.replace|Building production bundle|fs\.writeFileSync\(file, html\)/.test(ci));
check('mechanics audit watches runtime and move support', /poke-sim\/runtime_data\.js/.test(ci) && /poke-sim\/move_support\.js/.test(ci));
check('Pages uses reproducible install', /npm ci/.test(pages) && !/npm install/.test(pages));
check('Pages deploys an explicit runtime allowlist', /runtime_files=\(/.test(pages) && /generated_files=\(/.test(pages));
check('Pages excludes internal trees', /test ! -e pages-dist\/poke-sim\/tests/.test(pages) && /test ! -e pages-dist\/poke-sim\/db/.test(pages) && /test ! -e pages-dist\/poke-sim\/reports/.test(pages));
check('News uses only trusted main, not pending PR code', /ref: main/.test(news) && !/gh pr|pull_request_target|git checkout -b/.test(news));
check('News refresh is bounded, locked and tested', /timeout-minutes: 20/.test(news) && /npm ci/.test(news) && /npm run test:fast/.test(news));
check('News publishing preserves history', /git push origin HEAD:refs\/heads\/main/.test(news) && !/--force|--admin/.test(news));
check('News publication is owner/main only', /github.repository == 'TheYfactora12\/Pokemon-Champions-Sim-Planner'/.test(news) && /github.ref == 'refs\/heads\/main'/.test(news));
check('News does not use production secrets', !/secrets\./.test(news));
check('Health receipt restoration precedes complete mutation validation', news.indexOf('git restore --source=HEAD -- poke-sim/reports/news-sync-health.json') < news.indexOf('git diff --name-only -z HEAD |'));
check('Fresh health is retained before only its tracked copy is restored', news.indexOf('Retain source health') < news.indexOf('git restore --source=HEAD -- poke-sim/reports/news-sync-health.json'));
check('News checks all tracked changes and exact committed paths', /git diff --name-only -z HEAD \| node poke-sim\/tools\/news-review-policy.mjs --paths/.test(news) && /git diff --name-only -z HEAD\^ HEAD \| node poke-sim\/tools\/news-review-policy.mjs --paths/.test(news));
check('Offline gate precedes push, which precedes normal Pages dispatch', news.indexOf('npm run test:fast') < news.indexOf('git push origin') && news.indexOf('git push origin') < news.indexOf('gh workflow run pages.yml --ref main'));

const diagnostics = read('poke-sim/db/diagnostics/cleanup_preflight.sql').replace(/--[^\r\n]*/g, '');
check('DB cleanup diagnostics use a read-only transaction', /BEGIN TRANSACTION READ ONLY;/.test(diagnostics) && /COMMIT;/.test(diagnostics));
check('DB diagnostics have local execution limits', /SET LOCAL statement_timeout = '10s';/.test(diagnostics) && /SET LOCAL lock_timeout = '2s';/.test(diagnostics));
check('DB diagnostics contain no write/maintenance commands', !/\b(?:INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE|VACUUM|ANALYZE|DO|CALL)\b/i.test(diagnostics));
check('DB inventories report size limits and full matching counts', (diagnostics.match(/LIMIT 200/g) || []).length === 3 && (diagnostics.match(/count\(\*\) OVER \(\)/g) || []).length === 3);

console.log(`workflow governance: ${pass} pass, 0 fail`);
