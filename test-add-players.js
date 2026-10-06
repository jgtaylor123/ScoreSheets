const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const game = { id: 'sheet', holes: 9, players: [{ id: 'existing', name: 'JT', scores: [7, ...Array(8).fill(null)] }] };
const input = { value: ' Alex \n\n Sam ' };
let saved;
let closed = 0;
const context = {
  document: { getElementById: id => id === 'add-sheet-player-names' ? input : { close() { closed++; } } },
  game,
  save: async (value, options) => { assert.equal(options.syncToCloud, true); saved = value; },
};
let source = fs.readFileSync('public/app.js', 'utf8');
source = source.slice(0, source.indexOf('  // Service Worker for Offline PWA Support')) + `
  activeGame = game;
  addingPlayersToGameId = game.id;
  saveGame = save;
  saveLastPlayerNames = () => {};
  renderScorecard = () => {};
  showToast = () => {};
  globalThis.add = addPlayersToSheet;
})();`;
vm.runInNewContext(source, context);
(async () => {
  await context.add({ preventDefault() {} });
  assert.equal(saved, game);
  assert.equal(game.players.length, 3);
  assert.equal(game.players[0].scores[0], 7, 'Preserve existing scores');
  assert.equal(game.players[1].name, 'Alex');
  assert.equal(game.players[2].name, 'Sam');
  for (const player of game.players.slice(1)) {
    assert.equal(player.scores.length, 9);
    assert(player.scores.every(score => score === null));
    assert.equal(player.cardDetails.length, 9);
  }
  assert.equal(new Set(game.players.map(player => player.id)).size, 3);
  input.value = '   \n';
  await context.add({ preventDefault() {} });
  assert.equal(game.players.length, 3);
  assert.equal(closed, 1, 'Blank names leave the dialog open');
  game.completed = true;
  input.value = 'Pat';
  await context.add({ preventDefault() {} });
  assert.equal(game.players.length, 3, 'Completed sheets must not gain players');
  console.log('Add players tests passed.');
})().catch(err => { console.error(err); process.exitCode = 1; });
