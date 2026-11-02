import React, { useState } from 'react';
import type { StickerItem } from '../types';
import { Smile, Type, Plus, Trash2, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface StickerPanelProps {
  stickers: StickerItem[];
  onAddSticker: (sticker: StickerItem) => void;
  onRemoveSticker: (id: string) => void;
  onClearStickers: () => void;
}

const CUTE_EMOJIS = [
  '🕊️', '❤️', '💖', '🪽', '💘', '💝', '🌹', '✨',
  '🎀', '🌸', '🐰', '🐱', '🧸', '🍓', '🦢', '💌',
  '⭐', '🦋', '🍒', '😎', '😇', '🫧', '🌷', '☕',
  '🎂', '🍭', '🍩', '🥑', '📸', '🐾', '🍰', '💐',
  '🍬', '💫', '🧁', '🍪', '👒', '💄', '💞', '💓'
];

const CUTE_BADGES = [
  { text: '🕊️ LOVE BIRD 🕊️', color: '#e11d48' },
  { text: '♥ SWEETHEART ♥', color: '#f43f5e' },
  { text: '♡ MY LOVE ♡', color: '#ff1493' },
  { text: '🌹 ROMANTIC 🌹', color: '#be123c' },
  { text: '♡ CUTE ♡', color: '#ec4899' },
  { text: '★ ANGEL ★', color: '#a855f7' },
  { text: '✿ PRINCESS ✿', color: '#f43f5e' },
  { text: '✦ Y2K ✦', color: '#06b6d4' },
  { text: '♥ LOVE ♥', color: '#ef4444' },
  { text: 'VIP', color: '#eab308' },
  { text: 'XOXO', color: '#d946ef' },
  { text: '★ SUPERSTAR ★', color: '#8b5cf6' },
  { text: 'MOOD', color: '#10b981' },
  { text: 'LUCKY BABY', color: '#f97316' },
];

export const StickerPanel: React.FC<StickerPanelProps> = ({
  stickers,
  onAddSticker,
  onRemoveSticker,
  onClearStickers,
}) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'badge' | 'text'>('emoji');
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [selectedFont, setSelectedFont] = useState('Caveat');

  const addEmojiSticker = (emoji: string) => {
    sounds.playPop();
    const newSticker: StickerItem = {
      id: 'sticker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'emoji',
      content: emoji,
      x: 35 + Math.random() * 30, // random center area
      y: 35 + Math.random() * 30,
      scale: 1,
      rotation: (Math.random() - 0.5) * 30,
    };
    onAddSticker(newSticker);
  };

  const addBadgeSticker = (text: string, color: string) => {
    sounds.playPop();
    const newSticker: StickerItem = {
      id: 'sticker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'badge',
      content: text,
      color: color,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      scale: 1,
      rotation: (Math.random() - 0.5) * 20,
    };
    onAddSticker(newSticker);
  };

  const handleAddCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    sounds.playPop();
    const newSticker: StickerItem = {
      id: 'sticker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'text',
      content: customText.trim(),
      color: textColor,
      fontFamily: selectedFont,
      x: 50,
      y: 50,
      scale: 1.2,
      rotation: 0,
    };
    onAddSticker(newSticker);
    setCustomText('');
  };

  return (
    <div className="bg-slate-850/80 border border-slate-700/60 rounded-2xl p-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Stiker Lucu & Doodle
        </h3>
        {stickers.length > 0 && (
          <button
            onClick={() => {
              sounds.playPop();
              onClearStickers();
            }}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Hapus Semua ({stickers.length})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
        <button
          onClick={() => {
            sounds.playPop();
            setActiveTab('emoji');
          }}
          className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'emoji' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smile className="w-3.5 h-3.5" /> Emoji Lucu
        </button>
        <button
          onClick={() => {
            sounds.playPop();
            setActiveTab('badge');
          }}
          className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'badge' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Badge Y2K
        </button>
        <button
          onClick={() => {
            sounds.playPop();
            setActiveTab('text');
          }}
          className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'text' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" /> Teks Kustom
        </button>
      </div>

      {/* Tab 1: Emojis */}
      {activeTab === 'emoji' && (
        <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
          {CUTE_EMOJIS.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => addEmojiSticker(emoji)}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 hover:border-pink-500/50 flex items-center justify-center text-xl hover:scale-115 active:scale-95 transition-transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Tab 2: Badges */}
      {activeTab === 'badge' && (
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
          {CUTE_BADGES.map((b, idx) => (
            <button
              key={idx}
              onClick={() => addBadgeSticker(b.text, b.color)}
              style={{ backgroundColor: b.color }}
              className="px-3 py-1.5 rounded-full text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition cursor-pointer border-2 border-white/90"
            >
              {b.text}
            </button>
          ))}
        </div>
      )}

      {/* Tab 3: Custom Text */}
      {activeTab === 'text' && (
        <form onSubmit={handleAddCustomText} className="space-y-3">
          <div>
            <label className="block text-slate-400 text-xs mb-1">Tulis Kalimat / Doodle</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Contoh: Best Day Ever ♡"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Jenis Huruf</label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-pink-500"
              >
                <option value="Caveat">Tulisan Tangan (Caveat)</option>
                <option value="Fredoka">Bubbly Cute (Fredoka)</option>
                <option value="VT323">Pixel Retro (VT323)</option>
                <option value="Plus Jakarta Sans">Modern Bold</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Pilih Warna</label>
              <div className="flex items-center gap-1.5 pt-1">
                {['#ffffff', '#f43f5e', '#ec4899', '#a855f7', '#38bdf8', '#facc15', '#000000'].map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTextColor(c)}
                      className={`w-5 h-5 rounded-full border cursor-pointer ${
                        textColor === c ? 'border-white scale-125 ring-1 ring-pink-500' : 'border-slate-600'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!customText.trim()}
            className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambahkan ke Foto
          </button>
        </form>
      )}

      {/* Active Stickers on Screen */}
      {stickers.length > 0 && (
        <div className="pt-2 border-t border-slate-700/50">
          <p className="text-[10px] text-slate-400 font-semibold mb-1.5 uppercase">
            Stiker di Atas Kanvas (Geser langsung pada foto):
          </p>
          <div className="flex gap-1.5 flex-wrap max-h-24 overflow-y-auto">
            {stickers.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-xs"
              >
                <span>{s.content}</span>
                <button
                  onClick={() => {
                    sounds.playPop();
                    onRemoveSticker(s.id);
                  }}
                  className="text-slate-400 hover:text-rose-400 ml-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
