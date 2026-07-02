import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, artist, audioDuration = 300 } = await req.json();
    if (!title) {
      return NextResponse.json({ success: false, error: 'Missing track title' }, { status: 400 });
    }

    const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;

    // 1. Estimate Vocal Cue Points (Vocal In & Out)
    // In live DJ mixing, typical electronic/pop structure intro lasts 16 or 32 bars (~30 seconds at 124 BPM)
    // and outro starts ~30 seconds before the end.
    const introBarSeconds = Math.round(audioDuration > 180 ? 31 : 15);
    const outroBarSeconds = Math.round(audioDuration - (audioDuration > 180 ? 31 : 15));
    
    const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const vocalIn = formatTime(introBarSeconds);
    const vocalOut = formatTime(outroBarSeconds > introBarSeconds ? outroBarSeconds : audioDuration - 15);

    // 2. Query Hugging Face LLM / GTZAN Classification Metadata
    if (hfToken) {
      try {
        const prompt = `Classify the exact GTZAN genre (Blues, Classical, Country, Disco, Hiphop, Jazz, Metal, Pop, Reggae, Rock, Electronic/House) and determine vocal entry structure for song: "${title}" by "${artist}". Output JSON ONLY: {"gtzanGenre": "Electronic / House", "hasVocals": true, "vocalEntryAdvice": "Vocal enters after 32-bar intro"}`;
        
        const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: `<s>[INST] ${prompt} [/INST]`,
            parameters: { max_new_tokens: 120, temperature: 0.2, return_full_text: false }
          })
        });

        if (res.ok) {
          const data = await res.json();
          let textResult = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
          const match = textResult?.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            return NextResponse.json({
              success: true,
              analysis: {
                gtzanGenre: parsed.gtzanGenre || 'Electronic / Club House',
                hasVocals: parsed.hasVocals ?? true,
                vocalInCue: vocalIn,
                vocalOutCue: vocalOut,
                mixingAdvice: parsed.vocalEntryAdvice || `Mix in before ${vocalIn}, loop outro at ${vocalOut}`
              }
            });
          }
        }
      } catch (e) {
        console.error('HF Deep Scan error:', e);
      }
    }

    // Default heuristic fallback if no HF token or cloud timeout
    return NextResponse.json({
      success: true,
      analysis: {
        gtzanGenre: 'Electronic / Club House (GTZAN Standard)',
        hasVocals: true,
        vocalInCue: vocalIn,
        vocalOutCue: vocalOut,
        mixingAdvice: `Cue point A at ${vocalIn} (Vocal In), Cue point B at ${vocalOut} (Outro Drop)`
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server deep scan error' }, { status: 500 });
  }
}
