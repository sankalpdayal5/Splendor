# 💎 Splendor — Digital Gem Strategy Board Game

![React 19](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?style=flat-square&logo=socket.io)
![Vite](https://img.shields.io/badge/Vite-6.1-purple?style=flat-square&logo=vite)
![Android APK](https://img.shields.io/badge/Android-APK%20v1.0.0-green?style=flat-square&logo=android)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

An ultra-modern, full-stack digital implementation of the award-winning strategy board game **Splendor**. Built with **React 19**, **TypeScript**, **Socket.io**, **Web Audio API**, **CSS 3D Glassmorphic Visuals**, and an offline **ISMCTS AI Strategy Coach**. 

Supports **Offline Play** (vs AI Bots & Pass-and-Play), **Real-Time Online Multiplayer** (Room Codes), **PWA Standalone App Mode**, and **Native Android APK**.

---

## 🌟 Key Features

### 🎮 Game Modes
- **Offline vs AI Bots**: Play against single-player bots with 3 difficulty tiers (**Easy**, **Medium**, **Hard**).
- **Offline Pass & Play**: Local multiplayer for 2 to 4 human players on a single device screen.
- **Online Real-Time Multiplayer**: Create or join 6-character room codes (`CREATE_ROOM`, `JOIN_ROOM`) powered by Socket.io with server-side state projections.

### 🧠 World-Class Local AI Strategy Coach (Learn Mode)
- **Information Set Monte Carlo Tree Search (ISMCTS)**: Executes 150–250 game rollouts per candidate move in $<15\text{ms}$ to evaluate true **Win Expectancy Percentages ($\text{EV}_{\text{win}}\%$)**.
- **Ranked Move Recommendations**: Ranks top 3 candidate moves on your turn:
  - `🏆 #1 TOP CHOICE` (Gold Badge)
  - `🥈 #2 STRONG ALTERNATIVE` (Emerald Badge)
  - `🥉 #3 TACTICAL MOVE` (Sapphire Badge)
- **Multi-Turn Strategy Path Explorer**: Interactive 3-step projected masterplan roadmap showing Turn +1, Turn +2, Turn +3 outcomes.
- **Dynamic Board Overlays**: Glowing rank chips on market cards and `💡 REC` indicators on recommended gem bank stacks.
- **Predictive Opponent Blocking**: Scans opponent inventories to detect key card targets and boosts hate-reserving / gem-blocking scores.

### 🎨 Visual & Tactile Experience
- **Obsidian Dark Theme & Glassmorphism**: High-contrast `#0B0E14` palette with glowing gem borders, CSS 3D card tilt/flip perspectives, and smooth state transitions.
- **Web Audio API Sound Synthesizer**: Zero-asset procedural audio feedback for gem picks, card buys, noble fanfares, and victory chords.
- **Visual Accessibility**: Colorblind pattern overlays (`colorblindMode`) adding unique geometric icons (`◆`, `●`, `■`, `▲`, `⬢`, `★`) to cards and tokens.
- **ARIA Speech Announcer**: Screen reader accessibility using debounced live regions (`aria-live="polite"`).

### 📱 Cross-Platform & Mobile Native Support
- **Android Native APK**: Bundled with **Capacitor** into a native 4.1 MB `.apk` package.
- **Progressive Web App (PWA)**: Includes `manifest.json` for full-screen **Add to Home Screen** installation on Android and iPhone (iOS).
- **Ultra-Lean Docker Image**: Standalone esbuild server bundle under 65 MB.

---

## 📦 Direct Downloads

- 🤖 **[Download Android APK (splendor-v1.0.0.apk)](https://github.com/sankalpdayal5/Splendor/releases/download/v1.0.0/splendor-v1.0.0.apk)**
- 🏷️ **[View GitHub Release v1.0.0](https://github.com/sankalpdayal5/Splendor/releases/tag/v1.0.0)**

---

## 🛠️ Architecture & Tech Stack

```
Splendor Monorepo Architecture
├── src/                      # Frontend Single Page Application (Vite + React 19)
│   ├── engine/               # Pure Functional State Machine & AI
│   │   ├── types.ts          # Nominal Branded Types & Action Unions
│   │   ├── cardsData.ts      # Official 90 Development Cards Dataset
│   │   ├── noblesData.ts     # Official 10 Noble Tiles Dataset
│   │   ├── gameEngine.ts     # Pure Rule Evaluator & Move Validator
│   │   ├── aiEngine.ts       # Bot Decision Engine & Multi-Vector Scorer
│   │   └── ismctsEngine.ts   # Local 3-Turn ISMCTS Lookahead Simulator
│   ├── components/           # React 19 UI Components
│   │   ├── GameBoard.tsx     # Main Game Layout
│   │   ├── LearnModeCoach.tsx# AI Strategy Coach Widget
│   │   ├── CardComponent.tsx # 3D Tier Development Card Component
│   │   ├── GemBank.tsx       # Gem Token Supply Stacks
│   │   ├── PlayerPanel.tsx   # Player HUD & Resource Matrix
│   │   ├── BuyModal.tsx      # Purchase Confirmation & Token Breakdown
│   │   ├── ReserveModal.tsx  # Reserve Confirmation Modal
│   │   ├── OwnedCardsModal.tsx# Player Card Collection Explorer
│   │   └── ...               # Action, Lobby, Rulebook, Victory Modals
│   ├── services/             # Socket.io Client Wrapper
│   ├── utils/                # Web Audio API Synth & ARIA Announcer
│   └── styles/index.css      # Master Obsidian Glassmorphic CSS Engine
├── server/                   # Backend Real-Time Server
│   ├── server.ts             # Express + Socket.io Room State Manager
│   └── health.ts             # Telemetry & Health Endpoint Handlers
├── android/                  # Native Android Capacitor Project (Gradle)
├── Dockerfile                # Multi-stage Standalone Docker Build (<65MB)
└── docker-compose.yml        # Compose Stack Runner
```

---

## 📖 Official Rules Summary

1. **Setup**:
   - 2 Players = 4 tokens per gem color | 3 Players = 5 tokens | 4 Players = 7 tokens.
   - Always 5 Gold tokens. $(P + 1)$ Nobles drawn face-up.
2. **On Your Turn (Choose 1 Action)**:
   - **Take 3 Distinct Gems**: Select 3 different gem colors from bank (if supply $> 0$).
   - **Take 2 Same Gems**: Select 2 tokens of the same color (only if bank has $\ge 4$ of that color).
   - **Reserve 1 Card**: Take 1 face-up or top deck card into your hand (max 3 reserved) + receive +1 Gold token (if available).
   - **Buy 1 Card**: Spend gem tokens matching card cost minus permanent card discount bonuses in your collection.
3. **Holding Limits & Noble Visits**:
   - Max 10 gem tokens at turn end (must discard overflow tokens).
   - Nobles automatically visit at turn end when your permanent card bonuses meet their requirements (+3 Prestige Points).
4. **Victory Trigger & Tie-Breaker**:
   - Reaching 15 Prestige Points triggers the final round (all players get equal turns).
   - Tie-breaker: Player with the **fewest development cards purchased** wins!

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or higher
- **npm**: v10 or higher

### Installation & Local Run

1. **Clone Repository**:
   ```bash
   git clone https://github.com/sankalpdayal5/Splendor.git
   cd Splendor
   ```

2. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start Development Environment**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser to play!

4. **Run Vitest Unit Suite**:
   ```bash
   npm run test
   ```

5. **Build Client Production SPA**:
   ```bash
   npm run build:client
   ```

---

## 🐳 Docker Deployment

To build and run the ultra-lean standalone production container (< 65 MB):

```bash
docker-compose up --build
```
Access the production application at `http://localhost:3000`.

---

## 📱 Mobile Installation Guide

### Android Phone Installation (2 Ways):

#### Method 1: Install APK Package (Recommended)
1. Download **[`splendor-v1.0.0.apk`](https://github.com/sankalpdayal5/Splendor/releases/download/v1.0.0/splendor-v1.0.0.apk)** directly onto your phone.
2. Tap the downloaded `.apk` file and select **Install**.

#### Method 2: PWA Add to Home Screen
1. Open Chrome on your Android phone and visit `http://<YOUR-IP>:5173/`.
2. Tap **Install app** or **Add to Home screen**.

### iPhone (iOS) Installation:
1. Open Safari on your iPhone and visit your game URL.
2. Tap the **Share button** (square with up arrow).
3. Scroll down and tap **Add to Home Screen**.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
