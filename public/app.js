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
    real_golf: {
      id: 'real_golf',
      name: 'Golf',
      icon: '⛳',
      badge: 'Sport / Links',
      featured: true,
      scoreType: 'lowest',
      scoreLabel: 'Lowest Strokes Wins',
      roundName: 'Hole',
      roundPlural: 'Holes',
      description: 'On-the-course golf score tracking. Record strokes per hole across 9 or 18 holes. Lowest total score wins.',
      variants: [
        { id: 'stroke', name: 'Stroke Play', desc: 'Total strokes counted', default: true },
        { id: 'match', name: 'Match Play', desc: 'Hole-by-hole points', default: false },
        { id: 'stableford', name: 'Stableford', desc: 'Points per hole vs par', default: false }
      ],
      roundOptions: [
        { count: 9, label: '9 Holes', desc: 'Front / Back 9', default: true },
        { count: 18, label: '18 Holes', desc: 'Full 18 Holes' },
        { count: 6, label: '6 Holes', desc: 'Short Practice' }
      ],
      defaultVariant: 'stroke',
      defaultRounds: 9
    },
    golf: {
      id: 'golf',
      name: 'Golf the Card Game',
      icon: '🃏',
      badge: 'Cards',
      featured: true,
      scoreType: 'lowest', // lowest total score wins (unless someone scores exactly 100!)
      scoreLabel: 'Lowest Score Wins (or 100-pt Shoot the Moon)',
      roundName: 'Hole',
      roundPlural: 'Holes',
      description: 'Classic 4, 6, 8, or 9-card Golf card game. 2s are -2, Kings are 0, column pairs cancel to 0. Exactly 100 points wins outright!',
      variants: [
        { id: 4, name: '4-Card Golf', desc: '2x2 Grid (Quick)', default: false },
        { id: 6, name: '6-Card Golf', desc: '2x3 Grid (Classic)', default: true },
        { id: 8, name: '8-Card Golf', desc: '2x4 Grid', default: false },
        { id: 9, name: '9-Card Golf', desc: '3x3 Grid', default: false }
      ],
      roundOptions: [
        { count: 6, label: '6 Holes', desc: 'Short Match' },
        { count: 9, label: '9 Holes', desc: 'Standard 9 Holes', default: true },
        { count: 18, label: '18 Holes', desc: 'Full 18 Holes' }
      ],
      defaultVariant: 6,
      defaultRounds: 9
    },
    scrabble: {
      id: 'scrabble',
      name: 'Scrabble',
      icon: '🔤',
      badge: 'Word Game',
      featured: true,
      scoreType: 'highest',
      scoreLabel: 'Highest Score Wins',
      roundName: 'Turn',
      roundPlural: 'Turns',
      description: 'Crossword board game scoring. Record word scores per turn with 50-pt bingo bonuses. Highest cumulative score wins!',
      variants: [
        { id: 'standard', name: 'Standard Scrabble', desc: 'Word score per turn', default: true },
        { id: 'tournament', name: 'Tournament Play', desc: 'Strict word challenge rules', default: false }
      ],
      roundOptions: [
        { count: 10, label: '10 Turns', desc: 'Quick Game' },
        { count: 12, label: '12 Turns', desc: 'Standard Match', default: true },
        { count: 15, label: '15 Turns', desc: 'Full Board Match' },
        { count: 20, label: '20 Turns', desc: 'Extended Match' }
      ],
      defaultVariant: 'standard',
      defaultRounds: 12
    },
    cribbage: {
      id: 'cribbage',
      name: 'Cribbage',
      icon: '🧮',
      badge: 'Classic Board & Card',
      featured: true,
      scoreType: 'highest',
      scoreLabel: 'Highest Total (Race to 121 / 61)',
      roundName: 'Deal',
      roundPlural: 'Deals',
      description: 'Traditional 6-card Cribbage. Track hand, crib, and pegging scores across deals on a 121 or 61 point track.',
      variants: [
        { id: '121', name: '121 Points', desc: 'Full Board (Standard)', default: true },
        { id: '61', name: '61 Points', desc: 'Single Track (Short Game)', default: false }
      ],
      roundOptions: [
        { count: 6, label: '6 Deals', desc: 'Short Match' },
        { count: 8, label: '8 Deals', desc: 'Standard Match', default: true },
        { count: 10, label: '10 Deals', desc: 'Extended Match' },
        { count: 12, label: '12 Deals', desc: 'Championship' }
      ],
      defaultVariant: '121',
      defaultRounds: 8
    },
    crib: {
      id: 'crib',
      name: 'Crib',
      icon: '🪙',
      badge: '5x5 Grid Board',
      featured: true,
      scoreType: 'highest',
      scoreLabel: 'First to 100 Points Wins',
      roundName: 'Round',
      roundPlural: 'Rounds',
      description: '5×5 Grid Cribbage. 12 cards each + center cut card. One player scores rows (across), the other scores columns (top-to-bottom). First to 100 pts wins!',
      variants: [
        { id: 'standard', name: 'Standard (Rows vs Cols)', desc: 'Player 1 rows, Player 2 columns', default: true },
        { id: '100pts', name: 'First to 100 pts', desc: 'Game ends as soon as 100 pts is reached', default: false }
      ],
      roundOptions: [
        { count: 6, label: '6 Rounds', desc: 'Short Match' },
        { count: 8, label: '8 Rounds', desc: 'Standard Match (First to 100)', default: true },
        { count: 10, label: '10 Rounds', desc: 'Extended Match' }
      ],
      defaultVariant: 'standard',
      defaultRounds: 8
    },
    generic_rounds: {
      id: 'generic_rounds',
      name: 'Custom / Round-by-Round',
      icon: '📝',
      badge: 'Tabletop / Dice',
      featured: false,
      scoreType: 'highest', // default, can be toggled via variant
      scoreLabel: 'Highest Score Wins',
      roundName: 'Round',
      roundPlural: 'Rounds',
      description: 'Universal scorepad for any card, board, or dice game (Rummy, Yahtzee, Farkle, Phase 10, Wizard).',
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
      defaultRounds: 7
    }
  };

  // App State
  let currentUser = null;
  let activeGame = null;
  let gamesList = [];
  let db = null;
  let auth = null;
  let authReady = Promise.resolve();
  let redirectResultReady = Promise.resolve(null);
  let firestoreUnsubscribe = null;
  let liveRefreshTimer = null;
  let liveChallengesUnsubscribe = null;
  let liveRoundModalKey = null;
  let liveRoundDismissedKey = null;
  let lastCornerWinKey = null;
  let lastLiveGameWinKey = null;
  let lastLiveTurnId = null;
  let activeSheetsFilter = 'open'; // 'open' | 'all'

  // Selected game in setup form
  let setupSelectedGameType = 'golf';

  // Modal State for Round Scoring
  let editingScoreCtx = {
    playerId: null,
    holeIdx: null,
    directScore: 0
  };

  // Screen Wake Lock State (Defaults to ON, persisted in localStorage, togglable)
  const WAKE_LOCK_PREF_KEY = 'scoresheets_wake_lock_enabled';
  let isWakeLockEnabled = (function() {
    try {
      const stored = localStorage.getItem(WAKE_LOCK_PREF_KEY);
      return stored === null ? true : stored === 'true';
    } catch (e) {
      return true; // Default ON
    }
  })();
  let wakeLockSentinel = null;

  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) {
      updateWakeLockUI();
      return;
    }
    if (!isWakeLockEnabled) {
      updateWakeLockUI();
      return;
    }
    if (wakeLockSentinel && !wakeLockSentinel.released) {
      updateWakeLockUI();
      return;
    }

    try {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
        updateWakeLockUI();
      });
      updateWakeLockUI();
    } catch (err) {
      console.warn('Screen Wake Lock request note:', err && err.message);
      updateWakeLockUI();
    }
  }

  async function releaseWakeLock() {
    if (wakeLockSentinel) {
      try {
        await wakeLockSentinel.release();
      } catch (e) {}
      wakeLockSentinel = null;
    }
    updateWakeLockUI();
  }

  async function toggleWakeLock() {
    if (!('wakeLock' in navigator)) {
      showToast('Screen Wake Lock is not supported on this browser', 'info');
      return;
    }
    isWakeLockEnabled = !isWakeLockEnabled;
    try {
      localStorage.setItem(WAKE_LOCK_PREF_KEY, String(isWakeLockEnabled));
    } catch (e) {}

    if (isWakeLockEnabled) {
      await requestWakeLock();
      showToast('🔆 Stay Awake: ON (Screen will not sleep)', 'success');
    } else {
      await releaseWakeLock();
      showToast('💤 Stay Awake: OFF (Auto-sleep enabled)', 'info');
    }
    updateWakeLockUI();
  }

  function updateWakeLockUI() {
    const chip = document.getElementById('btn-wakelock-chip');
    if (!chip) return;
    if (!('wakeLock' in navigator)) {
      chip.style.display = 'none';
      return;
    }
    chip.style.display = 'inline-flex';
    if (isWakeLockEnabled) {
      chip.innerHTML = '🔆 Stay Awake: <strong style="margin-left:3px; color:#4ade80;">ON</strong>';
      chip.style.background = 'rgba(34, 197, 94, 0.2)';
      chip.style.color = '#ffffff';
      chip.style.borderColor = 'var(--fairway-green)';
      chip.style.boxShadow = '0 0 10px rgba(34, 197, 94, 0.35)';
      chip.title = 'Screen will stay awake while viewing this sheet. Tap to turn OFF.';
      if (!wakeLockSentinel || wakeLockSentinel.released) {
        requestWakeLock();
      }
    } else {
      chip.innerHTML = '💤 Stay Awake: <strong style="margin-left:3px; color:#94a3b8;">OFF</strong>';
      chip.style.background = 'rgba(255, 255, 255, 0.06)';
      chip.style.color = 'var(--text-muted)';
      chip.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      chip.style.boxShadow = 'none';
      chip.title = 'Phone will auto-sleep normally. Tap to turn ON.';
    }
  }

  // ==========================================================
  // SPLASH SCREEN & AUTH MODAL LOGIC (Squares-Style)
  // ==========================================================

  function dismissSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
      splashScreen.classList.add('is-dismissed');
      document.body.classList.remove('splash-active');
      setTimeout(() => {
        splashScreen.hidden = true;
      }, 450);
    }
  }

  function showSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
      splashScreen.hidden = false;
      splashScreen.classList.remove('is-dismissed');
      document.body.classList.add('splash-active');
    }
  }

  function openSignInModal() {
    const modal = document.getElementById('signin-modal');
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeSignInModal() {

      function showAuthDebugDialog(user) {
        if (!user) return;
        const modal = document.getElementById('auth-debug-modal');
        const details = document.getElementById('auth-debug-details');
        if (!modal || !details) return;
        const provider = user.providerData && user.providerData[0]
          ? user.providerData[0].providerId
          : 'password';
        const rows = [
          ['Email', user.email || 'Unavailable'],
          ['Provider', provider],
          ['Firebase UID', user.uid || 'Unavailable'],
          ['Auth domain', firebase?.app?.().options?.authDomain || 'Unavailable'],
          ['Browser', navigator.userAgent],
          ['App origin', window.location.origin],
          ['Session', firebase?.auth?.().currentUser ? 'Authenticated' : 'Not detected']
        ];
        details.innerHTML = rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
        modal.classList.add('is-open');
      }

      function closeAuthDebugDialog() {
        document.getElementById('auth-debug-modal')?.classList.remove('is-open');
      }
    const modal = document.getElementById('signin-modal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // ==========================================================
  // FIREBASE INITIALIZATION & SYNC
  // ==========================================================

  function ensureFirebaseServices() {
    if (!window.firebase) return false;
    try {
      if (!firebase.apps.length) {
        if (window.firebaseConfig) {
          firebase.initializeApp(window.firebaseConfig);
        } else {
          try {
            firebase.app();
          } catch (e) {}
        }
      }
      if (!auth) {
        auth = firebase.auth();

        // Configure persistence, then resolve the redirect result before allowing
        // the initial signed-out auth event to update the UI.
        let persistenceReady;
        try {
          persistenceReady = auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } catch (e) {
          persistenceReady = Promise.resolve();
        }

        authReady = Promise.resolve(persistenceReady).catch(() => {}).then(async () => {
          let redirectUser = null;
          try {
            const result = auth.getRedirectResult ? await auth.getRedirectResult() : null;
            redirectUser = result && result.user ? result.user : null;
          } catch (err) {
            console.error('Google redirect result error:', err);
            showToast('Google sign-in could not be completed: ' + (err.message || err.code), 'error');
          }
          redirectResultReady = Promise.resolve(redirectUser);

          auth.onAuthStateChanged(user => {
            currentUser = redirectUser || user || auth.currentUser;
            updateAuthUI();
            if (currentUser) {
              closeSignInModal();
              dismissSplashScreen();
            }
            loadGamesList();
          });

          if (redirectUser) {
            currentUser = redirectUser;
            updateAuthUI();
            closeSignInModal();
            dismissSplashScreen();
            showToast('Signed in successfully!', 'success');
          }
        });
      }
      if (!db) {
        db = firebase.firestore();
        try {
          db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
        } catch (e) {}
      }
      return !!auth;
    } catch (e) {
      console.warn('ensureFirebaseServices error:', e);
      return false;
    }
  }

  function initFirebase() {
    try {
      if (window.firebase) {
        ensureFirebaseServices();

        if (auth && auth.currentUser) {
          currentUser = auth.currentUser;
          updateAuthUI();
        }

        if (!auth) {
          updateAuthUI();
          loadGamesList();
        }
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

  // Local Storage Fallbacks & Stats Persistence
  const LOCAL_STORAGE_KEY = 'scoresheets_saved_matches';
  const STATS_STORAGE_KEY = 'scoresheets_all_match_stats';

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

  function getAllStatsMatches() {
    try {
      const data = localStorage.getItem(STATS_STORAGE_KEY);
      const statsList = data ? JSON.parse(data) : [];
      // Combine with currently active local games
      const local = getLocalGames();
      const map = {};
      statsList.forEach(g => { if (g && g.id) map[g.id] = g; });
      local.forEach(g => { if (g && g.id) map[g.id] = g; });
      return Object.values(map);
    } catch (e) {
      return getLocalGames();
    }
  }

  function recordMatchForStats(game) {
    try {
      if (!game || !game.id) return;
      const statsList = getAllStatsMatches();
      const map = {};
      statsList.forEach(g => { if (g && g.id) map[g.id] = g; });
      map[game.id] = JSON.parse(JSON.stringify(game));
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(Object.values(map)));
    } catch (e) {}
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
    const activeSheetsSection = document.getElementById('section-active-sheets');

    const user = currentUser || (auth && auth.currentUser);
    if (user && !currentUser) {
      currentUser = user;
    }

    if (currentUser) {
      // User is authenticated: immediately dismiss splash screen and modals
      dismissSplashScreen();
      closeSignInModal();

      const name = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'My Profile');
      if (authActionBtn) {
        authActionBtn.textContent = '👤 ' + name;
        authActionBtn.title = 'View Profile & Stats (' + (currentUser.email || name) + ')';
      }
      if (signedOutPane) signedOutPane.style.display = 'none';
      if (signedInPane) signedInPane.style.display = 'block';
      if (authUserName) authUserName.textContent = currentUser.displayName || name || 'Player';
      if (authUserEmail) authUserEmail.textContent = currentUser.email || '';
      
      // Reveal active score sheets section
      if (activeSheetsSection) activeSheetsSection.classList.remove('hidden');
    } else {
      if (authActionBtn) {
        authActionBtn.textContent = '👤 Sign In';
        authActionBtn.title = 'Sign in or create account';
      }
      if (signedOutPane) signedOutPane.style.display = 'block';
      if (signedInPane) signedInPane.style.display = 'none';
      
      // Hide active score sheets section when not authenticated
      if (activeSheetsSection) activeSheetsSection.classList.add('hidden');
    }
  }

  // ==========================================================
  // USER PROFILE & STATS ENGINE
  // ==========================================================

  function renderProfileView() {
    const allMatches = getAllStatsMatches();
    const userDisplayName = (currentUser && (currentUser.displayName || currentUser.email)) || 'Guest Golfer';
    const userEmail = (currentUser && currentUser.email) || 'Local Player Session';

    document.getElementById('profile-display-name').textContent = userDisplayName;
    document.getElementById('profile-display-email').textContent = userEmail;

    // Identify user in matches (either matching displayName, email, or primary player #1 in local matches)
    const normalizedUserNames = [
      userDisplayName.toLowerCase(),
      (currentUser && currentUser.displayName ? currentUser.displayName.toLowerCase() : ''),
      'player 1',
      'tiger',
      'me'
    ].filter(Boolean);

    let totalGamesPlayed = 0;
    let totalWins = 0;

    // Per-game category stats map
    // { gameType: { played: 0, wins: 0, scores: [], scoreType: 'lowest'|'highest', lastPlayed: null, gameName: '' } }
    const gameStatsMap = {};

    // Head-to-Head opponent records map
    // { opponentName: { faced: 0, wins: 0, losses: 0 } }
    const h2hMap = {};

    allMatches.forEach(game => {
      if (!game.players || !Array.isArray(game.players) || game.players.length === 0) return;

      const gType = game.gameType || 'golf';
      const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;
      const scoreType = game.scoreType || gameConfig.scoreType;

      // Find user player entry in this game
      let userPlayer = game.players.find(p => p.name && normalizedUserNames.includes(p.name.trim().toLowerCase()));
      if (!userPlayer) {
        // Default to first player if user created the match
        userPlayer = game.players[0];
      }

      const userScoreSum = userPlayer.scores.reduce((acc, s) => (s !== null && s !== undefined ? acc + s : acc), 0);
      const userPlayedCount = userPlayer.scores.filter(s => s !== null && s !== undefined).length;

      // Only count matches that have recorded scores
      if (userPlayedCount === 0) return;

      totalGamesPlayed++;

      // Evaluate rank/winner of this match
      const playerTotals = game.players.map(p => {
        const sum = p.scores.reduce((acc, s) => (s !== null && s !== undefined ? acc + s : acc), 0);
        const playedCount = p.scores.filter(s => s !== null && s !== undefined).length;
        return { name: p.name.trim(), sum, playedCount, isUser: p.id === userPlayer.id || p.name === userPlayer.name };
      }).filter(p => p.playedCount > 0);

      sortPlayerStats(playerTotals, gType, scoreType);
      const isWinner = playerTotals.length > 0 && playerTotals[0].isUser;
      if (isWinner) totalWins++;

      // Update Per-Game Stats
      if (!gameStatsMap[gType]) {
        gameStatsMap[gType] = {
          gameName: gameConfig.name,
          icon: gameConfig.icon,
          played: 0,
          wins: 0,
          scores: [],
          scoreType: scoreType,
          lastPlayed: game.updatedAt || game.createdAt || new Date().toISOString()
        };
      }
      gameStatsMap[gType].played++;
      if (isWinner) gameStatsMap[gType].wins++;
      gameStatsMap[gType].scores.push(userScoreSum);
      if (new Date(game.updatedAt || game.createdAt) > new Date(gameStatsMap[gType].lastPlayed)) {
        gameStatsMap[gType].lastPlayed = game.updatedAt || game.createdAt;
      }

      // Update Head-to-Head opponent records
      const userRank = playerTotals.findIndex(p => p.isUser);
      playerTotals.forEach((opp, rank) => {
        if (opp.isUser) return;
        const oppName = opp.name || 'Opponent';
        if (!h2hMap[oppName]) {
          h2hMap[oppName] = { faced: 0, wins: 0, losses: 0 };
        }
        h2hMap[oppName].faced++;
        if (userRank !== -1) {
          if (userRank < rank) {
            h2hMap[oppName].wins++;
          } else if (userRank > rank) {
            h2hMap[oppName].losses++;
          }
        }
      });
    });

    const winPercentage = totalGamesPlayed > 0 ? Math.round((totalWins / totalGamesPlayed) * 100) : 0;

    // Header & Summary Stats
    document.getElementById('profile-total-games-chip').textContent = `${totalGamesPlayed} Matches Played`;
    document.getElementById('profile-total-wins-chip').textContent = `${totalWins} Wins`;
    document.getElementById('profile-win-rate-chip').textContent = `${winPercentage}% Win Rate`;

    document.getElementById('stat-total-games').textContent = totalGamesPlayed;
    document.getElementById('stat-total-wins').textContent = totalWins;
    document.getElementById('stat-win-pct').textContent = `${winPercentage}%`;

    // 1. Render Game Score Records Table
    const gameStatsTbody = document.getElementById('profile-game-stats-tbody');
    const gameStatEntries = Object.values(gameStatsMap);

    if (gameStatEntries.length === 0) {
      gameStatsTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No completed match records yet. Play matches to build your stats!</td></tr>`;
    } else {
      gameStatsTbody.innerHTML = gameStatEntries.map(g => {
        const isLowest = g.scoreType === 'lowest';
        const bestScore = isLowest ? Math.min(...g.scores) : Math.max(...g.scores);
        const avgScore = Math.round((g.scores.reduce((a, b) => a + b, 0) / g.scores.length) * 10) / 10;
        const lastDate = new Date(g.lastPlayed).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const winRate = g.played > 0 ? Math.round((g.wins / g.played) * 100) : 0;

        return `
          <tr>
            <td><strong>${g.icon} ${escapeHtml(g.gameName)}</strong></td>
            <td>${g.played}</td>
            <td><strong style="color: var(--accent-gold);">${g.wins}</strong> (${winRate}%)</td>
            <td><strong style="color: var(--fairway-light);">${bestScore}</strong> <small style="color: var(--text-muted);">(${isLowest ? 'Lowest' : 'Highest'})</small></td>
            <td>${avgScore}</td>
            <td style="color: var(--text-muted);">${lastDate}</td>
          </tr>
        `;
      }).join('');
    }

    // 2. Render Head-to-Head Table
    const h2hTbody = document.getElementById('profile-h2h-tbody');
    const h2hEntries = Object.entries(h2hMap);

    if (h2hEntries.length === 0) {
      h2hTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No multiplayer match records found yet.</td></tr>`;
    } else {
      h2hEntries.sort((a, b) => b[1].faced - a[1].faced);
      h2hTbody.innerHTML = h2hEntries.map(([oppName, stats]) => {
        const rate = stats.faced > 0 ? Math.round((stats.wins / stats.faced) * 100) : 0;
        const rateColor = rate >= 50 ? 'var(--fairway-light)' : '#fca5a5';

        return `
          <tr>
            <td><strong>👤 ${escapeHtml(oppName)}</strong></td>
            <td>${stats.faced}</td>
            <td style="color: var(--fairway-light); font-weight: 700;">${stats.wins}</td>
            <td style="color: #fca5a5; font-weight: 700;">${stats.losses}</td>
            <td>
              <span class="meta-pill" style="color: ${rateColor}; background: rgba(255, 255, 255, 0.06); font-weight: 800;">
                ${rate}% Win Rate
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }

    showView('view-profile');
    loadLiveChallenges();
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
  // SETUP FORM DYNAMIC CONFIGURATION & PLAYER SUGGESTIONS
  // ==========================================================

  const LAST_PLAYERS_STORAGE_KEY = 'scoresheets_last_players';
  const RECENT_PLAYERS_STORAGE_KEY = 'scoresheets_recent_players_pool';

  function getLastPlayerNames() {
    try {
      const stored = localStorage.getItem(LAST_PLAYERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // Fallback: search most recent game from gamesList or local games
    const games = gamesList.length > 0 ? gamesList : getLocalGames();
    for (const g of games) {
      if (g.players && Array.isArray(g.players) && g.players.length > 0) {
        const names = g.players.map(p => (p.name || '').trim()).filter(Boolean);
        if (names.length > 0) return names;
      }
    }

    return null;
  }

  function getAllRecentPlayerPool() {
    const pool = new Set();
    try {
      const stored = localStorage.getItem(RECENT_PLAYERS_STORAGE_KEY);
      if (stored) {
        JSON.parse(stored).forEach(name => {
          if (name && name.trim()) pool.add(name.trim());
        });
      }
    } catch (e) {}

    const games = gamesList.length > 0 ? gamesList : getLocalGames();
    games.forEach(g => {
      if (g.players && Array.isArray(g.players)) {
        g.players.forEach(p => {
          if (p.name && p.name.trim() && !p.name.startsWith('Player ')) {
            pool.add(p.name.trim());
          }
        });
      }
    });

    return Array.from(pool);
  }

  function saveLastPlayerNames(names) {
    try {
      const cleaned = names.map(n => n.trim()).filter(Boolean);
      if (cleaned.length > 0) {
        localStorage.setItem(LAST_PLAYERS_STORAGE_KEY, JSON.stringify(cleaned));
        
        // Also update recent pool
        const pool = new Set(getAllRecentPlayerPool());
        cleaned.forEach(n => {
          if (!n.startsWith('Player ')) pool.add(n);
        });
        localStorage.setItem(RECENT_PLAYERS_STORAGE_KEY, JSON.stringify(Array.from(pool)));
      }
    } catch (e) {}
  }

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function createGolfCardLayout(variant) {
    return createLiveGolfState([{ id: 'pending-player' }], variant).boards['pending-player'];
  }

  function createGolfDeck() {
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = ['♠', '♥', '♦', '♣'];
    const deck = [];
    ranks.forEach(rank => suits.forEach(suit => {
      deck.push({ rank, suit, red: suit === '♥' || suit === '♦' });
    }));
    for (let index = deck.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
    }
    return deck;
  }

  function createLiveGolfState(playerIds, variant) {
    const deck = createGolfDeck();
    const boards = {};
    playerIds.forEach(playerId => {
      boards[playerId] = {
        cards: deck.splice(0, 6),
        revealed: Array(6).fill(false)
      };
    });
    return {
      roundIndex: 0,
      phase: 'opening',
      currentPlayerId: null,
      openingReveals: {},
      deck,
      discardPile: [deck.pop()],
      drawnCard: null,
      boards
    };
  }

  function ensureLiveGolfState(game) {
    if (!game.liveState) {
      game.liveState = createLiveGolfState((game.players || []).map(player => player.id), 6);
    }
    game.liveState.boards = game.liveState.boards || {};
    game.liveState.openingReveals = game.liveState.openingReveals || {};
    game.liveState.deck = game.liveState.deck || [];
    game.liveState.discardPile = game.liveState.discardPile || [];
    game.liveState.drawnCard = game.liveState.drawnCard || null;
    (game.players || []).forEach(player => {
      if (!game.liveState.boards[player.id] && game.liveState.deck.length >= 6) {
        game.liveState.boards[player.id] = {
          cards: game.liveState.deck.splice(0, 6),
          revealed: Array(6).fill(false)
        };
      }
    });
  }

  function getCurrentLivePlayer(game) {
    if (!game || !currentUser || !Array.isArray(game.players)) return null;
    return game.players.find(player => player.uid === currentUser.uid) || null;
  }

  function liveCardValue(card) {
    if (!card) return 0;
    if (card.rank === 'A') return 1;
    if (card.rank === '2') return -2;
    if (card.rank === 'K') return 0;
    if (card.rank === 'J' || card.rank === 'Q') return 10;
    return parseInt(card.rank, 10) || 0;
  }

  function liveBoardScore(board) {
    if (!board || !board.cards) return 0;
    let total = 0;
    for (let column = 0; column < 3; column++) {
      const top = board.cards[column];
      const bottom = board.cards[column + 3];
      if (top && bottom && top.rank === bottom.rank) continue;
      total += liveCardValue(top) + liveCardValue(bottom);
    }
    return total;
  }

  function allLiveCardsRevealed(board) {
    return !!board && Array.isArray(board.revealed) && board.revealed.every(Boolean);
  }

  function hasFourMatchingCorners(board) {
    if (!board || !Array.isArray(board.cards) || board.cards.length < 6) return false;
    const corners = [board.cards[0], board.cards[2], board.cards[3], board.cards[5]];
    return corners.every(card => card && card.rank) && corners.every(card => card.rank === corners[0].rank);
  }

  async function updateLiveGame(mutator) {
    if (!activeGame || !currentUser) return;
    ensureLiveGolfState(activeGame);
    const player = getCurrentLivePlayer(activeGame);
    if (!player) return;
    mutator(activeGame.liveState, player);
    await saveGame(activeGame, { syncToCloud: true });
    renderLiveCardBoard();
  }

  async function readyForNextLiveHole() {
    if (!activeGame || !currentUser || !activeGame.liveState || activeGame.liveState.phase !== 'round-complete') return;
    const player = getCurrentLivePlayer(activeGame);
    if (!player) return;
    const state = activeGame.liveState;
    const recordedResults = state.roundResults || {};
    activeGame.players.forEach(gamePlayer => {
      const recordedScore = recordedResults[gamePlayer.id];
      if (recordedScore && recordedScore.score !== undefined) {
        gamePlayer.scores[state.roundIndex] = recordedScore.score;
        gamePlayer.cardDetails[state.roundIndex] = recordedScore.cards;
      }
    });
    state.readyPlayers = [...new Set([...(state.readyPlayers || []), player.id])];

    closeLiveRoundSummary();
    showToast(state.readyPlayers.length < activeGame.players.length ? 'Ready recorded. Waiting for the other player.' : 'Starting the next hole...', 'info');

    if (state.readyPlayers.length >= activeGame.players.length) {
      const nextState = createLiveGolfState(activeGame.players.map(item => item.id), 6);
      nextState.roundIndex = (state.roundIndex || 0) + 1;
      nextState.firstPlayerId = activeGame.players[Math.floor(Math.random() * activeGame.players.length)].id;
      activeGame.liveState = nextState;
    }
    try {
      await saveGame(activeGame, { syncToCloud: true });
    } catch (err) {
      showToast('Ready saved locally, but could not sync yet.', 'error');
      console.warn('Ready for next hole sync error:', err);
    }
    renderScorecard();
  }

  async function revealOpeningCard(ownerId, cardIndex) {
    await updateLiveGame((state, player) => {
      if (ownerId !== player.id || state.phase !== 'opening') return;
      const board = state.boards[player.id];
      if (board.revealed[cardIndex] || (state.openingReveals[player.id] || 0) >= 2) return;
      board.revealed[cardIndex] = true;
      state.openingReveals[player.id] = (state.openingReveals[player.id] || 0) + 1;
      if (Object.keys(state.openingReveals).length === 2 && Object.values(state.openingReveals).every(count => count >= 2)) {
        state.phase = 'turn';
        state.currentPlayerId = activeGame.firstPlayerId;
      }
    });
  }

  async function takeLiveCard(source) {
    await updateLiveGame((state, player) => {
      if ((state.phase !== 'turn' && state.phase !== 'final-reveal') || state.currentPlayerId !== player.id || state.drawnCard) return;
      state.drawnCard = source === 'deck' ? state.deck.pop() : state.discardPile.pop();
    });
  }

  async function discardLiveCard() {
    await updateLiveGame((state, player) => {
      if (state.currentPlayerId !== player.id || !state.drawnCard) return;
      state.discardPile.push(state.drawnCard);
      state.drawnCard = null;
      advanceLiveTurn(state);
    });
  }

  async function replaceLiveCard(cardIndex) {
    await updateLiveGame((state, player) => {
      if (state.currentPlayerId !== player.id || !state.drawnCard) return;
      const board = state.boards[player.id];
      state.discardPile.push(board.cards[cardIndex]);
      board.cards[cardIndex] = state.drawnCard;
      board.revealed[cardIndex] = true;
      state.drawnCard = null;
      advanceLiveTurn(state);
    });
  }

  function advanceLiveTurn(state) {
    if (state.phase === 'final-reveal' || state.phase === 'round-complete') return;
    const playerIds = activeGame.players.map(player => player.id);
    const nextId = playerIds.find(id => id !== state.currentPlayerId);
    const currentBoard = state.boards[state.currentPlayerId];
    if (allLiveCardsRevealed(currentBoard)) {
      state.phase = 'final-reveal';
      state.finalRevealPlayerId = nextId;
      state.currentPlayerId = nextId;
    } else {
      state.currentPlayerId = nextId;
    }
  }

  function finishLiveTurn(game, playerId) {
    const state = game.liveState;
    if (state.currentPlayerId !== playerId) return;
    const playerBoard = state.boards[playerId];
    if (state.phase === 'turn' && hasFourMatchingCorners(playerBoard)) {
      state.cornerWinPlayerId = playerId;
      state.cornerWinAt = new Date().toISOString();
      state.phase = 'final-reveal';
      state.finalRevealPlayerId = game.players.find(player => player.id !== playerId)?.id || null;
      state.currentPlayerId = state.finalRevealPlayerId;
      return;
    }
    if (state.phase === 'final-reveal') {
      if (hasFourMatchingCorners(playerBoard)) {
        state.cornerWinPlayerId = playerId;
        state.cornerWinAt = new Date().toISOString();
      }
      Object.values(state.boards).forEach(board => {
        board.revealed = Array(6).fill(true);
      });
      game.players.forEach(player => {
        const board = state.boards[player.id];
        const score = player.id === state.cornerWinPlayerId ? -20 : liveBoardScore(board);
        player.cardDetails[state.roundIndex] = board.cards.map(card => `${card.rank}${card.suit}`).join(' ');
        player.scores[state.roundIndex] = score;
      });
      state.roundResults = {};
      game.players.forEach(player => {
        state.roundResults[player.id] = {
          score: player.scores[state.roundIndex],
          cards: player.cardDetails[state.roundIndex]
        };
      });
      const isFinalHole = state.roundIndex >= ((game.holes || 9) - 1);
      state.phase = isFinalHole ? 'game-complete' : 'round-complete';
      state.currentPlayerId = null;
      state.finalRevealPlayerId = null;
      state.roundCompletedAt = new Date().toISOString();
      if (isFinalHole) {
        state.gameCompletedAt = state.roundCompletedAt;
        game.completed = true;
      }
      return;
    }
    advanceLiveTurn(state);
  }

  function closeLiveRoundSummary() {
    const modal = document.getElementById('modal-live-round-summary');
    if (activeGame && activeGame.liveState && ['round-complete', 'game-complete'].includes(activeGame.liveState.phase)) {
      liveRoundDismissedKey = `${activeGame.id}:${activeGame.liveState.roundIndex || 0}`;
    }
    if (modal) modal.classList.remove('is-open');
  }

  function showLiveRoundSummary(game) {
    if (!game || !game.liveState || !['round-complete', 'game-complete'].includes(game.liveState.phase)) return;
    const currentPlayer = getCurrentLivePlayer(game);
    if (currentPlayer && (game.liveState.readyPlayers || []).includes(currentPlayer.id)) return;
    const modal = document.getElementById('modal-live-round-summary');
    const results = document.getElementById('live-round-results');
    const subtitle = document.getElementById('live-round-summary-subtitle');
    if (!modal || !results) return;

    const roundIndex = game.liveState.roundIndex || 0;
    const gameComplete = game.liveState.phase === 'game-complete';
    const summaryKey = `${game.id}:${roundIndex}`;
    if (liveRoundDismissedKey === summaryKey) return;
    if (liveRoundModalKey === summaryKey && modal.classList.contains('is-open')) return;
    liveRoundModalKey = summaryKey;

    const summaryTitle = document.getElementById('live-round-summary-title');
    const readyButton = document.getElementById('btn-live-round-ready');
    if (summaryTitle) summaryTitle.textContent = gameComplete ? 'Game Over' : 'Round Over';
    if (readyButton) readyButton.style.display = gameComplete ? 'none' : '';
    if (subtitle) subtitle.textContent = gameComplete
      ? `Final hole complete. ${escapeHtml(getGameWinner(game).name)} wins the game!`
      : game.liveState.cornerWinPlayerId
      ? `Four matching corner cards! ${escapeHtml(game.players.find(player => player.id === game.liveState.cornerWinPlayerId)?.name || 'A player')} scored -20 automatically.`
      : `Hole ${roundIndex + 1} is complete. Both players revealed all six cards.`;
    if (gameComplete && lastLiveGameWinKey !== `${game.id}:${game.liveState.gameCompletedAt}`) {
      lastLiveGameWinKey = `${game.id}:${game.liveState.gameCompletedAt}`;
      triggerConfetti();
    }
    results.innerHTML = game.players.map(player => {
      const recordedResult = game.liveState.roundResults && game.liveState.roundResults[player.id];
      const roundScore = recordedResult && recordedResult.score !== undefined
        ? recordedResult.score
        : (player.scores[roundIndex] ?? 0);
      const totalScore = player.scores.reduce((total, score) => total + (score ?? 0), 0);
      const isCurrentPlayer = currentUser && player.uid === currentUser.uid;
      return `<div class="live-round-result-row ${isCurrentPlayer ? 'is-current-player' : ''}">
        <div><strong>${escapeHtml(player.name)}${isCurrentPlayer ? ' (You)' : ''}</strong><small>Hole ${roundIndex + 1}</small></div>
        <div class="live-round-score"><strong>${roundScore}</strong><small>Round</small></div>
        <div class="live-round-score"><strong>${totalScore}</strong><small>Total</small></div>
      </div>`;
    }).join('');
    modal.classList.add('is-open');
  }

  function renderLiveCardBoard() {
    const board = document.getElementById('live-card-board');
    const grid = document.getElementById('live-card-board-grid');
    const status = document.getElementById('live-board-status');
    if (!board || !grid) return;

    const isLiveGolf = activeGame && activeGame.isLiveChallenge && activeGame.gameType === 'golf';
    if (!isLiveGolf) {
      board.classList.add('hidden');
      return;
    }

    ensureLiveGolfState(activeGame);
    const liveState = activeGame.liveState;
    if (!['round-complete', 'game-complete'].includes(liveState.phase)) {
      const summaryModal = document.getElementById('modal-live-round-summary');
      if (summaryModal) summaryModal.classList.remove('is-open');
      liveRoundModalKey = null;
      liveRoundDismissedKey = null;
    }
    const player = getCurrentLivePlayer(activeGame);
    board.classList.remove('hidden');
    if (!player || !liveState.boards[player.id]) {
      grid.innerHTML = '<p class="empty-state-copy">Your card layout is being dealt...</p>';
      return;
    }

    const currentTurn = liveState.currentPlayerId === player.id;
    const isOpening = liveState.phase === 'opening';
    const canRevealOpening = isOpening && (liveState.openingReveals[player.id] || 0) < 2;
    const canAct = currentTurn && (liveState.phase === 'turn' || liveState.phase === 'final-reveal');
    const drawn = liveState.drawnCard;
    const finalTurnPlayer = activeGame.players.find(item => item.id === liveState.finalRevealPlayerId);
    const alreadyReady = (liveState.readyPlayers || []).includes(player.id);
    if (liveState.cornerWinAt && lastCornerWinKey !== `${activeGame.id}:${liveState.cornerWinAt}`) {
      lastCornerWinKey = `${activeGame.id}:${liveState.cornerWinAt}`;
      triggerConfetti();
      showToast('🎉 Four matching corners! Automatic -20 score!', 'winner');
    }
    if (currentTurn && lastLiveTurnId && lastLiveTurnId !== liveState.currentPlayerId) {
      showToast("🔔 It's your turn in the live Golf game!", 'success');
    }
    lastLiveTurnId = liveState.currentPlayerId;
    const boardMarkup = activeGame.players.map(otherPlayer => {
      const otherBoard = liveState.boards[otherPlayer.id];
      if (!otherBoard) return '';
      const isMine = otherPlayer.id === player.id;
      return `<div class="live-player-board">
        <div class="live-player-board-heading"><strong>${isMine ? 'Your' : escapeHtml(otherPlayer.name)} Grid</strong><span>${isMine ? `${otherBoard.revealed.filter(Boolean).length}/6 face up` : 'Opponent cards hidden'}</span></div>
        <div class="live-card-grid" style="--card-columns:3;">${otherBoard.cards.map((card, index) => {
          const revealed = ['round-complete', 'game-complete'].includes(liveState.phase) || otherBoard.revealed[index];
          const clickable = isMine && ((canRevealOpening && !revealed) || (canAct && !!drawn));
          return `<button type="button" class="live-card ${revealed ? 'is-revealed' : ''} ${card.red ? 'is-red' : ''}" data-card-index="${index}" ${clickable ? '' : 'disabled'}>
            ${revealed ? `<span class="live-card-rank">${escapeHtml(card.rank)}</span><span class="live-card-suit">${card.suit}</span>` : '<span class="live-card-back">?</span>'}
          </button>`;
        }).join('')}</div>
      </div>`;
    }).join('');

    const topDiscard = liveState.discardPile[liveState.discardPile.length - 1];
    const discardMarkup = topDiscard ? `<button type="button" class="live-pile-card is-discard ${topDiscard.red ? 'is-red' : ''}" id="btn-live-discard-card" ${canAct && !drawn ? '' : 'disabled'}><span>${escapeHtml(topDiscard.rank)}</span><span>${topDiscard.suit}</span></button>` : '<div class="live-pile-empty">Empty</div>';
    const drawnMarkup = drawn ? `<div class="live-drawn-card is-revealed ${drawn.red ? 'is-red' : ''}"><span class="live-card-rank">${escapeHtml(drawn.rank)}</span><span class="live-card-suit">${drawn.suit}</span></div>` : '<span class="live-drawn-empty">No card drawn</span>';
    grid.innerHTML = `
      <div class="live-turn-panel">
        <strong>${liveState.phase === 'opening' ? 'Opening reveal: turn any two of your cards' : liveState.phase === 'final-reveal' ? (currentTurn ? 'FINAL TURN!' : `FINAL TURN: ${escapeHtml(finalTurnPlayer ? finalTurnPlayer.name : 'Opponent')}`) : liveState.phase === 'game-complete' ? 'Game Over' : liveState.phase === 'round-complete' ? 'Round complete' : currentTurn ? "It's your turn" : `${escapeHtml(activeGame.players.find(p => p.id === liveState.currentPlayerId)?.name || 'Opponent')}'s turn`}</strong>
        <span class="live-turn-phase">${liveState.phase === 'opening' ? `${liveState.openingReveals[player.id] || 0}/2 revealed` : liveState.phase}</span>
      </div>
      <div class="live-piles">
        <button type="button" class="live-pile-button" id="btn-live-draw-deck" ${canAct && !drawn ? '' : 'disabled'}><span class="live-card-back">?</span><small>Draw pile (${liveState.deck.length})</small></button>
        <div><strong>Discard</strong>${discardMarkup}<small>Top discard</small></div>
        <div class="live-draw-area"><strong>${currentTurn ? 'Your draw' : 'Their draw'}</strong>${drawnMarkup}</div>
      </div>
      ${liveState.phase === 'round-complete' ? `<button type="button" class="btn btn-primary btn-sm live-next-round-button" id="btn-live-next-round" ${alreadyReady ? 'disabled' : ''}>${alreadyReady ? 'Waiting for Other Player' : 'Next Round'}</button>` : ''}
      <div class="live-action-row">
        <button type="button" class="btn btn-outline btn-sm" id="btn-live-take-discard" ${canAct && !drawn && topDiscard ? '' : 'disabled'}>Take discard</button>
        <button type="button" class="btn btn-danger btn-sm" id="btn-live-discard-drawn" ${canAct && drawn ? '' : 'disabled'}>Discard drawn card</button>
      </div>
      ${boardMarkup}`;
    if (status) {
      const opponent = activeGame.players.find(other => other.id !== player.id);
      status.textContent = opponent ? (liveState.phase === 'final-reveal' ? (currentTurn ? 'FINAL TURN! Complete your six-card grid now.' : `${finalTurnPlayer ? finalTurnPlayer.name : opponent.name} has the FINAL TURN!`) : `${opponent.name} is in the match. ${currentTurn ? 'Choose a pile, then choose a grid card to replace it.' : 'You will be notified when the turn changes.'}`) : 'Waiting for the other player to accept the challenge...';
    }
    if (['round-complete', 'game-complete'].includes(liveState.phase)) showLiveRoundSummary(activeGame);

    grid.querySelectorAll('.live-card:not(:disabled)').forEach(button => {
      button.addEventListener('click', async () => {
        const cardIndex = parseInt(button.getAttribute('data-card-index'), 10);
        const ownBoard = liveState.boards[player.id];
        if (isOpening && !ownBoard.revealed[cardIndex]) {
          ownBoard.revealed[cardIndex] = true;
          liveState.openingReveals[player.id] = (liveState.openingReveals[player.id] || 0) + 1;
          if (activeGame.players.every(p => (liveState.openingReveals[p.id] || 0) >= 2)) {
            liveState.phase = 'turn';
            liveState.currentPlayerId = liveState.firstPlayerId;
          }
        } else if (canAct && drawn) {
          const replaced = ownBoard.cards[cardIndex];
          ownBoard.cards[cardIndex] = drawn;
          ownBoard.revealed[cardIndex] = true;
          liveState.discardPile.push(replaced);
          liveState.drawnCard = null;
          finishLiveTurn(activeGame, player.id);
          if (['round-complete', 'game-complete'].includes(liveState.phase)) showLiveRoundSummary(activeGame);
        }
        await saveGame(activeGame, { syncToCloud: true });
        renderLiveCardBoard();
        if (['round-complete', 'game-complete'].includes(liveState.phase)) showLiveRoundSummary(activeGame);
      });
    });

    const drawFromDeck = () => {
      if (!canAct || drawn || liveState.deck.length === 0) return;
      liveState.drawnCard = liveState.deck.pop();
      renderLiveCardBoard();
      saveGame(activeGame, { syncToCloud: true });
    };
    const takeDiscard = () => {
      if (!canAct || drawn || liveState.discardPile.length === 0) return;
      liveState.drawnCard = liveState.discardPile.pop();
      renderLiveCardBoard();
      saveGame(activeGame, { syncToCloud: true });
    };
    const discardDrawn = async () => {
      if (!canAct || !drawn) return;
      liveState.discardPile.push(liveState.drawnCard);
      liveState.drawnCard = null;
      finishLiveTurn(activeGame, player.id);
      const completedGame = ['round-complete', 'game-complete'].includes(liveState.phase) ? JSON.parse(JSON.stringify(activeGame)) : null;
      if (completedGame) showLiveRoundSummary(completedGame);
      await saveGame(activeGame, { syncToCloud: true });
      if (completedGame) {
        showLiveRoundSummary(completedGame);
        setTimeout(() => showLiveRoundSummary(completedGame), 250);
      }
      renderLiveCardBoard();
    };
    document.getElementById('btn-live-draw-deck')?.addEventListener('click', drawFromDeck);
    document.getElementById('btn-live-next-round')?.addEventListener('click', readyForNextLiveHole);
    document.getElementById('btn-live-take-discard')?.addEventListener('click', takeDiscard);
    document.getElementById('btn-live-discard-card')?.addEventListener('click', takeDiscard);
    document.getElementById('btn-live-discard-drawn')?.addEventListener('click', discardDrawn);
  }

  function loadLiveChallenges() {
    const list = document.getElementById('profile-live-challenges-list');
    if (!list) return;
    if (liveChallengesUnsubscribe) {
      liveChallengesUnsubscribe();
      liveChallengesUnsubscribe = null;
    }
    if (!currentUser || !db || !currentUser.email) {
      list.innerHTML = '<p class="empty-state-copy">Sign in to receive live game challenges.</p>';
      return;
    }

    try {
      liveChallengesUnsubscribe = db.collection('games')
        .where('liveChallenge.invitedEmail', '==', normalizeEmail(currentUser.email))
        .onSnapshot(snap => {
          const challenges = [];
          snap.forEach(doc => {
            const game = doc.data();
            if (game.liveChallenge && game.liveChallenge.status === 'pending') challenges.push(game);
          });
          if (challenges.length === 0) {
            list.innerHTML = '<p class="empty-state-copy">No live game challenges right now.</p>';
            return;
          }
          list.innerHTML = challenges.map(game => `
            <article class="live-challenge-card">
              <div>
                <strong>🃏 ${escapeHtml(game.title)}</strong>
                <p>${escapeHtml(game.liveChallenge.ownerEmail || 'A ScoreSheets player')} challenged you to ${game.variant}-card Golf.</p>
              </div>
              <button type="button" class="btn btn-primary btn-sm btn-accept-live-challenge" data-game-id="${escapeHtml(game.id)}">Accept &amp; Play</button>
            </article>
          `).join('');
          list.querySelectorAll('.btn-accept-live-challenge').forEach(button => {
            button.addEventListener('click', () => acceptLiveChallenge(button.getAttribute('data-game-id')));
          });
        }, err => {
          list.innerHTML = '<p class="empty-state-copy">Challenges could not be loaded. Try again shortly.</p>';
          console.warn('Live challenge subscription error:', err);
        });
    } catch (err) {
      list.innerHTML = '<p class="empty-state-copy">Challenges could not be loaded. Try again shortly.</p>';
      console.warn('Live challenge load error:', err);
    }
  }

  async function acceptLiveChallenge(gameId) {
    if (!currentUser || !db) return;
    const snapshot = await db.collection('games').doc(gameId).get();
    if (!snapshot.exists) {
      showToast('That challenge is no longer available.', 'error');
      return;
    }
    const game = snapshot.data();
    if (!game.liveChallenge || game.liveChallenge.status !== 'pending') {
      showToast('That challenge has already been accepted.', 'info');
      return;
    }
    const player = {
      id: 'player_' + currentUser.uid,
      uid: currentUser.uid,
      name: currentUser.displayName || currentUser.email.split('@')[0],
      email: normalizeEmail(currentUser.email),
      scores: Array(game.holes).fill(null),
      cardDetails: Array(game.holes).fill(null)
    };
    game.players = [...(game.players || []), player];
    game.participantUids = [...new Set([...(game.participantUids || []), currentUser.uid])];
    game.liveChallenge = { ...game.liveChallenge, status: 'active', invitedUid: currentUser.uid, acceptedAt: new Date().toISOString() };
    ensureLiveGolfState(game);
    game.liveState.boards[player.id] = {
      cards: game.liveState.deck.splice(0, 6),
      revealed: Array(6).fill(false)
    };
    game.liveState.firstPlayerId = game.players[Math.floor(Math.random() * game.players.length)].id;
    game.liveState.currentPlayerId = null;
    game.liveState.phase = 'opening';
    await saveGame(game, { syncToCloud: true });
    openGame(game);
    showToast('Live challenge accepted. Your cards are ready!', 'success');
  }

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

    const challengeGroup = document.getElementById('setup-live-challenge-group');
    const challengeEmail = document.getElementById('input-challenge-email');
    if (challengeGroup) {
      const canChallenge = gameType === 'golf' && !!currentUser;
      challengeGroup.classList.toggle('hidden', !canChallenge);
      if (challengeEmail) challengeEmail.required = false;
    }

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

    const lastPlayers = getLastPlayerNames();
    const defaultNames = (lastPlayers && lastPlayers.length > 0)
      ? lastPlayers
      : ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

    defaultNames.forEach((name, i) => {
      addPlayerInputRow(name, i + 1);
    });

    renderSuggestedPlayerChips();
  }

  function renderSuggestedPlayerChips() {
    const bar = document.getElementById('suggested-players-bar');
    const chipsContainer = document.getElementById('suggested-players-chips');
    const loadLastBtn = document.getElementById('btn-load-last-players');
    if (!bar || !chipsContainer) return;

    const lastPlayers = getLastPlayerNames();
    if (loadLastBtn) {
      if (lastPlayers && lastPlayers.length > 0) {
        loadLastBtn.classList.remove('hidden');
      } else {
        loadLastBtn.classList.add('hidden');
      }
    }

    const currentNames = Array.from(document.querySelectorAll('.player-name-input'))
      .map(i => i.value.trim().toLowerCase());

    const allRecent = getAllRecentPlayerPool();
    const suggestions = allRecent.filter(name => !currentNames.includes(name.toLowerCase()));

    if (suggestions.length > 0) {
      bar.classList.remove('hidden');
      chipsContainer.innerHTML = suggestions.slice(0, 10).map(name => `
        <button type="button" class="player-chip-btn" data-player-name="${escapeHtml(name)}" title="Add ${escapeHtml(name)}">
          ➕ ${escapeHtml(name)}
        </button>
      `).join('');

      chipsContainer.querySelectorAll('.player-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.getAttribute('data-player-name');
          addPlayerInputRow(name);
          renderSuggestedPlayerChips();
        });
      });
    } else {
      bar.classList.add('hidden');
    }
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

    const input = div.querySelector('.player-name-input');
    if (input) {
      input.addEventListener('input', () => {
        renderSuggestedPlayerChips();
      });
    }

    const removeBtn = div.querySelector('.btn-remove-player');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        div.remove();
        refreshPlayerIndices();
        renderSuggestedPlayerChips();
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
    const playerNames = [];
    playerInputs.forEach((input, i) => {
      const name = input.value.trim() || `Player ${i + 1}`;
      playerNames.push(name);
      players.push({
        id: 'p_' + Date.now() + '_' + i,
        uid: i === 0 && currentUser ? currentUser.uid : null,
        name: name,
        scores: Array(holes).fill(null),
        cardDetails: Array(holes).fill(null)
      });
    });

    const challengeEmail = normalizeEmail(document.getElementById('input-challenge-email')?.value);
    const isLiveChallenge = setupSelectedGameType === 'golf' && !!challengeEmail;
    if (isLiveChallenge) {
      if (!currentUser) {
        showToast('Sign in before sending a live challenge.', 'error');
        return;
      }
      if (challengeEmail === normalizeEmail(currentUser.email)) {
        showToast('Choose another player email address.', 'error');
        return;
      }
      players[0].name = currentUser.displayName || currentUser.email.split('@')[0];
      players.splice(1);
    }

    if (players.length === 0) {
      showToast('Please add at least one player', 'error');
      return;
    }

    // Save player names to suggest for subsequent boards
    saveLastPlayerNames(playerNames);

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
      createdBy: currentUser ? currentUser.uid : 'anonymous',
      isLiveChallenge,
      participantUids: currentUser ? [currentUser.uid] : [],
      liveState: isLiveChallenge && currentUser ? createLiveGolfState([players[0].id], 6) : null,
      cardLayouts: {},
      liveChallenge: isLiveChallenge ? {
        status: 'pending',
        invitedEmail: challengeEmail,
        ownerUid: currentUser.uid,
        ownerEmail: normalizeEmail(currentUser.email),
        createdAt: new Date().toISOString()
      } : null
    };

    if (isLiveChallenge) {
      gameData.liveState.firstPlayerId = players[0].id;
      gameData.liveState.currentPlayerId = null;
    }

    // Save locally and initialize in cloud asynchronously if available
    await saveGame(gameData, { syncToCloud: true });
    openGame(gameData);
    showToast(isLiveChallenge ? `Live challenge sent to ${challengeEmail}! 🚩` : `${gameConfig.name} match created! 🎲 (Offline-ready)`, 'success');
  }

  // ==========================================================
  // WINNER EVALUATION & RECORDING
  // ==========================================================

  function getGameWinner(game) {
    if (!game || !game.players || game.players.length === 0) {
      return { name: 'Player', totalScore: 0, id: '', is100PointWin: false, tally: [] };
    }
    const gType = game.gameType || 'golf';
    const playerStats = game.players.map((p, origIdx) => {
      const sum = p.scores.reduce((acc, s) => s !== null && s !== undefined ? acc + s : acc, 0);
      const playedCount = p.scores.filter(s => s !== null && s !== undefined).length;
      return { id: p.id, name: p.name, sum, totalScore: sum, playedCount, origIdx };
    });

    sortPlayerStats(playerStats, gType, game.scoreType);
    const top = playerStats[0] || { name: 'Player', sum: 0, totalScore: 0, id: '' };
    const is100PointWin = gType === 'golf' && top.sum === 100 && top.playedCount > 0;

    return {
      name: top.name,
      totalScore: top.sum,
      id: top.id,
      is100PointWin: is100PointWin,
      tally: playerStats
    };
  }

  async function toggleMatchCompletion(game) {
    if (!game) return;
    const willBeCompleted = !game.completed;
    game.completed = willBeCompleted;

    if (willBeCompleted) {
      const winner = getGameWinner(game);
      triggerConfetti();
      showToast(`🏆 And the winner is... ${winner.name} (${winner.totalScore} pts)! Match finalized and synced to cloud.`, 'winner');
      
      // When match is completed, write the entire finalized match and results to database
      try {
        await saveGame(game, { syncToCloud: true });
      } catch (err) {
        console.warn('Error syncing completed game to database:', err);
      }
    } else {
      showToast(`▶️ Match resumed! Operating offline until match is finalized.`, 'info');
      // When resumed, sync status update to cloud
      try {
        await saveGame(game, { syncToCloud: true });
      } catch (err) {
        console.warn('Error syncing resumed state:', err);
      }
    }

    if (activeGame && activeGame.id === game.id) {
      renderScorecard();
    }
    loadGamesList();
  }

  async function saveGame(game, options = {}) {
    const { syncToCloud = false } = options;
    game.updatedAt = new Date().toISOString();

    // Compute and record final tally & winner for posterity when marked complete
    if (game.completed) {
      const winnerInfo = getGameWinner(game);
      game.winner = {
        name: winnerInfo.name,
        totalScore: winnerInfo.totalScore,
        id: winnerInfo.id,
        is100PointWin: winnerInfo.is100PointWin
      };
      game.finalTally = winnerInfo.tally.map(t => ({
        id: t.id,
        name: t.name,
        totalScore: t.totalScore,
        playedCount: t.playedCount
      }));
      game.completedAt = game.completedAt || new Date().toISOString();
      game.lastFinalizedAt = new Date().toISOString();
    } else {
      game.winner = null;
      game.finalTally = null;
      game.lastResumedAt = new Date().toISOString();
    }

    // Always update local storage first (instant, 100% offline, zero latency)
    let localGames = getLocalGames();
    const existingIdx = localGames.findIndex(g => g.id === game.id);
    if (existingIdx >= 0) {
      localGames[existingIdx] = game;
    } else {
      localGames.unshift(game);
    }
    saveLocalGames(localGames);

    // Only make network Firestore request when syncToCloud is true (game creation, finalization, resume, delete)
    if (syncToCloud && db) {
      try {
        const cloudGame = JSON.parse(JSON.stringify(game));
        cloudGame.players = (cloudGame.players || []).map(player => ({
          ...player,
          cardDetails: (player.cardDetails || []).map(details => Array.isArray(details) ? details.join(' ') : details)
        }));
        await db.collection('games').doc(game.id).set(cloudGame, { merge: true });
        if (currentUser) {
          const userDocData = {
            id: game.id,
            gameType: game.gameType || 'golf',
            title: game.title,
            variant: game.variant,
            holes: game.holes,
            completed: game.completed,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          if (game.completed && game.winner) {
            userDocData.winner = game.winner;
            userDocData.finalTally = game.finalTally;
            userDocData.completedAt = game.completedAt;
          }
          await db.collection('users').doc(currentUser.uid)
            .collection('savedGames').doc(game.id)
            .set(userDocData, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore sync warning (match safely kept in offline storage):', err);
      }
    }
  }

  async function startRematch(game) {
    if (!game) return;
    const gameConfig = GAMES_REGISTRY[game.gameType || 'golf'] || GAMES_REGISTRY.golf;
    const holes = game.holes || gameConfig.defaultRounds;

    const newPlayers = game.players.map((p, i) => ({
      id: 'p_' + Date.now() + '_' + i,
      name: p.name,
      scores: Array(holes).fill(null),
      cardDetails: Array(holes).fill(null)
    }));

    const newGameData = {
      id: 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      gameType: game.gameType || 'golf',
      title: game.title,
      variant: game.variant !== undefined ? game.variant : gameConfig.defaultVariant,
      holes: holes,
      scoreType: game.scoreType || gameConfig.scoreType,
      players: newPlayers,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser ? currentUser.uid : 'anonymous'
    };

    saveLastPlayerNames(newPlayers.map(p => p.name));
    await saveGame(newGameData, { syncToCloud: true });
    openGame(newGameData);
    showToast(`Rematch created for ${newGameData.title}! 🔄`, 'success');
  }

  async function deleteGame(gameId) {
    if (!confirm('Remove this match card from your history? (Scores will still count toward your lifetime stats)')) return;
    const wasProfileView = document.getElementById('view-profile')?.classList.contains('is-active');
    const wasManageSheetsView = document.getElementById('view-manage-sheets')?.classList.contains('is-active');

    // Find and preserve game data in permanent stats storage before deleting from active list
    const targetGame = getLocalGames().find(g => g.id === gameId) || gamesList.find(g => g.id === gameId);
    if (targetGame) {
      recordMatchForStats(targetGame);
    }

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

    showToast('Match removed from history (stats preserved)', 'info');
    await loadGamesList();
    if (wasProfileView) {
      renderProfileView();
    } else if (wasManageSheetsView) {
      renderManageSheetsTable(gamesList);
      showView('view-manage-sheets');
    } else {
      showView('view-home');
    }
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

  // Sort rankings considering the special 100-points Golf rule
  function sortPlayerStats(playerStats, gameType, scoreType) {
    if (gameType === 'golf') {
      playerStats.sort((a, b) => {
        // Special Golf rule: Exactly 100 points wins over everything else!
        const aHas100 = a.sum === 100 && a.playedCount > 0;
        const bHas100 = b.sum === 100 && b.playedCount > 0;
        if (aHas100 && !bHas100) return -1;
        if (!aHas100 && bHas100) return 1;
        // Otherwise lowest score wins
        return a.sum - b.sum;
      });
    } else {
      if (scoreType === 'lowest') {
        playerStats.sort((a, b) => a.sum - b.sum);
      } else {
        playerStats.sort((a, b) => b.sum - a.sum);
      }
    }
    return playerStats;
  }

  function renderGamesList(games) {
    // 1. Render Active Open Sheets on Authenticated Home Screen (In Progress only)
    renderActiveSheetsSection(games);

    // 2. Render Match History: Shows completed games by default, or all games
    const listContainer = document.getElementById('games-list-container');
    const completedMatches = games.filter(g => g.completed);
    // If user has no completed matches, show all matches so history isn't completely empty
    const displayMatches = completedMatches.length > 0 ? completedMatches : games;

    if (displayMatches.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">📝</div>
          <h4>No Completed Matches Yet</h4>
          <p>Finalize an open match to archive it in your permanent match history.</p>
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

    listContainer.innerHTML = displayMatches.map(game => {
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
        sortPlayerStats(activePlayers, gType, game.scoreType);
        const top = activePlayers[0];
        const is100Win = gType === 'golf' && top.sum === 100;
        leaderText = `${game.completed ? 'Winner' : 'Leader'}: <strong>${escapeHtml(top.name)} (${top.sum} pts${is100Win ? ' 🎯 100-PT WIN!' : ''})</strong>`;
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
            ${game.completed ? '<span class="meta-pill completed">Completed</span>' : '<span class="meta-pill" style="background: rgba(34, 197, 94, 0.2); color: var(--fairway-light);">● In Progress</span>'}
          </div>
          <div class="game-item-leader">
            <span>${leaderText}</span>
          </div>
          <div class="game-item-actions">
            <button type="button" class="btn btn-primary btn-sm btn-open-game" data-game-id="${escapeHtml(game.id)}" style="flex:1">Open Sheet</button>
            <button type="button" class="btn btn-gold btn-sm btn-rematch-game" data-game-id="${escapeHtml(game.id)}" title="Start a rematch with the same players and settings">🔄 Rematch</button>
            <button type="button" class="btn btn-outline btn-sm btn-delete-card" data-game-id="${escapeHtml(game.id)}" title="Remove from Home">🗑️</button>
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

    listContainer.querySelectorAll('.btn-rematch-game').forEach(btn => {
      btn.addEventListener('click', () => {
        const gId = btn.getAttribute('data-game-id');
        const found = gamesList.find(g => g.id === gId);
        if (found) startRematch(found);
      });
    });

    listContainer.querySelectorAll('.btn-delete-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gId = btn.getAttribute('data-game-id');
        deleteGame(gId);
      });
    });

    // 3. Update Manage Sheets view if currently opened
    renderManageSheetsTable(games);
  }

  // Render Active / Open Sheets for Authenticated Users
  function renderActiveSheetsSection(games) {
    const section = document.getElementById('section-active-sheets');
    const grid = document.getElementById('active-sheets-grid');
    if (!section || !grid) return;

    if (!currentUser) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');

    // Filter games: only show non-completed (active open) matches in this section
    const openMatches = games.filter(g => !g.completed && g.completed !== true);

    if (openMatches.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; padding: 2rem 1.5rem;">
          <div class="empty-state-icon">⛳</div>
          <h4>No Open Matches In Progress</h4>
          <p>All matches are finalized! Completed matches are archived below in Recent Match History.</p>
          <button type="button" class="btn btn-primary btn-sm" id="btn-active-new-sheet" style="margin-top: 0.75rem;">
            ➕ Start New Match
          </button>
        </div>
      `;
      const btn = document.getElementById('btn-active-new-sheet');
      if (btn) btn.addEventListener('click', () => {
        initSetupForm('golf');
        showView('view-setup');
      });
      return;
    }

    grid.innerHTML = openMatches.map(game => {
      const gType = game.gameType || 'golf';
      const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;
      const isLowestWins = game.scoreType === 'lowest';

      let leaderText = 'In progress';
      const playerTotals = game.players.map(p => {
        const sum = p.scores.reduce((acc, s) => s !== null ? acc + s : acc, 0);
        const playedCount = p.scores.filter(s => s !== null).length;
        return { name: p.name, sum, playedCount };
      });

      const activePlayers = playerTotals.filter(p => p.playedCount > 0);
      if (activePlayers.length > 0) {
        sortPlayerStats(activePlayers, gType, game.scoreType);
        const top = activePlayers[0];
        const is100Win = gType === 'golf' && top.sum === 100;
        leaderText = `Current 1st: <strong>${escapeHtml(top.name)} (${top.sum} pts${is100Win ? ' 🎯 100!' : ''})</strong>`;
      }

      return `
        <div class="game-item-card" data-game-id="${escapeHtml(game.id)}" style="border-color: rgba(34, 197, 94, 0.4);">
          <div class="game-item-top">
            <h4 class="game-item-title">${gameConfig.icon} ${escapeHtml(game.title)}</h4>
            <span class="meta-pill" style="background: rgba(34, 197, 94, 0.2); color: var(--fairway-light);">● OPEN</span>
          </div>
          <div class="game-item-meta">
            <span class="meta-pill variant">${escapeHtml(gameConfig.name)}</span>
            <span class="meta-pill">${game.holes} ${gameConfig.roundPlural}</span>
            <span class="meta-pill">${game.players.length} Players</span>
          </div>
          <div class="game-item-leader">
            <span>${leaderText}</span>
          </div>
          <div class="game-item-actions">
            <button type="button" class="btn btn-primary btn-sm btn-open-active-game" data-game-id="${escapeHtml(game.id)}" style="flex:1">Open Sheet</button>
            <button type="button" class="btn btn-gold btn-sm btn-rematch-active-game" data-game-id="${escapeHtml(game.id)}" title="Start a rematch with the same players and settings">🔄 Rematch</button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.btn-open-active-game').forEach(btn => {
      btn.addEventListener('click', () => {
        const gId = btn.getAttribute('data-game-id');
        const found = gamesList.find(g => g.id === gId);
        if (found) openGame(found);
      });
    });

    grid.querySelectorAll('.btn-rematch-active-game').forEach(btn => {
      btn.addEventListener('click', () => {
        const gId = btn.getAttribute('data-game-id');
        const found = gamesList.find(g => g.id === gId);
        if (found) startRematch(found);
      });
    });
  }

  // Render Manage Sheets Table
  function renderManageSheetsTable(games) {
    const tbody = document.getElementById('manage-sheets-tbody');
    if (!tbody) return;

    if (games.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No score sheets found.</td></tr>`;
      return;
    }

    tbody.innerHTML = games.map(game => {
      const gType = game.gameType || 'golf';
      const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;
      const formattedDate = new Date(game.createdAt || Date.now()).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });

      return `
        <tr>
          <td><strong>${escapeHtml(game.title)}</strong></td>
          <td>${gameConfig.icon} ${escapeHtml(gameConfig.name)}</td>
          <td>
            ${game.completed 
              ? '<span class="meta-pill completed">Completed</span>' 
              : '<span class="meta-pill" style="background: rgba(34, 197, 94, 0.2); color: var(--fairway-light);">In Progress</span>'}
          </td>
          <td>${game.players.length}</td>
          <td>${formattedDate}</td>
          <td style="text-align: right;">
            <div class="manage-actions-cell" style="justify-content: flex-end;">
              <button type="button" class="btn btn-primary btn-sm btn-manage-open" data-game-id="${escapeHtml(game.id)}">Open</button>
              <button type="button" class="btn btn-gold btn-sm btn-manage-rematch" data-game-id="${escapeHtml(game.id)}" title="Start a rematch">🔄 Rematch</button>
              <button type="button" class="btn btn-outline btn-sm btn-manage-toggle" data-game-id="${escapeHtml(game.id)}" title="Toggle Status">${game.completed ? 'Reopen' : 'Finish'}</button>
              <button type="button" class="btn btn-danger btn-sm btn-manage-del" data-game-id="${escapeHtml(game.id)}" title="Delete">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-manage-open').forEach(btn => {
      btn.addEventListener('click', () => {
        const gId = btn.getAttribute('data-game-id');
        const found = gamesList.find(g => g.id === gId);
        if (found) openGame(found);
      });
    });

    tbody.querySelectorAll('.btn-manage-rematch').forEach(btn => {
      btn.addEventListener('click', () => {
        const gId = btn.getAttribute('data-game-id');
        const found = gamesList.find(g => g.id === gId);
        if (found) startRematch(found);
      });
    });

    tbody.querySelectorAll('.btn-manage-toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const gId = btn.getAttribute('data-game-id');
        const found = gamesList.find(g => g.id === gId);
        if (found) {
          await toggleMatchCompletion(found);
        }
      });
    });

    tbody.querySelectorAll('.btn-manage-del').forEach(btn => {
      btn.addEventListener('click', () => {
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
    if (liveRefreshTimer) {
      clearInterval(liveRefreshTimer);
      liveRefreshTimer = null;
    }

    // Keep URL parameter synchronized so refreshing stays on the active scorecard
    try {
      if (game && game.id) {
        localStorage.setItem('scoresheets_last_opened_game_id', game.id);
        const newUrl = window.location.origin + window.location.pathname + '?game=' + encodeURIComponent(game.id);
        if (window.location.search !== '?game=' + game.id) {
          window.history.replaceState({ gameId: game.id }, '', newUrl);
        }
      }
    } catch (e) {}

    dismissSplashScreen();
    renderScorecard();
    showView('view-scorecard');
    requestWakeLock();

    if (db && game && game.isLiveChallenge) {
      const applyLiveSnapshot = snapshot => {
        if (!snapshot.exists) return;
        const wasCompleted = !!(activeGame && activeGame.id === snapshot.id && activeGame.completed);
        activeGame = snapshot.data();
        if (activeGame.isLiveChallenge) ensureLiveGolfState(activeGame);
        const localGames = getLocalGames().filter(saved => saved.id !== activeGame.id);
        saveLocalGames([activeGame, ...localGames]);
        if (activeGame.liveState && ['round-complete', 'game-complete'].includes(activeGame.liveState.phase)) {
          showLiveRoundSummary(activeGame);
        }
        renderScorecard();
        if (!wasCompleted && activeGame.completed) {
          showToast('🏁 The live match has been finalized.', 'winner');
        }
        if (activeGame.liveState && ['round-complete', 'game-complete'].includes(activeGame.liveState.phase)) {
          setTimeout(() => showLiveRoundSummary(activeGame), 0);
          setTimeout(() => showLiveRoundSummary(activeGame), 300);
        }
      };
      firestoreUnsubscribe = db.collection('games').doc(game.id).onSnapshot(applyLiveSnapshot, err => {
        console.warn('Live game update error:', err);
      });
      liveRefreshTimer = setInterval(async () => {
        try {
          const snapshot = await db.collection('games').doc(game.id).get({ source: 'server' });
          applyLiveSnapshot(snapshot);
        } catch (err) {
          console.warn('Live game refresh error:', err);
        }
      }, 2000);
    }
  }

  // Check if any player in the game has reached exactly 100 points
  function hasPlayerWith100Points(game) {
    if (!game || !game.players) return false;
    return game.players.some(p => {
      const sum = p.scores.reduce((acc, s) => s !== null && s !== undefined ? acc + s : acc, 0);
      const playedCount = p.scores.filter(s => s !== null && s !== undefined).length;
      return playedCount > 0 && sum === 100;
    });
  }

  // Match Details Drawer State
  let isDetailsDrawerOpen = false;

  function toggleDetailsDrawer(forceState) {
    const chipsDrawer = document.getElementById('sc-meta-details');
    const toggleBtn = document.getElementById('btn-toggle-details');
    const toggleText = document.getElementById('btn-details-text');
    if (!chipsDrawer || !toggleBtn) return;

    isDetailsDrawerOpen = typeof forceState === 'boolean' ? forceState : !isDetailsDrawerOpen;

    if (isDetailsDrawerOpen) {
      chipsDrawer.classList.add('is-open');
      toggleBtn.classList.add('is-active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (toggleText) toggleText.textContent = 'Hide';
    } else {
      chipsDrawer.classList.remove('is-open');
      toggleBtn.classList.remove('is-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (toggleText) toggleText.textContent = 'Details';
    }
  }

  function renderScorecard() {
    if (!activeGame) return;

    const gType = activeGame.gameType || 'golf';
    const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;
    const isLowestWins = activeGame.scoreType === 'lowest';
    const has100Winner = gType === 'golf' && hasPlayerWith100Points(activeGame);

    document.getElementById('sc-game-title').textContent = activeGame.title;
    document.getElementById('sc-game-type-chip').textContent = `${gameConfig.icon} ${gameConfig.name}`;
    document.getElementById('sc-variant-chip').textContent = typeof activeGame.variant === 'number' ? `${activeGame.variant}-Card` : `${activeGame.variant}`;
    document.getElementById('sc-holes-chip').textContent = `${activeGame.holes} ${gameConfig.roundPlural || 'Rounds'}`;
    document.getElementById('sc-win-condition-chip').textContent = has100Winner 
      ? '🎯 100-PT WINNER!' 
      : (isLowestWins ? 'Lowest Wins (or 100 pts) ⛳' : 'Highest Wins 🏆');

    const statusChip = document.getElementById('sc-status-chip');
    statusChip.textContent = activeGame.completed ? 'Completed' : 'In Progress';
    statusChip.className = `meta-pill ${activeGame.completed ? 'completed' : 'variant'}`;

    const syncChip = document.getElementById('sc-sync-chip');
    if (syncChip) {
      if (activeGame.completed) {
        syncChip.textContent = '☁️ Synced to Cloud';
        syncChip.className = 'meta-pill completed';
        syncChip.style.background = 'rgba(34, 197, 94, 0.2)';
        syncChip.style.color = 'var(--fairway-light)';
      } else {
        syncChip.textContent = '⚡ Offline-First (Syncs on Finish)';
        syncChip.className = 'meta-pill';
        syncChip.style.background = 'rgba(59, 130, 246, 0.18)';
        syncChip.style.color = '#93c5fd';
      }
    }

    // Refresh Details toggle state
    toggleDetailsDrawer(isDetailsDrawerOpen);

    // Winner announcement banner & Toggle button state
    const winnerBanner = document.getElementById('sc-winner-banner');
    const winnerNameEl = document.getElementById('sc-winner-name');
    const winnerSubEl = document.getElementById('sc-winner-sub');
    const toggleCompleteBtn = document.getElementById('btn-finish-game-toggle');

    if (activeGame.completed) {
      const winner = getGameWinner(activeGame);
      if (winnerBanner && winnerNameEl && winnerSubEl) {
        winnerBanner.classList.remove('hidden');
        winnerNameEl.textContent = winner.name;
        winnerSubEl.textContent = `Final Score: ${winner.totalScore} pts ${winner.is100PointWin ? '🎯 (100 PTS ULTIMATE WIN!)' : ''} • Match recorded to database for posterity.`;
      }
      if (toggleCompleteBtn) {
        toggleCompleteBtn.innerHTML = '▶️ Resume Match';
        toggleCompleteBtn.className = 'btn btn-outline btn-sm';
      }
    } else {
      if (winnerBanner) winnerBanner.classList.add('hidden');
      if (toggleCompleteBtn) {
        toggleCompleteBtn.innerHTML = '🏁 Finalize &amp; Record Match';
        toggleCompleteBtn.className = 'btn btn-gold btn-sm';
      }
    }

    updateWakeLockUI();
    renderLeaderboardBar();
    renderScoreTable();
    renderLiveCardBoard();
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

    sortPlayerStats(playerStats, gType, activeGame.scoreType);

    bar.innerHTML = playerStats.map((item, rank) => {
      const isFirst = rank === 0 && item.playedCount > 0;
      const is100Win = gType === 'golf' && item.sum === 100 && item.playedCount > 0;
      return `
        <div class="leader-card ${isFirst ? 'rank-1' : ''}" ${is100Win ? 'style="border-color: #fbbf24; box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);"' : ''}>
          <div class="leader-rank">${is100Win ? '👑' : '#' + (rank + 1)}</div>
          <div class="leader-info">
            <div class="leader-name">${escapeHtml(item.player.name)} ${is100Win ? '<span style="color:#fbbf24; font-size:0.75rem; font-weight:800;">(100 PTS!)</span>' : ''}</div>
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
    const liveScoreLocked = activeGame.isLiveChallenge;

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
            <button type="button" class="${scoreClass}" data-player-id="${escapeHtml(p.id)}" data-hole-idx="${h}" ${liveScoreLocked ? 'disabled' : ''}>
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

  // Quick Score Presets
  const GOLF_QUICK_SCORES = [-20, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const REAL_GOLF_QUICK_SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const SCRABBLE_QUICK_SCORES = [0, 5, 8, 10, 12, 14, 16, 18, 20, 24, 28, 30, 35, 40, 50, 60, 70, 80];
  const CRIBBAGE_QUICK_SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24, 28, 29];
  const CRIB_GRID_QUICK_SCORES = [0, 4, 6, 8, 10, 12, 14, 15, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40];
  const GENERIC_QUICK_SCORES = [-10, -5, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 50, 100];

  // ==========================================================
  // CONFETTI CELEBRATION ENGINE
  // ==========================================================

  function triggerConfetti() {
    const existingCanvas = document.getElementById('confetti-canvas');
    if (existingCanvas) existingCanvas.remove();

    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const particles = [];
    const colors = [
      '#fbbf24', '#f59e0b', '#22c55e', '#10b981', '#4ade80',
      '#ef4444', '#3b82f6', '#ec4899', '#a855f7', '#38bdf8', '#facc15'
    ];

    // Spawn 180 particles bursting from top and corners
    for (let i = 0; i < 180; i++) {
      const fromLeft = i % 2 === 0;
      particles.push({
        x: fromLeft ? window.innerWidth * (Math.random() * 0.4) : window.innerWidth * (0.6 + Math.random() * 0.4),
        y: Math.random() * -100,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: fromLeft ? (Math.random() * 8 + 2) : -(Math.random() * 8 + 2),
        vy: Math.random() * 7 + 3,
        rotation: Math.random() * 360,
        vRotation: (Math.random() - 0.5) * 16,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.12 + 0.06,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    let animationFrameId;
    const startTime = Date.now();

    function render() {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let activeCount = 0;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16; // gravity
        p.vx *= 0.985; // drag
        p.rotation += p.vRotation;
        p.wobble += p.wobbleSpeed;

        if (elapsed > 2500) {
          p.opacity = Math.max(0, p.opacity - 0.025);
        }

        if (p.y < window.innerHeight + 60 && p.opacity > 0) {
          activeCount++;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x + Math.sin(p.wobble) * 6, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * (0.6 + Math.sin(p.wobble) * 0.4));
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      if (activeCount > 0 && elapsed < 4500) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // ==========================================================
  // SCORE INPUT MODAL (DIRECT REPORTING)
  // ==========================================================

  function setModalScore(scoreVal) {
    editingScoreCtx.directScore = scoreVal;
    const display = document.getElementById('direct-score-display');
    if (display) display.textContent = editingScoreCtx.directScore;

    // Highlight active button
    document.querySelectorAll('.numpad-btn').forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      btn.classList.toggle('is-active-val', !isNaN(val) && val === scoreVal);
    });

    // If they select -20 drop confetti!
    if (scoreVal === -20) {
      triggerConfetti();
      showToast('🏆 -20 JACKPOT! Confetti dropped! 🎉', 'success');
    }
  }

  function renderScoreButtons(gameType, currentScore) {
    const container = document.getElementById('modal-numpad-container');
    if (!container) return;

    let scoresList = GENERIC_QUICK_SCORES;
    if (gameType === 'golf') {
      scoresList = GOLF_QUICK_SCORES;
    } else if (gameType === 'real_golf') {
      scoresList = REAL_GOLF_QUICK_SCORES;
    } else if (gameType === 'scrabble') {
      scoresList = SCRABBLE_QUICK_SCORES;
    } else if (gameType === 'cribbage') {
      scoresList = CRIBBAGE_QUICK_SCORES;
    } else if (gameType === 'crib') {
      scoresList = CRIB_GRID_QUICK_SCORES;
    }

    let html = scoresList.map(num => {
      const isJackpot = num === -20;
      const isNeg = num < 0;
      const isSelected = num === currentScore;
      let btnClass = 'numpad-btn';
      if (isJackpot) btnClass += ' btn-jackpot';
      else if (isNeg) btnClass += ' btn-negative';
      if (isSelected) btnClass += ' is-active-val';

      return `
        <button type="button" class="${btnClass}" data-val="${num}" title="${isJackpot ? 'Super Jackpot (-20)!' : num + ' pts'}">
          ${isJackpot ? '★ -20' : num}
        </button>
      `;
    }).join('');

    // Append CLR (Clear) button
    html += `<button type="button" class="numpad-btn btn-clr" data-val="CLR">CLR</button>`;
    container.innerHTML = html;

    // Bind click events
    container.querySelectorAll('.numpad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        if (val === 'CLR') {
          setModalScore(0);
        } else {
          setModalScore(parseInt(val, 10));
        }
      });
    });
  }

  function openScoreModal(playerId, holeIdx) {
    const player = activeGame.players.find(p => p.id === playerId);
    if (!player) return;

    const gType = activeGame.gameType || 'golf';
    const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;

    editingScoreCtx.playerId = playerId;
    editingScoreCtx.holeIdx = holeIdx;

    document.getElementById('modal-score-title').textContent = `${gameConfig.roundName} ${holeIdx + 1} Score – ${player.name}`;

    const existingScore = player.scores[holeIdx];
    editingScoreCtx.directScore = existingScore !== null && existingScore !== undefined ? existingScore : 0;
    document.getElementById('direct-score-display').textContent = editingScoreCtx.directScore;
    document.getElementById('input-direct-custom').value = '';

    // Render quick buttons for this game type
    renderScoreButtons(gType, editingScoreCtx.directScore);

    const modal = document.getElementById('modal-score-input');
    modal.classList.add('is-open');
  }

  function closeScoreModal() {
    document.getElementById('modal-score-input').classList.remove('is-open');
  }

  function highlightScoreCell(playerId, holeIdx) {
    const cellBtn = document.querySelector(`.score-cell-btn[data-player-id="${playerId}"][data-hole-idx="${holeIdx}"]`);
    if (cellBtn) {
      cellBtn.classList.remove('cell-pulse');
      void cellBtn.offsetWidth; // trigger reflow
      cellBtn.classList.add('cell-pulse');
    }
  }

  async function saveScoreFromModal() {
    const player = activeGame.players.find(p => p.id === editingScoreCtx.playerId);
    if (!player) {
      closeScoreModal();
      return;
    }
    const gType = activeGame.gameType || 'golf';
    const gameConfig = GAMES_REGISTRY[gType] || GAMES_REGISTRY.golf;
    const scoreVal = parseInt(editingScoreCtx.directScore, 10);
    const validScore = isNaN(scoreVal) ? 0 : scoreVal;
    const holeIdx = editingScoreCtx.holeIdx;

    player.scores[holeIdx] = validScore;

    // If saving a score into a previously completed match, automatically make it active again
    const wasCompleted = activeGame.completed;
    if (wasCompleted) {
      activeGame.completed = false;
    }

    // Immediately close modal and update scorecard
    closeScoreModal();
    renderScorecard();
    highlightScoreCell(player.id, holeIdx);
    
    if (wasCompleted) {
      showToast(`${gameConfig.roundName} ${holeIdx + 1} updated! Match reactivated until finalized again.`, 'info');
    } else {
      showToast(`${gameConfig.roundName} ${holeIdx + 1}: ${player.name} scored ${validScore} pts`, 'success');
    }

    try {
      // Save locally (offline-first during match; if reactivated, sync state)
      await saveGame(activeGame, { syncToCloud: wasCompleted || activeGame.isLiveChallenge });
    } catch (err) {
      console.warn('Error saving local score:', err);
    }
  }

  async function clearScoreFromModal() {
    const player = activeGame.players.find(p => p.id === editingScoreCtx.playerId);
    if (!player) {
      closeScoreModal();
      return;
    }
    const holeIdx = editingScoreCtx.holeIdx;
    player.scores[holeIdx] = null;

    // If clearing a score in a previously completed match, automatically make it active again
    const wasCompleted = activeGame.completed;
    if (wasCompleted) {
      activeGame.completed = false;
    }

    closeScoreModal();
    renderScorecard();
    highlightScoreCell(player.id, holeIdx);
    
    if (wasCompleted) {
      showToast(`Score cleared! Match reactivated until finalized again.`, 'info');
    } else {
      showToast(`Score cleared`, 'info');
    }

    try {
      // Save locally (offline-first during match; if reactivated, sync state)
      await saveGame(activeGame, { syncToCloud: wasCompleted || activeGame.isLiveChallenge });
    } catch (err) {
      console.warn('Error clearing score:', err);
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

  async function startGoogleSignIn() {
    ensureFirebaseServices();
    if (!auth) {
      showToast('Firebase Auth is ready once hosted on Firebase!', 'info');
      return;
    }
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({ prompt: 'select_account' });
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        await auth.signInWithRedirect(provider);
        return;
      }
      await authReady;
      const result = await auth.signInWithPopup(provider);
      if (result && result.user) {
        currentUser = result.user;
        updateAuthUI();
        closeSignInModal();
        dismissSplashScreen();
        showToast('Signed in successfully!', 'success');
        showAuthDebugDialog(result.user);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      showToast(err.code === 'auth/network-request-failed'
        ? 'Google sign-in was blocked by this browser. Check browser privacy settings and try again.'
        : 'Sign in error: ' + err.message, 'error');
    }
  }

  function openProfileOrSignIn() {
    if (currentUser || (auth && auth.currentUser)) {
      currentUser = currentUser || auth.currentUser;
      renderProfileView();
    } else {
      openSignInModal();
    }
  }

  function setupEventListeners() {
    // Splash Screen & Sign-in Modal Triggers
    const enterAppBtn = document.getElementById('enter-app');
    if (enterAppBtn) {
      enterAppBtn.addEventListener('click', () => {
        openSignInModal();
      });
    }

    const closeSigninBtn = document.getElementById('close-signin');
    if (closeSigninBtn) {
      closeSigninBtn.addEventListener('click', () => {
        closeSignInModal();
      });
    }

    const guestEntryBtn = document.getElementById('btn-guest-entry');
    if (guestEntryBtn) {
      guestEntryBtn.addEventListener('click', () => {
        closeSignInModal();
        dismissSplashScreen();
        showToast('Playing as Guest in local offline mode', 'info');
      });
    }

    // Password Toggle
    const togglePasswordBtn = document.getElementById('toggle-password');
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        const passInput = document.getElementById('password');
        if (passInput) {
          passInput.type = passInput.type === 'password' ? 'text' : 'password';
        }
      });
    }

    // Email Login / Signup Form
    const emailForm = document.getElementById('email-login-form');
    if (emailForm) {
      emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        if (!email || !password) {
          alert('Email and password are required.');
          return;
        }

        ensureFirebaseServices();

        if (!auth) {
          showToast('Firebase Auth is ready once hosted on Firebase!', 'info');
          closeSignInModal();
          dismissSplashScreen();
          return;
        }

        try {
          const userCred = await auth.signInWithEmailAndPassword(email, password);
          if (userCred && userCred.user) {
            currentUser = userCred.user;
            updateAuthUI();
          }
          closeSignInModal();
          dismissSplashScreen();
          showToast('Signed in successfully!', 'success');
          if (userCred && userCred.user) showAuthDebugDialog(userCred.user);
        } catch (err) {
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            try {
              const userCred2 = await auth.createUserWithEmailAndPassword(email, password);
              if (userCred2 && userCred2.user) {
                currentUser = userCred2.user;
                updateAuthUI();
              }
              closeSignInModal();
              dismissSplashScreen();
              showToast('Account created and signed in!', 'success');
              if (userCred2 && userCred2.user) showAuthDebugDialog(userCred2.user);
            } catch (err2) {
              if (err2.code === 'auth/email-already-in-use') {
                alert('Incorrect password. Please try again or use Forgot password.');
              } else if (err2.code === 'auth/weak-password') {
                alert('Password is too weak. Use at least 6 characters.');
              } else {
                alert('Sign up failed: ' + err2.message);
              }
            }
          } else {
            alert('Sign in failed: ' + err.message);
          }
        }
      });
    }

    // Password Reset
    const resetPasswordBtn = document.getElementById('resetPassword');
    if (resetPasswordBtn) {
      resetPasswordBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value.trim();
        if (!email) {
          alert('Please enter your email in the field first.');
          return;
        }
        ensureFirebaseServices();
        if (!auth) {
          alert('Authentication is active on the deployed URL.');
          return;
        }
        try {
          await auth.sendPasswordResetEmail(email);
          alert('Password reset email sent. Please check your inbox.');
        } catch (err) {
          alert('Password reset failed: ' + err.message);
        }
      });
    }

    // Manage Sheets Navigation & Actions
    const manageNavBtn = document.getElementById('btn-nav-manage-sheets');
    if (manageNavBtn) {
      manageNavBtn.addEventListener('click', () => {
        renderManageSheetsTable(gamesList);
        showView('view-manage-sheets');
      });
    }

    const profileManageSheetsBtn = document.getElementById('btn-profile-manage-sheets');
    if (profileManageSheetsBtn) {
      profileManageSheetsBtn.addEventListener('click', () => {
        renderManageSheetsTable(gamesList);
        showView('view-manage-sheets');
      });
    }

    const profileRulesBtn = document.getElementById('btn-profile-rules');
    if (profileRulesBtn) {
      profileRulesBtn.addEventListener('click', () => {
        showView('view-rules');
      });
    }

    const manageBackHomeBtn = document.getElementById('btn-manage-back-home');
    if (manageBackHomeBtn) {
      manageBackHomeBtn.addEventListener('click', () => {
        loadGamesList();
        showView('view-home');
      });
    }

    const manageNewSheetBtn = document.getElementById('btn-manage-new-sheet');
    if (manageNewSheetBtn) {
      manageNewSheetBtn.addEventListener('click', () => {
        initSetupForm('golf');
        showView('view-setup');
      });
    }

    // Nav Brand & Buttons
    document.getElementById('nav-brand').addEventListener('click', () => {
      try {
        localStorage.removeItem('scoresheets_last_opened_game_id');
        if (window.location.search) {
          window.history.replaceState({}, '', window.location.origin + window.location.pathname);
        }
      } catch (e) {}
      loadGamesList();
      showView('view-home');
    });

    const heroNewGameBtn = document.getElementById('btn-hero-new-game');
    if (heroNewGameBtn) {
      heroNewGameBtn.addEventListener('click', () => {
        initSetupForm('golf');
        showView('view-setup');
      });
    }

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

    const showRulesBtn = document.getElementById('btn-show-rules');
    if (showRulesBtn) {
      showRulesBtn.addEventListener('click', () => {
        showView('view-rules');
      });
    }

    const heroRulesBtn = document.getElementById('btn-hero-rules');
    if (heroRulesBtn) {
      heroRulesBtn.addEventListener('click', () => {
        showView('view-rules');
      });
    }

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
      try {
        localStorage.removeItem('scoresheets_last_opened_game_id');
        if (window.location.search) {
          window.history.replaceState({}, '', window.location.origin + window.location.pathname);
        }
      } catch (e) {}
      loadGamesList();
      showView('view-home');
    });

    document.getElementById('btn-add-player-row').addEventListener('click', () => {
      addPlayerInputRow('', document.querySelectorAll('.player-name-input').length + 1);
      renderSuggestedPlayerChips();
    });

    const loadLastPlayersBtn = document.getElementById('btn-load-last-players');
    if (loadLastPlayersBtn) {
      loadLastPlayersBtn.addEventListener('click', () => {
        const lastPlayers = getLastPlayerNames();
        if (lastPlayers && lastPlayers.length > 0) {
          const container = document.getElementById('player-inputs-container');
          container.innerHTML = '';
          lastPlayers.forEach((name, i) => {
            addPlayerInputRow(name, i + 1);
          });
          renderSuggestedPlayerChips();
          showToast('Loaded players from last game! 👥', 'info');
        }
      });
    }

    document.getElementById('new-game-form').addEventListener('submit', (e) => {
      e.preventDefault();
      createNewGameFromForm();
    });

    document.getElementById('btn-share-game').addEventListener('click', shareCurrentGame);

    document.getElementById('btn-delete-current-game').addEventListener('click', () => {
      if (activeGame) deleteGame(activeGame.id);
    });

    const toggleDetailsBtn = document.getElementById('btn-toggle-details');
    if (toggleDetailsBtn) {
      toggleDetailsBtn.addEventListener('click', () => {
        toggleDetailsDrawer();
      });
    }

    document.getElementById('btn-finish-game-toggle').addEventListener('click', async () => {
      if (activeGame) {
        await toggleMatchCompletion(activeGame);
      }
    });

    const winnerConfettiBtn = document.getElementById('btn-winner-confetti');
    if (winnerConfettiBtn) {
      winnerConfettiBtn.addEventListener('click', () => {
        triggerConfetti();
      });
    }

    // Score Modal Actions
    document.getElementById('btn-close-score-modal').addEventListener('click', closeScoreModal);
    document.getElementById('btn-cancel-score-modal').addEventListener('click', closeScoreModal);
    document.getElementById('btn-save-score').addEventListener('click', saveScoreFromModal);
    document.getElementById('btn-clear-score').addEventListener('click', clearScoreFromModal);

    const liveRoundReadyBtn = document.getElementById('btn-live-round-ready');
    if (liveRoundReadyBtn) {
      liveRoundReadyBtn.addEventListener('click', readyForNextLiveHole);
    }
    const liveRoundDismissBtn = document.getElementById('btn-live-round-dismiss');
    if (liveRoundDismissBtn) {
      liveRoundDismissBtn.addEventListener('click', closeLiveRoundSummary);
    }
    document.getElementById('btn-close-auth-debug')?.addEventListener('click', closeAuthDebugDialog);
    document.getElementById('btn-auth-debug-continue')?.addEventListener('click', closeAuthDebugDialog);

    // Quick Decrement / Increment Stepper Buttons (- / +)
    const btnScoreDec = document.getElementById('btn-score-dec');
    if (btnScoreDec) {
      btnScoreDec.addEventListener('click', () => {
        setModalScore(editingScoreCtx.directScore - 1);
      });
    }

    const btnScoreInc = document.getElementById('btn-score-inc');
    if (btnScoreInc) {
      btnScoreInc.addEventListener('click', () => {
        setModalScore(editingScoreCtx.directScore + 1);
      });
    }

    // Custom Direct Points Field
    const applyCustomBtn = document.getElementById('btn-apply-custom-direct');
    if (applyCustomBtn) {
      applyCustomBtn.addEventListener('click', () => {
        const input = document.getElementById('input-direct-custom');
        const val = parseInt(input.value, 10);
        if (!isNaN(val)) {
          setModalScore(val);
          input.value = '';
        }
      });
    }

    // Auth & Profile Navigation Action
    const authActionButton = document.getElementById('btn-auth-action');
    authActionButton.addEventListener('click', openProfileOrSignIn);
    authActionButton.dataset.profileHandlerBound = 'true';

    // Profile Page Back & Log Out actions
    const profileBackBtn = document.getElementById('btn-profile-back');
    if (profileBackBtn) {
      profileBackBtn.addEventListener('click', () => {
        loadGamesList();
        showView('view-home');
      });
    }

    const profileLogoutBtn = document.getElementById('btn-profile-logout');
    if (profileLogoutBtn) {
      profileLogoutBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to log out?')) {
          if (auth) {
            await auth.signOut();
          }
          currentUser = null;
          updateAuthUI();
          showToast('Signed out successfully', 'info');
          showSplashScreen();
          showView('view-home');
        }
      });
    }

    const modalGoogleSigninBtn = document.getElementById('modal-google-signin');
    if (modalGoogleSigninBtn) {
      modalGoogleSigninBtn.addEventListener('click', startGoogleSignIn);
      modalGoogleSigninBtn.dataset.googleHandlerBound = 'true';
    }

    // Screen Wake Lock Toggle & Auto-Reacquire
    const wakeLockChip = document.getElementById('btn-wakelock-chip');
    if (wakeLockChip) {
      wakeLockChip.addEventListener('click', () => {
        toggleWakeLock();
      });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isWakeLockEnabled) {
        requestWakeLock();
      }
    });

    // Acquire on first touch/interaction on mobile devices if user has stay awake enabled
    const onFirstUserInteraction = () => {
      if (isWakeLockEnabled) {
        requestWakeLock();
      }
    };
    document.addEventListener('touchstart', onFirstUserInteraction, { passive: true });
    document.addEventListener('click', onFirstUserInteraction, { passive: true });

    // Check URL parameters or saved active session for direct game reload: ?game=xyz
    const urlParams = new URLSearchParams(window.location.search);
    let targetGameId = urlParams.get('game');
    if (!targetGameId) {
      try {
        targetGameId = localStorage.getItem('scoresheets_last_opened_game_id');
      } catch (e) {}
    }

    if (targetGameId) {
      const loadTargetGame = async () => {
        // 1. Check local storage first (instant offline reload)
        let local = getLocalGames().find(g => g.id === targetGameId);
        if (local) {
          openGame(local);
        }

        // 2. Fetch latest version from Firestore if available
        if (db) {
          try {
            const doc = await db.collection('games').doc(targetGameId).get();
            if (doc.exists) {
              const cloudGame = doc.data();
              saveLocalGames([cloudGame, ...getLocalGames().filter(g => g.id !== cloudGame.id)]);
              openGame(cloudGame);
            }
          } catch (e) {
            console.warn('Could not fetch game from Firestore:', e);
          }
        }
      };

      // Run immediately and after a short delay for DB init
      loadTargetGame();
      setTimeout(loadTargetGame, 600);
    }
  }

  // Service Worker for Offline PWA Support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }

  // Bootstrap
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      setupEventListeners();
    } catch (err) {
      console.error('ScoreSheets event setup error:', err);
      const googleButton = document.getElementById('modal-google-signin');
      if (googleButton && googleButton.dataset.googleHandlerBound !== 'true') {
        googleButton.addEventListener('click', startGoogleSignIn);
        googleButton.dataset.googleHandlerBound = 'true';
      }
      const authActionButton = document.getElementById('btn-auth-action');
      if (authActionButton && authActionButton.dataset.profileHandlerBound !== 'true') {
        authActionButton.addEventListener('click', openProfileOrSignIn);
        authActionButton.dataset.profileHandlerBound = 'true';
      }
    }
    try {
      const response = await fetch('/__/firebase/init.json');
      if (response.ok) {
        const config = await response.json();
        window.firebaseConfig = { ...config, authDomain: window.location.host };
      }
    } catch (e) {
      console.warn('Could not load Firebase runtime config; using offline mode.');
    }
    initFirebase();
  });

})();
