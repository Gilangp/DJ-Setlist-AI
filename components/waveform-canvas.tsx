"use client";

import React, { useEffect, useRef } from 'react';

interface WaveformCanvasProps {
  isPlaying: boolean;
  energy: number; // 1 to 10
  height?: number;
  barCount?: number;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  isPlaying,
  energy = 6,
  height = 36,
  barCount = 38
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const h = canvas.height;
      const barWidth = Math.max(2, (width / barCount) - 2);

      for (let i = 0; i < barCount; i++) {
        // Base static bar amplitude derived from position and energy
        const normalizedPos = i / barCount;
        const envelope = Math.sin(normalizedPos * Math.PI); // Peak in center
        
        let barHeight = h * 0.2 + (h * 0.6 * envelope * (energy / 10));

        if (isPlaying) {
          // Add dynamic sine-wave movement when playing
          const wave = Math.sin(phase + i * 0.3) * Math.cos(phase * 0.7 + i * 0.2);
          barHeight += wave * (h * 0.25 * (energy / 10));
        }

        barHeight = Math.max(4, Math.min(h - 2, barHeight));

        const x = i * (barWidth + 2);
        const y = (h - barHeight) / 2;

        // Gradient styling
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, '#6366f1'); // Indigo 500
        gradient.addColorStop(1, '#10b981'); // Emerald 500

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.12;
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying, energy, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 6}
      height={height}
      className="w-full max-w-md rounded overflow-hidden"
    />
  );
};
