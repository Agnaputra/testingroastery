import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3000';
const cdpUrl = process.argv[3] ?? 'http://127.0.0.1:9224';
const pending = new Map();
const listeners = new Map();
let nextId = 0;

async function retry(fn, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { return await fn(); } catch (error) {
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
  const callbacks = listeners.get(message.method) ?? [];
  listeners.delete(message.method);
  callbacks.forEach((resolve) => resolve(message.params));
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
  const { result, exceptionDetails } = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  return result.value;
}

async function settle() {
  await evaluate('new Promise((resolve) => setTimeout(resolve, 500))');
}

async function viewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 });
}

async function openChat() {
  const loaded = once('Page.loadEventFired');
  await send('Page.navigate', { url: baseUrl });
  await loaded;
  await settle();
  await evaluate(`document.querySelector('button[aria-label="Buka Virtual Barista"]').click()`);
  await settle();
}

async function screenshot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(new URL(name, import.meta.url), Buffer.from(data, 'base64'));
}

await send('Page.enable');
await send('Runtime.enable');

await viewport(390, 844);
await openChat();
const mobile = await evaluate(`(() => {
  const dialog = document.querySelector('[role="dialog"][aria-label="Percakapan dengan Virtual Barista"]');
  const rect = dialog.getBoundingClientRect();
  const prompts = [...dialog.querySelectorAll('button')].filter((button) => ['Pilih kopi', 'Panduan seduh', 'Coffee Lab', 'Kemitraan'].includes(button.textContent.trim()));
  const controls = [...dialog.querySelectorAll('button[aria-label], input')];
  return {
    rect: { left: rect.left, right: rect.right, bottom: rect.bottom, height: rect.height },
    promptLabels: prompts.map((button) => button.textContent.trim()),
    minControlHeight: Math.min(...controls.map((control) => control.getBoundingClientRect().height)),
    text: dialog.textContent,
  };
})()`);
assert.deepEqual(mobile.promptLabels, ['Pilih kopi', 'Panduan seduh', 'Coffee Lab', 'Kemitraan']);
assert.equal(mobile.rect.left, 0);
assert.equal(mobile.rect.right, 390);
assert.equal(mobile.rect.bottom, 844);
assert.ok(mobile.rect.height <= 844);
assert.ok(mobile.minControlHeight >= 44);
assert.match(mobile.text, /Katalog 52 Coffee aktif/);
assert.doesNotMatch(mobile.text, /Katalog published|@52coffeeroastery/);
await screenshot('mobile.png');

await viewport(1440, 900);
await openChat();
const desktop = await evaluate(`(() => {
  const rect = document.querySelector('[role="dialog"][aria-label="Percakapan dengan Virtual Barista"]').getBoundingClientRect();
  return { width: rect.width, right: innerWidth - rect.right, bottom: innerHeight - rect.bottom, scrollbarGutter: innerWidth - document.documentElement.clientWidth };
})()`);
assert.ok(Math.abs(desktop.width - 420) < 1);
assert.ok(Math.abs(desktop.right - (24 + desktop.scrollbarGutter)) < 1);
assert.ok(Math.abs(desktop.bottom - 24) < 1);
await screenshot('desktop.png');

await send('Browser.close');
console.log(JSON.stringify({ mobile, desktop }, null, 2));
