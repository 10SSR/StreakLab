# 🧪 Streak Lab

> A competitive daily habit tracker Progressive Web App with scheduled reminders, a 15-minute check-in timer, points, personal rewards, and weekly friend leagues.

Runs locally with **ZERO external setup** in full **Demo Mode** using Dexie (IndexedDB), with simulated friends, animated leaderboard, and an optional Firebase adapter layer.

---

## 🚀 Quick Start (Local Demo Mode)

No Firebase keys, accounts, or cloud setup required. The app runs fully in offline-capable IndexedDB demo mode right out of the box.

```bash
# 1. Install dependencies
npm install

# 2. Run all production health checks
npm run healthcheck

# 3. Start local development server with LAN host enabled
npm run dev -- --host
```

Once running:
- **Local URL**: [http://localhost:5173](http://localhost:5173)
- **LAN URL**: e.g. `http://<your-lan-ip>:5173` (open in your mobile phone browser on the same Wi-Fi)

---

## 📱 PWA Installation Guide

### iOS (iPhone & iPad, iOS 16.4+)
1. Open the app URL in **Safari**.
2. Tap the **Share** button (box with upward arrow) in the bottom bar.
3. Scroll down and tap **"Add to Home Screen"**.
4. Open the installed Streak Lab icon from your Home Screen.
5. Tap **"Allow Notifications"** in the Onboarding or Settings to enable web push notifications.

### Android
1. Open the app URL in **Chrome** or **Brave**.
2. Tap the browser menu (three dots) or tap the **"Install Streak Lab"** pop-up.
3. Tap **Add to Home screen** / **Install**.
4. Enjoy standalone offline mode with full haptic feedback.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + Vite + TypeScript (Strict) |
| **Styling** | Tailwind CSS + Cyber-Lab Glassmorphic Design System |
| **Animation Engine** | Framer Motion (spring physics, shared `layoutId`, drag gestures) + `canvas-confetti` |
| **Local Storage** | Dexie (IndexedDB) with reactive `dexie-react-hooks` |
| **State Management** | Zustand (lightweight global app & modal state) |
| **Date Engine** | `date-fns` & `date-fns/locale` |
| **Audio Synthesis** | Web Audio API (zero external mp3 assets to fail; procedural chimes, ticks, fanfares, coin drops) |
| **Tactile Haptics** | `navigator.vibrate` with cyber vibration patterns |
| **Service Worker / PWA** | `vite-plugin-pwa` with Workbox offline precache & runtime caching |
| **Optional Adapters** | Firebase Auth, Firestore, FCM Push behind unified adapter interface |

---

## 🧪 Core Mechanics

### 1. Scoring & Streaks (`src/services/scoring.ts`)
- **Base XP**: Easy (+10 XP), Medium (+20 XP), Hard (+30 XP).
- **Streak Multiplier**:
  - `< 3 days`: `1.0x`
  - `3 - 6 days`: `1.2x`
  - `7 - 29 days`: `1.5x`
  - `30+ days`: `2.0x`
- **Perfect Day Bonus**: `+50 XP` when all habits in the day are completed with 0 misses.
- **Daily Points Cap**: `300 XP` to prevent gamification exploits.
- **Streak Freezes**: Earned every 7-day milestone, consumed automatically to safeguard your streak on missed days.
- **Level Titles**:
  - Level 1: *Lab Rookie* (0 - 99 XP)
  - Level 2: *Test Subject* (100 - 299 XP)
  - Level 3: *Mad Scientist* (300 - 699 XP)
  - Level 4: *Streak Wizard* (700 - 1499 XP)
  - Level 5: *Lab Legend* (1500+ XP)

### 2. Daily Check-in & Glowing Ring Timer
- Scheduled reminder alarm defaults to 9:00 PM.
- 15-minute glowing SVG ring timer shifts dynamically:
  - 🟢 **Neon Green** (> 5 min)
  - 🟡 **Amber Alert** (2 - 5 min)
  - 🔴 **Crimson Pulse** (< 2 min with mechanical tick audio)
- Large tap targets for **Done / Missed / Skipped-Rest**.
- Missed reason diagnostic chips (*Tired*, *Busy*, *Forgot*, *Sick*, *Not motivated*).
- Yesterday's grace period allowed until 12:00 PM noon today.
- Full-screen **Perfect Day Celebration** with confetti cannons, fanfare, and bonus XP animation.

### 3. The Reward Vault (`src/components/vault/`)
- Connect habit discipline to real emotional desires (e.g. Headphones, Coffee, Gaming session).
- **Pace Velocity Estimator**: Calculates your daily XP velocity and projects time to completion.
- Recommends 2-to-4 week milestones if goals are too far out (> 6 weeks).
- **3D Vault Opening Cinematic**: Rotating lock rings, light beam explosion, gold coin rain, and "Mark as bought 🎁" button that moves items to the permanent **Trophy Shelf**.

### 4. Competitive Weekly Leagues
- **Fair metric**: Ranked by true **Weekly Consistency %** (`done / scheduled * 100`), with points as secondary stat.
- **Monday 00:00 UTC Reset**: Leaderboard wipes clean every Monday so anyone can climb to the top.
- Interactive **Podium (1st, 2nd, 3rd)** with animated rising bars and falling crowns.
- Motivational catch-up nudges (*"You're 40 points behind Rahul (#2). Check in today to overtake!"*).
- Friendly cheers and nudges: Send 🔥 💪 👏 reactions with instant feedback.

---

## 🔒 Optional Firebase Adapter Layer

To activate cloud synchronization and real background push notifications:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your Firebase Web App configuration:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-app
   VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   VITE_FIREBASE_VAPID_KEY=BMx...
   ```
3. Deploy Firestore Security Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

*Security Architecture: Client devices can write habit schedules and daily check-in logs, but cannot tamper with their own points or league scores. All league consistency rankings and multiplier validation are enforced server-side.*

---

## ⚠️ Known Limitations & Device Notes
1. **iOS Push Notifications**: On iOS (16.4+), Apple strictly requires the PWA to be added to the Home Screen via Safari's "Add to Home Screen" before push notification permissions can be granted.
2. **True Background Push**: While the local Notification API provides instant scheduling and test triggers while the app is active, true device wake-up background push when the app is killed requires HTTPS and an active Firebase Cloud Messaging (FCM) credentials configuration.

---

## 🩺 Health Check Suite

Run the full production audit:
```bash
npm run healthcheck
```

Runs 9 automated verifications:
1. TypeScript strict typecheck
2. ESLint
3. Vitest unit tests (scoring, streaks, pace estimator, league ranking)
4. Production bundle build & chunk splitting
5. PWA manifest, service worker & icon validation
6. Mobile viewport, theme color & Lighthouse prerequisites
7. WCAG AA color contrast & Aria semantics
8. Runtime `/health` diagnostics dialog in settings
9. End-to-end integration smoke tests
