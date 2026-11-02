import React from 'react';
import type { FrameType } from '../types';
import { Laptop, Smartphone, Film, Camera, Heart, Image, Gamepad2, Music } from 'lucide-react';
import { sounds } from '../utils/sound';

interface FrameSelectorProps {
  currentFrame: FrameType;
  onSelectFrame: (frame: FrameType) => void;
}

interface FrameOption {
  id: FrameType;
  name: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const FRAMES: FrameOption[] = [
  {
    id: 'macbook',
    name: 'MacBook Photo Booth',
    badge: 'Trending 🔥',
    icon: <Laptop className="w-5 h-5 text-blue-400" />,
    description: 'Jendela klasik Mac & tombol shutter merah',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
  },
  {
    id: 'iphone',
    name: 'iPhone Camera UI',
    badge: 'Popular ⭐',
    icon: <Smartphone className="w-5 h-5 text-amber-400" />,
    description: 'Viewfinder iOS asli, fokus kuning & zoom',
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30',
  },
  {
    id: 'reels',
    name: 'Instagram / Reels',
    badge: 'Viral 🎬',
    icon: <Film className="w-5 h-5 text-rose-400" />,
    description: 'Overlay Reels vertikal, likes, avatar & audio',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30',
  },
  {
    id: 'digicam',
    name: 'Y2K Digicam 2000s',
    badge: 'Retro 💾',
    icon: <Camera className="w-5 h-5 text-emerald-400" />,
    description: 'Layar Cybershot, timestamp orange & battery',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
  },
  {
    id: 'photobooth_4cut',
    name: 'Korean Life4Cut',
    badge: 'Cute ♡',
    icon: <Heart className="w-5 h-5 text-pink-400" />,
    description: 'Frame pastel Korea 인생네컷 & stempel',
    color: 'from-pink-500/20 to-purple-500/10 border-pink-500/30',
  },
  {
    id: 'polaroid',
    name: 'Instax Polaroid',
    badge: 'Aesthetic 📸',
    icon: <Image className="w-5 h-5 text-amber-300" />,
    description: 'Border polaroid klasik & masking tape',
    color: 'from-amber-600/20 to-orange-500/10 border-amber-500/30',
  },
  {
    id: 'music_player',
    name: 'Spotify Player',
    badge: 'Vibes 🎵',
    icon: <Music className="w-5 h-5 text-cyan-400" />,
    description: 'Kartu pemutar musik lo-fi transparan',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
  },
  {
    id: 'gameboy',
    name: 'GameBoy 1998',
    badge: 'Pixel 👾',
    icon: <Gamepad2 className="w-5 h-5 text-purple-400" />,
    description: 'Casing retro console Nintendo & bezel',
    color: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/30',
  },
  {
    id: 'none',
    name: 'Tanpa Frame',
    badge: 'Basic',
    icon: <Image className="w-5 h-5 text-slate-400" />,
    description: 'Tampilkan foto tanpa overlay bingkai',
    color: 'from-slate-700/20 to-slate-800/10 border-slate-700/40',
  },
];

export const FrameSelector: React.FC<FrameSelectorProps> = ({ currentFrame, onSelectFrame }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Pilih Frame & Bingkai
        </h2>
        <span className="text-[11px] text-pink-400 font-medium">
          {FRAMES.find((f) => f.id === currentFrame)?.name}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {FRAMES.map((f) => {
          const isSelected = currentFrame === f.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                sounds.playPop();
                onSelectFrame(f.id);
              }}
              className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500 ring-2 ring-pink-500/40 shadow-lg shadow-pink-500/10'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 w-full">
                <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-700/40">
                  {f.icon}
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-pink-500 text-white'
                      : 'bg-slate-700/60 text-slate-300'
                  }`}
                >
                  {f.badge}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-tight truncate group-hover:text-pink-300 transition-colors">
                  {f.name}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-1 mt-0.5">
                  {f.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
