import React from 'react';
import type { FrameType, FrameSettings } from '../types';
import { Sliders, Type, Palette, Sun, Moon } from 'lucide-react';
import { sounds } from '../utils/sound';

interface FrameCustomizerProps {
  currentFrame: FrameType;
  settings: FrameSettings;
  onUpdateSettings: (updater: (prev: FrameSettings) => FrameSettings) => void;
}

export const FrameCustomizer: React.FC<FrameCustomizerProps> = ({
  currentFrame,
  settings,
  onUpdateSettings,
}) => {
  if (currentFrame === 'none') {
    return null;
  }

  return (
    <div className="bg-slate-850/80 border border-slate-700/60 rounded-2xl p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-pink-400" /> Kustomisasi Frame
        </h3>
        <span className="text-[10px] text-slate-400">Atur teks & tampilan frame</span>
      </div>

      {/* MacBook Controls */}
      {currentFrame === 'macbook' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Judul Jendela</label>
            <div className="relative">
              <input
                type="text"
                value={settings.macbookTitle}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({ ...prev, macbookTitle: e.target.value }))
                }
                placeholder="Photo Booth"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Tema Window</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onUpdateSettings((prev) => ({ ...prev, macbookDark: false }));
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                  !settings.macbookDark
                    ? 'bg-slate-200 text-slate-900 border-white'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Silver Light
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onUpdateSettings((prev) => ({ ...prev, macbookDark: true }));
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                  settings.macbookDark
                    ? 'bg-slate-800 text-pink-400 border-pink-500'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iPhone Controls */}
      {currentFrame === 'iphone' && (
        <div className="space-y-3.5 text-xs">
          {/* Skala Ukuran Frame iPhone */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-pink-400" /> Skala Frame iPhone
              </label>
              <span className="font-mono font-bold text-pink-400 text-xs">
                {Math.round((settings.iphoneFrameScale ?? 1.0) * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.iphoneFrameScale ?? 1.0}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  iphoneFrameScale: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-pink-500 cursor-pointer"
            />

            {/* Quick Scale Presets */}
            <div className="flex gap-1.5 pt-1">
              {[
                { label: 'Kecil (75%)', val: 0.75 },
                { label: 'Normal (100%)', val: 1.0 },
                { label: 'Besar (125%)', val: 1.25 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    onUpdateSettings((prev) => ({ ...prev, iphoneFrameScale: p.val }));
                  }}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    (settings.iphoneFrameScale ?? 1.0) === p.val
                      ? 'bg-pink-500 text-white border-pink-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Mode Carousel Selector */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Mode Kamera iPhone (Geser & Fade di Ujung)</label>
            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
              {(['TIME-LAPSE', 'SLO-MO', 'CINEMATIC', 'VIDEO', 'PHOTO', 'PORTRAIT', 'PANO'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    onUpdateSettings((prev) => ({ ...prev, iphoneCameraMode: m }));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer whitespace-nowrap ${
                    settings.iphoneCameraMode === m
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-sm shadow-amber-400/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Pilihan Mode</label>
              <select
                value={settings.iphoneCameraMode}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    iphoneCameraMode: e.target.value as FrameSettings['iphoneCameraMode'],
                  }))
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-pink-500"
              >
                <option value="TIME-LAPSE">TIME-LAPSE</option>
                <option value="SLO-MO">SLO-MO</option>
                <option value="CINEMATIC">CINEMATIC</option>
                <option value="VIDEO">VIDEO</option>
                <option value="PHOTO">PHOTO</option>
                <option value="PORTRAIT">PORTRAIT</option>
                <option value="PANO">PANO</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Lensa Aktif</label>
              <select
                value={settings.iphoneZoomBadge}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    iphoneZoomBadge: e.target.value,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-pink-500"
              >
                <option value="0.5">0.5x Ultra Wide</option>
                <option value="1x">1x Main</option>
                <option value="2">2x Telephoto</option>
                <option value="3">3x Optical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl hover:bg-slate-800">
              <input
                type="checkbox"
                checked={settings.iphoneGrid}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({ ...prev, iphoneGrid: e.target.checked }))
                }
                className="rounded text-pink-500 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">Grid 3x3</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl hover:bg-slate-800">
              <input
                type="checkbox"
                checked={settings.iphoneShowFocus}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({ ...prev, iphoneShowFocus: e.target.checked }))
                }
                className="rounded text-pink-500 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">Fokus ☀️</span>
            </label>
          </div>
        </div>
      )}

      {/* Reels Controls */}
      {currentFrame === 'reels' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1 font-medium">Username (@)</label>
            <input
              type="text"
              value={settings.reelsUsername}
              onChange={(e) =>
                onUpdateSettings((prev) => ({ ...prev, reelsUsername: e.target.value }))
              }
              placeholder="@cutie.vibes"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Jumlah Likes</label>
            <input
              type="text"
              value={settings.reelsLikes}
              onChange={(e) =>
                onUpdateSettings((prev) => ({ ...prev, reelsLikes: e.target.value }))
              }
              placeholder="342.8K"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Jumlah Komentar</label>
            <input
              type="text"
              value={settings.reelsComments}
              onChange={(e) =>
                onUpdateSettings((prev) => ({ ...prev, reelsComments: e.target.value }))
              }
              placeholder="1,894"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1 font-medium">Caption & Hashtag</label>
            <input
              type="text"
              value={settings.reelsCaption}
              onChange={(e) =>
                onUpdateSettings((prev) => ({ ...prev, reelsCaption: e.target.value }))
              }
              placeholder="Aesthetic vibe check ✨ #fyp #reels"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1 font-medium">Nama Lagu / Audio</label>
            <input
              type="text"
              value={settings.reelsAudio}
              onChange={(e) =>
                onUpdateSettings((prev) => ({ ...prev, reelsAudio: e.target.value }))
              }
              placeholder="Original Sound - Cute Chill Lo-Fi"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>
      )}

      {/* Digicam Controls */}
      {currentFrame === 'digicam' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Format Tanggal Digital</label>
            <input
              type="text"
              value={settings.digicamDate}
              onChange={(e) =>
                onUpdateSettings((prev) => ({ ...prev, digicamDate: e.target.value }))
              }
              placeholder="2004. 11. 02 21:30"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 font-mono text-amber-400 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onUpdateSettings((prev) => ({ ...prev, digicamRec: !prev.digicamRec }));
              }}
              className={`w-full py-1.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer ${
                settings.digicamRec
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  settings.digicamRec ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span>{settings.digicamRec ? 'Status: REC (Merekam)' : 'Status: STBY (Standby)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Photobooth 4-cut Controls */}
      {currentFrame === 'photobooth_4cut' && (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Palette className="w-3 h-3 text-pink-400" /> Warna Latar Bingkai Korea
              </span>
              <span className="text-[10px] text-slate-500">Otomatis kontras teks</span>
            </label>
            <div className="flex gap-2 flex-wrap items-center">
              {[
                { name: 'Pink Pastel', hex: '#fbcfe8' },
                { name: 'Lavender', hex: '#e9d5ff' },
                { name: 'Soft Mint', hex: '#bbf7d0' },
                { name: 'Butter Yellow', hex: '#fef08a' },
                { name: 'Denim Blue', hex: '#bae6fd' },
                { name: 'Chic Noir', hex: '#0f172a' },
                { name: 'Espresso Brown', hex: '#3e2723' },
                { name: 'Muted Peach', hex: '#fed7aa' },
                { name: 'Pure White', hex: '#ffffff' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    onUpdateSettings((prev) => ({ ...prev, photoboothColor: c.hex }));
                  }}
                  title={c.name}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    settings.photoboothColor === c.hex
                      ? 'scale-110 border-white ring-2 ring-pink-500'
                      : 'border-slate-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}

              {/* Custom Color Input */}
              <label
                title="Pilih Warna Kustom"
                className="w-7 h-7 rounded-full border-2 border-dashed border-slate-500 hover:border-pink-400 flex items-center justify-center cursor-pointer relative overflow-hidden"
              >
                <input
                  type="color"
                  value={settings.photoboothColor.startsWith('#') && settings.photoboothColor.length === 7 ? settings.photoboothColor : '#fbcfe8'}
                  onChange={(e) => onUpdateSettings((prev) => ({ ...prev, photoboothColor: e.target.value }))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-[11px] font-bold text-slate-400">+</span>
              </label>
            </div>
          </div>

          {/* Text Color Option */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Warna Teks & Tanggal</label>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { label: '✨ Auto Kontras', val: 'auto' },
                { label: 'Hitam / Navy', val: '#1e1b4b' },
                { label: 'Putih Bersih', val: '#ffffff' },
                { label: 'Emas / Gold', val: '#facc15' },
                { label: 'Soft Pink', val: '#f472b6' },
              ].map((tc) => (
                <button
                  key={tc.val}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    onUpdateSettings((prev) => ({ ...prev, photoboothTextColor: tc.val }));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    (settings.photoboothTextColor || 'auto') === tc.val
                      ? 'bg-pink-500 text-white border-pink-400 shadow-sm shadow-pink-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {tc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Tulisan Utama</label>
              <input
                type="text"
                value={settings.photoboothText}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({ ...prev, photoboothText: e.target.value }))
                }
                placeholder="인생네컷 ♡ HARU FILM"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Sub-tulisan / Tanggal</label>
              <input
                type="text"
                value={settings.photoboothDate}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({ ...prev, photoboothDate: e.target.value }))
                }
                placeholder="2026. 11. 02 MEMORIES"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Polaroid Controls */}
      {currentFrame === 'polaroid' && (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Palette className="w-3 h-3 text-pink-400" /> Warna Kertas Instax / Polaroid
              </span>
              <span className="text-[10px] text-slate-500">Otomatis kontras tulisan</span>
            </label>
            <div className="flex gap-2 flex-wrap items-center">
              {[
                { name: 'Putih Klasik', hex: '#ffffff' },
                { name: 'Instax Black', hex: '#18181b' },
                { name: 'Vintage Cream', hex: '#fdfbf7' },
                { name: 'Soft Peach', hex: '#ffe4e6' },
                { name: 'Cool Lavender', hex: '#f3e8ff' },
                { name: 'Midnight Navy', hex: '#0f172a' },
                { name: 'Sage Green', hex: '#dcfce7' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    onUpdateSettings((prev) => ({ ...prev, polaroidColor: c.hex }));
                  }}
                  title={c.name}
                  className={`w-7 h-7 rounded-lg border-2 cursor-pointer transition-transform ${
                    settings.polaroidColor === c.hex
                      ? 'scale-110 border-pink-500 ring-2 ring-pink-500/50'
                      : 'border-slate-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}

              {/* Custom Color Input */}
              <label
                title="Pilih Warna Kertas Kustom"
                className="w-7 h-7 rounded-lg border-2 border-dashed border-slate-500 hover:border-pink-400 flex items-center justify-center cursor-pointer relative overflow-hidden"
              >
                <input
                  type="color"
                  value={settings.polaroidColor.startsWith('#') && settings.polaroidColor.length === 7 ? settings.polaroidColor : '#ffffff'}
                  onChange={(e) => onUpdateSettings((prev) => ({ ...prev, polaroidColor: e.target.value }))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-[11px] font-bold text-slate-400">+</span>
              </label>
            </div>
          </div>

          {/* Polaroid Text Color Option */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Warna Tulisan Tangan</label>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { label: '✨ Auto Kontras', val: 'auto' },
                { label: 'Spidol Hitam', val: '#1f2937' },
                { label: 'Gel Pen Putih', val: '#f8fafc' },
                { label: 'Gel Pen Gold', val: '#facc15' },
                { label: 'Gel Pen Pink', val: '#fb7185' },
              ].map((tc) => (
                <button
                  key={tc.val}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    onUpdateSettings((prev) => ({ ...prev, polaroidTextColor: tc.val }));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    (settings.polaroidTextColor || 'auto') === tc.val
                      ? 'bg-pink-500 text-white border-pink-400 shadow-sm shadow-pink-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {tc.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
              <Type className="w-3 h-3 text-pink-400" /> Tulisan Tangan Polaroid
            </label>
            <input
              type="text"
              value={settings.polaroidCaption}
              onChange={(e) =>
                onUpdateSettings((prev) => ({ ...prev, polaroidCaption: e.target.value }))
              }
              placeholder="Sweet Memories ♡"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500 font-serif"
            />
          </div>
        </div>
      )}

      {/* Music Player Controls */}
      {currentFrame === 'music_player' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Judul Lagu</label>
            <input
              type="text"
              value={settings.musicSongTitle}
              onChange={(e) =>
                onUpdateSettings((prev) => ({ ...prev, musicSongTitle: e.target.value }))
              }
              placeholder="Cute Daydream"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Nama Artis</label>
            <input
              type="text"
              value={settings.musicArtist}
              onChange={(e) =>
                onUpdateSettings((prev) => ({ ...prev, musicArtist: e.target.value }))
              }
              placeholder="Lofi Chill & Beats"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Progress Lagu ({settings.musicProgress}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.musicProgress}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  musicProgress: parseInt(e.target.value, 10),
                }))
              }
              className="w-full accent-pink-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
