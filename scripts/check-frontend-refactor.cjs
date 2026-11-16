const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const ts = require('../apps/web/node_modules/typescript');

const root = path.resolve(__dirname, '..');
const baseline = 'backup/frontend-refactor-20261116';
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, ...args], { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
const files = git('ls-tree', '-r', '--name-only', baseline, 'apps/web/app', 'apps/web/components', 'apps/web/lib').trim().split('\n');
const printer = ts.createPrinter({ removeComments: true });
const parse = (file, source) => ts.createSourceFile(file, source.replace(/\r\n/g, '\n'), ts.ScriptTarget.Latest, true);
const print = (node, source) => printer.printNode(ts.EmitHint.Unspecified, node, source);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}

// Compare the actual render primitives across extracted files, including event handlers.
function inventory(sources) {
  const items = [];
  for (const [file, text] of sources) {
    const source = parse(file, text);
    function visit(node) {
      if (ts.isJsxElement(node) && node.openingElement.tagName.getText(source) === 'AnimatePresence') {
        items.push(`presence ${print(node, source).replace(/\s+/g, ' ')}`);
      }
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(source);
        if (/^[a-z]/.test(tag) || ['Image', 'Link', 'AnimatePresence'].includes(tag)) {
          items.push(`${tag} ${print(node.attributes, source)}`);
        }
      }
      if (ts.isJsxText(node) && node.text.trim()) items.push(`text ${node.text.trim().replace(/\s+/g, ' ')}`);
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return items.sort();
}
const original = files.filter(file => /\.tsx$/.test(file)).map(file => [file, git('show', `${baseline}:${file}`)]);
const current = ['app', 'components', 'features'].flatMap(dir => walk(path.join(root, 'apps/web', dir))).filter(file => /\.tsx$/.test(file)).map(file => [file, fs.readFileSync(file, 'utf8')]);
assert.deepEqual(inventory(current), inventory(original), 'Rendered JSX primitives, props, handlers and text must match baseline');

const routeFiles = files.filter(file => /apps\/web\/app\/(?:.*\/)?(page|layout|route|loading)\.tsx?$/.test(file));
const currentRoutes = walk(path.join(root, 'apps/web/app')).map(file => path.relative(root, file).replaceAll('\\', '/')).filter(file => /\/(page|layout|route|loading)\.tsx?$/.test(file));
assert.deepEqual(currentRoutes.sort(), routeFiles.sort(), 'Route files must remain unchanged');
for (const file of routeFiles) {
  const before = parse(file, git('show', `${baseline}:${file}`));
  const after = parse(file, fs.readFileSync(path.join(root, file), 'utf8'));
  const contracts = source => source.statements.filter(node =>
    ts.isVariableStatement(node) && node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
    || ts.isFunctionDeclaration(node) && ['generateMetadata', 'generateStaticParams'].includes(node.name?.text)
  ).map(node => print(node, source));
  assert.deepEqual(contracts(after), contracts(before), `${file}: route exports must match baseline`);
}
const manifest = fs.readFileSync(path.join(root, 'docs/52coffee-frontend-refactor-manifest-main.md'), 'utf8');
const moves = [...manifest.matchAll(/^\| ([^|]+) \| ([^|]+) \|$/gm)]
  .map(match => [match[1].trim(), match[2].trim()])
  .filter(([from, to]) => from !== to && /^(features|components\/layout)\//.test(to));
let compared = 0;
for (const [from, to] of moves) {
  const destination = path.join(root, 'apps/web', to);
  assert(fs.existsSync(destination), `${to}: manifest destination must exist`);
  assert.equal(fs.existsSync(path.join(root, 'apps/web', from)), false, `${from}: old implementation must not remain`);
  if (['components/app-layout-shell.tsx', 'components/catalog-content.tsx'].includes(from)) continue;
  const before = git('show', `${baseline}:apps/web/${from}`);
  const after = fs.readFileSync(destination, 'utf8');
  const implementation = text => {
    const source = parse(from, text);
    return source.statements.filter(node => !ts.isImportDeclaration(node)).map(node => print(node, source));
  };
  if (from.endsWith('.css')) assert.equal(after.replace(/\r\n/g, '\n'), before.replace(/\r\n/g, '\n'), `${from}: CSS must match baseline`);
  else assert.deepEqual(implementation(after), implementation(before), `${from}: implementation must match baseline`);
  compared++;
}
for (const [from, to] of [
  ['app/page.module.css', 'features/home/home-page.module.css'],
  ['app/about/page.module.css', 'features/about/about-page.module.css'],
]) {
  assert.equal(fs.readFileSync(path.join(root, 'apps/web', to), 'utf8').replace(/\r\n/g, '\n'), git('show', `${baseline}:apps/web/${from}`), `${to}: page CSS must match baseline`);
}
for (const file of files.filter(file => file.startsWith('apps/web/app/api/') && file.endsWith('/route.ts'))) {
  const body = text => {
    const source = parse(file, text);
    return source.statements.filter(node => !ts.isImportDeclaration(node)).map(node => print(node, source));
  };
  assert.deepEqual(body(fs.readFileSync(path.join(root, file), 'utf8')), body(git('show', `${baseline}:${file}`)), `${file}: API handler behavior must match baseline`);
}
console.log(`PASS: baseline JSX and AnimatePresence trees/handlers/text, routes/metadata/static params, ${compared} moved implementations/CSS`);
