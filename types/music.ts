export type CamelotKey = 
  | '1A' | '1B' | '2A' | '2B' | '3A' | '3B' | '4A' | '4B' 
  | '5A' | '5B' | '6A' | '6B' | '7A' | '7B' | '8A' | '8B' 
  | '9A' | '9B' | '10A' | '10B' | '11A' | '11B' | '12A' | '12B';

export type ColorTag = 'RED' | 'BLUE' | 'GREEN' | 'MAGENTA' | 'ORANGE' | 'CYAN' | 'NONE';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre: string;
  duration: number; // in seconds
  bpm: number;
  key: CamelotKey;
  energy: number; // 1 to 10
  mood: string;
  popularity: number; // 0 to 100
  fileUrl?: string;
  fileSize?: number;
  isFavorite: boolean;
  rating: number; // 0 to 5
  colorTag?: ColorTag;
  playCount: number;
  createdAt: string;
  danceability?: number;
  beatgridOffsetMs?: number;
  phrases?: {
    introEnd?: string;
    dropStart?: string;
    breakdownStart?: string;
    outroStart?: string;
  };
}

export interface PlaylistTrack extends Track {
  position: number;
  transitionNotes?: string;
  harmonicCompatibility?: 'PERFECT' | 'ENERGY_BOOST' | 'KEY_SHIFT' | 'CLASH';
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  eventType?: string;
  targetDuration: number; // in minutes
  targetGenre?: string;
  targetMood?: string;
  isAiGenerated: boolean;
  aiPrompt?: string;
  tracks: PlaylistTrack[];
  createdAt: string;
}

export interface Gig {
  id: string;
  title: string;
  venue: string;
  date: string;
  playlistId?: string;
  playlistName?: string;
  crowdRating: number; // 1 to 5
  notes?: string;
  trackCount: number;
}

export interface AISetlistPrompt {
  eventType: string;
  durationMinutes: number;
  primaryGenre: string;
  targetAudienceAge: string;
  energyProgression: string;
  specialInstructions?: string;
  prioritizeViral?: boolean;
  customVenue?: string;
  targetTrackCount?: number;
}
