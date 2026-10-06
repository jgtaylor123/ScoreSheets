const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const players = ['a', 'b', 'c'].map((id, index) => ({ id, scores: [index + 10] }));
const game = { id: 'sheet', players, isLiveChallenge: true };
const writes = [];
const context = { game, save: async (value, options) => writes.push({ value, options }) };
let source = fs.readFileSync('public/app.js', 'utf8');
source = source.slice(0, source.indexOf('  // Service Worker for Offline PWA Support')) + `
  activeGame = game;
  renderScoreTable = () => {};
  saveGame = save;
  globalThis.move = movePlayerColumn;
  globalThis.ordered = orderedSheetPlayers;
  globalThis.bind = bindPlayerColumnDragging;
})();`;
vm.runInNewContext(source, context);
(async () => {
  await context.move('a', 2);
  assert.deepEqual(Array.from(game.playerOrder), ['b', 'c', 'a']);
  assert.deepEqual(players.map(player => player.id), ['a', 'b', 'c'], 'Do not change identity or live turn order');
  assert.deepEqual(Array.from(context.ordered(game), p => p.scores[0]), [11, 12, 10], 'Scores follow their players');
  assert.equal(writes[0].options.syncToCloud, true);
  await context.move('a', 0);
  assert.deepEqual(Array.from(game.playerOrder), ['a', 'b', 'c']);
  await context.move('a', -1);
  await context.move('missing', 1);
  assert.equal(writes.length, 2, 'Invalid moves must not save');
  players.push({ id: 'd', scores: [null] });
  assert.equal(context.ordered(game).at(-1).id, 'd', 'New players append to the saved display order');

  const headers = players.map((player, index) => ({
    classList: { add() {}, remove() {} },
    getBoundingClientRect: () => ({ left: index * 100, width: 100 }),
  }));
  const handles = players.map((player, index) => ({
    dataset: { playerId: player.id }, listeners: {},
    addEventListener(type, handler) { this.listeners[type] = handler; },
    closest: () => headers[index],
    setPointerCapture() {}, hasPointerCapture: () => true, releasePointerCapture() {},
  }));
  const row = {
    querySelectorAll: selector => selector === '.player-column-handle' ? handles : headers,
    closest: () => ({ scrollLeft: 0, getBoundingClientRect: () => ({ left: 0, right: 400 }) }),
  };
  context.bind(row);
  const pointer = x => ({ button: 0, pointerId: 1, clientX: x, preventDefault() {} });
  handles[0].listeners.pointerdown(pointer(50));
  handles[0].listeners.pointermove(pointer(250));
  handles[0].listeners.pointerup(pointer(250));
  assert.deepEqual(Array.from(game.playerOrder), ['b', 'c', 'a', 'd'], 'Pointer drag must reorder columns');
  const count = writes.length;
  handles[0].listeners.pointerdown(pointer(50));
  handles[0].listeners.pointermove(pointer(350));
  handles[0].listeners.pointercancel();
  handles[0].listeners.pointerup(pointer(350));
  assert.equal(writes.length, count, 'Cancelled gestures must not reorder');
  console.log('Player order and pointer dragging tests passed.');
})().catch(err => { console.error(err); process.exitCode = 1; });
