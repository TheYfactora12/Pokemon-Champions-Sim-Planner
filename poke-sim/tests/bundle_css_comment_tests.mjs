import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const path = fileURLToPath(new URL('../tools/build-bundle.py', import.meta.url));
const script = `import ast,json,sys
source=open(sys.argv[1],encoding='utf-8').read()
module=ast.parse(source)
fn=next(n for n in module.body if isinstance(n,ast.FunctionDef) and n.name=='omit_css_comments')
namespace={}
exec(compile(ast.Module(body=[fn],type_ignores=[]),'<css-comment-test>','exec'),namespace)
f=namespace['omit_css_comments']
rows=json.loads(sys.stdin.read())
out=[]
for row in rows:
 try: out.append({'value':f(row)})
 except RuntimeError as e: out.append({'error':str(e)})
print(json.dumps(out))`;
const cases = [
  ['a/**/b { color: red; }','a/**/b { color: red; }'],
  ['a { content: "/* data */"; }','a { content: "/* data */"; }'],
  ["a { content: '/* data */'; }", "a { content: '/* data */'; }"],
  ['/* multi\nline */a{}','/**/a{}'],
  ['a{color:red}/* tail */','a{color:red}/**/'],
];
cases.push(['.a/* comment */.b{}','.a/**/.b{}']);
cases.push([String.raw`.a\"b{color:red}`,String.raw`.a\"b{color:red}`]);
cases.push(['a{background:url(foo/*bar*/baz)}','a{background:url(foo/*bar*/baz)}']);
cases.push([String.raw`a{background:url(foo\)/*bar*/baz)}`,String.raw`a{background:url(foo\)/*bar*/baz)}`]);
const input=cases.map(x=>x[0]).concat(['/* unterminated', 'a{content:"unterminated']);
const command=process.platform==='win32'?'python':'python3';
const run=spawnSync(command,['-c',script,path],{input:JSON.stringify(input),encoding:'utf8'});
assert.equal(run.status,0,run.stderr);
const results=JSON.parse(run.stdout);
cases.forEach((row,i)=>assert.equal(results[i].value,row[1]));
assert.match(results[cases.length].error,/Unterminated CSS comment/);
assert.match(results[cases.length+1].error,/Unterminated CSS string/);
assert.match(readFileSync(path,'utf8'),/css = omit_css_comments\(css\)/);
console.log('CSS comment preservation: 11 cases passed; build uses tested scanner.');
