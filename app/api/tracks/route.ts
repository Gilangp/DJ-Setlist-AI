import { NextResponse } from 'next/server';
import { getServerTracks, addServerTrack, deleteServerTrack } from '@/lib/server-db';

export async function GET() {
  try {
    const tracks = await getServerTracks();
    return NextResponse.json({ success: true, tracks });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch tracks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.title || !body.artist) {
      return NextResponse.json({ success: false, error: 'Missing required track fields' }, { status: 400 });
    }

    const newTrack = {
      ...body,
      id: body.id || `t-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: body.createdAt || new Date().toISOString().split('T')[0],
      playCount: body.playCount || 0
    };

    const saved = await addServerTrack(newTrack);
    return NextResponse.json({ success: true, track: saved });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save track' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing track ID' }, { status: 400 });
    }

    await deleteServerTrack(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete track' }, { status: 500 });
  }
}
