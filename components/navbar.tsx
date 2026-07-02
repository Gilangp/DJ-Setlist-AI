"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Upload, Sparkles, RotateCcw } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenAiCopilot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenAiCopilot,
}) => {
  const { tracks, resetToDefaultData, language, setLanguage, t } = useAppStore();

  const navItems = [
    { id: 'dashboard', label: t.nav_overview },
    { id: 'library', label: `${t.nav_library} (${tracks.length})` },
    { id: 'copilot', label: t.nav_setlists },
    { id: 'recommend', label: t.nav_harmonic },
    { id: 'live', label: t.nav_live },
    { id: 'history', label: t.nav_gigs },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-xs tracking-tighter">
            AI
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            DJ Setlist Copilot
          </span>
        </div>

        {/* Minimal Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isLive = item.id === 'live';
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? isLive ? 'bg-emerald-600 text-white font-bold tracking-wider' : 'bg-zinc-800 text-white font-semibold'
                    : isLive ? 'text-emerald-400 hover:bg-emerald-950/40 font-semibold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Clean Action Buttons & Language Switcher */}
        <div className="flex items-center gap-2">
          
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-zinc-900 rounded-md border border-zinc-800 p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setLanguage('id')}
              className={`px-2 py-0.5 rounded transition-colors ${
                language === 'id' ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded transition-colors ${
                language === 'en' ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            {t.btn_import}
          </button>

          <button
            onClick={onOpenAiCopilot}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-indigo-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.btn_generate}
          </button>

          <button
            onClick={resetToDefaultData}
            title="Reset library"
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {t.btn_reset}
          </button>
        </div>
      </div>
    </header>
  );
};
