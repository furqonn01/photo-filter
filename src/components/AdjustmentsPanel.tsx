import React from 'react';
import type { PhotoAdjustments, AspectRatio } from '../types';
import { RotateCw, FlipHorizontal, FlipVertical, ZoomIn, Sun, Contrast, Eye, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface AdjustmentsPanelProps {
  adjustments: PhotoAdjustments;
  onChange: (updater: (prev: PhotoAdjustments) => PhotoAdjustments) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ar: AspectRatio) => void;
}

export const AdjustmentsPanel: React.FC<AdjustmentsPanelProps> = ({
  adjustments,
  onChange,
  aspectRatio,
  onAspectRatioChange,
}) => {
  const handleResetAdjustments = () => {
    sounds.playPop();
    onChange(() => ({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      grain: 0,
      vignette: 0,
      zoom: 1,
      panX: 0,
      panY: 0,
      rotation: 0,
      flipH: false,
      flipV: false,
    }));
  };

  return (
    <div className="bg-slate-850/80 border border-slate-700/60 rounded-2xl p-4 space-y-4">
      {/* Header & Reset */}
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Penyesuaian Foto
        </h3>
        <button
          onClick={handleResetAdjustments}
          className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold cursor-pointer"
        >
          Reset Slider
        </button>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-400 block">Rasio Kanvas</label>
        <div className="grid grid-cols-5 gap-1.5 text-xs">
          {(['1:1', '4:5', '9:16', '4:3', 'original'] as AspectRatio[]).map((ar) => (
            <button
              key={ar}
              onClick={() => {
                sounds.playPop();
                onAspectRatioChange(ar);
              }}
              className={`py-1.5 px-2 rounded-xl font-bold border transition cursor-pointer text-center ${
                aspectRatio === ar
                  ? 'bg-pink-500 text-white border-pink-400 shadow-sm shadow-pink-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700/80 hover:text-white hover:bg-slate-800'
              }`}
            >
              {ar === 'original' ? 'Asli' : ar}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Transforms: Rotate, Flip H, Flip V */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            sounds.playPop();
            onChange((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 text-pink-400" /> Putar 90°
        </button>

        <button
          onClick={() => {
            sounds.playPop();
            onChange((prev) => ({ ...prev, flipH: !prev.flipH }));
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
            adjustments.flipH
              ? 'bg-pink-500/20 text-pink-300 border-pink-500'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <FlipHorizontal className="w-3.5 h-3.5" /> Mirror Selfie
        </button>

        <button
          onClick={() => {
            sounds.playPop();
            onChange((prev) => ({ ...prev, flipV: !prev.flipV }));
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
            adjustments.flipV
              ? 'bg-pink-500/20 text-pink-300 border-pink-500'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <FlipVertical className="w-3.5 h-3.5" /> Flip V
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {/* Zoom */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <ZoomIn className="w-3.5 h-3.5 text-pink-400" /> Zoom Foto
            </span>
            <span className="font-mono text-slate-300">{Math.round(adjustments.zoom * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={adjustments.zoom}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, zoom: parseFloat(e.target.value) }))
            }
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>

        {/* Brightness */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Kecerahan
            </span>
            <span className="font-mono text-slate-300">{adjustments.brightness}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="160"
            value={adjustments.brightness}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, brightness: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Contrast className="w-3.5 h-3.5 text-indigo-400" /> Kontras
            </span>
            <span className="font-mono text-slate-300">{adjustments.contrast}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="160"
            value={adjustments.contrast}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, contrast: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-rose-400" /> Kejenuhan Warna
            </span>
            <span className="font-mono text-slate-300">{adjustments.saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={adjustments.saturation}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, saturation: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>

        {/* Film Grain */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Grain Film Vintage</span>
            <span className="font-mono text-slate-300">{adjustments.grain}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={adjustments.grain}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, grain: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>

        {/* Vignette */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Vignette Sudut Gelap</span>
            <span className="font-mono text-slate-300">{adjustments.vignette}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={adjustments.vignette}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, vignette: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
