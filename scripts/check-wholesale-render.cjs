const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('../apps/web/node_modules/typescript');
require.extensions['.css'] = module => { module.exports = {}; };
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
}
const React = require('../apps/web/node_modules/react');
const { renderToStaticMarkup } = require('../apps/web/node_modules/react-dom/server');
const { WholesaleSection } = require('../apps/web/app/work-with-us/wholesale-section.tsx');
const html = renderToStaticMarkup(React.createElement(WholesaleSection));
assert.equal((html.match(/type="radio"/g) || []).length, 3);
assert.equal((html.match(/required=""/g) || []).length, 3);
for (const id of ['business-name', 'contact-name', 'business-phone', 'business-location', 'service-type', 'estimated-volume', 'partnership-notes']) {
  assert.ok(html.includes(`id="${id}"`), `${id} must remain available`);
}
assert.ok(html.includes('WhatsApp: [nomor WhatsApp]'));
assert.ok(html.includes('<details'));
assert.ok(html.includes('Membuka WhatsApp belum mengirim pesan.'));
assert.ok(html.includes('Pasokan kopi yang berawal dari kebutuhanmu.'));
assert.ok(html.includes('Brief kemitraan'));
assert.ok(html.includes('href="#wholesale-business-form"'));
assert.ok(html.includes('id="wholesale-business-form"'));
assert.ok(html.includes('href="#wholesale-services"'));
assert.ok(decodeURIComponent(html).includes('/images/bag-prau.jpg'));
console.log('PASS: wholesale fields, required rules, service selection and message preview');
