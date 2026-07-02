import fs from 'fs/promises';
import path from 'path';
import { Track, Playlist, Gig } from '@/types/music';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS, INITIAL_GIGS } from './mock-data';
import { supabase } from './supabase';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  tracks: Track[];
  playlists: Playlist[];
  gigs: Gig[];
}

async function ensureDbExists(): Promise<DatabaseSchema> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      const content = await fs.readFile(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      const initialDb: DatabaseSchema = {
        tracks: INITIAL_TRACKS,
        playlists: INITIAL_PLAYLISTS,
        gigs: INITIAL_GIGS
      };
      await fs.writeFile(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
  } catch (e) {
    return {
      tracks: INITIAL_TRACKS,
      playlists: INITIAL_PLAYLISTS,
      gigs: INITIAL_GIGS
    };
  }
}

async function saveDb(db: DatabaseSchema): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save server DB:', e);
  }
}

export async function getServerTracks(): Promise<Track[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('tracks').select('*').order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) return data as Track[];
    } catch {}
  }
  const db = await ensureDbExists();
  return db.tracks;
}

export async function addServerTrack(track: Track): Promise<Track> {
  if (supabase) {
    try {
      await supabase.from('tracks').upsert(track);
    } catch {}
  }
  const db = await ensureDbExists();
  db.tracks = [track, ...db.tracks.filter(t => t.id !== track.id)];
  await saveDb(db);
  return track;
}

export async function deleteServerTrack(id: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('tracks').delete().eq('id', id);
    } catch {}
  }
  const db = await ensureDbExists();
  db.tracks = db.tracks.filter(t => t.id !== id);
  await saveDb(db);
  return true;
}

export async function getServerPlaylists(): Promise<Playlist[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('playlists').select('*').order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) return data as Playlist[];
    } catch {}
  }
  const db = await ensureDbExists();
  return db.playlists;
}

export async function addServerPlaylist(playlist: Playlist): Promise<Playlist> {
  if (supabase) {
    try {
      await supabase.from('playlists').upsert(playlist);
    } catch {}
  }
  const db = await ensureDbExists();
  db.playlists = [playlist, ...db.playlists.filter(p => p.id !== playlist.id)];
  await saveDb(db);
  return playlist;
}

export async function deleteServerPlaylist(id: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('playlists').delete().eq('id', id);
    } catch {}
  }
  const db = await ensureDbExists();
  db.playlists = db.playlists.filter(p => p.id !== id);
  await saveDb(db);
  return true;
}

export async function getServerGigs(): Promise<Gig[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('gigs').select('*').order('date', { ascending: false });
      if (!error && data && data.length > 0) return data as Gig[];
    } catch {}
  }
  const db = await ensureDbExists();
  return db.gigs;
}

export async function addServerGig(gig: Gig): Promise<Gig> {
  if (supabase) {
    try {
      await supabase.from('gigs').upsert(gig);
    } catch {}
  }
  const db = await ensureDbExists();
  db.gigs = [gig, ...db.gigs.filter(g => g.id !== gig.id)];
  await saveDb(db);
  return gig;
}
