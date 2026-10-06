const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const game = { id: 'sheet', playerOrder: ['b', 'a'], players: [{ id: 'a', name: 'Alex', scores: [17] }, { id: 'b', name: 'Sam', scores: [23] }] };
const input = { value: '', focus() {} };
const dialog = { showModal() {}, close() {} };
const deleteButton = {};
let writes = 0;
let confirmed = true;
const context = {
  game,
  document: { getElementById: id => ({ 'edit-sheet-player-name': input, 'edit-player-dialog': dialog, 'btn-delete-sheet-player': deleteButton })[id] },
  save: async (value, options) => { writes++; assert.equal(options.syncToCloud, true); },
  confirm: () => confirmed,
};
let source = fs.readFileSync('public/app.js', 'utf8');
source = source.slice(0, source.indexOf('  // Service Worker for Offline PWA Support')) + `
  activeGame = game;
  renderScorecard = () => {};
  saveLastPlayerNames = () => {};
  showToast = () => {};
  saveGame = save;
  globalThis.open = openEditPlayerDialog;
  globalThis.rename = savePlayerName;
  globalThis.remove = deletePlayerFromSheet;
})();`;
vm.runInNewContext(source, context);
(async () => {
  context.open('a');
  assert.equal(input.value, 'Alex');
  input.value = '  Alexandra  ';
  await context.rename({ preventDefault() {} });
  assert.equal(game.players[0].name, 'Alexandra');
  assert.equal(game.players[0].scores[0], 17, 'Renaming must preserve scores and identity');
  context.open('a');
  confirmed = false;
  await context.remove();
  assert.equal(game.players.length, 2, 'Cancel must preserve the player');
  confirmed = true;
  await context.remove();
  assert.equal(game.players.length, 1);
  assert.equal(game.players[0].id, 'b');
  assert.equal(game.players[0].scores[0], 23);
  assert.deepEqual(Array.from(game.playerOrder), ['b']);
  context.open('b');
  assert.equal(deleteButton.disabled, true);
  await context.remove();
  assert.equal(game.players.length, 1, 'The final player must be preserved');
  assert.equal(writes, 2);
  console.log('Player rename and deletion tests passed.');
})().catch(err => { console.error(err); process.exitCode = 1; });
