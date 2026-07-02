import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob;
    const title = formData.get('title') as string || 'Unknown Title';
    const artist = formData.get('artist') as string || 'Unknown Artist';

    if (!file) {
      return NextResponse.json({ success: false, error: 'File audio tidak ditemukan' }, { status: 400 });
    }

    const mirUrl = process.env.MIR_SERVICE_URL || 'https://gilangppp-dj-setlist-mir-engine.hf.space/analyze';

    // Forward binary blob to Python Essentia/Madmom microservice
    const mirFormData = new FormData();
    mirFormData.append('file', file, title);

    const res = await fetch(mirUrl, {
      method: 'POST',
      body: mirFormData,
      signal: AbortSignal.timeout(180000)
    });

    if (!res.ok) {
      throw new Error(`Cloud MIR Engine returned status ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.analysis) {
      return NextResponse.json({
        success: true,
        verified: {
          title,
          artist,
          bpm: data.analysis.bpm,
          key: data.analysis.key,
          energy: data.analysis.energy,
          beatgridOffsetMs: data.analysis.beatgridOffsetMs,
          phrases: data.analysis.phrases,
          danceability: data.analysis.danceability
        }
      });
    }

    throw new Error('Analisis audio gagal diproses oleh MIR Engine.');
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message || 'Koneksi ke MIR Engine gagal atau timeout'
    }, { status: 500 });
  }
}
