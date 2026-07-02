---
title: DJ Setlist AI MIR Engine
emoji: 🎧
colorFrom: purple
colorTo: indigo
sdk: docker
pinned: false
---

# DJ Setlist AI — Professional MIR DSP Microservice

This microservice provides high-precision Digital Signal Processing (DSP) aligned with Serato/rekordbox architectures using **Librosa** and **FastAPI**.

## Features
- **BPM & Beat Tracking**: Exact beat tracking via `librosa.beat.beat_track`.
- **Beatgrid Onset**: Downbeat transient detection via `librosa.onset.onset_detect`.
- **Harmonic Key Estimation**: Chromagram HPCP pitch profile mapping to the DJ Camelot Wheel (`1A` to `12B`).
- **Phrase Analysis**: Identifies Intro, Drop, Breakdown, and Outro cue timestamps.

## How to Deploy to Hugging Face Spaces
1. Create a new Space on [Hugging Face Spaces](https://huggingface.co/spaces).
2. Select **Docker** as the Space SDK (Blank Docker template).
3. Upload all files inside this `python_mir_service` folder (`app.py`, `requirements.txt`, `Dockerfile`, `README.md`) directly into your Hugging Face Space repository.
4. Your Space will build automatically on port `7860`.
5. Once running, copy your Space API URL (e.g., `https://your-username-dj-setlist-mir.hf.space/analyze`) and set it in your Next.js application `.env` file:
   ```env
   MIR_SERVICE_URL=https://your-username-dj-setlist-mir.hf.space/analyze
   ```
