/**
 * Golf Card Game Scorekeeper - Core Application
 * Handles State, Score Calculations, Pairing Logic, UI Rendering, and Firebase Firestore Sync
 */

(function () {
  'use strict';

  // --- Card Definition Constants & Scoring Rules ---
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

  // App State
  let currentUser = null;
  let activeGame = null;
  let gamesList = [];
  let db = null;
  let auth = null;
  let firestoreUnsubscribe = null;

  // Modal State for Hole Scoring
  let editingScoreCtx = {
    playerId: null,
    holeIdx: null,
    variant: 6,
    slots: [], // array of card ranks
    activeSlotIdx: 0,
    directScore: 0
  };

  // --- Firebase Initialization ---
  function initFirebase() {
    // If running on Firebase Hosting, it will automatically use the active project config if available
    // or fallback to offline local storage gracefully
    try {
      if (window.firebase && firebase.apps.length === 0) {
        // Look for window.firebaseConfig or hosting __/firebase/init.js
        if (window.firebaseConfig) {
          firebase.initializeApp(window.firebaseConfig);
        }
      }

      if (window.firebase && firebase.apps.length > 0) {
        auth = firebase.auth();
        db = firebase.firestore();

        auth.onAuthStateChanged(user => {
          currentUser = user;
          updateAuthUI();
          loadGamesList();
        });
      } else {
        console.warn('Firebase SDK initialized in local mode.');
        updateAuthUI();
        loadGamesList();
      }
    } catch (err) {
      console.warn('Firebase init error (using offline mode):', err);
      updateAuthUI();
      loadGamesList();
    }
  }

  // --- Local Storage Fallback & Helpers ---
  const LOCAL_STORAGE_KEY = 'golf_scoresheets_games';

  function getLocalGames() {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalGames(games) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(games));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  // --- UI Routing & Navigation ---
  function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('is-active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --- Auth UI Handler ---
  function updateAuthUI() {
    const authActionBtn = document.getElementById('btn-auth-action');
    const signedOutPane = document.getElementById('auth-signed-out-pane');
    const signedInPane = document.getElementById('auth-signed-in-pane');
    const authUserName = document.getElementById('auth-user-name');
    const authUserEmail = document.getElementById('auth-user-email');

    if (currentUser) {
      authActionBtn.textContent = '👤 ' + (currentUser.displayName || currentUser.email || 'My Account');
      signedOutPane.style.display = 'none';
      signedInPane.style.display = 'block';
      authUserName.textContent = currentUser.displayName || 'Golfer';
      authUserEmail.textContent = currentUser.email || '';
    } else {
      authActionBtn.textContent = '👤 Sign In';
      signedOutPane.style.display = 'block';
      signedInPane.style.display = 'none';
    }
  }

  // --- Game Calculation Logic ---
  // Calculates score given an array of card ranks for variants: 4, 6, 8, 9
  function calculateGolfCardsScore(variant, cards) {
    const numCards = parseInt(variant, 10);
    const cols = numCards === 4 ? 2 : numCards === 6 ? 3 : numCards === 8 ? 4 : 3;
    const rows = numCards === 9 ? 3 : 2;

    let total = 0;
    const pairedSlotIndices = new Set();

    // Check pairs per column
    for (let c = 0; c < cols; c++) {
      if (rows === 2) {
        const topIdx = c;
        const botIdx = c + cols;
        const topCard = cards[topIdx];
        const botCard = cards[botIdx];

        if (topCard && botCard && topCard === botCard) {
          // Column pair matches! Scores 0 pts
          pairedSlotIndices.add(topIdx);
          pairedSlotIndices.add(botIdx);
          // 0 points added
        } else {
          if (topCard && CARD_MAP[topCard]) total += CARD_MAP[topCard].pts;
          if (botCard && CARD_MAP[botCard]) total += CARD_MAP[botCard].pts;
        }
      } else if (rows === 3) { // 9 cards
        const idx1 = c;
        const idx2 = c + cols;
        const idx3 = c + (cols * 2);
        const card1 = cards[idx1];
        const card2 = cards[idx2];
        const card3 = cards[idx3];

        if (card1 && card2 && card3 && card1 === card2 && card2 === card3) {
          // Triple column match (Scores 0 or negative bonus depending on rule)
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

  // --- Setup Form Logic ---
  function initSetupForm() {
    const container = document.getElementById('player-inputs-container');
    container.innerHTML = '';

    const defaultNames = ['Tiger', 'Phil', 'Rory', 'Scottie'];
    defaultNames.forEach((name, i) => {
      addPlayerInputRow(name, i + 1);
    });
  }

  function addPlayerInputRow(defaultName = '', index = 1) {
    const container = document.getElementById('player-inputs-container');
    const div = document.createElement('div');
    div.className = 'player-row';
    const rowCount = container.children.length + 1;
    div.innerHTML = `
      <span class="player-number">#${rowCount}</span>
      <input type="text" class="form-input player-name-input" placeholder="Player name" value="${escapeHtml(defaultName || 'Player ' + rowCount)}" required />
      ${rowCount > 1 ? '<button type="button" class="btn btn-danger btn-sm btn-remove-player" title="Remove Player">✕</button>' : ''}
    `;

    const removeBtn = div.querySelector('.btn-remove-player');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        div.remove();
        refreshPlayerIndices();
      });
    }
    container.appendChild(div);
  }

  function refreshPlayerIndices() {
    const container = document.getElementById('player-inputs-container');
    Array.from(container.children).forEach((row, idx) => {
      const numSpan = row.querySelector('.player-number');
      if (numSpan) numSpan.textContent = `#${idx + 1}`;
    });
  }

  // --- Create & Save Game ---
  async function createNewGameFromForm() {
    const title = document.getElementById('input-game-title').value.trim() || 'Golf Card Match';
    const variantEl = document.querySelector('input[name="gameVariant"]:checked');
    const holesEl = document.querySelector('input[name="gameHoles"]:checked');

    const variant = parseInt(variantEl ? variantEl.value : '6', 10);
    const holes = parseInt(holesEl ? holesEl.value : '9', 10);

    const playerInputs = document.querySelectorAll('.player-name-input');
    const players = [];
    playerInputs.forEach((input, i) => {
      const name = input.value.trim() || `Player ${i + 1}`;
      players.push({
        id: 'p_' + Date.now() + '_' + i,
        name: name,
        scores: Array(holes).fill(null),
        cardDetails: Array(holes).fill(null)
      });
    });

    if (players.length === 0) {
      showToast('Please add at least one player', 'error');
      return;
    }

    const gameData = {
      id: 'golf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      title: title,
      variant: variant,
      holes: holes,
      players: players,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser ? currentUser.uid : 'anonymous'
    };

    await saveGame(gameData);
    openGame(gameData);
    showToast('Match created! 🏌️‍♂️', 'success');
  }

  // --- Database Sync (Firestore & LocalStorage) ---
  async function saveGame(game) {
    game.updatedAt = new Date().toISOString();

    // 1. Update local storage
    let localGames = getLocalGames();
    const existingIdx = localGames.findIndex(g => g.id === game.id);
    if (existingIdx >= 0) {
      localGames[existingIdx] = game;
    } else {
      localGames.unshift(game);
    }
    saveLocalGames(localGames);

    // 2. Sync to Firestore if online & configured
    if (db) {
      try {
        await db.collection('games').doc(game.id).set(game, { merge: true });
        if (currentUser) {
          await db.collection('users').doc(currentUser.uid)
            .collection('savedGames').doc(game.id)
            .set({
              id: game.id,
              title: game.title,
              variant: game.variant,
              holes: game.holes,
              completed: game.completed,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore sync warning:', err);
      }
    }
  }

  async function deleteGame(gameId) {
    if (!confirm('Are you sure you want to delete this scorecard?')) return;

    // Remove local
    let localGames = getLocalGames().filter(g => g.id !== gameId);
    saveLocalGames(localGames);

    // Remove firestore
    if (db) {
      try {
        await db.collection('games').doc(gameId).delete();
        if (currentUser) {
          await db.collection('users').doc(currentUser.uid).collection('savedGames').doc(gameId).delete();
        }
      } catch (err) {
        console.warn('Firestore delete error:', err);
      }
    }

    showToast('Game deleted', 'success');
    loadGamesList();
    showView('view-home');
  }

  async function loadGamesList() {
    const listContainer = document.getElementById('games-list-container');
    listContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Loading matches...</div>';

    let games = getLocalGames();

    // Fetch from Firestore if available
    if (db) {
      try {
        const snap = await db.collection('games').orderBy('updatedAt', 'desc').limit(20).get();
        const firestoreGames = [];
        snap.forEach(doc => firestoreGames.push(doc.data()));
        if (firestoreGames.length > 0) {
          // Merge
          const gameMap = {};
          games.forEach(g => { gameMap[g.id] = g; });
          firestoreGames.forEach(g => { gameMap[g.id] = g; });
          games = Object.values(gameMap).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          saveLocalGames(games);
        }
      } catch (err) {
        console.warn('Could not fetch Firestore games:', err);
      }
    }

    gamesList = games;
    renderGamesList(games);
  }

  function renderGamesList(games) {
    const listContainer = document.getElementById('games-list-container');
    if (games.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">⛳</div>
          <h4>No Saved Matches Yet</h4>
          <p>Start a new game to begin tracking cards, scores, and column pairs.</p>
          <button type="button" class="btn btn-primary btn-sm" id="btn-empty-new-game" style="margin-top: 1rem;">
            ➕ Start First Match
          </button>
        </div>
      `;
      const btn = document.getElementById('btn-empty-new-game');
      if (btn) btn.addEventListener('click', () => {
        initSetupForm();
        showView('view-setup');
      });
      return;
    }

    listContainer.innerHTML = games.map(game => {
      // Calculate leader
      let leaderText = 'No scores recorded yet';
      const playerTotals = game.players.map(p => {
        const sum = p.scores.reduce((acc, s) => s !== null ? acc + s : acc, 0);
        const playedCount = p.scores.filter(s => s !== null).length;
        return { name: p.name, sum, playedCount };
      });

      const activePlayers = playerTotals.filter(p => p.playedCount > 0);
      if (activePlayers.length > 0) {
        activePlayers.sort((a, b) => a.sum - b.sum);
        leaderText = `Leader: <strong>${escapeHtml(activePlayers[0].name)} (${activePlayers[0].sum} pts)</strong>`;
      }

      const formattedDate = new Date(game.createdAt || Date.now()).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return `
        <div class="game-item-card" data-game-id="${escapeHtml(game.id)}">
          <div class="game-item-top">
            <h4 class="game-item-title">${escapeHtml(game.title)}</h4>
            <span class="game-item-date">${formattedDate}</span>
          </div>
          <div class="game-item-meta">
            <span class="meta-pill variant">${game.variant}-Card</span>
            <span class="meta-pill">${game.holes} Holes</span>
            <span class="meta-pill">${game.players.length} Players</span>
            ${game.completed ? '<span class="meta-pill completed">Completed</span>' : ''}
          </div>
          <div class="game-item-leader">
            <span>${leaderText}</span>
          </div>
          <div class="game-item-actions">
            <button type="button" class="btn btn-primary btn-sm btn-open-game" data-game-id="${escapeHtml(game.id)}" style="flex:1">Open Scorecard</button>
            <button type="button" class="btn btn-outline btn-sm btn-delete-card" data-game-id="${escapeHtml(game.id)}">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind item clicks
    listContainer.querySelectorAll('.btn-open-game').forEach(btn => {
      btn.addEventListener('click', () => {
        const gId = btn.getAttribute('data-game-id');
        const found = gamesList.find(g => g.id === gId);
        if (found) openGame(found);
      });
    });

    listContainer.querySelectorAll('.btn-delete-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gId = btn.getAttribute('data-game-id');
        deleteGame(gId);
      });
    });
  }

  // --- Active Scorecard View ---
  function openGame(game) {
    activeGame = game;

    // Subscribe to real-time Firestore updates if game has id and db is active
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
      firestoreUnsubscribe = null;
    }

    if (db && game.id) {
      firestoreUnsubscribe = db.collection('games').doc(game.id).onSnapshot(doc => {
        if (doc.exists) {
          const freshData = doc.data();
          // Merge local in-progress state if remote is updated
          activeGame = freshData;
          renderScorecard();
        }
      });
    }

    renderScorecard();
    showView('view-scorecard');
  }

  function renderScorecard() {
    if (!activeGame) return;

    document.getElementById('sc-game-title').textContent = activeGame.title;
    document.getElementById('sc-variant-chip').textContent = `${activeGame.variant}-Card Golf`;
    document.getElementById('sc-holes-chip').textContent = `${activeGame.holes} Holes`;
    document.getElementById('sc-players-chip').textContent = `${activeGame.players.length} Players`;
    
    const statusChip = document.getElementById('sc-status-chip');
    statusChip.textContent = activeGame.completed ? 'Completed' : 'In Progress';
    statusChip.className = `meta-pill ${activeGame.completed ? 'completed' : 'variant'}`;

    renderLeaderboardBar();
    renderScoreTable();
  }

  function renderLeaderboardBar() {
    const bar = document.getElementById('sc-leaderboard-bar');
    const playerStats = activeGame.players.map((p, origIdx) => {
      const sum = p.scores.reduce((acc, s) => s !== null ? acc + s : acc, 0);
      const playedCount = p.scores.filter(s => s !== null).length;
      return { player: p, sum, playedCount, origIdx };
    });

    playerStats.sort((a, b) => a.sum - b.sum);

    bar.innerHTML = playerStats.map((item, rank) => {
      const isFirst = rank === 0 && item.playedCount > 0;
      return `
        <div class="leader-card ${isFirst ? 'rank-1' : ''}">
          <div class="leader-rank">#${rank + 1}</div>
          <div class="leader-info">
            <div class="leader-name">${escapeHtml(item.player.name)}</div>
            <div class="leader-sub">${item.playedCount}/${activeGame.holes} holes played</div>
          </div>
          <div class="leader-score">${item.sum}</div>
        </div>
      `;
    }).join('');
  }

  function renderScoreTable() {
    const theadRow = document.getElementById('score-table-head-row');
    const tbody = document.getElementById('score-table-body');
    const tfootRow = document.getElementById('score-table-foot-row');

    // Headers
    let headHtml = '<th class="hole-col">Hole</th>';
    activeGame.players.forEach(p => {
      headHtml += `<th>${escapeHtml(p.name)}</th>`;
    });
    theadRow.innerHTML = headHtml;

    // Body Rows (Holes 1 to N)
    let bodyHtml = '';
    for (let h = 0; h < activeGame.holes; h++) {
      const holeNumber = h + 1;
      bodyHtml += `<tr><td class="hole-col">Hole ${holeNumber}</td>`;
      activeGame.players.forEach(p => {
        const score = p.scores[h];
        const hasScore = score !== null && score !== undefined;
        let scoreClass = 'score-cell-btn';
        if (hasScore) {
          scoreClass += ' has-score';
          if (score < 0) scoreClass += ' negative';
          if (score >= 15) scoreClass += ' high-score';
        }

        const scoreText = hasScore ? score : '-';
        bodyHtml += `
          <td>
            <button type="button" class="${scoreClass}" data-player-id="${escapeHtml(p.id)}" data-hole-idx="${h}">
              <span>${scoreText}</span>
              ${hasScore ? '<span class="score-subtag">pts</span>' : ''}
            </button>
          </td>
        `;
      });
      bodyHtml += '</tr>';
    }
    tbody.innerHTML = bodyHtml;

    // Footer Totals Row
    let footHtml = '<td class="hole-col">TOTAL</td>';
    activeGame.players.forEach(p => {
      const total = p.scores.reduce((acc, s) => s !== null ? acc + s : acc, 0);
      footHtml += `<td class="total-col">${total}</td>`;
    });
    tfootRow.innerHTML = footHtml;

    // Bind cell buttons
    tbody.querySelectorAll('.score-cell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-player-id');
        const hIdx = parseInt(btn.getAttribute('data-hole-idx'), 10);
        openScoreModal(pId, hIdx);
      });
    });
  }

  // --- Score Input & Calculator Modal Logic ---
  function openScoreModal(playerId, holeIdx) {
    const player = activeGame.players.find(p => p.id === playerId);
    if (!player) return;

    editingScoreCtx.playerId = playerId;
    editingScoreCtx.holeIdx = holeIdx;
    editingScoreCtx.variant = activeGame.variant;
    editingScoreCtx.activeSlotIdx = 0;

    document.getElementById('modal-score-title').textContent = `Hole ${holeIdx + 1} Score - ${player.name}`;

    // Initialize or load existing card slots
    const existingCards = player.cardDetails && player.cardDetails[holeIdx];
    if (existingCards && Array.isArray(existingCards) && existingCards.length === activeGame.variant) {
      editingScoreCtx.slots = [...existingCards];
    } else {
      // Default empty/King slots
      editingScoreCtx.slots = Array(activeGame.variant).fill('K');
    }

    const existingScore = player.scores[holeIdx];
    editingScoreCtx.directScore = existingScore !== null ? existingScore : 0;
    document.getElementById('direct-score-display').textContent = editingScoreCtx.directScore;

    renderCardSlotsGrid();
    renderCardPalette();
    updateModalCalculatedScore();

    // Default to Calculator tab
    switchModalTab('tab-calculator');

    const modal = document.getElementById('modal-score-input');
    modal.classList.add('is-open');
  }

  function closeScoreModal() {
    document.getElementById('modal-score-input').classList.remove('is-open');
  }

  function renderCardSlotsGrid() {
    const grid = document.getElementById('calc-card-grid');
    grid.className = `card-grid-selector card-grid-${editingScoreCtx.variant}`;
    grid.innerHTML = '';

    const { pairedSlotIndices } = calculateGolfCardsScore(editingScoreCtx.variant, editingScoreCtx.slots);

    editingScoreCtx.slots.forEach((rank, idx) => {
      const cardInfo = CARD_MAP[rank] || CARD_MAP['K'];
      const isSelected = idx === editingScoreCtx.activeSlotIdx;
      const isPaired = pairedSlotIndices.has(idx);
      const isRed = cardInfo.color === 'red';

      const slotDiv = document.createElement('div');
      slotDiv.className = `card-slot ${isSelected ? 'is-active-slot' : ''} ${isPaired ? 'is-paired' : ''} ${isRed ? 'is-red' : ''}`;
      slotDiv.innerHTML = `
        <div class="card-slot-rank">${escapeHtml(cardInfo.label)}</div>
        <div class="card-slot-center">${cardInfo.rank === 'JOKER' ? '🃏' : cardInfo.label}</div>
        <div class="card-slot-points">${isPaired ? '0 pts' : cardInfo.pts + ' pts'}</div>
      `;

      slotDiv.addEventListener('click', () => {
        editingScoreCtx.activeSlotIdx = idx;
        renderCardSlotsGrid();
      });

      grid.appendChild(slotDiv);
    });
  }

  function renderCardPalette() {
    const palette = document.getElementById('calc-card-palette');
    palette.innerHTML = '';

    CARD_RANKS.forEach(card => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `card-pick-btn ${card.color === 'red' ? 'red-card' : ''}`;
      btn.innerHTML = `
        <span>${escapeHtml(card.label)}</span>
        <span class="pick-pts">${card.pts}p</span>
      `;

      btn.addEventListener('click', () => {
        // Set card in currently selected slot
        editingScoreCtx.slots[editingScoreCtx.activeSlotIdx] = card.rank;

        // Auto-advance to next slot
        if (editingScoreCtx.activeSlotIdx < editingScoreCtx.variant - 1) {
          editingScoreCtx.activeSlotIdx++;
        }

        renderCardSlotsGrid();
        updateModalCalculatedScore();
      });

      palette.appendChild(btn);
    });
  }

  function updateModalCalculatedScore() {
    const { total } = calculateGolfCardsScore(editingScoreCtx.variant, editingScoreCtx.slots);
    document.getElementById('calc-total-score').textContent = total;
  }

  function switchModalTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('is-active', pane.id === tabId);
    });
  }

  async function saveScoreFromModal() {
    const activeTab = document.querySelector('.tab-pane.is-active');
    let finalScore = 0;
    let cardDetails = null;

    if (activeTab.id === 'tab-calculator') {
      const { total } = calculateGolfCardsScore(editingScoreCtx.variant, editingScoreCtx.slots);
      finalScore = total;
      cardDetails = [...editingScoreCtx.slots];
    } else {
      finalScore = editingScoreCtx.directScore;
      cardDetails = null;
    }

    const player = activeGame.players.find(p => p.id === editingScoreCtx.playerId);
    if (player) {
      player.scores[editingScoreCtx.holeIdx] = finalScore;
      player.cardDetails[editingScoreCtx.holeIdx] = cardDetails;
      await saveGame(activeGame);
      renderScorecard();
      closeScoreModal();
      showToast(`Hole ${editingScoreCtx.holeIdx + 1} score saved for ${player.name}`, 'success');
    }
  }

  async function clearScoreFromModal() {
    const player = activeGame.players.find(p => p.id === editingScoreCtx.playerId);
    if (player) {
      player.scores[editingScoreCtx.holeIdx] = null;
      player.cardDetails[editingScoreCtx.holeIdx] = null;
      await saveGame(activeGame);
      renderScorecard();
      closeScoreModal();
      showToast(`Hole ${editingScoreCtx.holeIdx + 1} cleared`, 'success');
    }
  }

  // --- Share / Link Helper ---
  function shareCurrentGame() {
    if (!activeGame) return;
    const url = window.location.origin + window.location.pathname + '?game=' + activeGame.id;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Match link copied to clipboard! 📋', 'success');
      }).catch(() => {
        prompt('Copy match link:', url);
      });
    } else {
      prompt('Copy match link:', url);
    }
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Navigation & Buttons
    document.getElementById('nav-brand').addEventListener('click', () => {
      loadGamesList();
      showView('view-home');
    });

    document.getElementById('btn-hero-new-game').addEventListener('click', () => {
      initSetupForm();
      showView('view-setup');
    });

    document.getElementById('btn-new-game-nav').addEventListener('click', () => {
      initSetupForm();
      showView('view-setup');
    });

    document.getElementById('btn-cancel-setup').addEventListener('click', () => {
      showView('view-home');
    });

    document.getElementById('btn-cancel-setup-2').addEventListener('click', () => {
      showView('view-home');
    });

    document.getElementById('btn-show-rules').addEventListener('click', () => {
      showView('view-rules');
    });

    document.getElementById('btn-hero-rules').addEventListener('click', () => {
      showView('view-rules');
    });

    document.getElementById('btn-close-rules').addEventListener('click', () => {
      if (activeGame) {
        showView('view-scorecard');
      } else {
        showView('view-home');
      }
    });

    document.getElementById('btn-refresh-games').addEventListener('click', () => {
      loadGamesList();
      showToast('Matches refreshed', 'info');
    });

    document.getElementById('btn-back-to-home').addEventListener('click', () => {
      loadGamesList();
      showView('view-home');
    });

    document.getElementById('btn-add-player-row').addEventListener('click', () => {
      addPlayerInputRow('', document.querySelectorAll('.player-name-input').length + 1);
    });

    document.getElementById('new-game-form').addEventListener('submit', (e) => {
      e.preventDefault();
      createNewGameFromForm();
    });

    document.getElementById('btn-share-game').addEventListener('click', shareCurrentGame);

    document.getElementById('btn-delete-current-game').addEventListener('click', () => {
      if (activeGame) deleteGame(activeGame.id);
    });

    document.getElementById('btn-finish-game-toggle').addEventListener('click', async () => {
      if (!activeGame) return;
      activeGame.completed = !activeGame.completed;
      await saveGame(activeGame);
      renderScorecard();
      showToast(activeGame.completed ? 'Match marked as completed! 🏆' : 'Match set to in progress', 'success');
    });

    // Score Modal Tabs & Actions
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchModalTab(btn.getAttribute('data-tab'));
      });
    });

    document.getElementById('btn-close-score-modal').addEventListener('click', closeScoreModal);
    document.getElementById('btn-cancel-score-modal').addEventListener('click', closeScoreModal);
    document.getElementById('btn-save-score').addEventListener('click', saveScoreFromModal);
    document.getElementById('btn-clear-score').addEventListener('click', clearScoreFromModal);

    // Direct Numpad Buttons
    document.querySelectorAll('.numpad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        if (val === 'CLR') {
          editingScoreCtx.directScore = 0;
        } else {
          editingScoreCtx.directScore = parseInt(val, 10);
        }
        document.getElementById('direct-score-display').textContent = editingScoreCtx.directScore;
      });
    });

    // Auth Modal Actions
    const authModal = document.getElementById('modal-auth');
    document.getElementById('btn-auth-action').addEventListener('click', () => {
      authModal.classList.add('is-open');
    });

    document.getElementById('btn-close-auth-modal').addEventListener('click', () => {
      authModal.classList.remove('is-open');
    });

    document.getElementById('btn-continue-guest').addEventListener('click', () => {
      authModal.classList.remove('is-open');
    });

    document.getElementById('btn-google-sign-in').addEventListener('click', async () => {
      if (!auth) {
        showToast('Firebase Auth is ready once hosted on Firebase!', 'info');
        authModal.classList.remove('is-open');
        return;
      }
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        authModal.classList.remove('is-open');
        showToast('Signed in successfully!', 'success');
      } catch (err) {
        console.error('Sign in error:', err);
        showToast('Sign in error: ' + err.message, 'error');
      }
    });

    document.getElementById('btn-sign-out').addEventListener('click', async () => {
      if (auth) {
        await auth.signOut();
        authModal.classList.remove('is-open');
        showToast('Signed out', 'info');
      }
    });

    // Check URL parameters for direct game link: ?game=xyz
    const urlParams = new URLSearchParams(window.location.search);
    const linkedGameId = urlParams.get('game');
    if (linkedGameId) {
      setTimeout(async () => {
        let game = gamesList.find(g => g.id === linkedGameId);
        if (!game && db) {
          try {
            const doc = await db.collection('games').doc(linkedGameId).get();
            if (doc.exists) game = doc.data();
          } catch (e) {}
        }
        if (game) openGame(game);
      }, 500);
    }
  }

  // --- Service Worker for Offline PWA Support ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }

  // --- Bootstrap on DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initFirebase();
  });

})();
