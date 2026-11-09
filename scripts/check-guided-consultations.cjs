const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer');

// Run with an available Puppeteer installation via NODE_PATH; no app dependency is needed.
const baseUrl = process.env.CONSULTATIONS_TEST_URL || 'http://127.0.0.1:3031';
const output = path.resolve(__dirname, '../design/guided-complete/implementation-qa');
const results = [];
fs.mkdirSync(output, { recursive: true });

async function clickText(page, selector, text) {
  const buttons = await page.$$(selector);
  for (const button of buttons) {
    if ((await button.evaluate((node) => node.textContent)).includes(text)) {
      await button.evaluate((node) => node.click());
      return;
    }
  }
  throw new Error(`Button missing: ${text}`);
}

async function changeNumber(page, selector, value) {
  await page.$eval(selector, (node, next) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, String(next));
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
  await page.waitForFunction((query, next) => document.querySelector(query).value === String(next), {}, selector, value);
}

async function checkLayout(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Horizontal overflow');
  assert.equal(await page.$$eval('.guided-stepper button', (nodes) => nodes.length), 3);
  assert.equal(await page.$$eval('.guided-stepper [aria-current="step"]', (nodes) => nodes.length), 1);
  assert.equal(await page.$eval('.coffee-poster', (node) => node.getAttribute('src').includes('bag-grand-reserve-cutout.png')), true);
  assert.equal(await page.$$eval('.guided-stepper button', (nodes) => nodes.every((node) => node.getBoundingClientRect().height >= 48)), true);
  assert.equal(await page.$$eval('header .icon-button', (nodes) => nodes.every((node) => {
    const rect = node.getBoundingClientRect();
    return !rect.width || (rect.left >= 0 && rect.right <= document.documentElement.clientWidth);
  })), true, 'Navbar controls clipped');
}

