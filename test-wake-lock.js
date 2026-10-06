const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const chip = { style: {}, setAttribute() {} };
const document = { visibilityState: 'visible', getElementById: () => chip };
let attempts = 0;
let rejectRequest = true;
let released;
const context = {
  document,
  localStorage: { getItem: () => null },
  console: { warn() {} },
  navigator: { wakeLock: { request: async () => {
    attempts++;
    if (rejectRequest) throw Error('Not allowed');
    return { released: false, addEventListener: (type, fn) => { released = fn; } };
  } } },
};
let source = fs.readFileSync('public/app.js', 'utf8');
source = source.slice(0, source.indexOf('  // Service Worker for Offline PWA Support')) + `
  currentViewId = 'view-scorecard';
  isWakeLockEnabled = true;
  globalThis.setView = id => { currentViewId = id; };
  globalThis.request = requestWakeLock;
  globalThis.update = updateWakeLockUI;
})();`;
vm.runInNewContext(source, context);
(async () => {
  await context.request();
  assert.equal(attempts, 1, 'A rejected wake lock must not retry recursively');
  context.update();
  assert.equal(attempts, 1, 'Rendering status must never request a wake lock');
  document.visibilityState = 'hidden';
  await context.request();
  assert.equal(attempts, 1, 'Do not request a lock in the background');
  document.visibilityState = 'visible';
  rejectRequest = false;
  await Promise.all([context.request(), context.request()]);
  assert.equal(attempts, 2, 'Concurrent requests must acquire only one lock');
  document.visibilityState = 'hidden';
  released();
  assert.equal(attempts, 2, 'Releasing in the background must not restart acquisition');
  document.visibilityState = 'visible';
  await context.request();
  assert.equal(attempts, 3, 'Foreground interaction can acquire the lock again');
  context.setView('view-home');
  await context.request();
  assert.equal(attempts, 3, 'The sheet list must never acquire a wake lock');
  console.log('Wake lock background/rejection and sheet-only tests passed.');
})().catch(err => { console.error(err); process.exitCode = 1; });
