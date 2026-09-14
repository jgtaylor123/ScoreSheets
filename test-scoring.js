const fs = require('fs');
const path = require('path');

const CARD_RANKS = [
  { rank: 'JOKER', label: '★', pts: -2, name: 'Joker', color: 'gold' },
  { rank: 'K', label: 'K', pts: 0, name: 'King', color: 'green' },
  { rank: 'A', label: 'A', pts: 1, name: 'Ace' },
  { rank: '2', label: '2', pts: 2, name: '2' },
  { rank: '3', label: '3', pts: 3, name: '3' },
  { rank: '4', label: '4', pts: 4, name: '4' },
  { rank: '5', label: '5', pts: 5, name: '5' },
  { rank: '6', label: '6', pts: 6, name: '6' },
  { rank: '7', label: '7', pts: 7, name: '7' },
  { rank: '8', label: '8', pts: 8, name: '8' },
  { rank: '9', label: '9', pts: 9, name: '9' },
  { rank: '10', label: '10', pts: 10, name: '10' },
  { rank: 'J', label: 'J', pts: 10, name: 'Jack', color: 'red' },
  { rank: 'Q', label: 'Q', pts: 10, name: 'Queen', color: 'red' }
];

const CARD_MAP = {};
CARD_RANKS.forEach(c => { CARD_MAP[c.rank] = c; });

function calculateGolfCardsScore(variant, cards) {
  const numCards = parseInt(variant, 10);
  const cols = numCards === 4 ? 2 : numCards === 6 ? 3 : numCards === 8 ? 4 : 3;
  const rows = numCards === 9 ? 3 : 2;

  let total = 0;
  const pairedSlotIndices = new Set();

  for (let c = 0; c < cols; c++) {
    if (rows === 2) {
      const topIdx = c;
      const botIdx = c + cols;
      const topCard = cards[topIdx];
      const botCard = cards[botIdx];

      if (topCard && botCard && topCard === botCard) {
        pairedSlotIndices.add(topIdx);
        pairedSlotIndices.add(botIdx);
      } else {
        if (topCard && CARD_MAP[topCard]) total += CARD_MAP[topCard].pts;
        if (botCard && CARD_MAP[botCard]) total += CARD_MAP[botCard].pts;
      }
    } else if (rows === 3) {
      const idx1 = c;
      const idx2 = c + cols;
      const idx3 = c + (cols * 2);
      const card1 = cards[idx1];
      const card2 = cards[idx2];
      const card3 = cards[idx3];

      if (card1 && card2 && card3 && card1 === card2 && card2 === card3) {
        pairedSlotIndices.add(idx1);
        pairedSlotIndices.add(idx2);
        pairedSlotIndices.add(idx3);
      } else if (card1 && card2 && card1 === card2) {
        pairedSlotIndices.add(idx1);
        pairedSlotIndices.add(idx2);
        if (card3 && CARD_MAP[card3]) total += CARD_MAP[card3].pts;
      } else if (card2 && card3 && card2 === card3) {
        pairedSlotIndices.add(idx2);
        pairedSlotIndices.add(idx3);
        if (card1 && CARD_MAP[card1]) total += CARD_MAP[card1].pts;
      } else if (card1 && card3 && card1 === card3) {
        pairedSlotIndices.add(idx1);
        pairedSlotIndices.add(idx3);
        if (card2 && CARD_MAP[card2]) total += CARD_MAP[card2].pts;
      } else {
        if (card1 && CARD_MAP[card1]) total += CARD_MAP[card1].pts;
        if (card2 && CARD_MAP[card2]) total += CARD_MAP[card2].pts;
        if (card3 && CARD_MAP[card3]) total += CARD_MAP[card3].pts;
      }
    }
  }

  return { total, pairedSlotIndices };
}

// Tests
const test1 = calculateGolfCardsScore(6, ['8', 'K', '5', '8', 'Q', 'JOKER']);
console.log('Test 1 (6-card):', test1);
if (test1.total !== 13 || !test1.pairedSlotIndices.has(0) || !test1.pairedSlotIndices.has(3)) {
  throw new Error('Test 1 failed');
}

const test2 = calculateGolfCardsScore(4, ['JOKER', 'JOKER', 'JOKER', 'JOKER']);
console.log('Test 2 (4-card double joker pairs):', test2);
if (test2.total !== 0 || test2.pairedSlotIndices.size !== 4) {
  throw new Error('Test 2 failed');
}

const test3 = calculateGolfCardsScore(4, ['A', '5', '2', 'K']);
console.log('Test 3 (4-card no pairs):', test3);
if (test3.total !== (1 + 5 + 2 + 0)) {
  throw new Error('Test 3 failed');
}

console.log('All scoring engine tests passed with 100% accuracy! 🎉');
