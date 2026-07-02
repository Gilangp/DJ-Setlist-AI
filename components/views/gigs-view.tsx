"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';

export const GigsView: React.FC = () => {
  const { gigs, addGig, playlists } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [crowdRating, setCrowdRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');

  const handleCreateGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !venue) return;

    const matchedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

    addGig({
      title,
      venue,
      date,
      crowdRating,
      notes,
      playlistId: matchedPlaylist?.id,
      playlistName: matchedPlaylist?.name,
      trackCount: matchedPlaylist?.tracks.length || 12
    });

    setShowAddModal(false);
    setTitle('');
    setVenue('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-24">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-white">Gig Logs & Performance History</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Track venue feedback and link setlists to tune your AI recommendations over time.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors"
        >
          Log New Gig
        </button>
      </div>

      {showAddModal && (
        <form onSubmit={handleCreateGig} className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Record Performance Log</h3>
            <button type="button" onClick={() => setShowAddModal(false)} className="text-xs text-zinc-400 hover:text-white">Close</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Event Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Sunset Beach Club Opening"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Venue Location *</label>
              <input
                type="text"
                required
                placeholder="e.g., Savaya Uluwatu Bali"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Crowd Response</label>
              <select
                value={crowdRating}
                onChange={e => setCrowdRating(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value={5}>5/5 - Legendary Peak Crowd</option>
                <option value={4}>4/5 - High Energy & Engaged</option>
                <option value={3}>3/5 - Steady & Maintain</option>
                <option value={2}>2/5 - Tough Crowd</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Linked AI Setlist</label>
              <select
                value={selectedPlaylistId}
                onChange={e => setSelectedPlaylistId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="">None (Freestyle Set)</option>
                {playlists.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Post-Gig Notes</label>
            <textarea
              rows={2}
              placeholder="How did transitions and tempos perform?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-500 font-mono"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              Save Gig Log
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-zinc-800/60 bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
        {gigs.map((gig) => (
          <div
            key={gig.id}
            className="p-5 hover:bg-zinc-800/30 transition-colors space-y-2.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 mb-0.5">
                  <span>{gig.date}</span>
                  {gig.playlistName && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-400 font-medium">{gig.playlistName}</span>
                    </>
                  )}
                </div>
                <h3 className="text-base font-semibold text-white">{gig.title}</h3>
                <p className="text-xs text-zinc-400">{gig.venue}</p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400 font-semibold">
                  Rating {gig.crowdRating}.0 / 5
                </span>
              </div>
            </div>

            {gig.notes && (
              <div className="bg-zinc-950/60 rounded-lg p-3 border border-zinc-800/40 text-xs text-zinc-300 font-mono">
                {gig.notes}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
