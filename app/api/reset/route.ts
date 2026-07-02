import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS, INITIAL_GIGS } from '@/lib/mock-data';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export async function POST() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const initialDb = {
      tracks: INITIAL_TRACKS,
      playlists: INITIAL_PLAYLISTS,
      gigs: INITIAL_GIGS
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to reset server DB' }, { status: 500 });
  }
}
