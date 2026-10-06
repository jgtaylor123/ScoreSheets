const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Use the real page IDs and app startup wiring to catch errors that leave
// later controls without handlers, even when the app still renders.
const html = fs.readFileSync('public/index.html', 'utf8');
const elements = new Map([...html.matchAll(/id="([^"]+)"/g)].map(([, id]) => [id, {
  handlers: {}, dataset: {}, value: '', textContent: '',
  addEventListener(event, handler) { this.handlers[event] = handler; },
}]));
const context = {
  document: {
    getElementById: id => elements.get(id) || null,
    querySelectorAll: () => [],
    addEventListener() {},
  },
  window: { location: { search: '' } },
  navigator: {}, localStorage: { getItem: () => null }, URLSearchParams,
};
let source = fs.readFileSync('public/app.js', 'utf8');
source = source.slice(0, source.indexOf('  // Service Worker for Offline PWA Support')) + `
  setupEventListeners();
})();`;
vm.runInNewContext(source, context);
const click = id => {
  assert.equal(typeof elements.get(id).handlers.click, 'function', id + ' should be wired');
  elements.get(id).handlers.click();
};
const score = () => Number(elements.get('direct-score-display').textContent);
click('btn-score-inc');
assert.equal(score(), 1);
click('btn-score-inc');
assert.equal(score(), 2);
click('btn-score-dec');
assert.equal(score(), 1);
elements.get('input-direct-custom').value = '14';
click('btn-apply-custom-direct');
click('btn-score-inc');
assert.equal(score(), 15);
elements.get('input-direct-custom').value = '0';
click('btn-apply-custom-direct');
click('btn-score-dec');
assert.equal(score(), -1);
console.log('Score controls startup and click tests passed.');
