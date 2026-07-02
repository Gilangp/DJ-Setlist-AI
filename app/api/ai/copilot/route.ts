import { NextResponse } from 'next/server';
import { generateAISetlist } from '@/lib/ai-generator';
import { addServerPlaylist } from '@/lib/server-db';
import { Track, Playlist } from '@/types/music';

async function callGeminiSetlistGenerator(prompt: any, tracks: Track[]): Promise<Playlist | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const viralRule = prompt.prioritizeViral ? "PRIORITIZE HIGHLY POPULAR & VIRAL TRACKS (high popularity score >= 85 or 5 star ratings) for peak stage reaction." : "";
    const trackCountRule = prompt.targetTrackCount && prompt.targetTrackCount > 0 ? `YOU MUST SELECT EXACTLY ${prompt.targetTrackCount} TRACKS IN THE SETLIST.` : "";
    const systemPrompt = `You are a world-class DJ Copilot and acoustic mixing specialist. 
Given a list of available club tracks and an event criteria, select a sequence of tracks that follow harmonic mixing (Camelot Key) rules and the requested energy progression. ${viralRule} ${trackCountRule}
For each track, write detailed studio DJ mixing advice in the 'transitionNotes' field (e.g. EQ swap on bar 16, 32-bar loop phrasing, filter sweep). Do not use emojis anywhere.

Return ONLY valid JSON with this structure:
{
  "name": "Playlist Title",
  "description": "Short explanation of the harmonic flow",
  "tracks": [
    {
      "id": "track_id",
      "title": "Exact Title",
      "artist": "Exact Artist",
      "genre": "Genre",
      "duration": 300,
      "bpm": 124,
      "key": "8A",
      "energy": 7,
      "position": 1,
      "transitionNotes": "Detailed mixing note"
    }
  ]
}`;

    const userContent = `Event/Venue: ${prompt.eventType} (${prompt.durationMinutes}m). Target Genre/Vibe: ${prompt.primaryGenre}. Crowd Profile: ${prompt.targetAudienceAge}. Flow Curve: ${prompt.energyProgression}. Target Track Count: ${prompt.targetTrackCount || 'Auto'}. Special Instructions: ${prompt.specialInstructions || 'None'}. Prioritize Viral Hype: ${Boolean(prompt.prioritizeViral)}.
Available Tracks: ${JSON.stringify(tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist, bpm: t.bpm, key: t.key, energy: t.energy, popularity: t.popularity, rating: t.rating })))}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userContent}` }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    if (!parsed || !Array.isArray(parsed.tracks) || parsed.tracks.length === 0) return null;

    return {
      id: `ai-gemini-${Date.now()}`,
      name: parsed.name || `${prompt.eventType || 'Live'} Gemini Curated Set`,
      description: parsed.description || `Powered by Google Gemini 1.5 Flash AI Engine. ${prompt.prioritizeViral ? 'Includes Viral Bangers.' : ''}`,
      eventType: prompt.eventType,
      targetDuration: prompt.durationMinutes,
      targetGenre: prompt.primaryGenre,
      targetMood: prompt.energyProgression,
      isAiGenerated: true,
      aiPrompt: `Gemini 1.5 Flash synthesized for ${prompt.eventType}, ${prompt.primaryGenre}`,
      createdAt: new Date().toISOString().split('T')[0],
      tracks: parsed.tracks
    };
  } catch (err) {
    console.error('Gemini API execution error:', err);
    return null;
  }
}

async function callHuggingFaceSetlistGenerator(prompt: any, tracks: Track[]): Promise<Playlist | null> {
  const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  if (!hfToken) return null;

  try {
    const viralRule = prompt.prioritizeViral ? "Prioritize selecting hype viral tracks with popularity >= 85." : "";
    const trackCountRule = prompt.targetTrackCount && prompt.targetTrackCount > 0 ? `Select exactly ${prompt.targetTrackCount} tracks.` : "";
    const systemPrompt = `You are an expert club DJ. Create a JSON setlist adhering to Camelot harmonic mixing rules from the provided tracks. ${viralRule} ${trackCountRule} Do not use emojis. Output JSON ONLY. Format: {"name": "Title", "description": "Flow", "tracks": [{"id": "t-1", "title": "Song", "artist": "Artist", "genre": "House", "duration": 300, "bpm": 124, "key": "8A", "energy": 7, "position": 1, "transitionNotes": "Cut bass at bar 16"}]}`;
    const userContent = `Event: ${prompt.eventType}. Target Track Count: ${prompt.targetTrackCount || 'Auto'}. Genre: ${prompt.primaryGenre}. Flow: ${prompt.energyProgression}. Available Tracks: ${JSON.stringify(tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist, bpm: t.bpm, key: t.key, energy: t.energy, popularity: t.popularity })))}`;

    const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: `<s>[INST] ${systemPrompt}\n\n${userContent} [/INST]`,
        parameters: { max_new_tokens: 1200, temperature: 0.6, return_full_text: false }
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    let textResult = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    if (!textResult) return null;

    const jsonMatch = textResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) textResult = jsonMatch[0];

    const parsed = JSON.parse(textResult);
    if (!parsed || !Array.isArray(parsed.tracks) || parsed.tracks.length === 0) return null;

    return {
      id: `ai-hf-${Date.now()}`,
      name: parsed.name || `${prompt.eventType || 'Live'} HuggingFace Curated Set`,
      description: parsed.description || `Powered by Hugging Face Open-Source Mistral AI Engine.`,
      eventType: prompt.eventType,
      targetDuration: prompt.durationMinutes,
      targetGenre: prompt.primaryGenre,
      targetMood: prompt.energyProgression,
      isAiGenerated: true,
      aiPrompt: `Hugging Face Mistral synthesized for ${prompt.eventType}`,
      createdAt: new Date().toISOString().split('T')[0],
      tracks: parsed.tracks
    };
  } catch (err) {
    console.error('Hugging Face API execution error:', err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, tracks } = await req.json();
    if (!prompt || !tracks || !Array.isArray(tracks)) {
      return NextResponse.json({ success: false, error: 'Invalid prompt or tracks payload' }, { status: 400 });
    }

    let generatedPlaylist = await callGeminiSetlistGenerator(prompt, tracks);

    if (!generatedPlaylist) {
      generatedPlaylist = await callHuggingFaceSetlistGenerator(prompt, tracks);
    }

    if (!generatedPlaylist) {
      generatedPlaylist = await generateAISetlist(prompt, tracks);
    }

    const saved = await addServerPlaylist(generatedPlaylist);

    return NextResponse.json({ success: true, playlist: saved });
  } catch (error) {
    console.error('Server AI Copilot error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate AI setlist on server' }, { status: 500 });
  }
}
