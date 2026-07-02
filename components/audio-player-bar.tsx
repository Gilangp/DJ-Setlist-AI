"use client";

import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDuration } from '@/lib/harmonic-mixing';
import { WaveformCanvas } from './waveform-canvas';
import { midiController } from '@/lib/midi';

interface AudioPlayerBarProps {
  onOpenHarmonicDeck: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ onOpenHarmonicDeck }) => {
  const { activeTrack, isPlaying, setIsPlaying, tracks, setActiveTrack, t } = useAppStore();
  const [midiDevice, setMidiDevice] = useState<string | null>(null);

  useEffect(() => {
    midiController.init();

    const handleStatus = (name: string | null) => {
      setMidiDevice(name);
    };

    const handleCommand = (cmd: string) => {
      if (cmd === 'PLAY_PAUSE') {
        setIsPlaying(!isPlaying);
      } else if (cmd === 'NEXT_TRACK' || cmd === 'CUE_NEXT') {
        if (activeTrack) {
          const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
          const nextIndex = (currentIndex + 1) % tracks.length;
          setActiveTrack(tracks[nextIndex]);
          setIsPlaying(true);
        }
      } else if (cmd === 'PREV_TRACK') {
        if (activeTrack) {
          const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
          const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
          setActiveTrack(tracks[prevIndex]);
        }
      }
    };

    midiController.addStatusListener(handleStatus);
    midiController.addListener(handleCommand as any);

    return () => {
      midiController.removeStatusListener(handleStatus);
      midiController.removeListener(handleCommand as any);
    };
  }, [activeTrack, isPlaying, tracks, setActiveTrack, setIsPlaying]);

  if (!activeTrack) return null;

  const handleNextTrack = () => {
    const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setActiveTrack(tracks[nextIndex]);
  };

  const handlePrevTrack = () => {
    const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setActiveTrack(tracks[prevIndex]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-800/80 px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Track Title & MIDI Status */}
        <div className="w-full sm:w-64 overflow-hidden">
          <div className="text-xs font-semibold text-white truncate flex items-center gap-2">
            <span>{activeTrack.title}</span>
            {midiDevice && (
              <span title={`Connected: ${midiDevice}`} className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            )}
          </div>
          <div className="text-[11px] text-zinc-400 truncate mt-0.5">
            {activeTrack.artist} • <span className="text-indigo-400">{midiDevice ? `MIDI: ${midiDevice}` : activeTrack.genre}</span>
          </div>
        </div>

        {/* Controls & Animated Waveform */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-md w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevTrack}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={handleNextTrack}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
            <span>0:45</span>
            <div className="flex-1 flex items-center justify-center">
              <WaveformCanvas isPlaying={isPlaying} energy={activeTrack.energy} height={18} barCount={44} />
            </div>
            <span>{formatDuration(activeTrack.duration)}</span>
          </div>
        </div>

        {/* Audio Specs & Action */}
        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <div className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
            {activeTrack.bpm} <span className="text-[10px] text-zinc-500">BPM</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-indigo-950/50 border border-indigo-500/30 text-indigo-300">
            {activeTrack.key}
          </div>

          <div className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
            {activeTrack.energy}/10 <span className="text-[10px] text-zinc-500">NRG</span>
          </div>

          <button
            onClick={onOpenHarmonicDeck}
            className="ml-1 px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-sans font-medium transition-colors text-xs"
          >
            {t.harmonic_next}
          </button>
        </div>

      </div>
    </div>
  );
};
