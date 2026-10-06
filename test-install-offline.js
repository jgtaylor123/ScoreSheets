const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function installTest(userAgent, standalone = false) {
  const events = {};
  const button = { addEventListener: (name, fn) => { button[name] = fn; } };
  const dialog = { showModal() { this.open = true; }, close() { this.open = false; } };
  const steps = {};
  const title = {};
  vm.runInNewContext(fs.readFileSync('public/install.js', 'utf8'), {
    document: { getElementById: id => ({ 'btn-install-app': button, 'install-app-dialog': dialog, 'install-app-steps': steps, 'install-app-title': title })[id] },
    navigator: { userAgent },
    window: { addEventListener: (name, fn) => { events[name] = fn; }, matchMedia: () => ({ matches: standalone }) },
  });
  assert.equal(button.hidden, false);
  if (standalone) {
    await button.click();
    assert.equal(title.textContent, 'ScoreSheets is installed');
    return;
  }
  await button.click();
  assert.equal(dialog.open, true);
  assert(steps.innerHTML.includes(/iPhone/.test(userAgent) ? 'Share' : 'Install app'));
  let prompted = 0;
  events.beforeinstallprompt({ preventDefault() {}, prompt: async () => { prompted++; }, userChoice: Promise.resolve({ outcome: 'accepted' }) });
  await button.click();
  assert.equal(prompted, 1);
  assert.equal(button.hidden, false);
  assert.equal(button.disabled, false);
  events.appinstalled();
  assert.equal(dialog.open, false);
}
async function offlineTest() {
  const events = {};
  const entries = new Map([['/', new Response('cached app')], ['/styles.css?v=16', new Response('cached styles')]]);
  const key = request => typeof request === 'string' ? request : new URL(request.url).pathname + new URL(request.url).search;
  const cache = { match: async request => entries.get(key(request)), put: async (request, response) => entries.set(key(request), response) };
  vm.runInNewContext(fs.readFileSync('public/service-worker.js', 'utf8'), {
    self: { addEventListener: (name, fn) => { events[name] = fn; }, location: { origin: 'https://gamescoresheets.web.app' } },
    caches: { open: async () => cache },
    fetch: async () => { throw Error('offline'); },
    URL, Response, AbortController, setTimeout, clearTimeout,
  });
  const respond = async request => {
    let response;
    events.fetch({ request, respondWith: promise => { response = promise; } });
    return response;
  };
  const match = await respond({ method: 'GET', mode: 'navigate', url: 'https://gamescoresheets.web.app/?game=match_123' });
  assert.equal(await match.text(), 'cached app', 'Match URLs must fall back to the root app shell');
  const style = await respond({ method: 'GET', mode: 'cors', url: 'https://gamescoresheets.web.app/styles.css?v=16' });
  assert.equal(await style.text(), 'cached styles');
  entries.clear();
  const recovery = await respond({ method: 'GET', mode: 'navigate', url: 'https://gamescoresheets.web.app/' });
  assert((await recovery.text()).includes('Try again'), 'A missing cache must show a retry control');
}
(async () => {
  await installTest('iPhone');
  await installTest('Android');
  await installTest('Android', true);
  await offlineTest();
  const html = fs.readFileSync('public/index.html', 'utf8');
  const sw = fs.readFileSync('public/service-worker.js', 'utf8');
  for (const [, asset] of html.matchAll(/(?:href|src)="(\/(?:styles\.css|app\.js|install\.js)[^"]*)"/g)) assert(sw.includes(asset), 'Precache current asset ' + asset);
  for (const icon of JSON.parse(fs.readFileSync('public/manifest.json')).icons) assert(fs.existsSync('public' + icon.src));
  console.log('Install flow and offline recovery tests passed.');
})().catch(err => { console.error(err); process.exitCode = 1; });
