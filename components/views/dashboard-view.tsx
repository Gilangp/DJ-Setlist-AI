"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenAiCopilot: () => void;
  onOpenHarmonicDeck: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAiCopilot,
  onOpenHarmonicDeck
}) => {
  const { tracks, playlists, gigs, setActiveTrack, setIsPlaying, t } = useAppStore();

  const avgBpm = tracks.length > 0
    ? Math.round(tracks.reduce((acc, t) => acc + t.bpm, 0) / tracks.length)
    : 0;

  const avgEnergy = tracks.length > 0
    ? (tracks.reduce((acc, t) => acc + t.energy, 0) / tracks.length).toFixed(1)
    : '0.0';

  const favoriteTracks = tracks.filter(t => t.isFavorite);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-24">
      
      {/* Sleek Hero Banner */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">
            {t.status_badge}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t.hero_title}
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.hero_desc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAiCopilot}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            {t.btn_hero_generate}
          </button>
          <button
            onClick={onOpenHarmonicDeck}
            className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-colors"
          >
            {t.btn_hero_wheel}
          </button>
        </div>
      </div>

      {/* Clean Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigate('library')}
          className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-colors cursor-pointer select-none"
        >
          <div className="text-xs font-medium text-zinc-400">{t.stat_library}</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{tracks.length}</span>
            <span className="text-xs text-zinc-500">{t.tracks_label}</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('copilot')}
          className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-colors cursor-pointer select-none"
        >
          <div className="text-xs font-medium text-zinc-400">{t.stat_setlists}</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{playlists.length}</span>
            <span className="text-xs text-zinc-500">{t.generated_label}</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="text-xs font-medium text-zinc-400">{t.stat_avg_bpm}</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{avgBpm}</span>
            <span className="text-xs text-zinc-500">{t.tempo_label}</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="text-xs font-medium text-zinc-400">{t.stat_avg_energy}</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{avgEnergy}</span>
            <span className="text-xs text-zinc-500">{t.scale_label}</span>
          </div>
        </div>

      </div>

      {/* Main Content Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Peak Club Bangers List */}
        <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">{t.peak_tracks_title}</h3>
              <p className="text-xs text-zinc-500">{t.peak_tracks_sub}</p>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {t.view_all}
            </button>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {favoriteTracks.slice(0, 6).map((track) => (
              <div
                key={track.id}
                onClick={() => {
                  setActiveTrack(track);
                  setIsPlaying(true);
                }}
                className="py-3 flex items-center justify-between hover:bg-zinc-800/30 px-2 rounded-lg transition-colors cursor-pointer select-none"
              >
                <div className="overflow-hidden pr-4">
                  <div className="text-sm font-medium text-white truncate">
                    {track.title}
                  </div>
                  <div className="text-xs text-zinc-400 truncate mt-0.5">
                    {track.artist}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {track.bpm} BPM
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                    {track.key}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    NRG {track.energy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Architecture Specifications */}
        <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-zinc-800/80 pb-3">
              <h3 className="text-sm font-semibold text-white">{t.engine_title}</h3>
              <p className="text-xs text-zinc-500">{t.engine_sub}</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-zinc-400">{t.mod_key}</span>
                <span className="text-zinc-200 font-medium font-mono">{t.mod_key_val}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-zinc-400">{t.mod_tempo}</span>
                <span className="text-zinc-200 font-medium font-mono">{t.mod_tempo_val}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-zinc-400">{t.mod_energy}</span>
                <span className="text-zinc-200 font-medium font-mono">{t.mod_energy_val}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-zinc-400">{t.mod_logs}</span>
                <span className="text-zinc-200 font-medium font-mono">{gigs.length} {t.mod_logs_val}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex justify-end">
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {t.view_logs}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
