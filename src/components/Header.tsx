import React, { useState } from 'react';
import { Camera, Volume2, VolumeX, ShieldCheck, Download, Upload, Sparkles, RefreshCw } from 'lucide-react';
import { sounds } from '../utils/sound';

interface HeaderProps {
  onOpenCamera: () => void;
  onUploadClick: () => void;
  onExportClick: () => void;
  onReset: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCamera,
  onUploadClick,
  onExportClick,
  onReset,
  soundEnabled,
  setSoundEnabled,
}) => {
  const [showPrivacyTooltip, setShowPrivacyTooltip] = useState(false);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sounds.enabled = newState;
    if (newState) {
      sounds.playPop();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0f1422]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-pink-500/20 text-white">
            <Camera className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                RetroSnap Studio
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                <Sparkles className="w-3 h-3" /> Cute & Retro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              MacBook Photo Booth, iPhone Viewfinder & Reels Filter
            </p>
          </div>
        </div>

        {/* Center: Privacy Local Browser Badge */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowPrivacyTooltip(true)}
            onMouseLeave={() => setShowPrivacyTooltip(false)}
            onClick={() => setShowPrivacyTooltip(!showPrivacyTooltip)}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">100% Lokal & Privat</span>
            <span className="md:hidden">Privat</span>
          </button>

          {showPrivacyTooltip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-slate-300 z-50 animate-in fade-in zoom-in-95">
              <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                🔒 Aman Tanpa Server
              </p>
              Semua proses edit foto dilakukan langsung di dalam browser laptop/HP Anda. Foto tidak pernah dikirim ke server luar.
            </div>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 text-pink-400 border-pink-500/30 shadow-sm shadow-pink-500/10'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              if (soundEnabled) sounds.playPop();
              onReset();
            }}
            title="Reset Pengaturan"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Ambil Foto Webcam / Kamera HP */}
          <button
            onClick={() => {
              if (soundEnabled) sounds.playPop();
              onOpenCamera();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Camera className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Ambil Foto</span>
            <span className="md:hidden">Kamera</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => {
              if (soundEnabled) sounds.playPop();
              onUploadClick();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 text-xs font-semibold border border-purple-500/30 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">Pilih Foto</span>
            <span className="md:hidden">Galeri</span>
          </button>

          {/* Export / Save Button */}
          <button
            onClick={() => {
              if (soundEnabled) sounds.playPop();
              onExportClick();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-pink-500/25 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </header>
  );
};

