import { NextResponse } from 'next/server';
import { getServerPlaylists, addServerPlaylist, deleteServerPlaylist } from '@/lib/server-db';

export async function GET() {
  try {
    const playlists = await getServerPlaylists();
    return NextResponse.json({ success: true, playlists });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.name || !body.tracks) {
      return NextResponse.json({ success: false, error: 'Missing required playlist fields' }, { status: 400 });
    }

    const newPlaylist = {
      ...body,
      id: body.id || `pl-${Date.now()}`,
      createdAt: body.createdAt || new Date().toISOString().split('T')[0]
    };

    const saved = await addServerPlaylist(newPlaylist);
    return NextResponse.json({ success: true, playlist: saved });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save playlist' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing playlist ID' }, { status: 400 });
    }

    await deleteServerPlaylist(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete playlist' }, { status: 500 });
  }
}
