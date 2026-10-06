const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function app({ local = [], cloud = [], saved = [], uid = 'owner', offline = false, cache = [] } = {}) {
  const storage = new Map([
    ['scoresheets_saved_matches', JSON.stringify(local)],
    ['scoresheets_saved_matches_account_' + uid, JSON.stringify(cache)],
  ]);
  let rendered;
  const queries = [];
  const snapshot = games => ({ forEach: fn => games.forEach(game => fn({ id: game.id, data: () => game })) });
  const db = {
    collection(name) {
      if (name === 'users') return { doc: () => ({ collection: () => ({
        get: async () => {
          if (offline) throw Error('offline');
          return snapshot(saved.map(id => ({ id })));
        },
      }) }) };
      assert.equal(name, 'games');
      return {
        where(field, operator, value) {
          queries.push([field, operator, value]);
          return { get: async options => {
            assert.equal(options.source, 'server');
            if (offline) throw Error('offline');
            return snapshot(cloud.filter(game => operator === '=='
              ? game[field] === value : (game[field] || []).includes(value)));
          } };
        },
        doc(id) { return { get: async () => {
          const game = cloud.find(g => g.id === id);
          return { id, exists: !!game, data: () => game };
        } }; },
      };
    },
  };
  const context = {
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    document: { getElementById: () => ({ innerHTML: '', classList: { contains: () => false } }) },
    console: { warn() {} }, dbStub: db, userStub: uid ? { uid } : null,
    rendered: games => { rendered = games; },
  };
  let source = fs.readFileSync('public/app.js', 'utf8');
  source = source.slice(0, source.indexOf('  // Service Worker for Offline PWA Support')) + `
    db = dbStub;
    currentUser = userStub;
    renderGamesList = rendered;
    globalThis.load = loadGamesList;
  })();`;
  vm.runInNewContext(source, context);
  return { load: context.load, games: () => rendered, storage, queries };
}
const game = (id, extra = {}) => ({ id, createdBy: 'owner', completed: false, updatedAt: '2026-10-01T00:00:00Z', ...extra });
(async () => {
  const cloud = Array.from({ length: 32 }, (_, i) => game('sheet-' + i));
  cloud.push(game('other-user', { createdBy: 'other' }));
  cloud.push(game('invite', { createdBy: 'other', participantUids: ['owner'] }));
  cloud.push(game('shared', { createdBy: 'other' }));
  const local = [game('deleted'), game('guest', { createdBy: 'anonymous' }), game('other-user', { createdBy: 'other' })];
  const laptop = app({ cloud, local, saved: ['shared', 'deleted'] });
  const phone = app({ cloud, saved: ['shared', 'deleted'] });
  await Promise.all([laptop.load(), phone.load()]);
  assert.equal(laptop.games().length, 34, 'No 25-sheet cutoff; include participating and saved sheets');
  assert.deepEqual(Array.from(laptop.games(), g => g.id), Array.from(phone.games(), g => g.id), 'Device history must not change account counts');
  assert(!laptop.games().some(g => ['deleted', 'guest', 'other-user'].includes(g.id)));
  assert(JSON.parse(laptop.storage.get('scoresheets_saved_matches')).some(g => g.id === 'guest'), 'Preserve guest history');
  const empty = app({ local });
  await empty.load();
  assert.equal(empty.games().length, 0, 'An empty account must not revive local cached sheets');
  const offline = app({ offline: true, local, cache: [game('cached-account-sheet')] });
  await offline.load();
  assert.equal(offline.games()[0].id, 'cached-account-sheet', 'Offline fallback must be account-scoped');
  const guest = app({ uid: null, local, cloud });
  await guest.load();
  assert.equal(guest.games().length, local.length);
  assert.equal(guest.queries.length, 0, 'Guest view must not fetch unrelated cloud sheets');
  const newer = game('sheet-0', { updatedAt: '2026-10-06T00:00:00Z', score: 17 });
  const edits = app({ local: [newer], cloud });
  await edits.load();
  assert.equal(edits.games().find(g => g.id === newer.id).score, 17, 'Preserve newer offline edits on existing sheets');
  console.log('Account sheet sync tests passed.');
})().catch(err => { console.error(err); process.exitCode = 1; });
