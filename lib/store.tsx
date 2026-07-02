"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Track, Playlist, Gig } from '@/types/music';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS, INITIAL_GIGS } from './mock-data';
import { Language, translations } from './i18n';

interface AppContextType {
  tracks: Track[];
  playlists: Playlist[];
  gigs: Gig[];
  activeTrack: Track | null;
  isPlaying: boolean;
  searchQuery: string;
  selectedGenre: string;
  selectedKey: string;
  minEnergy: number;
  language: Language;
  t: typeof translations.en;
  setLanguage: (lang: Language) => void;
  addTrack: (track: Omit<Track, 'id' | 'createdAt' | 'playCount'>) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  rateTrack: (id: string, rating: number) => void;
  addPlaylist: (playlist: Playlist) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addGig: (gig: Omit<Gig, 'id'>) => Promise<void>;
  setActiveTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedKey: (key: string) => void;
  setMinEnergy: (energy: number) => void;
  resetToDefaultData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [gigs, setGigs] = useState<Gig[]>(INITIAL_GIGS);
  const [activeTrack, setActiveTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [language, setLanguageState] = useState<Language>('id');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedKey, setSelectedKey] = useState<string>('All');
  const [minEnergy, setMinEnergy] = useState<number>(1);

  // Dynamic Server Fetch on startup
  useEffect(() => {
    const savedLang = localStorage.getItem('dj_language_v1') as Language;
    if (savedLang === 'en' || savedLang === 'id') {
      setLanguageState(savedLang);
    }

    async function loadServerData() {
      try {
        const [resTracks, resPlaylists, resGigs] = await Promise.all([
          fetch('/api/tracks').then(r => r.json()).catch(() => null),
          fetch('/api/playlists').then(r => r.json()).catch(() => null),
          fetch('/api/gigs').then(r => r.json()).catch(() => null)
        ]);

        if (resTracks?.success && Array.isArray(resTracks.tracks)) {
          setTracks(resTracks.tracks);
          if (resTracks.tracks.length > 0) {
            setActiveTrack(resTracks.tracks[0]);
          }
        }
        if (resPlaylists?.success && Array.isArray(resPlaylists.playlists)) {
          setPlaylists(resPlaylists.playlists);
        }
        if (resGigs?.success && Array.isArray(resGigs.gigs)) {
          setGigs(resGigs.gigs);
        }
      } catch (e) {
        console.error('Failed dynamic fetch:', e);
      }
    }

    loadServerData();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dj_language_v1', lang);
  };

  const addTrack = async (newTrackData: Omit<Track, 'id' | 'createdAt' | 'playCount'>) => {
    const newTrack: Track = {
      ...newTrackData,
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString().split('T')[0],
      playCount: 0
    };
    setTracks(prev => [newTrack, ...prev]);

    // Dynamic Server Sync
    try {
      await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrack)
      });
    } catch (e) {
      console.error('Failed to sync track:', e);
    }
  };

  const deleteTrack = async (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`/api/tracks?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete track:', e);
    }
  };

  const toggleFavorite = (id: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const rateTrack = (id: string, rating: number) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, rating } : t));
  };

  const addPlaylist = async (playlist: Playlist) => {
    setPlaylists(prev => [playlist, ...prev]);
    try {
      await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playlist)
      });
    } catch (e) {
      console.error('Failed to sync playlist:', e);
    }
  };

  const deletePlaylist = async (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    try {
      await fetch(`/api/playlists?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete playlist:', e);
    }
  };

  const addGig = async (newGigData: Omit<Gig, 'id'>) => {
    const newGig: Gig = {
      ...newGigData,
      id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    setGigs(prev => [newGig, ...prev]);
    try {
      await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGig)
      });
    } catch (e) {
      console.error('Failed to sync gig:', e);
    }
  };

  const resetToDefaultData = async () => {
    setTracks(INITIAL_TRACKS);
    setPlaylists(INITIAL_PLAYLISTS);
    setGigs(INITIAL_GIGS);
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch {}
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        tracks,
        playlists,
        gigs,
        activeTrack,
        isPlaying,
        searchQuery,
        selectedGenre,
        selectedKey,
        minEnergy,
        language,
        t,
        setLanguage,
        addTrack,
        deleteTrack,
        toggleFavorite,
        rateTrack,
        addPlaylist,
        deletePlaylist,
        addGig,
        setActiveTrack,
        setIsPlaying,
        setSearchQuery,
        setSelectedGenre,
        setSelectedKey,
        setMinEnergy,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within an AppProvider');
  return context;
};
