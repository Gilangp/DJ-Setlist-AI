"use client";

import React, { useState } from 'react';
import { AppProvider } from '@/lib/store';
import { Navbar } from '@/components/navbar';
import { AudioPlayerBar } from '@/components/audio-player-bar';
import { UploadModal } from '@/components/upload-modal';
import { AICopilotModal } from '@/components/ai-copilot-modal';
import { CamelotWheelModal } from '@/components/camelot-wheel';

import { DashboardView } from '@/components/views/dashboard-view';
import { LibraryView } from '@/components/views/library-view';
import { SetlistsView } from '@/components/views/setlists-view';
import { GigsView } from '@/components/views/gigs-view';
import { LiveBoothView } from '@/components/views/live-booth-view';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | undefined>(undefined);

  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState<boolean>(false);
  const [isHarmonicDeckOpen, setIsHarmonicDeckOpen] = useState<boolean>(false);

  const handleNavigate = (tab: string, playlistId?: string) => {
    setActiveTab(tab);
    if (playlistId !== undefined) {
      setSelectedPlaylistId(playlistId);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => handleNavigate(tab, undefined)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => handleNavigate(tab)}
            onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
            onOpenHarmonicDeck={() => setIsHarmonicDeckOpen(true)}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {activeTab === 'copilot' && (
          <SetlistsView
            selectedPlaylistId={selectedPlaylistId}
            onSelectPlaylist={(id) => setSelectedPlaylistId(id)}
            onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
          />
        )}

        {activeTab === 'live' && <LiveBoothView />}

        {activeTab === 'recommend' && (
          <div className="py-12 text-center space-y-4 animate-in fade-in">
            <h2 className="text-2xl font-black text-white">Harmonic Deck Active</h2>
            <p className="text-sm text-zinc-400">Opening visual Camelot Wheel interface...</p>
            <button
              onClick={() => setIsHarmonicDeckOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-bold shadow-lg shadow-emerald-500/20"
            >
              Launch Camelot Wheel & Deck Recommendation
            </button>
          </div>
        )}

        {activeTab === 'history' && <GigsView />}
      </main>

      {/* Sticky Bottom Audio Player Deck */}
      <AudioPlayerBar
        onOpenHarmonicDeck={() => setIsHarmonicDeckOpen(true)}
      />

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <AICopilotModal
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        onSelectPlaylist={(id) => handleNavigate('copilot', id)}
      />

      <CamelotWheelModal
        isOpen={isHarmonicDeckOpen}
        onClose={() => setIsHarmonicDeckOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
