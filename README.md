# 📝 ScoreSheets

A modern, real-time multiplayer digital scorekeeper and match tracker for tabletop, card, and board games. Backed by **Firebase Hosting** and **Google Cloud Firestore**.

---

## 🌟 Available ScoreSheets & Games

### 1. ⛳ Golf Card Game
- **Interactive Card Layout Calculator**: Supports 4-card ($2 \times 2$), 6-card ($2 \times 3$), 8-card ($2 \times 4$), and 9-card ($3 \times 3$) variations.
- **Smart Column Pair Rules**: Automatically cancels matching vertical card pairs to $0$ points.
- **Special Card Values**: Automatically scores Jokers ($-2$ pts), Kings ($0$ pts), Aces ($1$ pt), and Face cards ($10$ pts).
- **Match Formats**: 6-hole, 9-hole, and 18-hole matches with lowest-score-wins leaderboard.

### 2. 📝 Round-by-Round / Custom Game Sheets
- **Universal Round Tracker**: Flexible scorepad for games like Rummy, Farkle, Yahtzee, Wizard, Phase 10, Hearts, Spades, etc.
- **Configurable Win Conditions**: Toggle between *Highest Score Wins* and *Lowest Score Wins*.
- **Quick Numpad & Custom Points Entry**: Rapid point entry with support for positive and negative scores.

---

## ✨ Platform Features

- **🏆 Real-Time Multiplayer Leaderboards**: Live standings with podium highlights, sub-totals, and round progress.
- **☁️ Cloud Firestore Sync & Offline PWA**: Real-time cloud sync across devices with offline `localStorage` and ServiceWorker caching.
- **🔗 Instant Match Sharing**: Share match scorecards via URL (`?game=<id>`).
- **📱 Responsive Mobile-First Design**: Optimized for tabletop gameplay on smartphones, tablets, and desktop.
- **👤 Google Sign-In & Guest Play**: Play without signing in or log in with Google to sync matches across devices.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** HTML5, Modern Vanilla JavaScript (ES6+), CSS3 Grid & Flexbox, SVG assets.
- **Database:** Firebase Cloud Firestore.
- **Hosting:** Firebase Hosting.
- **Auth:** Firebase Authentication (Google Auth + Guest fallback).

---

## 🚀 Setup & Deployment

### 1. Associate Firebase Project
```bash
firebase use <project-id>
```

### 2. Run Locally
```bash
npx serve public
# or
firebase serve --only hosting
```

### 3. Deploy to Hosting & Firestore
```bash
firebase deploy --only hosting,firestore:rules
```

---

## 📦 GitHub Repository
Backed up at: [https://github.com/jgtaylor123/ScoreSheets](https://github.com/jgtaylor123/ScoreSheets)

