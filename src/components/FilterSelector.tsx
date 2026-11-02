import React from 'react';
import type { FilterType } from '../types';
import { Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface FilterSelectorProps {
  currentFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
}

interface FilterOption {
  id: FilterType;
  name: string;
  category: 'Classic Mac' | 'Aesthetic' | 'Retro' | 'Viral Cewek ♡';
  previewGradient: string;
  desc: string;
}

const FILTERS: FilterOption[] = [
  {
    id: 'normal',
    name: 'Normal (Asli)',
    category: 'Aesthetic',
    previewGradient: 'from-slate-400 to-slate-600',
    desc: 'Warna alami foto asli',
  },
  {
    id: 'birds_hearts',
    name: 'Burung Terbang & Love Merah',
    category: 'Viral Cewek ♡',
    previewGradient: 'from-red-500 via-rose-400 to-pink-500',
    desc: 'Burung terbang & love-love merah romantis 🕊️❤️',
  },
  {
    id: 'macbook_squeeze',
    name: 'Mac Squeeze',
    category: 'Classic Mac',
    previewGradient: 'from-blue-400 via-indigo-500 to-purple-600',
    desc: 'Distorsi lengkung Photo Booth',
  },
  {
    id: 'macbook_thermal',
    name: 'Thermal Heatmap',
    category: 'Classic Mac',
    previewGradient: 'from-blue-600 via-yellow-400 to-red-600',
    desc: 'Infrared sensor false-color Mac',
  },
  {
    id: 'macbook_comic',
    name: 'Comic Book',
    category: 'Classic Mac',
    previewGradient: 'from-amber-400 via-rose-500 to-slate-900',
    desc: 'Cel-shading pop art kartun',
  },
  {
    id: 'macbook_popart',
    name: 'Warhol Pop Art',
    category: 'Classic Mac',
    previewGradient: 'from-pink-500 via-yellow-300 to-cyan-400',
    desc: '4 kuadran warna kontras ikonik',
  },
  {
    id: 'y2k_flash',
    name: 'Y2K Flash Glow',
    category: 'Aesthetic',
    previewGradient: 'from-cyan-300 via-white to-indigo-600',
    desc: 'Center flash pop & soft diffusion',
  },
  {
    id: 'vintage_35mm',
    name: '35mm Film Leak',
    category: 'Retro',
    previewGradient: 'from-orange-500 via-amber-400 to-red-600',
    desc: 'Warm analog tone & bocor cahaya',
  },
  {
    id: 'pastel_dream',
    name: 'Pastel Dream',
    category: 'Aesthetic',
    previewGradient: 'from-pink-300 via-rose-200 to-purple-300',
    desc: 'Warna peach lembut & dreamy',
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Neon',
    category: 'Retro',
    previewGradient: 'from-cyan-400 to-fuchsia-500',
    desc: 'Duotone futuristik cyan & magenta',
  },
  {
    id: 'noir_bw',
    name: 'B&W Noir',
    category: 'Retro',
    previewGradient: 'from-white via-slate-500 to-black',
    desc: 'Hitam putih dramatis kontras tinggi',
  },
  {
    id: 'vhs_glitch',
    name: 'VHS 90s Glitch',
    category: 'Retro',
    previewGradient: 'from-red-500 via-green-500 to-blue-500',
    desc: 'Scanline tabung TV & chromatic RGB',
  },
];

export const FilterSelector: React.FC<FilterSelectorProps> = ({ currentFilter, onSelectFilter }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Efek & Filter Shaders
        </h2>
        <span className="text-[11px] text-pink-400 font-medium">
          {FILTERS.find((f) => f.id === currentFilter)?.name}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {FILTERS.map((f) => {
          const isSelected = currentFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                sounds.playPop();
                onSelectFilter(f.id);
              }}
              className={`flex-shrink-0 w-24 p-2 rounded-2xl border text-center transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-slate-800 border-pink-500 ring-2 ring-pink-500/40 shadow-lg shadow-pink-500/10'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {/* Preview Circle */}
              <div
                className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-tr ${f.previewGradient} shadow-inner mb-2 transform transition-transform group-hover:scale-105 border border-white/10 flex items-center justify-center`}
              >
                {isSelected && <span className="text-white text-xs drop-shadow font-bold">✓</span>}
              </div>

              <p className="text-[11px] font-bold text-white tracking-tight truncate">
                {f.name}
              </p>
              <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                {f.category}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
