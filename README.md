# 📝 ScoreSheets

A modern, real-time multiplayer digital scorekeeper and match tracker for tabletop, card, and board games. Backed by **Firebase Hosting** and **Google Cloud Firestore**.

---

## 🌟 Available ScoreSheets & Games

### 1. ⛳ Golf Card Game
- **Fast Hole Score Reporting**: Quick points pad, increment/decrement steppers, and direct numeric input.
- **Game Formats**: 4-card, 6-card, 8-card, and 9-card Golf across 6, 9, or 18 holes.
- **Built-In Rules Reference**: Quick lookup for **2s** ($-2$ pts), **Kings** ($0$ pts), **Aces** ($1$ pt), **3 through 10** (face value), **Jacks & Queens** ($10$ pts), vertical column pair cancellations ($0$ pts), and the **100-point outright win** rule.
- **Match Leaderboard**: Real-time lowest-score-wins ranking and stroke totals.

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

