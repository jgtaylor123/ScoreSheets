/**
 * ScoreSheets - Universal Digital Scorekeeper & Match Tracker
 * Supports Golf Card Game, Generic Round-by-Round Sheets, and easily extensible game modules.
 */

(function () {
  'use strict';

  // ==========================================================
  // GAMES REGISTRY & CONFIGURATIONS
  // ==========================================================

  const GAMES_REGISTRY = {
    golf: {
      id: 'golf',
      name: 'Golf Card Game',
      icon: '⛳',
      badge: 'Cards',
      featured: true,
      scoreType: 'lowest', // lowest total score wins
      scoreLabel: 'Lowest Score Wins',
      roundName: 'Hole',
      roundPlural: 'Holes',
      description: 'Classic 4, 6, 8, or 9-card Golf. Layout pairs in columns cancel to 0 pts, Jokers are -2 pts, Kings are 0 pts.',
      variants: [
        { id: 4, name: '4-Card Golf', desc: '2x2 Grid (Quick)', default: false },
        { id: 6, name: '6-Card Golf', desc: '2x3 Grid (Classic)', default: true },
        { id: 8, name: '8-Card Golf', desc: '2x4 Grid', default: false },
        { id: 9, name: '9-Card Golf', desc: '3x3 Grid', default: false }
      ],
      roundOptions: [
        { count: 6, label: '6 Holes', desc: 'Short Match' },
        { count: 9, label: '9 Holes', desc: 'Standard Half', default: true },
        { count: 18, label: '18 Holes', desc: 'Full Championship' }
      ],
      defaultVariant: 6,
      defaultRounds: 9,
      hasCardCalculator: true
    },
    generic_rounds: {
      id: 'generic_rounds',
      name: 'Round-by-Round Sheet',
      icon: '📝',
      badge: 'Tabletop / Card',
      featured: false,
      scoreType: 'highest', // default, can be toggled via variant
      scoreLabel: 'Highest Score Wins',
      roundName: 'Round',
      roundPlural: 'Rounds',
      description: 'Universal scorekeeper for any card, board, or dice game with rounds (e.g. Rummy, Farkle, Yahtzee, Wizard, Phase 10).',
      variants: [
        { id: 'highest', name: 'Highest Score Wins', desc: 'Standard point accumulation', default: true },
        { id: 'lowest', name: 'Lowest Score Wins', desc: 'Penalty / trick avoidance', default: false }
      ],
      roundOptions: [
        { count: 5, label: '5 Rounds', desc: 'Quick Game' },
        { count: 7, label: '7 Rounds', desc: 'Standard', default: true },
        { count: 10, label: '10 Rounds', desc: 'Extended Match' },
        { count: 12, label: '12 Rounds', desc: 'Championship' }
      ],
      defaultVariant: 'highest',
      defaultRounds: 7,
      hasCardCalculator: false
    }
  };

  // --- Golf Card Constants & Values ---
  const GOLF_CARD_RANKS = [
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

  const GOLF_CARD_MAP = {};
  GOLF_CARD_RANKS.forEach(c => { GOLF_CARD_MAP[c.rank] = c; });

  // App State
  let currentUser = null;
  let activeGame = null;
  let gamesList = [];
  let db = null;
  let auth = null;
  let firestoreUnsubscribe = null;

  // Selected game in setup form
  let setupSelectedGameType = 'golf';

  // Modal State for Round Scoring
  let editingScoreCtx = {
    playerId: null,
    holeIdx: null,
    variant: 6,
    slots: [],
    activeSlotIdx: 0,
    directScore: 0
  };

  // ==========================================================
  // FIREBASE INITIALIZATION & SYNC
  // ==========================================================

  function initFirebase() {
    try {
      if (window.firebase && firebase.apps.length === 0) {
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
        console.warn('ScoreSheets initialized in local offline mode.');
        updateAuthUI();
        loadGamesList();
      }
    } catch (err) {
      console.warn('Firebase init error (using offline mode):', err);
      updateAuthUI();
      loadGamesList();
    }
  }

  // Local Storage Fallback
  const LOCAL_STORAGE_KEY = 'scoresheets_saved_matches';

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

  // ==========================================================
  // UI ROUTING & NAVIGATION
  // ==========================================================

  function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('is-active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

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
      authUserName.textContent = currentUser.displayName || 'Player';
      authUserEmail.textContent = currentUser.email || '';
    } else {
      authActionBtn.textContent = '👤 Sign In';
      signedOutPane.style.display = 'block';
      signedInPane.style.display = 'none';
    }
  }

  // ==========================================================
  // HOME SCREEN & CATALOG
  // ==========================================================

  function renderGameCatalog() {
    const container = document.getElementById('games-catalog-container');
    container.innerHTML = Object.values(GAMES_REGISTRY).map(game => `
      <div class="game-catalog-card ${game.featured ? 'featured' : ''}" data-game-id="${game.id}">
        <div>
          <div class="game-catalog-top">
            <div class="game-catalog-icon">${game.icon}</div>
            <div>
              <h4 class="game-catalog-title">${escapeHtml(game.name)}</h4>
              <span class="game-catalog-badge">${escapeHtml(game.badge)}</span>
            </div>
          </div>
          <p class="game-catalog-desc" style="margin-top: 0.75rem;">${escapeHtml(game.description)}</p>
        </div>
        <div class="game-catalog-footer">
          <span class="game-catalog-meta">${game.hasCardCalculator ? '🎴 Card Calculator' : '🔢 Custom Scoring'}</span>
          <button type="button" class="btn btn-primary btn-sm btn-quick-start" data-game-type="${game.id}">
            Play Now ➔
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-quick-start').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.getAttribute('data-game-type');
        setupSelectedGameType = type;
        initSetupForm(type);
        showView('view-setup');
      });
    });
  }

  // ==========================================================
  // GOLF CARD GAME SCORING ENGINE
  // ==========================================================

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
          if (topCard && GOLF_CARD_MAP[topCard]) total += GOLF_CARD_MAP[topCard].pts;
          if (botCard && GOLF_CARD_MAP[botCard]) total += GOLF_CARD_MAP[botCard].pts;
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
          if (card3 && GOLF_CARD_MAP[card3]) total += GOLF_CARD_MAP[card3].pts;
        } else if (card2 && card3 && card2 === card3) {
          pairedSlotIndices.add(idx2);
          pairedSlotIndices.add(idx3);
          if (card1 && GOLF_CARD_MAP[card1]) total += GOLF_CARD_MAP[card1].pts;
        } else if (card1 && card3 && card1 === card3) {
          pairedSlotIndices.add(idx1);
          pairedSlotIndices.add(idx3);
          if (card2 && GOLF_CARD_MAP[card2]) total += GOLF_CARD_MAP[card2].pts;
        } else {
          if (card1 && GOLF_CARD_MAP[card1]) total += GOLF_CARD_MAP[card1].pts;
          if (card2 && GOLF_CARD_MAP[card2]) total += GOLF_CARD_MAP[card2].pts;
          if (card3 && GOLF_CARD_MAP[card3]) total += GOLF_CARD_MAP[card3].pts;
        }
      }
    }

    return { total, pairedSlotIndices };
  }

  // ==========================================================
  // SETUP FORM DYNAMIC CONFIGURATION
  // ==========================================================

  function renderSetupGameTypeSelector() {
    const container = document.getElementById('setup-game-type-selector');
    container.innerHTML = Object.values(GAMES_REGISTRY).map(game => `
      <label class="game-select-card">
        <input type="radio" name="setupGameType" value="${game.id}" ${game.id === setupSelectedGameType ? 'checked' : ''} />
        <div class="game-select-label">
          <span class="icon">${game.icon}</span>
          <div>
            <strong>${escapeHtml(game.name)}</strong>
            <small>${escapeHtml(game.badge)}</small>
          </div>
        </div>
      </label>
    `).join('');

    container.querySelectorAll('input[name="setupGameType"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        setupSelectedGameType = e.target.value;
        updateSetupFormForGame(setupSelectedGameType);
      });
    });
  }

  function updateSetupFormForGame(gameType) {
    const game = GAMES_REGISTRY[gameType] || GAMES_REGISTRY.golf;

    // Default title
    const titleInput = document.getElementById('input-game-title');
    if (!titleInput.value || titleInput.value.includes('Match') || titleInput.value.includes('Game')) {
      titleInput.value = `${game.name} Match`;
    }

    // Variant Options
    const variantOptionsContainer = document.getElementById('setup-variant-options');
    const variantLabel = document.getElementById('setup-variant-label');
    variantLabel.textContent = gameType === 'golf' ? 'Cards Per Player (Grid Variant)' : 'Win Condition / Rules Variant';

    variantOptionsContainer.innerHTML = game.variants.map((v, idx) => `
      <label class="choice-card">
        <input type="radio" name="gameVariant" value="${v.id}" ${v.default || idx === 0 ? 'checked' : ''} />
        <div class="choice-label">
          <strong>${escapeHtml(v.name)}</strong>
          <span>${escapeHtml(v.desc)}</span>
        </div>
      </label>
    `).join('');

    // Rounds / Holes Options
    const roundsContainer = document.getElementById('setup-rounds-options');
    const roundsLabel = document.getElementById('setup-rounds-label');
    roundsLabel.textContent = `Number of ${game.roundPlural}`;

    roundsContainer.innerHTML = game.roundOptions.map((r, idx) => `
      <label class="choice-card">
        <input type="radio" name="gameHoles" value="${r.count}" ${r.default || idx === 0 ? 'checked' : ''} />
        <div class="choice-label">
          <strong>${r.label}</strong>
          <span>${escapeHtml(r.desc)}</span>
        </div>
      </label>
    `).join('');
  }

  function initSetupForm(preferredGameType = 'golf') {
    setupSelectedGameType = preferredGameType;
    renderSetupGameTypeSelector();
    updateSetupFormForGame(setupSelectedGameType);

    const container = document.getElementById('player-inputs-container');
    container.innerHTML = '';
    const defaultNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
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

  // ==========================================================
  // CREATE & SAVE MATCHES
  // ==========================================================

  async function createNewGameFromForm() {
    const gameConfig = GAMES_REGISTRY[setupSelectedGameType] || GAMES_REGISTRY.golf;
    const title = document.getElementById('input-game-title').value.trim() || `${gameConfig.name} Match`;
    
    const variantEl = document.querySelector('input[name="gameVariant"]:checked');
    const holesEl = document.querySelector('input[name="gameHoles"]:checked');

    let variant = variantEl ? variantEl.value : gameConfig.defaultVariant;
    if (!isNaN(parseInt(variant, 10)) && setupSelectedGameType === 'golf') {
      variant = parseInt(variant, 10);
    }

    const holes = parseInt(holesEl ? holesEl.value : gameConfig.defaultRounds, 10);

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

    let scoreType = gameConfig.scoreType;
    if (setupSelectedGameType === 'generic_rounds' && variant === 'lowest') {
      scoreType = 'lowest';
    }

    const gameData = {
      id: 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      gameType: setupSelectedGameType,
      title: title,
      variant: variant,
      holes: holes,
      scoreType: scoreType,
      players: players,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser ? currentUser.uid : 'anonymous'
    };

    await saveGame(gameData);
    openGame(gameData);
    showToast(`${gameConfig.name} match created! 🎲`, 'success');
  }

  async function saveGame(game) {
    game.updatedAt = new Date().toISOString();

    let localGames = getLocalGames();
    const existingIdx = localGames.findIndex(g => g.id === game.id);
    if (existingIdx >= 0) {
      localGames[existingIdx] = game;
    } else {
      localGames.unshift(game);
    }
    saveLocalGames(localGames);

    if (db) {
      try {
        await db.collection('games').doc(game.id).set(game, { merge: true });
        if (currentUser) {
          await db.collection('users').doc(currentUser.uid)
            .collection('savedGames').doc(game.id)
            .set({
              id: game.id,
              gameType: game.gameType || 'golf',
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

    let localGames = getLocalGames().filter(g => g.id !== gameId);
    saveLocalGames(localGames);

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

    showToast('Match deleted', 'success');
    loadGamesList();
    showView('view-home');
  }

  async function loadGamesList() {
    const listContainer = document.getElementById('games-list-container');
    listContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Loading matches...</div>';

    let games = getLocalGames();

    if (db) {
      try {
        const snap = await db.collection('games').orderBy('updatedAt', 'desc').limit(25).get();
        const firestoreGames = [];
        snap.forEach(doc => firestoreGames.push(doc.data()));
        if (firestoreGames.length > 0) {
          const gameMap = {};
          games.forEach(g => { gameMap[g.id] = g; });
          firestoreGames.forEach(g => { gameMap[g.id] = g; });
          games = Object.values(gameMap).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          saveLocalGames(games);
        }
      } catch (err) {
        console.warn('Could not fetch Firestore matches:', err);
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
          <div class="empty-state-icon">📝</div>
          <h4>No Matches Played Yet</h4>
          <p>Choose an available ScoreSheet above to start tracking your next game.</p>
          <button type="button" class="btn btn-primary btn-sm" id="btn-empty-new-game" style="margin-top: 1rem;">
            ➕ Start First Match
          </button>
        </div>
      `;
      const btn = document.getElementById('btn-empty-new-game');
      if (btn) btn.addEventListener('click', () => {
        initSetupForm('golf');
        showView('view-setup');
      });
      return;
    }

    listContainer.innerHTML = games.map(game => {
      const gType = game.gameType || 'golf';
      const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;
      const isLowestWins = game.scoreType === 'lowest';

      let leaderText = 'No scores recorded yet';
      const playerTotals = game.players.map(p => {
        const sum = p.scores.reduce((acc, s) => s !== null ? acc + s : acc, 0);
        const playedCount = p.scores.filter(s => s !== null).length;
        return { name: p.name, sum, playedCount };
      });

      const activePlayers = playerTotals.filter(p => p.playedCount > 0);
      if (activePlayers.length > 0) {
        if (isLowestWins) {
          activePlayers.sort((a, b) => a.sum - b.sum);
        } else {
          activePlayers.sort((a, b) => b.sum - a.sum);
        }
        leaderText = `Leader: <strong>${escapeHtml(activePlayers[0].name)} (${activePlayers[0].sum} pts)</strong>`;
      }

      const formattedDate = new Date(game.createdAt || Date.now()).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const roundLabel = `${game.holes} ${gameConfig.roundPlural || 'Rounds'}`;
      const variantDisplay = typeof game.variant === 'number' ? `${game.variant}-Card` : `${game.variant}`;

      return `
        <div class="game-item-card" data-game-id="${escapeHtml(game.id)}">
          <div class="game-item-top">
            <h4 class="game-item-title">${gameConfig.icon} ${escapeHtml(game.title)}</h4>
            <span class="game-item-date">${formattedDate}</span>
          </div>
          <div class="game-item-meta">
            <span class="meta-pill variant">${escapeHtml(gameConfig.name)}</span>
            <span class="meta-pill">${variantDisplay}</span>
            <span class="meta-pill">${roundLabel}</span>
            <span class="meta-pill">${game.players.length} Players</span>
            ${game.completed ? '<span class="meta-pill completed">Completed</span>' : ''}
          </div>
          <div class="game-item-leader">
            <span>${leaderText}</span>
          </div>
          <div class="game-item-actions">
            <button type="button" class="btn btn-primary btn-sm btn-open-game" data-game-id="${escapeHtml(game.id)}" style="flex:1">Open ScoreSheet</button>
            <button type="button" class="btn btn-outline btn-sm btn-delete-card" data-game-id="${escapeHtml(game.id)}">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

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

  // ==========================================================
  // ACTIVE SCORECARD VIEW
  // ==========================================================

  function openGame(game) {
    activeGame = game;

    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
      firestoreUnsubscribe = null;
    }

    if (db && game.id) {
      firestoreUnsubscribe = db.collection('games').doc(game.id).onSnapshot(doc => {
        if (doc.exists) {
          activeGame = doc.data();
          renderScorecard();
        }
      });
    }

    renderScorecard();
    showView('view-scorecard');
  }

  function renderScorecard() {
    if (!activeGame) return;

    const gType = activeGame.gameType || 'golf';
    const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;
    const isLowestWins = activeGame.scoreType === 'lowest';

    document.getElementById('sc-game-title').textContent = activeGame.title;
    document.getElementById('sc-game-type-chip').textContent = `${gameConfig.icon} ${gameConfig.name}`;
    document.getElementById('sc-variant-chip').textContent = typeof activeGame.variant === 'number' ? `${activeGame.variant}-Card` : `${activeGame.variant}`;
    document.getElementById('sc-holes-chip').textContent = `${activeGame.holes} ${gameConfig.roundPlural || 'Rounds'}`;
    document.getElementById('sc-win-condition-chip').textContent = isLowestWins ? 'Lowest Wins ⛳' : 'Highest Wins 🏆';

    const statusChip = document.getElementById('sc-status-chip');
    statusChip.textContent = activeGame.completed ? 'Completed' : 'In Progress';
    statusChip.className = `meta-pill ${activeGame.completed ? 'completed' : 'variant'}`;

    renderLeaderboardBar();
    renderScoreTable();
  }

  function renderLeaderboardBar() {
    const isLowestWins = activeGame.scoreType === 'lowest';
    const gType = activeGame.gameType || 'golf';
    const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;

    const bar = document.getElementById('sc-leaderboard-bar');
    const playerStats = activeGame.players.map((p, origIdx) => {
      const sum = p.scores.reduce((acc, s) => s !== null ? acc + s : acc, 0);
      const playedCount = p.scores.filter(s => s !== null).length;
      return { player: p, sum, playedCount, origIdx };
    });

    if (isLowestWins) {
      playerStats.sort((a, b) => a.sum - b.sum);
    } else {
      playerStats.sort((a, b) => b.sum - a.sum);
    }

    bar.innerHTML = playerStats.map((item, rank) => {
      const isFirst = rank === 0 && item.playedCount > 0;
      return `
        <div class="leader-card ${isFirst ? 'rank-1' : ''}">
          <div class="leader-rank">#${rank + 1}</div>
          <div class="leader-info">
            <div class="leader-name">${escapeHtml(item.player.name)}</div>
            <div class="leader-sub">${item.playedCount}/${activeGame.holes} ${gameConfig.roundPlural.toLowerCase()}</div>
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

    const gType = activeGame.gameType || 'golf';
    const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;
    const roundName = gameConfig.roundName || 'Round';

    // Headers
    let headHtml = `<th class="hole-col">${roundName}</th>`;
    activeGame.players.forEach(p => {
      headHtml += `<th>${escapeHtml(p.name)}</th>`;
    });
    theadRow.innerHTML = headHtml;

    // Body Rows
    let bodyHtml = '';
    for (let h = 0; h < activeGame.holes; h++) {
      const roundNum = h + 1;
      bodyHtml += `<tr><td class="hole-col">${roundName} ${roundNum}</td>`;
      activeGame.players.forEach(p => {
        const score = p.scores[h];
        const hasScore = score !== null && score !== undefined;
        let scoreClass = 'score-cell-btn';
        if (hasScore) {
          scoreClass += ' has-score';
          if (score < 0) scoreClass += ' negative';
          if (score >= 20) scoreClass += ' high-score';
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

    // Bind cell clicks
    tbody.querySelectorAll('.score-cell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-player-id');
        const hIdx = parseInt(btn.getAttribute('data-hole-idx'), 10);
        openScoreModal(pId, hIdx);
      });
    });
  }

  // ==========================================================
  // SCORE INPUT & CALCULATOR MODAL
  // ==========================================================

  function openScoreModal(playerId, holeIdx) {
    const player = activeGame.players.find(p => p.id === playerId);
    if (!player) return;

    const gType = activeGame.gameType || 'golf';
    const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;

    editingScoreCtx.playerId = playerId;
    editingScoreCtx.holeIdx = holeIdx;
    editingScoreCtx.variant = typeof activeGame.variant === 'number' ? activeGame.variant : 6;
    editingScoreCtx.activeSlotIdx = 0;

    document.getElementById('modal-score-title').textContent = `${gameConfig.roundName} ${holeIdx + 1} Score - ${player.name}`;

    // Handle Card Calculator visibility
    const calcTabBtn = document.getElementById('tab-btn-calculator');

    if (gameConfig.hasCardCalculator) {
      calcTabBtn.style.display = 'inline-block';
      const existingCards = player.cardDetails && player.cardDetails[holeIdx];
      if (existingCards && Array.isArray(existingCards) && existingCards.length === editingScoreCtx.variant) {
        editingScoreCtx.slots = [...existingCards];
      } else {
        editingScoreCtx.slots = Array(editingScoreCtx.variant).fill('K');
      }
      renderCardSlotsGrid();
      renderCardPalette();
      updateModalCalculatedScore();
      switchModalTab('tab-calculator');
    } else {
      calcTabBtn.style.display = 'none';
      switchModalTab('tab-numpad');
    }

    const existingScore = player.scores[holeIdx];
    editingScoreCtx.directScore = existingScore !== null ? existingScore : 0;
    document.getElementById('direct-score-display').textContent = editingScoreCtx.directScore;
    document.getElementById('input-direct-custom').value = '';

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
      const cardInfo = GOLF_CARD_MAP[rank] || GOLF_CARD_MAP['K'];
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

    GOLF_CARD_RANKS.forEach(card => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `card-pick-btn ${card.color === 'red' ? 'red-card' : ''}`;
      btn.innerHTML = `
        <span>${escapeHtml(card.label)}</span>
        <span class="pick-pts">${card.pts}p</span>
      `;

      btn.addEventListener('click', () => {
        editingScoreCtx.slots[editingScoreCtx.activeSlotIdx] = card.rank;
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

    const gType = activeGame.gameType || 'golf';
    const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;

    if (activeTab.id === 'tab-calculator' && gameConfig.hasCardCalculator) {
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
      showToast(`${gameConfig.roundName} ${editingScoreCtx.holeIdx + 1} score saved for ${player.name}`, 'success');
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
      showToast(`Score cleared`, 'success');
    }
  }

  // ==========================================================
  // UTILITIES & EVENT LISTENERS
  // ==========================================================

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

  function setupEventListeners() {
    // Nav Brand & Buttons
    document.getElementById('nav-brand').addEventListener('click', () => {
      loadGamesList();
      showView('view-home');
    });

    document.getElementById('btn-hero-new-game').addEventListener('click', () => {
      initSetupForm('golf');
      showView('view-setup');
    });

    document.getElementById('btn-new-game-nav').addEventListener('click', () => {
      initSetupForm('golf');
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
      showToast(activeGame.completed ? 'Match marked as completed! 🏆' : 'Match in progress', 'success');
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

    // Custom Direct Points Field
    document.getElementById('btn-apply-custom-direct').addEventListener('click', () => {
      const val = parseInt(document.getElementById('input-direct-custom').value, 10);
      if (!isNaN(val)) {
        editingScoreCtx.directScore = val;
        document.getElementById('direct-score-display').textContent = editingScoreCtx.directScore;
      }
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

  // Service Worker for Offline PWA Support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }

  // Bootstrap
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderGameCatalog();
    initFirebase();
  });

})();
