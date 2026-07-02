"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Track, CamelotKey, ColorTag } from '@/types/music';

interface LibraryViewProps {
  onOpenUpload: () => void;
}

const colorMap: Record<string, string> = {
  RED: 'bg-rose-500/20 border-rose-500/50 text-rose-400',
  BLUE: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  GREEN: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
  MAGENTA: 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-400',
  ORANGE: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
  CYAN: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400',
  NONE: 'bg-zinc-800 border-zinc-700 text-zinc-400'
};

export const LibraryView: React.FC<LibraryViewProps> = ({ onOpenUpload }) => {
  const {
    tracks,
    activeTrack,
    setActiveTrack,
    setIsPlaying,
    toggleFavorite,
    rateTrack,
    deleteTrack,
    addTrack,
    t
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedKey, setSelectedKey] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [minEnergy, setMinEnergy] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);

  // New track form state
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newGenre, setNewGenre] = useState('House');
  const [newBpm, setNewBpm] = useState(124);
  const [newKey, setNewKey] = useState<CamelotKey>('8A');
  const [newEnergy, setNewEnergy] = useState(7);
  const [newColor, setNewColor] = useState<ColorTag>('BLUE');
  const [newMood, setNewMood] = useState('Energetic Club');

  const genres = ['All', ...Array.from(new Set(tracks.map(t => t.genre)))];
  const keys = ['All', '8A', '8B', '9A', '9B', '10A', '10B', '7A', '7B', '6A', '6B', '11A', '11B'];
  const colors = ['All', 'RED', 'BLUE', 'GREEN', 'MAGENTA', 'ORANGE', 'CYAN'];

  const filteredTracks = tracks.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.artist.toLowerCase().includes(search.toLowerCase()) ||
      t.genre.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || t.genre === selectedGenre;
    const matchesKey = selectedKey === 'All' || t.key === selectedKey;
    const matchesColor = selectedColor === 'All' || t.colorTag === selectedColor;
    const matchesEnergy = t.energy >= minEnergy;
    return matchesSearch && matchesGenre && matchesKey && matchesColor && matchesEnergy;
  });

  const handleCreateTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newArtist) return;
    addTrack({
      title: newTitle,
      artist: newArtist,
      genre: newGenre,
      duration: 320,
      bpm: Number(newBpm),
      key: newKey,
      energy: Number(newEnergy),
      mood: newMood,
      popularity: 85,
      isFavorite: false,
      rating: 4,
      colorTag: newColor
    });
    setShowAddForm(false);
    setNewTitle('');
    setNewArtist('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-24">
      
      {/* Search & Action Controls */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="text"
            placeholder={t.search_placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-md bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-medium"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
            >
              {t.btn_add_track}
            </button>
            <button
              onClick={onOpenUpload}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              {t.btn_import_audio}
            </button>
          </div>
        </div>

        {/* Minimal Filters */}
        <div className="pt-3 border-t border-zinc-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              {t.genre_label}
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              {t.key_label}
            </label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
            >
              {keys.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Rekordbox Color Tag
            </label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
            >
              {colors.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 mb-1">
              <span>{t.min_energy_label}</span>
              <span className="font-mono text-zinc-200">{minEnergy}+ / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={minEnergy}
              onChange={(e) => setMinEnergy(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-zinc-950 cursor-pointer h-1.5 rounded-lg mt-2"
            />
          </div>
        </div>
      </div>

      {/* Manual Track Form */}
      {showAddForm && (
        <form onSubmit={handleCreateTrack} className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">{t.manual_add_title}</h4>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-zinc-400 hover:text-white">{t.close_btn}</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Track Title *"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              required
              placeholder="Artist *"
              value={newArtist}
              onChange={e => setNewArtist(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Genre"
              value={newGenre}
              onChange={e => setNewGenre(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">BPM</label>
              <input
                type="number"
                value={newBpm}
                onChange={e => setNewBpm(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Key</label>
              <select
                value={newKey}
                onChange={e => setNewKey(e.target.value as CamelotKey)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              >
                {['8A', '8B', '9A', '9B', '10A', '10B', '7A', '7B', '6A', '6B', '11A', '11B'].map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Color Tag</label>
              <select
                value={newColor}
                onChange={e => setNewColor(e.target.value as ColorTag)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              >
                {['RED', 'BLUE', 'GREEN', 'MAGENTA', 'ORANGE', 'CYAN'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-1.5 text-xs font-semibold transition-colors"
              >
                {t.save_btn}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Minimalist Studio Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span>{t.tracks_label} ({filteredTracks.length})</span>
          <span>{t.click_to_preview}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/80 text-[11px] font-medium text-zinc-500 bg-zinc-950/40">
                <th className="py-2.5 px-5">Color</th>
                <th className="py-2.5 px-5">{t.col_title}</th>
                <th className="py-2.5 px-5">{t.col_artist}</th>
                <th className="py-2.5 px-5">{t.col_genre}</th>
                <th className="py-2.5 px-5 text-center font-mono">{t.col_bpm}</th>
                <th className="py-2.5 px-5 text-center font-mono">{t.col_key}</th>
                <th className="py-2.5 px-5 text-center font-mono">{t.col_energy}</th>
                <th className="py-2.5 px-5 text-center">{t.col_rating}</th>
                <th className="py-2.5 px-5 text-right">{t.col_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-xs">
              {filteredTracks.map((track) => {
                const isCurrent = activeTrack?.id === track.id;
                const tagClass = track.colorTag && colorMap[track.colorTag] ? colorMap[track.colorTag] : colorMap['NONE'];

                return (
                  <tr
                    key={track.id}
                    onClick={() => {
                      setActiveTrack(track);
                      setIsPlaying(true);
                    }}
                    className={`hover:bg-zinc-800/30 transition-colors cursor-pointer select-none ${
                      isCurrent ? 'bg-indigo-950/30 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-5 w-16">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${tagClass}`}>
                        {track.colorTag || 'NONE'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-white font-medium max-w-xs truncate">
                      {track.title}
                    </td>
                    <td className="py-3 px-5 text-zinc-400 max-w-xs truncate">
                      {track.artist}
                    </td>
                    <td className="py-3 px-5 text-zinc-400">
                      {track.genre}
                    </td>
                    <td className="py-3 px-5 text-center font-mono text-zinc-300">
                      {track.bpm}
                    </td>
                    <td className="py-3 px-5 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-indigo-300">
                        {track.key}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center font-mono text-zinc-300">
                      {track.energy}/10
                    </td>
                    <td className="py-3 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1 font-mono text-zinc-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => rateTrack(track.id, star)}
                            className={`cursor-pointer hover:text-white ${
                              star <= track.rating ? 'text-amber-400 font-bold' : ''
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => toggleFavorite(track.id)}
                          className={`text-xs hover:text-white transition-colors ${
                            track.isFavorite ? 'text-pink-500 font-semibold' : 'text-zinc-600'
                          }`}
                        >
                          {track.isFavorite ? '♥ Fav' : '♡'}
                        </button>
                        <button
                          onClick={() => deleteTrack(track.id)}
                          className="text-zinc-600 hover:text-rose-400 transition-colors"
                        >
                          {t.delete_btn}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