async function capture(page, name) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const height = await page.$eval('.consultation-page', (node) => Math.ceil(node.getBoundingClientRect().height));
  const width = page.viewport().width;
  await page.screenshot({ path: path.join(output, `${name}.png`), clip: { x: 0, y: 0, width, height }, captureBeyondViewport: true });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    for (const width of [1440, 768, 390, 320]) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewport({ width, height: 1000 });
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.evaluateOnNewDocument(() => {
        sessionStorage.setItem('52coffee:intro-seen', 'true');
        window.testWhatsAppUrls = [];
        window.open = (url) => { window.testWhatsAppUrls.push(url); return null; };
      });
      await page.goto(`${baseUrl}/work-with-us/consultations`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.guided-beans');
      await checkLayout(page);
      assert.equal(await page.$eval('.guided-stepper button:nth-child(2)', (node) => node.disabled), true);
      const initialBean = await page.$eval('.guided-beans select', (node) => node.value);
      assert.equal(await page.$eval('.consultation-ratios', (node) => getComputedStyle(node).marginTop), '0px', 'Avoid stacking space-y margins on top of flex gap');
      if (width > 900) {
        const tops = await page.evaluate(() => ['.consultation-controls', '.consultation-results'].map((query) => document.querySelector(query).getBoundingClientRect().top));
        assert.ok(Math.abs(tops[0] - tops[1]) < 8, 'Radar should start beside beans, without an empty upper column');
      }
      const radar = await page.$eval('#define-profile svg[role="img"]', (node) => node.innerHTML);
      await capture(page, `${width}-1-racikan`);
      await page.$eval('.guided-price-details', (node) => { node.open = true; });
      assert.equal(await page.$eval('.guided-price-details > div > span', (node) => getComputedStyle(node).color), 'rgb(255, 255, 255)', 'Price breakdown must be readable on charcoal');
      assert.equal(await page.$$eval('.guided-price-details > div', (nodes) => nodes.length), 3);
      await capture(page, `${width}-1-price-details`);
      await page.$eval('.guided-price-details', (node) => { node.open = false; });
      await clickText(page, '.guided-add-bean', 'Bean C');
      await page.waitForSelector('.consultation-ratio-cards > div:nth-child(3)');
      await changeNumber(page, '.consultation-ratio-cards input[type="range"]', 55);
      const ratios = await page.$$eval('.consultation-ratio-cards input[type="number"]', (nodes) => nodes.map((node) => Number(node.value)));
      assert.equal(ratios.reduce((sum, value) => sum + value, 0), 100);
      assert.notEqual(await page.$eval('#define-profile svg[role="img"]', (node) => node.innerHTML), radar);
      await checkLayout(page);
      await capture(page, `${width}-1-three-beans`);
      await clickText(page, '.consultation-ratio-cards button', 'Hapus Bean C');
      await page.waitForFunction(() => document.querySelectorAll('.consultation-ratio-cards > div').length === 2);
      await clickText(page, '.guided-navigation button', 'Lanjut');
      await page.waitForSelector('#pricing-calculator:not([hidden])');
      await checkLayout(page);
      const readOutputs = () => page.$$eval('.consultation-hpp dd', (nodes) => nodes.map((node) => Number(node.textContent.replace(/[^0-9-]/g, ''))));
      const values = await readOutputs();
      assert.equal(values[1], Math.round(values[0] * 18 / 1000));
      assert.equal(values[2], values[1] + 4500);
      assert.equal(values[3], 22000 - values[2]);
      assert.equal(values[5], values[3] * 100 * 30);
      await capture(page, `${width}-2-hpp`);
      await changeNumber(page, '#menu-price', 25000);
      await page.waitForFunction((expected) => Number(document.querySelectorAll('.consultation-hpp dd')[3].textContent.replace(/[^0-9-]/g, '')) === expected, {}, 25000 - values[2]);
      await page.click('input[name="hpp-source"][value="retail"]');
      await page.waitForSelector('#retail-bean');
      await checkLayout(page);
      assert.ok(await page.$eval('#retail-variant', (node) => node.options.length > 0));
      await page.click('input[name="hpp-source"][value="byob"]');
      await clickText(page, '.guided-navigation button', 'Lanjut');
      await page.waitForSelector('#consultation-form:not([hidden]) form');
      await checkLayout(page);
      await capture(page, `${width}-3-konsultasi`);
      await page.click('#consultation-form button[type="submit"]');
      assert.equal(await page.evaluate(() => window.testWhatsAppUrls.length), 0);
      assert.equal(await page.$eval('#businessName', (node) => node.validity.valueMissing), true);
      await capture(page, `${width}-3-validation`);
      for (const [id, value] of Object.entries({ businessName: 'Kafe Uji', contactName: 'Tim Uji', whatsapp: '081200000000', city: 'Malang', notes: 'Uji lokal, tidak dikirim.' })) {
        await page.type(`#${id}`, value);
      }
      for (const id of ['businessType', 'serviceType', 'useCase', 'profile']) {
        const value = await page.$eval(`#${id}`, (node) => node.options[1].value);
        await page.select(`#${id}`, value);
      }
      await page.click('#consultation-form details summary');
      await page.waitForFunction(() => document.querySelector('#consultation-form pre').textContent.includes('Kafe Uji'));
      const message = await page.$eval('#consultation-form pre', (node) => node.textContent);
      assert.ok(message.includes('Total HPP:'));
      await capture(page, `${width}-3-preview`);
      await page.click('#consultation-form button[type="submit"]');
      const urls = await page.evaluate(() => window.testWhatsAppUrls);
      assert.equal(urls.length, 1);
      assert.equal(new URL(urls[0]).searchParams.get('text'), message);
      await clickText(page, '.guided-selection-summary button', 'Edit racikan');
      assert.equal(await page.$eval('.guided-beans select', (node) => node.value), initialBean);
      await clickText(page, '.guided-stepper button', 'Konsultasi');
      assert.equal(await page.$eval('#businessName', (node) => node.value), 'Kafe Uji');
      assert.deepEqual(errors, []);
      results.push({ width, status: 'PASS', checks: ['three steps', 'layout overflow', 'bean C add/remove', 'ratio total', 'radar update', 'HPP formula', 'retail source', 'required validation', 'WhatsApp preview and URL intercepted', 'state retained', 'reduced motion', 'no page errors'] });
      await page.close();
    }
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluateOnNewDocument(() => sessionStorage.setItem('52coffee:intro-seen', 'true'));
    await page.setRequestInterception(true);
    page.on('request', (request) => request.url().includes('/api/catalog/publication') || request.url().includes('/api/catalog/authority')
      ? request.respond({ status: 503, contentType: 'application/json', body: '{}' }) : request.continue());
    await page.goto(`${baseUrl}/work-with-us/consultations`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#pricing-unavailable-title');
    await checkLayout(page);
    await capture(page, '390-catalog-unavailable');
    await clickText(page, '#pricing-calculator button', 'Konsultasi tanpa estimasi');
    await page.waitForSelector('#consultation-form:not([hidden]) form');
    assert.equal(await page.$('.guided-selection-summary'), null);
    await checkLayout(page);
    results.push({ status: 'PASS', checks: ['catalog unavailable', 'consultation without estimate'] });
    console.log(JSON.stringify(results, null, 2));
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
