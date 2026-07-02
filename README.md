# Modern Audio Studio & DJ Setlist Copilot v2.4

A state-of-the-art AI-powered harmonic mixing suite and live performance copilot built for modern club DJs and sound engineers. Designed with a clean, distraction-free minimalist studio aesthetic, real-time Web Audio acoustic analysis, hardware MIDI controller integration, and dual-layer persistence (Supabase Cloud PostgreSQL & Local Server File Storage).

---

## Key Technical Features

### 1. AI Harmonic Core & Camelot Key Matrix
* **Automated Harmonic Sequencing:** Evaluates 12-Tone Camelot Key compatibility (`PERFECT`, `ENERGY_BOOST`, `KEY_SHIFT`, `CLASH`) and tempo phase matching.
* **LLM Studio Commentary:** Integrated with **Google Gemini 1.5 Flash** (`/api/ai/copilot`) to synthesize dynamic transition instructions (e.g., 32-bar loop phrasing, EQ frequency swaps, filter sweeps). Falls back gracefully to a heuristic acoustic rule engine when offline.

### 2. Live Stage Performance Booth Mode
* High-contrast dark performance screen engineered for dark DJ booth environments.
* **Stage Clocks & Elapsed Set Timers:** Real-time synchronized time displays.
* **Next Cue Advice Engine:** Continuously analyzes the master deck and calculates the highest-rated harmonic track match from your library with instant trigger loading.
* **Animated Spectrum Waveform:** HTML5 Canvas multi-bar visualizer displaying dynamic frequency envelopes.

### 3. Web Audio API Acoustic Scanner
* Upload real `.mp3` or `.wav` files directly into your browser.
* Uses native browser `AudioContext.decodeAudioData` to analyze waveform RMS energy and estimate acoustic tempo (BPM) and Camelot key profiles.

### 4. Pioneer rekordbox & Serato DJ Export & Color Coding
* **Industry Standard Color Tags:** Label tracks with Rekordbox color codes (`RED`, `BLUE`, `GREEN`, `MAGENTA`, `ORANGE`, `CYAN`).
* **Multi-Format Export:** Export setlists to M3U, CSV, TXT, or direct Pioneer **rekordbox XML** (`<DJ_PLAYLISTS>`) format.

### 5. Hardware DJ Controller Support (Web MIDI API)
* Native integration with USB MIDI hardware controllers (Pioneer DDJ, Traktor Kontrol, Novation Launchpad).
* Listeners intercept physical Note On/CC messages to trigger play/pause and instant next cue loading.

### 6. Bilingual Localization Engine
* Seamless live switching between **English (EN)** and **Bahasa Indonesia (ID)** with persistent state storage.

---

## Tech Stack & Architecture

* **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas API.
* **Backend API Routes:** Server-rendered REST endpoints (`/api/tracks`, `/api/playlists`, `/api/gigs`, `/api/ai/copilot`, `/api/reset`).
* **Persistence Engine:** Dual-Adapter Pattern supporting cloud PostgreSQL (`@supabase/supabase-js`) and local JSON server file persistence (`.data/database.json`).

---

## Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd DJ-Setlist-AI
npm install
```

### 2. Environment Setup (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Edit `.env.local` to add your Google Gemini API key or Supabase PostgreSQL database credentials:
```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
*(Note: If left blank, the suite runs smoothly using localized file storage and heuristic mixing rules).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## License
MIT License. Crafted for professional audio mixing and intelligent stage performance.
