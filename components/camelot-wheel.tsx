"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { CamelotKey, Track } from '@/types/music';
import { checkHarmonicCompatibility, recommendNextTracks } from '@/lib/harmonic-mixing';

interface CamelotWheelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CamelotWheelModal: React.FC<CamelotWheelProps> = ({ isOpen, onClose }) => {
  const { activeTrack, tracks, setActiveTrack, setIsPlaying } = useAppStore();
  const [selectedKey, setSelectedKey] = useState<CamelotKey>(activeTrack ? activeTrack.key : '8A');

  if (!isOpen) return null;

  const camelotNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const referenceTrack: Track = activeTrack || {
    id: 'ref',
    title: 'Reference Track',
    artist: 'DJ Reference',
    genre: 'House',
    duration: 300,
    bpm: 124,
    key: selectedKey,
    energy: 7,
    mood: 'Peak',
    popularity: 80,
    isFavorite: false,
    rating: 5,
    playCount: 0,
    createdAt: '2026-01-01'
  };

  const compatibleTracks = recommendNextTracks(
    { ...referenceTrack, key: selectedKey },
    tracks,
    8
  );

  const getKeyColorClass = (key: CamelotKey) => {
    if (key === selectedKey) {
      return 'bg-indigo-600 text-white font-bold border-2 border-white scale-105 shadow-md z-10';
    }
    const compat = checkHarmonicCompatibility(selectedKey, key);
    if (compat.type === 'PERFECT') {
      return 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-medium hover:bg-emerald-900/40';
    }
    if (compat.type === 'ENERGY_BOOST') {
      return 'bg-amber-950/60 border-amber-500/50 text-amber-300 font-medium hover:bg-amber-900/40';
    }
    if (compat.type === 'KEY_SHIFT') {
      return 'bg-pink-950/60 border-pink-500/50 text-pink-300 hover:bg-pink-900/40';
    }
    return 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 opacity-60';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Camelot Harmonic Wheel</h3>
            <p className="text-xs text-zinc-400">Click any key to preview harmonic mixing compatibility and matching tracks</p>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800"
          >
            Close
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          
          <div className="lg:col-span-7 space-y-5">
            
            <div className="flex flex-wrap items-center gap-4 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Selected Key
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Perfect Flow (+/-1, Rel)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Energy Surge (+2)
              </span>
            </div>

            <div>
              <span className="font-semibold text-zinc-400 mb-2 block">
                Outer Ring: Major Keys (B Ring)
              </span>
              <div className="grid grid-cols-6 gap-2">
                {camelotNumbers.map(num => {
                  const key = `${num}B` as CamelotKey;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedKey(key)}
                      className={`py-2.5 rounded-lg border transition-all text-center font-mono ${getKeyColorClass(key)}`}
                    >
                      <div className="text-sm">{key}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="font-semibold text-zinc-400 mb-2 block">
                Inner Ring: Minor Keys (A Ring)
              </span>
              <div className="grid grid-cols-6 gap-2">
                {camelotNumbers.map(num => {
                  const key = `${num}A` as CamelotKey;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedKey(key)}
                      className={`py-2.5 rounded-lg border transition-all text-center font-mono ${getKeyColorClass(key)}`}
                    >
                      <div className="text-sm">{key}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeTrack && (
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-zinc-500">Current Track</div>
                  <div className="font-semibold text-white mt-0.5">{activeTrack.title}</div>
                </div>
                <button
                  onClick={() => setSelectedKey(activeTrack.key)}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
                >
                  Snap to ({activeTrack.key})
                </button>
              </div>
            )}

          </div>

          <div className="lg:col-span-5 flex flex-col bg-zinc-950 rounded-lg border border-zinc-800 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 font-semibold text-zinc-300">
              <span>Compatible Next Tracks</span>
              <span className="font-mono text-zinc-500">{compatibleTracks.length}</span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {compatibleTracks.map(track => {
                const compat = checkHarmonicCompatibility(selectedKey, track.key);
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      setActiveTrack(track);
                      setIsPlaying(true);
                    }}
                    className="p-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2 mb-1 font-mono text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300">
                          {track.key}
                        </span>
                        <span className="text-zinc-500">{track.bpm} BPM</span>
                      </div>
                      <div className="font-medium text-white truncate">
                        {track.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {track.artist}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
