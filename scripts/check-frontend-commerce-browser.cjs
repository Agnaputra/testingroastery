// Offline browser regression; all customer writes and AI replies use explicit fixtures.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {spawn}=require('node:child_process');
const puppeteer=require(process.env.PUPPETEER_MODULE || 'puppeteer');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'.private/frontend-finalization-browser');fs.mkdirSync(output,{recursive:true});
const results=[];
require('../apps/web/node_modules/sucrase/register');
const {getPublishedProducts}=require('../apps/web/lib/catalog-master.ts');
const prices={};for(const product of getPublishedProducts()){for(const variant of product.variants)prices[`${product.slug}:beans:${variant.weightGrams}`]={slug:product.slug,kind:'beans',weightGrams:variant.weightGrams,amountIdr:variant.price};if(product.cupPrice)prices[`${product.slug}:cup:1`]={slug:product.slug,kind:'cup',weightGrams:1,amountIdr:product.cupPrice};}
const fixture=http.createServer((req,res)=>{
 res.setHeader('Content-Type','application/json');
 if(req.method==='GET'&&['/api/catalog/publication','/api/catalog/authority'].includes(req.url)){res.end(JSON.stringify({overrides:{},revision:1,effectiveCatalogFingerprint:'local-browser-fixture',prices}));return;}
 res.statusCode=401;res.end(JSON.stringify({detail:'Local QA: no authenticated session'}));
});
let web,browser,activePage;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 await new Promise((resolve,reject)=>{fixture.once('error',reject);fixture.listen(3089,'127.0.0.1',resolve);});
 const log=fs.openSync(path.join(output,'server.txt'),'w');
 web=spawn(process.execPath,[path.join(root,'apps/web/node_modules/next/dist/bin/next'),'start','-H','127.0.0.1','-p','3088'],{cwd:path.join(root,'apps/web'),env:{...process.env,AI_BACKEND_URL:'http://127.0.0.1:3089'},stdio:['ignore',log,log],windowsHide:true});
 await new Promise((resolve,reject)=>{web.once('error',reject);(async()=>{for(let i=0;i<60;i++){if(web.exitCode!==null) return reject(Error('QA web server exited'));try{const r=await fetch('http://127.0.0.1:3088/about');if(r.ok)return resolve();}catch{}await pause(500);}reject(Error('QA web server timeout'));})();});
 const executable=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
 browser=await puppeteer.launch({headless:true,executablePath:executable});
 for(const width of [1440,768,390]) {
  const page=await browser.newPage();activePage=page;const errors=[];let chatCalls=0;page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width,height:900});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.evaluateOnNewDocument(()=>sessionStorage.setItem('52coffee:intro-seen','true'));
  await page.setRequestInterception(true);page.on('request',r=>{const pathname=new URL(r.url()).pathname;
   const respond=(body,status=200)=>r.respond({status,contentType:'application/json',body:JSON.stringify(body)});
   if(pathname==='/api/customer/auth/me')return respond({id:'qa-user',email:'qa@example.invalid',role:'customer',emailVerified:true,googleLinked:false,displayName:'QA fixture',whatsapp:'6281200000000',createdAt:'2026-01-01'});
   if(pathname==='/api/customer/addresses')return respond([{id:'qa-address',recipientName:'QA fixture',fullAddress:'Alamat sintetis untuk QA',district:'Klojen',city:'Malang',province:'Jawa Timur',postalCode:'65111',whatsapp:'6281200000000',notes:'',isDefault:true}]);
   if(pathname==='/api/customer/checkout-policy')return respond({shippingCost:10000,shippingPolicy:'Fixture QA offline',shippingOptions:[{id:'qa-shipping',courier:'QA',service:'Fixture',duration:'',price:10000}],paymentHours:24,mode:'testing',paymentMethods:['qris_static','bca_transfer']});
   if(pathname==='/api/customer/orders'&&r.method()==='POST')return respond({detail:'Fixture QA: pesanan sengaja ditolak'},503);
   if(pathname==='/api/chat'){chatCalls++;return chatCalls===1?respond({reply:'Respons fixture QA untuk menguji antarmuka.',grounding:'none',intent:'unsupported',recommendedProductSlugs:[],actions:[]}):respond({detail:'Fixture outage'},503);}
   return r.url().startsWith('http://127.0.0.1:3088/')||r.url().startsWith('data:')?r.continue():r.abort();});
  for(const route of ['/','/checkout']) {
   const response=await page.goto('http://127.0.0.1:3088'+route,{waitUntil:'networkidle2'});assert(response.ok()||response.status()===304,`${width} ${route} HTTP ${response.status()} ${response.url()}`);
   await page.waitForSelector('#main-content');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   results.push({width,route,status:overflow?'FAIL':'PASS',check:'HTTP/render/no horizontal overflow'});
   if(route==='/') {
    await page.waitForSelector('button[aria-label^="Tambah "]');await page.click('button[aria-label^="Tambah "]');
    await page.waitForSelector('button[aria-label="Tutup notifikasi"]');
    await page.click('::-p-text(Lihat Keranjang)');
    await page.waitForSelector('button[aria-label="Tutup keranjang"]');
    const quantity=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('52coffee-cart-storage')).state.items.reduce((n,item)=>n+item.quantity,0));
    const initialQuantity=await quantity();
    await page.click('button[aria-label="Increase quantity"]');assert.equal(await quantity(),initialQuantity+1);
    await page.click('button[aria-label="Decrease quantity"]');assert.equal(await quantity(),initialQuantity);
    await page.click('button[aria-label="Tutup keranjang"]');await page.waitForSelector('button[aria-label="Tutup keranjang"]',{hidden:true});
    const rail=await page.$('[aria-label="Koleksi kopi pilihan. Geser secara horizontal untuk menjelajah."]');
    await rail.scrollIntoView();const bounds=await rail.boundingBox();
    await page.mouse.move(bounds.x+bounds.width/2,bounds.y+100);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width/2-100,bounds.y+100,{steps:8});await page.mouse.up();
    assert.equal(await quantity(),initialQuantity,'Dragging must not add an item');
    await page.click('button[aria-label="Buka Virtual Barista"]');await page.waitForSelector('[aria-label="Percakapan dengan Virtual Barista"]');
    await page.type('[aria-label="Pesan untuk Virtual Barista"]','Uji antarmuka QA');await page.click('[aria-label="Kirim pesan"]');
    await page.waitForFunction(()=>document.body.innerText.includes('Respons fixture QA untuk menguji antarmuka.'));
    await page.type('[aria-label="Pesan untuk Virtual Barista"]','Uji kegagalan QA');
    await page.waitForFunction(()=>!document.querySelector('[aria-label="Kirim pesan"]').disabled);await page.click('[aria-label="Kirim pesan"]');
    await page.waitForFunction(()=>document.body.innerText.includes('Virtual Barista sedang tidak tersedia. Kamu masih bisa membuka Catalogue atau Brewing Guidance.'));
    await page.click('button[aria-label="Tutup percakapan"]');
    await page.waitForSelector('[aria-controls="faq-panel-1"]');await page.click('[aria-controls="faq-panel-1"]');
    assert.equal(await page.$eval('[aria-controls="faq-panel-1"]',n=>n.getAttribute('aria-expanded')),'true');
    const processButton=await page.$('[aria-controls="process-panel"]:last-child');await processButton.click();
    await page.waitForFunction(()=>document.querySelector('#process-heading')?.textContent==='Rasa diselesaikan lewat seduhan dan percakapan.');
   }
   if(route==='/checkout') {
    await page.waitForSelector('#checkout-voucher');await page.waitForFunction(()=>!![...document.querySelectorAll('button')].find(n=>n.textContent.trim()==='Buat pesanan'&&!n.disabled));
    const before=await page.evaluate(()=>localStorage.getItem('52coffee-cart-storage'));
    const methods=await page.$$('input[name="paymentMethod"]');assert.equal(methods.length,2);await methods[1].click();
    await page.click('button[type="submit"]');
    await page.waitForFunction(()=>document.body.innerText.includes('Fixture QA: pesanan sengaja ditolak'));
    assert.equal(await page.evaluate(()=>localStorage.getItem('52coffee-cart-storage')),before,'Failed checkout must retain cart');
    await page.reload({waitUntil:'networkidle2'});await page.waitForSelector('#checkout-voucher');
    assert.equal(await page.evaluate(()=>localStorage.getItem('52coffee-cart-storage')),before,'Cart must survive reload');
    await page.click('button[aria-label^="Keranjang belanja"]');await page.waitForSelector('button[aria-label^="Hapus "]');
    await page.click('button[aria-label^="Hapus "]');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('52coffee-cart-storage')).state.items.length),0);
   }
  }
  assert.deepEqual(errors,[],`${width}: browser runtime errors`);await page.close();
 }
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify({checks:results.length,passed:results.filter(r=>r.status==='PASS').length,failures:results.filter(r=>r.status==='FAIL'),evidence:output},null,2));
 assert(results.every(r=>r.status==='PASS'),'Layout overflow detected; compare baseline before changing UI');
})().catch(error=>{console.error(error);fs.writeFileSync(path.join(output,'partial-results.json'),JSON.stringify({results,error:error.message},null,2));process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(web)web.kill();fixture.close();});
