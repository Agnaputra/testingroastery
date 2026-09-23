import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3000';
const cdpUrl = process.argv[3] ?? 'http://127.0.0.1:9222';
const pending = new Map();
const listeners = new Map();
let nextId = 0;

async function retry(fn, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

const target = await retry(async () => {
  const response = await fetch(`${cdpUrl}/json/new?${encodeURIComponent(baseUrl)}`, { method: 'PUT' });
  if (!response.ok) throw new Error(`CDP tab creation failed: ${response.status}`);
  return response.json();
});

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
    return;
  }

  const eventListeners = listeners.get(message.method) ?? [];
  listeners.delete(message.method);
  eventListeners.forEach((resolve) => resolve(message.params));
});

function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

function once(method) {
  return new Promise((resolve) => listeners.set(method, [...(listeners.get(method) ?? []), resolve]));
}

async function evaluate(expression) {
  return retry(async () => {
    const { result, exceptionDetails } = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value;
  }, 10);
}

async function settle() {
  await evaluate('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
}

async function goto(path) {
  const loaded = once('Page.loadEventFired');
  await send('Page.navigate', { url: `${baseUrl}${path}` });
  await loaded;
  await settle();
}

async function viewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  await settle();
}

async function screenshot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(new URL(name, import.meta.url), Buffer.from(data, 'base64'));
}

const results = [];
const record = (name) => results.push(`PASS ${name}`);

await send('Page.enable');
await send('Runtime.enable');
await viewport(1440, 1000);
await goto('/');

assert.equal(await evaluate(`getComputedStyle(document.querySelector('nav[aria-label="Navigasi utama"]')).display`), 'flex');
record('desktop navigation visible');

const desktopGroups = [
  ['About Us', 'about', ['Behind 52 Coffee & Roastery', 'Roastery Journey', 'Slowbar Ambience']],
  ['Catalogue', 'catalogue', ['Retail Beans', 'Slowbar Beverages', 'Glassware', 'Machine & Tools']],
  ['Partnerships', 'partnerships', ['Consultations', 'Wholesale & Partnership']],
  ['Coffee Lab', 'coffee-lab', ['Brewing Guidance', 'Build Your Own Blend', 'Coffee Experiments']],
];

for (const [label, id, expected] of desktopGroups) {
  await evaluate(`(() => {
    const nav = document.querySelector('nav[aria-label="Navigasi utama"]');
    const button = [...nav.querySelectorAll(':scope > div > button')].find((item) => item.textContent.trim() === ${JSON.stringify(label)});
    button.click();
  })()`);
  await settle();
  const labels = await evaluate(`[...document.querySelector('#desktop-${id}-navigation').children].map((item) => (item.matches('a, button') ? item : item.querySelector(':scope > a, :scope > button')).textContent.trim())`);
  assert.deepEqual(labels, expected);
  record(`${label} first level only`);
}

const nestedGroups = [
  ['partnerships', 'Consultations', 'partnerships-consultations', ['Formulir Consultation', 'Build Your Own Blend', 'Pricing Calculator']],
  ['coffee-lab', 'Brewing Guidance', 'brewing-guidance', ['Brewing Methods', 'Recipes', 'Grind Size', 'Ratio & Extraction']],
  ['coffee-lab', 'Build Your Own Blend', 'lab-blend', ['Choose Your Beans', 'Define Your Profile', 'Blend Development', 'Tasting & Adjustment']],
  ['coffee-lab', 'Coffee Experiments', 'coffee-experiments', ['Cupping Events', 'Roasting Experiments', 'Brewing Experiments']],
];

for (const [rootId, label, id, expected] of nestedGroups) {
  await evaluate(`(() => {
    const rootButton = [...document.querySelectorAll('nav[aria-label="Navigasi utama"] > div > button')].find((item) => item.getAttribute('aria-controls') === 'desktop-${rootId}-navigation');
    rootButton.click();
  })()`);
  await settle();
  await evaluate(`(() => {
    const button = [...document.querySelectorAll('#desktop-${rootId}-navigation > div > button')].find((item) => item.textContent.trim() === ${JSON.stringify(label)});
    button.click();
  })()`);
  await settle();
  const labels = await evaluate(`[...document.querySelectorAll('#desktop-${id}-navigation > a')].map((item) => item.textContent.trim())`);
  assert.deepEqual(labels, expected);
  record(`${label} second level`);
}

