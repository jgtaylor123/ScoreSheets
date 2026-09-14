# ⛳ Golf Card Game Scorekeeper (ScoreSheets)

A real-time multiplayer digital scorecard and interactive card calculator for the **Golf Card Game** (supporting 4-card, 6-card, 8-card, and 9-card variations). Built to run on **Firebase Hosting** and sync across players with **Google Cloud Firestore**.

---

## 🌟 Features

- **🎴 Smart Visual Card Calculator**: Tap cards into your round's grid layout (2x2, 2x3, 2x4, or 3x3) to automatically calculate point totals, column pair cancellations (pairs score 0 pts), Kings (0 pts), and Jokers (-2 pts).
- **🔢 Quick Score Direct Entry**: Fast numeric entry / numpad for rapid scoring without the visual card layout if preferred.
- **🏆 Real-Time Live Standings & Podiums**: Dynamic rankings, hole-by-hole totals, and color-coded status badges.
- **🔄 Multi-Hole Formats**: Support for 6-hole short games, 9-hole matches, and 18-hole full championship games.
- **☁️ Cloud Firestore Sync & Share**: Live cloud sync with shareable match links (`?game=<id>`).
- **📱 PWA & Mobile-First Responsive Design**: Works seamlessly on mobile phones at the table and on desktop, complete with offline ServiceWorker caching.

---

## 🃏 Standard Golf Card Game Scoring

| Card | Points | Notes |
| :--- | :--- | :--- |
| **Joker** | **-2 Pts** | Lowest scoring card (Bonus) |
| **King (K)** | **0 Pts** | Zero points |
| **Ace (A)** | **1 Pt** | One point |
| **2 through 10** | **Face Value** | 2 = 2 pts, 3 = 3 pts ... 10 = 10 pts |
| **Jack (J), Queen (Q)** | **10 Pts** | High penalty face cards |

> **Column Pair Cancellation Rule:** Any matching pair in the same vertical column cancels out to **0 points** (e.g., a column with two 8s scores 0 instead of 16).

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** HTML5, Modern Vanilla JavaScript (ES6+), CSS3 Grid & Flexbox, SVG graphics.
- **Database:** Firebase Cloud Firestore.
- **Hosting:** Firebase Hosting with custom cache-control headers.
- **Authentication:** Firebase Auth (Google Sign-In + Guest fallback).

---

## 🚀 Firebase Setup & Deployment

### 1. Set Firebase Project
To associate with your Firebase project:
```bash
firebase use <your-firebase-project-id>
```

### 2. Run Locally
```bash
npx serve public
# or
firebase serve --only hosting
```

### 3. Deploy
```bash
firebase deploy --only hosting,firestore:rules
```

---

## 📦 Repository & GitHub
Backed up under `jgtaylor123` GitHub account.
