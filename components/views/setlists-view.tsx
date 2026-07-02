"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatDuration } from '@/lib/harmonic-mixing';

interface SetlistsViewProps {
  selectedPlaylistId?: string;
  onSelectPlaylist: (id?: string) => void;
  onOpenAiCopilot: () => void;
}

export const SetlistsView: React.FC<SetlistsViewProps> = ({
  selectedPlaylistId,
  onSelectPlaylist,
  onOpenAiCopilot
}) => {
  const { playlists, deletePlaylist, setActiveTrack, setIsPlaying, t } = useAppStore();
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId) || playlists[0];

  const handleExport = (format: 'M3U' | 'XML' | 'CSV' | 'TXT') => {
    if (!activePlaylist) return;
    setDownloadingFormat(format);

    setTimeout(() => {
      let content = '';
      let filename = `${activePlaylist.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${format.toLowerCase()}`;
      let mimeType = 'text/plain';

      if (format === 'M3U') {
        content = '#EXTM3U\n' + activePlaylist.tracks.map(t => `#EXTINF:${t.duration},${t.artist} - ${t.title}\n${t.title}.mp3`).join('\n');
      } else if (format === 'XML') {
        mimeType = 'application/xml';
        const tracksXml = activePlaylist.tracks.map((tr, idx) => `
    <TRACK TrackID="${idx + 1}" Name="${tr.title}" Artist="${tr.artist}" Composer="" Album="" Genre="${tr.genre}" Kind="MP3 File" Size="10485760" TotalTime="${tr.duration}" DiscNumber="1" TrackNumber="${tr.position}" Year="2026" AverageBpm="${tr.bpm}" Tonality="${tr.key}" DateAdded="${new Date().toISOString().split('T')[0]}" Comments="${tr.transitionNotes || ''}" />`).join('');
        
        const playlistNodesXml = activePlaylist.tracks.map((tr, idx) => `
      <TRACK Key="${idx + 1}" />`).join('');

        content = `<?xml version="1.0" encoding="UTF-8"?>
<DJ_PLAYLISTS Version="1.0.0">
  <PRODUCT Name="DJ Setlist AI" Version="2.4" Company="Advanced Agentic Studio" />
  <COLLECTION Entries="${activePlaylist.tracks.length}">${tracksXml}
  </COLLECTION>
  <PLAYLISTS>
    <NODE Type="0" Name="ROOT" Count="1">
      <NODE Name="${activePlaylist.name}" Type="1" KeyType="0" Entries="${activePlaylist.tracks.length}">${playlistNodesXml}
      </NODE>
    </NODE>
  </PLAYLISTS>
</DJ_PLAYLISTS>`;
      } else if (format === 'CSV') {
        content = 'Position,Title,Artist,BPM,Key,Energy,TransitionNotes\n' +
          activePlaylist.tracks.map(tr => `"${tr.position}","${tr.title}","${tr.artist}",${tr.bpm},"${tr.key}",${tr.energy},"${tr.transitionNotes || ''}"`).join('\n');
      } else if (format === 'TXT') {
        content = `=== DJ SETLIST AI REPORT ===\nPlaylist: ${activePlaylist.name}\nEvent: ${activePlaylist.eventType || 'N/A'}\nDuration: ${activePlaylist.targetDuration} mins\n\nTRACK SEQUENCE:\n` +
          activePlaylist.tracks.map(tr => `[#${tr.position}] ${tr.artist} - ${tr.title} (${tr.bpm} BPM | Key ${tr.key} | Energy ${tr.energy}/10)\nNote: ${tr.transitionNotes || 'Standard transition'}`).join('\n\n');
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadingFormat(null);
    }, 500);
  };

  if (selectedPlaylistId && activePlaylist) {
    const totalDurationSecs = activePlaylist.tracks.reduce((acc, tr) => acc + tr.duration, 0);

    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-24">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectPlaylist(undefined)}
            className="text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors"
          >
            {t.all_setlists_back}
          </button>

          <div className="flex items-center gap-1.5">
            {(['M3U', 'XML', 'CSV', 'TXT'] as const).map(fmt => (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                disabled={!!downloadingFormat}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 border border-zinc-800 transition-colors"
              >
                Export {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Setlist Summary */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-indigo-400">
            <span>{activePlaylist.eventType || 'AI Copilot Setlist'}</span>
            <span>•</span>
            <span className="text-zinc-500">Created {activePlaylist.createdAt}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white">{activePlaylist.name}</h1>
          <p className="text-xs text-zinc-400 max-w-2xl">{activePlaylist.description}</p>

          <div className="pt-2 flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span>{activePlaylist.tracks.length} {t.tracks_label}</span>
            <span>~{Math.round(totalDurationSecs / 60)} mins</span>
          </div>
        </div>

        {/* Track Sequence Table */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/80 text-xs font-semibold text-zinc-300">
            {t.blueprint_title}
          </div>

          <div className="divide-y divide-zinc-800/40">
            {activePlaylist.tracks.map((track, i) => (
              <div
                key={track.id + i}
                onClick={() => {
                  setActiveTrack(track);
                  setIsPlaying(true);
                }}
                className="p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer select-none space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-zinc-500 w-6">
                      #{track.position}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {track.title}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {track.artist} • {track.genre}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {track.bpm} BPM
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                      Key {track.key}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      NRG {track.energy}
                    </span>
                  </div>
                </div>

                {track.transitionNotes && (
                  <div className="ml-10 bg-zinc-950/60 border-l-2 border-indigo-500 rounded-r-lg p-2.5 text-xs text-zinc-400">
                    <span className="text-indigo-400 font-mono text-[11px] font-medium block mb-0.5">
                      {t.ai_note}
                    </span>
                    {track.transitionNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-24">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-white">{t.setlists_hero_title}</h2>
          <p className="text-xs text-zinc-400 mt-1">
            {t.setlists_hero_sub}
          </p>
        </div>
        <button
          onClick={onOpenAiCopilot}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors"
        >
          {t.btn_new_setlist}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => onSelectPlaylist(playlist.id)}
            className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 transition-colors cursor-pointer select-none space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-indigo-400 font-medium">
                  {playlist.eventType || 'AI Copilot Set'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlaylist(playlist.id);
                  }}
                  className="text-zinc-600 hover:text-rose-400"
                >
                  {t.delete_btn}
                </button>
              </div>

              <h3 className="text-base font-bold text-white">
                {playlist.name}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-2">{playlist.description}</p>
            </div>

            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between font-mono text-xs text-zinc-500">
              <span>{playlist.tracks.length} {t.tracks_label}</span>
              <span className="text-zinc-300 font-medium">{t.inspect_seq}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
