import { NextResponse } from 'next/server';
import { CamelotKey } from '@/types/music';
import { performMirAnalysis } from '@/lib/mir-engine';

const CAMELOT_KEYS: CamelotKey[] = [
  '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B',
  '5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B',
  '9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B'
];

async function verifyWithGemini(title: string, artist: string): Promise<any | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `You are a professional musicologist and DJ studio database auditor.
Identify the official studio BPM, official Camelot Key (from 1A to 12B), primary sub-genre, and energy rating (1-10) for the following track:
Title: "${title}"
Artist: "${artist}"

Return ONLY valid JSON format:
{
  "bpm": 124,
  "key": "8A",
  "genre": "Melodic Techno",
  "energy": 7
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    return JSON.parse(rawText);
  } catch {
    return null;
  }
}

async function verifyWithHuggingFace(title: string, artist: string): Promise<any | null> {
  const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  if (!hfToken) return null;

  try {
    const prompt = `Identify official BPM, Camelot Key (1A-12B), Genre, and Energy (1-10) for song: "${title}" by "${artist}". Output JSON ONLY: {"bpm": 124, "key": "8A", "genre": "House", "energy": 7}`;
    
    const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: `<s>[INST] ${prompt} [/INST]`,
        parameters: { max_new_tokens: 150, temperature: 0.2, return_full_text: false }
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    let textResult = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    if (!textResult) return null;

    const match = textResult.match(/\{[\s\S]*\}/);
    if (match) textResult = match[0];
    return JSON.parse(textResult);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { title, artist } = await req.json();
    if (!title) {
      return NextResponse.json({ success: false, error: 'Missing track title' }, { status: 400 });
    }

    let result = await verifyWithGemini(title, artist || 'Unknown Artist');
    if (!result) {
      result = await verifyWithHuggingFace(title, artist || 'Unknown Artist');
    }

    const mirData = await performMirAnalysis(title, artist || 'Unknown Artist');

    if (result && result.bpm && result.key && CAMELOT_KEYS.includes(result.key)) {
      return NextResponse.json({ 
        success: true, 
        verified: {
          ...result,
          beatgridOffsetMs: mirData.beatgridOffsetMs,
          phrases: mirData.phrases,
          danceability: mirData.danceability
        } 
      });
    }

    // Fallback directly to MIR DSP bridge if cloud AI fails/unconfigured
    return NextResponse.json({ 
      success: true, 
      verified: {
        bpm: mirData.bpm,
        key: mirData.key,
        genre: mirData.genreTags[0] || 'Club House',
        energy: mirData.energy,
        beatgridOffsetMs: mirData.beatgridOffsetMs,
        phrases: mirData.phrases,
        danceability: mirData.danceability
      } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server verification error' }, { status: 500 });
  }
}
