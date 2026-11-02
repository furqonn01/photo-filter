import React, { useState } from 'react';
import type {
  FrameType,
  FilterType,
  PhotoAdjustments,
  FrameSettings,
  StickerItem,
  AspectRatio,
} from '../types';
import { renderCanvas } from '../utils/canvasRenderer';
import { Download, Copy, Check, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/sound';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: HTMLImageElement | null;
  frame: FrameType;
  filter: FilterType;
  adjustments: PhotoAdjustments;
  frameSettings: FrameSettings;
  stickers: StickerItem[];
  aspectRatio: AspectRatio;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  image,
  frame,
  filter,
  adjustments,
  frameSettings,
  stickers,
  aspectRatio,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#a855f7', '#38bdf8', '#facc15'],
    });
  };

  const getExportCanvas = (): HTMLCanvasElement => {
    const exportCanvas = document.createElement('canvas');
    renderCanvas({
      canvas: exportCanvas,
      image,
      frame,
      filter,
      adjustments,
      frameSettings,
      stickers,
      aspectRatio,
      highRes: true, // Export in high resolution!
    });
    return exportCanvas;
  };

  const handleDownload = () => {
    setIsExporting(true);
    try {
      const canvas = getExportCanvas();
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mime, 0.95);

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
      link.download = `retrosnap_${frame}_${timestamp}.${format}`;
      link.href = dataUrl;
      link.click();

      sounds.playChime();
      triggerConfetti();
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const canvas = getExportCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopied(true);
          sounds.playChime();
          triggerConfetti();
          setTimeout(() => setCopied(false), 3000);
        } catch (err) {
          console.error('Clipboard copy error:', err);
          alert('Browser ini tidak mengizinkan salin gambar langsung ke clipboard. Silakan gunakan tombol Unduh.');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Simpan & Bagikan Foto</h3>
              <p className="text-xs text-slate-400">Kualitas tinggi untuk Instagram & Sosmed</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Format Gambar</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sounds.playPop();
                setFormat('png');
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                format === 'png'
                  ? 'bg-pink-500/20 border-pink-500 text-white'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs flex items-center justify-between">
                <span>PNG (Lossless)</span>
                {format === 'png' && <span className="text-pink-400">✓</span>}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Kualitas tajam & jernih</p>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setFormat('jpeg');
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                format === 'jpeg'
                  ? 'bg-pink-500/20 border-pink-500 text-white'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs flex items-center justify-between">
                <span>JPG (Ringan)</span>
                {format === 'jpeg' && <span className="text-pink-400">✓</span>}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Ukuran file lebih hemat</p>
            </button>
          </div>
        </div>

        {/* Feature summary */}
        <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>Resolusi Tinggi (HD 2x Canvas Engine)</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Frame, Efek & Stiker menyatu utuh</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 transition cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Gambar {format.toUpperCase()}</span>
          </button>

          {/* Copy to clipboard button */}
          <button
            onClick={handleCopyToClipboard}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Salin Gambar (Siap Paste ke WA/IG)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
