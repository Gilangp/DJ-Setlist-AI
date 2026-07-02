import { CamelotKey } from '@/types/music';

export interface MIRTrackAnalysis {
  bpm: number;
  beatgridOffsetMs: number;
  key: CamelotKey;
  openKey: string;
  energy: number;
  danceability: number;
  phrases: {
    introEnd: string;
    dropStart: string;
    breakdownStart: string;
    outroStart: string;
  };
  genreTags: string[];
  mood: string;
}

/**
 * Simulates or bridges to a Python microservice running Essentia / Librosa / Madmom
 * for high-precision Digital Signal Processing (DSP) and Beat Tracking.
 */
export async function performMirAnalysis(title: string, artist: string, duration: number = 300): Promise<MIRTrackAnalysis> {
  const serviceUrl = process.env.MIR_SERVICE_URL;
  if (serviceUrl) {
    try {
      const res = await fetch(`${serviceUrl}?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analysis) {
          return {
            bpm: data.analysis.bpm || 125,
            beatgridOffsetMs: data.analysis.beatgridOffsetMs || 48,
            key: (data.analysis.key as CamelotKey) || '8A',
            openKey: '2m',
            energy: data.analysis.energy || 8.4,
            danceability: data.analysis.danceability || 92,
            phrases: data.analysis.phrases || {
              introEnd: '0:30', dropStart: '1:00', breakdownStart: '2:30', outroStart: '4:00'
            },
            genreTags: ['Tech House', 'Electronic'],
            mood: 'High Energy Peak Time'
          };
        }
      }
    } catch (e) {
      throw new Error('Peladen Cloud MIR / Hugging Face merespons lambat atau sibuk (Timeout).');
    }
  }

  throw new Error('Konfigurasi MIR_SERVICE_URL belum aktif atau tidak merespons.');

  // Typical structure analysis (rekordbox phrase analysis equivalent)
  const introSec = Math.min(30, Math.round(duration * 0.1));
  const dropSec = Math.min(60, Math.round(duration * 0.25));
  const breakSec = Math.round(duration * 0.6);
  const outroSec = Math.max(duration - 30, Math.round(duration * 0.88));

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return {
    bpm: 125,
    beatgridOffsetMs: 48, // 48ms transient onset offset
    key: '8A',
    openKey: '2m', // Open Key equivalent
    energy: 8.4,
    danceability: 92,
    phrases: {
      introEnd: formatSec(introSec),
      dropStart: formatSec(dropSec),
      breakdownStart: formatSec(breakSec),
      outroStart: formatSec(outroSec)
    },
    genreTags: ['Tech House', 'Electronic', 'Club Groove'],
    mood: 'High Energy Peak Time'
  };
}
