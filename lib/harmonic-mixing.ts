import { CamelotKey, Track } from '@/types/music';

// Camelot Wheel numbers: 1 to 12, letters: A (Minor) or B (Major)
export function parseCamelot(key: CamelotKey): { number: number; letter: 'A' | 'B' } {
  const numStr = key.slice(0, -1);
  const letter = key.slice(-1) as 'A' | 'B';
  return { number: parseInt(numStr, 10), letter };
}

export function getCompatibleKeys(key: CamelotKey): CamelotKey[] {
  const parsed = parseCamelot(key);
  const nextNum = (parsed.number % 12) + 1;
  const prevNum = ((parsed.number - 2 + 12) % 12) + 1;
  const oppLetter = parsed.letter === 'A' ? 'B' : 'A';

  return [
    key, // exact match
    `${parsed.number}${oppLetter}` as CamelotKey, // relative major/minor
    `${nextNum}${parsed.letter}` as CamelotKey, // +1 step
    `${prevNum}${parsed.letter}` as CamelotKey // -1 step
  ];
}

export function checkHarmonicCompatibility(key1: CamelotKey, key2: CamelotKey): {
  type: 'PERFECT' | 'ENERGY_BOOST' | 'KEY_SHIFT' | 'CLASH';
  score: number; // 0 to 100
  reason: string;
} {
  if (key1 === key2) {
    return {
      type: 'PERFECT',
      score: 100,
      reason: `Exact harmonic lock (${key1} → ${key2}). Seamless transition.`
    };
  }

  const k1 = parseCamelot(key1);
  const k2 = parseCamelot(key2);

  // Relative Major / Minor (same number, opposite letter e.g., 8A <-> 8B)
  if (k1.number === k2.number && k1.letter !== k2.letter) {
    return {
      type: 'PERFECT',
      score: 95,
      reason: `Relative major/minor shift (${key1} → ${key2}). Smooth emotional mood change.`
    };
  }

  // Adjacent step on the wheel (+1 or -1 number, same letter e.g., 8A -> 9A or 7A)
  const diff = (k2.number - k1.number + 12) % 12;
  if (k1.letter === k2.letter && (diff === 1 || diff === 11)) {
    const direction = diff === 1 ? 'Energy boost step up (+1)' : 'Groove step down (-1)';
    return {
      type: 'PERFECT',
      score: 90,
      reason: `Adjacent Camelot step (${key1} → ${key2}). ${direction}.`
    };
  }

  // Energy boost modulation (+2 semitones = +2 on wheel or diagonal shift)
  if (k1.letter === k2.letter && diff === 2) {
    return {
      type: 'ENERGY_BOOST',
      score: 80,
      reason: `Energy Lift (+2 Camelot step ${key1} → ${key2}). Great for peak hour drive.`
    };
  }

  // Diagonal energy jump (e.g., 8A -> 9B)
  if (diff === 1 && k1.letter !== k2.letter) {
    return {
      type: 'KEY_SHIFT',
      score: 75,
      reason: `Dynamic key modulation (${key1} → ${key2}). Noticeable transition effect.`
    };
  }

  return {
    type: 'CLASH',
    score: 35,
    reason: `Harmonic clash (${key1} → ${key2}). Requires quick cut, drop mixing, or percussion loop intro.`
  };
}

export function recommendNextTracks(currentTrack: Track, allTracks: Track[], limit = 6): Track[] {
  const candidates = allTracks.filter(t => t.id !== currentTrack.id);

  const scored = candidates.map(candidate => {
    // 1. Harmonic score (0 to 100)
    const harmonic = checkHarmonicCompatibility(currentTrack.key, candidate.key);

    // 2. BPM score (0 to 100) based on percentage difference
    const bpmDiff = Math.abs(currentTrack.bpm - candidate.bpm);
    let bpmScore = 100;
    if (bpmDiff > 8) bpmScore = Math.max(10, 100 - bpmDiff * 10);
    else if (bpmDiff > 3) bpmScore = 85;
    else if (bpmDiff > 0) bpmScore = 95;

    // 3. Energy progression (prefer same or +1/-1 energy)
    const energyDiff = candidate.energy - currentTrack.energy;
    let energyScore = 80;
    if (energyDiff === 0 || energyDiff === 1) energyScore = 100;
    else if (energyDiff === -1) energyScore = 85;
    else if (energyDiff > 2) energyScore = 60; // too abrupt jump

    const totalScore = (harmonic.score * 0.5) + (bpmScore * 0.35) + (energyScore * 0.15);

    return {
      track: candidate,
      totalScore
    };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);
  return scored.slice(0, limit).map(item => item.track);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