await goto('/coffee-lab/recipes');
await evaluate('new Promise((resolve) => setTimeout(resolve, 2500))');
await evaluate(`(() => {
  const rootButton = [...document.querySelectorAll('nav[aria-label="Navigasi utama"] > div > button')].find((item) => item.getAttribute('aria-controls') === 'desktop-coffee-lab-navigation');
  rootButton.click();
})()`);
await settle();
await evaluate(`(() => {
  const button = [...document.querySelectorAll('#desktop-coffee-lab-navigation > div > button')].find((item) => item.textContent.trim() === 'Build Your Own Blend');
  button.click();
})()`);
await settle();
await evaluate('new Promise((resolve) => setTimeout(resolve, 200))');
await screenshot('desktop-navigation.png');
await viewport(1280, 800);
assert.equal(await evaluate(`(() => {
  const rect = document.querySelector('#desktop-lab-blend-navigation').getBoundingClientRect();
  return rect.left >= 0 && rect.right <= window.innerWidth;
})()`), true);
record('desktop cascade fits 1280px viewport');
await viewport(1440, 1000);

await evaluate(`(() => {
  const button = [...document.querySelectorAll('nav[aria-label="Navigasi utama"] > div > button')].find((item) => item.textContent.trim() === 'Coffee Lab');
  button.focus();
  button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
})()`);
await settle();
assert.equal(await evaluate('document.activeElement.textContent.trim()'), 'Brewing Guidance');
await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
await settle();
assert.equal(await evaluate(`document.querySelector('#desktop-coffee-lab-navigation') === null`), true);
assert.equal(await evaluate('document.activeElement.textContent.trim()'), 'Coffee Lab');
record('keyboard open, focus, and Escape close');

await evaluate(`(() => {
  const button = [...document.querySelectorAll('nav[aria-label="Navigasi utama"] > div > button')].find((item) => item.textContent.trim() === 'Partnerships');
  button.click();
  document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
})()`);
await settle();
assert.equal(await evaluate(`document.querySelector('#desktop-partnerships-navigation') === null`), true);
record('click outside closes desktop menu');

await goto('/coffee-lab/recipes');
assert.equal(await evaluate(`document.querySelector('button[aria-controls="desktop-coffee-lab-navigation"]').getAttribute('aria-current')`), 'page');
record('active route indication');

await evaluate(`document.querySelector('button[aria-label="Cari kopi"]').click()`);
await settle();
assert.equal(await evaluate(`document.querySelector('[role="dialog"][aria-label="Pencarian Biji Kopi"]') !== null`), true);
await evaluate(`document.querySelector('button[aria-label="Tutup pencarian"]').click()`);
await settle();
record('search opens and closes');

await evaluate(`document.querySelector('button[aria-label^="Keranjang belanja"]').click()`);
await settle();
assert.equal(await evaluate(`document.querySelector('[role="dialog"][aria-labelledby="cart-drawer-title"]') !== null`), true);
await evaluate(`document.querySelector('button[aria-label="Tutup keranjang"]').click()`);
await settle();
record('cart opens and closes');

await evaluate(`document.querySelector('button[aria-label="Buka Virtual Barista"]').click()`);
await settle();
assert.equal(await evaluate(`document.querySelector('button[aria-label="Tutup percakapan"]') !== null`), true);
await evaluate(`document.querySelector('button[aria-label="Tutup percakapan"]').click()`);
await settle();
record('Virtual Barista opens and closes');

await viewport(390, 844);
await goto('/');
assert.equal(await evaluate(`getComputedStyle(document.querySelector('nav[aria-label="Navigasi utama"]')).display`), 'none');
await evaluate(`document.querySelector('button[aria-controls="mobile-navigation"]').click()`);
await settle();

for (const [label, id, expected] of [
  ['Partnerships', 'partnerships', ['Consultations', 'Wholesale & Partnership']],
  ['Coffee Lab', 'coffee-lab', ['Brewing Guidance', 'Build Your Own Blend', 'Coffee Experiments']],
]) {
  await evaluate(`(() => {
    const button = [...document.querySelectorAll('#mobile-navigation > div > div > button')].find((item) => item.textContent.trim().startsWith(${JSON.stringify(label)}));
    button.click();
  })()`);
  await settle();
  const labels = await evaluate(`[...document.querySelector('#mobile-${id}-navigation').children].map((item) => (item.matches('a, button') ? item : item.querySelector(':scope > a, :scope > button')).textContent.trim())`);
  assert.deepEqual(labels, expected);
  record(`${label} mobile accordion first level`);
}

await evaluate(`(() => {
  const button = [...document.querySelectorAll('#mobile-coffee-lab-navigation > div > button')].find((item) => item.textContent.trim().startsWith('Build Your Own Blend'));
  button.click();
})()`);
await settle();
assert.deepEqual(
  await evaluate(`[...document.querySelectorAll('#mobile-lab-blend-navigation > a')].map((item) => item.textContent.trim())`),
  ['Choose Your Beans', 'Define Your Profile', 'Blend Development', 'Tasting & Adjustment'],
);
record('mobile nested accordion');
await screenshot('mobile-navigation.png');

await send('Browser.close');
console.log(results.join('\n'));
