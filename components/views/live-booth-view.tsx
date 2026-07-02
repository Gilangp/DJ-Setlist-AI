"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { getCompatibleKeys } from '@/lib/harmonic-mixing';
import { WaveformCanvas } from '@/components/waveform-canvas';

export const LiveBoothView: React.FC = () => {
  const { activeTrack, tracks, setActiveTrack, isPlaying, setIsPlaying, t } = useAppStore();
  const [currentTime, setCurrentTime] = useState<string>('00:00:00');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeTrack) {
    return (
      <div className="p-12 text-center text-zinc-500 font-mono">
        No track loaded on Master Deck. Select a track from the library.
      </div>
    );
  }

  // Calculate best harmonic next track
  const compatibleKeys = getCompatibleKeys(activeTrack.key);
  const candidates = tracks.filter(t => 
    t.id !== activeTrack.id && 
    compatibleKeys.includes(t.key) &&
    Math.abs(t.bpm - activeTrack.bpm) <= 5
  );

  const bestNextTrack = candidates.length > 0 
    ? candidates.reduce((prev, curr) => curr.energy > prev.energy ? curr : prev, candidates[0])
    : tracks.filter(t => t.id !== activeTrack.id)[0] || activeTrack;

  const handleCueNext = () => {
    if (bestNextTrack) {
      setActiveTrack(bestNextTrack);
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-[80vh] bg-black text-white p-6 sm:p-10 rounded-2xl border border-zinc-800 flex flex-col justify-between gap-8 font-mono animate-in fade-in">
      
      {/* Header Clocks */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
        <div>
          <div className="text-xs text-indigo-400 font-bold uppercase tracking-widest">
            {t.live_booth_title}
          </div>
          <div className="text-xs text-zinc-500 mt-1 font-sans">
            {t.live_booth_sub}
          </div>
        </div>

        <div className="flex items-center gap-6 text-right">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">{t.stage_clock}</div>
            <div className="text-xl sm:text-2xl font-black text-white">{currentTime}</div>
          </div>
          <div className="border-l border-zinc-800 pl-6">
            <div className="text-[10px] text-zinc-500 uppercase">{t.set_timer}</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-400">{formatElapsed(elapsedSeconds)}</div>
          </div>
        </div>
      </div>

      {/* Master Deck Display */}
      <div className="bg-zinc-950 p-8 rounded-xl border border-zinc-800/80 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="inline-block px-3 py-1 rounded bg-indigo-600 text-[11px] font-bold tracking-wider text-white">
              {t.now_playing}
            </div>
            <div className="text-3xl sm:text-5xl font-black tracking-tight font-sans text-white uppercase truncate">
              {activeTrack.title}
            </div>
            <div className="text-lg sm:text-2xl font-bold text-zinc-400 font-sans truncate">
              {activeTrack.artist} • <span className="text-zinc-500 text-base">{activeTrack.genre}</span>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-3 sm:gap-4">
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-lg text-center min-w-[80px]">
              <div className="text-[10px] text-zinc-500 uppercase">BPM</div>
              <div className="text-2xl font-black text-white">{activeTrack.bpm}</div>
            </div>
            <div className="bg-indigo-950 border border-indigo-500/50 px-4 py-3 rounded-lg text-center min-w-[80px]">
              <div className="text-[10px] text-indigo-300 uppercase">KEY</div>
              <div className="text-2xl font-black text-indigo-400">{activeTrack.key}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-lg text-center min-w-[80px]">
              <div className="text-[10px] text-zinc-500 uppercase">NRG</div>
              <div className="text-2xl font-black text-emerald-400">{activeTrack.energy}/10</div>
            </div>
          </div>
        </div>

        {/* Large Stage Animated Waveform */}
        <div className="pt-4 border-t border-zinc-900 flex items-center justify-center">
          <WaveformCanvas isPlaying={isPlaying} energy={activeTrack.energy} height={42} barCount={68} />
        </div>
      </div>

      {/* Next Recommended Harmonic Cue */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-8 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {t.next_cue_advice}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-sans uppercase">
            {bestNextTrack ? bestNextTrack.title : 'End of Library'}
          </div>
          <div className="text-sm font-medium text-zinc-400 font-sans">
            {bestNextTrack ? `${bestNextTrack.artist} • ${bestNextTrack.bpm} BPM • Key ${bestNextTrack.key} (Harmonic Match)` : ''}
          </div>
        </div>

        <button
          onClick={handleCueNext}
          className="w-full md:w-auto px-8 py-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base sm:text-lg tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] shrink-0 font-sans"
        >
          {t.trigger_next_cue}
        </button>
      </div>

    </div>
  );
};
