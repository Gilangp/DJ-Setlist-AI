-- DJ Setlist AI Cloud PostgreSQL Schema (Supabase)

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL DEFAULT 'House',
  duration INTEGER NOT NULL DEFAULT 300,
  bpm INTEGER NOT NULL DEFAULT 124,
  key TEXT NOT NULL DEFAULT '8A',
  energy INTEGER NOT NULL DEFAULT 5,
  mood TEXT DEFAULT 'Club Groove',
  popularity INTEGER DEFAULT 80,
  "isFavorite" BOOLEAN DEFAULT false,
  rating INTEGER DEFAULT 4,
  "createdAt" TEXT NOT NULL,
  "playCount" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "eventType" TEXT,
  "targetDuration" INTEGER,
  "targetGenre" TEXT,
  "targetMood" TEXT,
  "isAiGenerated" BOOLEAN DEFAULT true,
  "aiPrompt" TEXT,
  "createdAt" TEXT NOT NULL,
  tracks JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS gigs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  venue TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "durationHours" INTEGER NOT NULL DEFAULT 2,
  "crowdSize" INTEGER DEFAULT 200,
  "crowdEnergy" INTEGER DEFAULT 8,
  notes TEXT,
  "linkedPlaylistId" TEXT,
  rating INTEGER DEFAULT 5
);
