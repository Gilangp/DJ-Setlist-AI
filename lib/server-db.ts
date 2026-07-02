import { Track, Playlist, Gig } from '@/types/music';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS, INITIAL_GIGS } from './mock-data';
import { supabase } from './supabase';

interface DatabaseSchema {
  tracks: Track[];
  playlists: Playlist[];
  gigs: Gig[];
}

// In-memory runtime database so no local disk files are ever created or saved
const inMemoryDb: DatabaseSchema = {
  tracks: [...INITIAL_TRACKS],
  playlists: [...INITIAL_PLAYLISTS],
  gigs: [...INITIAL_GIGS]
};

export async function getServerTracks(): Promise<Track[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('tracks').select('*').order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) return data as Track[];
    } catch {}
  }
  return inMemoryDb.tracks;
}

export async function addServerTrack(track: Track): Promise<Track> {
  if (supabase) {
    try {
      await supabase.from('tracks').upsert(track);
    } catch {}
  }
  inMemoryDb.tracks = [track, ...inMemoryDb.tracks.filter(t => t.id !== track.id)];
  return track;
}

export async function deleteServerTrack(id: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('tracks').delete().eq('id', id);
    } catch {}
  }
  inMemoryDb.tracks = inMemoryDb.tracks.filter(t => t.id !== id);
  return true;
}

export async function getServerPlaylists(): Promise<Playlist[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('playlists').select('*').order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) return data as Playlist[];
    } catch {}
  }
  return inMemoryDb.playlists;
}

export async function addServerPlaylist(playlist: Playlist): Promise<Playlist> {
  if (supabase) {
    try {
      await supabase.from('playlists').upsert(playlist);
    } catch {}
  }
  inMemoryDb.playlists = [playlist, ...inMemoryDb.playlists.filter(p => p.id !== playlist.id)];
  return playlist;
}

export async function deleteServerPlaylist(id: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('playlists').delete().eq('id', id);
    } catch {}
  }
  inMemoryDb.playlists = inMemoryDb.playlists.filter(p => p.id !== id);
  return true;
}

export async function getServerGigs(): Promise<Gig[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('gigs').select('*').order('date', { ascending: false });
      if (!error && data && data.length > 0) return data as Gig[];
    } catch {}
  }
  return inMemoryDb.gigs;
}

export async function addServerGig(gig: Gig): Promise<Gig> {
  if (supabase) {
    try {
      await supabase.from('gigs').upsert(gig);
    } catch {}
  }
  inMemoryDb.gigs = [gig, ...inMemoryDb.gigs.filter(g => g.id !== gig.id)];
  return gig;
}
