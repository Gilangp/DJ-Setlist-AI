import { AISetlistPrompt, Playlist, PlaylistTrack, Track } from '@/types/music';
import { checkHarmonicCompatibility, recommendNextTracks } from './harmonic-mixing';

export async function generateAISetlist(
  prompt: AISetlistPrompt,
  library: Track[],
  customTitle?: string
): Promise<Playlist> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const targetTrackCount = prompt.targetTrackCount && prompt.targetTrackCount > 0 
    ? Number(prompt.targetTrackCount) 
    : Math.max(4, Math.round((prompt.durationMinutes * 60) / 330));
  const selectedTracks: PlaylistTrack[] = [];

  let candidates = [...library];

  if (prompt.prioritizeViral) {
    candidates.sort((a, b) => (b.popularity + b.rating * 10) - (a.popularity + a.rating * 10));
  }

  const genreMatch = candidates.filter(t => 
    t.genre.toLowerCase().includes(prompt.primaryGenre.toLowerCase()) ||
    t.mood.toLowerCase().includes(prompt.primaryGenre.toLowerCase())
  );
  if (genreMatch.length > 0) candidates = genreMatch;

  let startEnergyTarget = 5;
  if (prompt.energyProgression?.toLowerCase().includes('peak') || prompt.energyProgression?.toLowerCase().includes('octane')) startEnergyTarget = 8;
  if (prompt.energyProgression?.toLowerCase().includes('warmup') || prompt.energyProgression?.toLowerCase().includes('chill')) startEnergyTarget = 4;

  candidates.sort((a, b) => Math.abs(a.energy - startEnergyTarget) - Math.abs(b.energy - startEnergyTarget));
  let currentTrack = candidates[0] || library[0];

  selectedTracks.push({
    ...currentTrack,
    position: 1,
    transitionNotes: `STAGE CUE 1 (Intro ${prompt.prioritizeViral ? '[VIRAL OPENER]' : ''}): Establish ${prompt.eventType || 'Club'} vibe at ${currentTrack.bpm} BPM (Key ${currentTrack.key}). Master EQ flat, High-pass filter slightly open during intro bars.`,
    harmonicCompatibility: 'PERFECT'
  });

  const usedIds = new Set<string>([currentTrack.id]);

  const mixingTechniques = [
    'Loop 32-bar outro of outgoing track; cut Bass EQ on bar 16 while fading in incoming high frequencies.',
    'Harmonic Key Shift: Execute smooth filter sweep on transition phrase. Swap LOW EQ precisely on beat 1 of drop.',
    'BPM Phase Alignment: Sync pitch slider smoothly over 16 bars. Use light reverb tail on outgoing vocal.',
    'Energy Boost Transition: Slam transition on beat 1 or use 8-beat roll build-up for maximum crowd reaction.',
    'Smooth Blend: Keep mids balanced at 10 o\'clock during overlap. Let incoming bassline take over smoothly.'
  ];

  for (let i = 2; i <= targetTrackCount && usedIds.size < library.length; i++) {
    const progress = i / targetTrackCount;
    let targetEnergy = currentTrack.energy;
    if (prompt.energyProgression?.toLowerCase().includes('warmup')) {
      targetEnergy = Math.min(10, Math.round(4 + progress * 6));
    } else if (prompt.energyProgression?.toLowerCase().includes('sunset')) {
      targetEnergy = progress < 0.6 ? 6 : 8;
    } else if (prompt.energyProgression?.toLowerCase().includes('rollercoaster')) {
      targetEnergy = i % 2 === 0 ? 9 : 6;
    }

    const available = library.filter(t => !usedIds.has(t.id));
    let recommended = recommendNextTracks(currentTrack, available, available.length);

    if (prompt.prioritizeViral) {
      recommended.sort((a, b) => (b.popularity + b.rating * 10) - (a.popularity + a.rating * 10));
    }

    let chosen = recommended[0];
    for (const cand of recommended) {
      if (Math.abs(cand.energy - targetEnergy) <= 3) {
        chosen = cand;
        break;
      }
    }

    if (!chosen) break;

    const compat = checkHarmonicCompatibility(currentTrack.key, chosen.key);
    usedIds.add(chosen.id);

    const bpmChange = chosen.bpm - currentTrack.bpm;
    const bpmNote = bpmChange > 0 ? `+${bpmChange} BPM pitch acceleration` : bpmChange < 0 ? `${bpmChange} BPM groove decelerate` : 'Exact phase tempo lock';
    const techAdvice = mixingTechniques[(i - 2) % mixingTechniques.length];
    const viralBadge = (prompt.prioritizeViral && chosen.popularity >= 88) ? ' [HYPE VIRAL]' : '';

    selectedTracks.push({
      ...chosen,
      position: i,
      transitionNotes: `STAGE CUE ${i} [${compat.type} / ${bpmNote}${viralBadge}]: ${techAdvice} (${compat.reason}). Energy -> ${chosen.energy}/10.`,
      harmonicCompatibility: compat.type
    });

    currentTrack = chosen;
  }

  const playlistName = customTitle || `${prompt.eventType || 'Live Set'} - ${prompt.primaryGenre || 'Club'} Blueprint (${prompt.durationMinutes}m)`;

  return {
    id: `ai-${Date.now()}`,
    name: playlistName,
    description: `Professional Stage Blueprint optimized for ${prompt.eventType || 'Event'} (${prompt.targetAudienceAge || 'Crowd'}). Flow: ${prompt.energyProgression || 'Balanced'}. ${prompt.prioritizeViral ? 'Includes Viral Peak Bangers.' : ''}`,
    eventType: prompt.eventType,
    targetDuration: prompt.durationMinutes,
    targetGenre: prompt.primaryGenre,
    targetMood: prompt.energyProgression,
    isAiGenerated: true,
    aiPrompt: `Synthesized for ${prompt.eventType}, ${prompt.durationMinutes} mins, ${prompt.primaryGenre}, ${prompt.targetAudienceAge} crowd. Viral: ${Boolean(prompt.prioritizeViral)}`,
    createdAt: new Date().toISOString().split('T')[0],
    tracks: selectedTracks
  };
}
