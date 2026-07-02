"use client";

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAppStore } from '@/lib/store';
import { AISetlistPrompt } from '@/types/music';
import { Sparkles, Flame, X } from 'lucide-react';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlaylist: (id: string) => void;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({ isOpen, onClose, onSelectPlaylist }) => {
  const { tracks, addPlaylist } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const [prompt, setPrompt] = useState<AISetlistPrompt>({
    eventType: 'Club Dragonfly SCBD (Peak Time)',
    durationMinutes: 90,
    primaryGenre: 'Melodic Techno & Progressive House',
    targetAudienceAge: 'Anak muda usia 20-35 tahun yang ingin joget berenergi tinggi',
    energyProgression: 'Mulai dari pemanasan santai 122 BPM lalu naik bertahap ke puncak meledak 128 BPM',
    specialInstructions: 'Pastikan transisi antar lagu mulus secara harmoni Camelot Key. Hindari tabrakan vokal.',
    prioritizeViral: true,
    targetTrackCount: 12
  });

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tracks })
      });
      const data = await res.json();

      if (data.success && data.playlist) {
        addPlaylist(data.playlist);

        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {}

        setIsGenerating(false);
        onClose();
        onSelectPlaylist(data.playlist.id);
      } else {
        setIsGenerating(false);
      }
    } catch (e) {
      console.error('AI generation request failed:', e);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">AI Studio Copilot (100% Manual Override)</h3>
              <p className="text-xs text-zinc-400">Ketik manual spesifikasi panggung, suasana, ritme, dan prioritas viral</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Prioritize Viral Box */}
          <div 
            onClick={() => setPrompt({ ...prompt, prioritizeViral: !prompt.prioritizeViral })}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              prompt.prioritizeViral 
                ? 'bg-amber-950/30 border-amber-500/60 text-amber-200' 
                : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Flame className={`w-5 h-5 ${prompt.prioritizeViral ? 'text-amber-400 animate-pulse' : 'text-zinc-600'}`} />
              <div>
                <div className="font-semibold text-sm">Prioritaskan Lagu Paling Hype & Viral</div>
                <div className="text-[11px] opacity-80">AI otomatis memilih trek dengan rating tertinggi & popularitas teratas di library Anda</div>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={Boolean(prompt.prioritizeViral)} 
              onChange={() => {}} 
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Tempat / Nama Acara (*Venue*)
              </label>
              <input
                type="text"
                value={prompt.eventType}
                onChange={(e) => setPrompt({ ...prompt, eventType: e.target.value })}
                placeholder="Misal: Club Peak Time, Outdoor Sunset Beach, Pesta Pernikahan..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Durasi Set (Menit)
              </label>
              <input
                type="number"
                min={15}
                max={360}
                value={prompt.durationMinutes}
                onChange={(e) => setPrompt({ ...prompt, durationMinutes: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Target Jumlah Lagu
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={prompt.targetTrackCount || ''}
                onChange={(e) => setPrompt({ ...prompt, targetTrackCount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Otomatis (Durasi)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-indigo-300 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Genre / Warna Musik Utama
              </label>
              <input
                type="text"
                value={prompt.primaryGenre}
                onChange={(e) => setPrompt({ ...prompt, primaryGenre: e.target.value })}
                placeholder="Misal: Progressive House, Tech House dicampur Afrobeat..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Suasana / Profil Penonton (*Crowd*)
              </label>
              <input
                type="text"
                value={prompt.targetAudienceAge}
                onChange={(e) => setPrompt({ ...prompt, targetAudienceAge: e.target.value })}
                placeholder="Misal: Anak muda usia 20-30 tahun yang butuh musik joget..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Ritme / Alur Energi (*Tempo & Energy Progression*)
            </label>
            <input
              type="text"
              value={prompt.energyProgression}
              onChange={(e) => setPrompt({ ...prompt, energyProgression: e.target.value })}
              placeholder="Misal: Mulai santai 120 BPM lalu naik bertahap ke puncak meledak 128 BPM..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Catatan & Instruksi Khusus AI (*Special Prompt Override*)
            </label>
            <textarea
              rows={3}
              value={prompt.specialInstructions}
              onChange={(e) => setPrompt({ ...prompt, specialInstructions: e.target.value })}
              placeholder="Ketik manual instruksi bebas apa saja! Contoh: 'Lagu pertama harus vokal melodis, jangan gunakan trek yang terlalu gelap, potong EQ bass di bar 16...'"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-400 font-mono">
              Memindai {tracks.length} lagu di library
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'AI Sedang Meracik Setlist...' : 'Racik Setlist AI Sekarang'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
