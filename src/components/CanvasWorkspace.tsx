import React, { useRef, useEffect, useState, useCallback } from 'react';
import type {
  FrameType,
  FilterType,
  PhotoAdjustments,
  FrameSettings,
  StickerItem,
  AspectRatio,
} from '../types';
import { renderCanvas } from '../utils/canvasRenderer';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import type { SampleImage } from '../utils/sampleImages';
import { Move, ZoomIn, ZoomOut, Maximize2, Trash2, RotateCw, Sparkles, Upload, Camera } from 'lucide-react';
import { sounds } from '../utils/sound';

interface CanvasWorkspaceProps {
  image: HTMLImageElement | null;
  frame: FrameType;
  filter: FilterType;
  adjustments: PhotoAdjustments;
  frameSettings: FrameSettings;
  stickers: StickerItem[];
  aspectRatio: AspectRatio;
  onUpdateAdjustments: (updater: (prev: PhotoAdjustments) => PhotoAdjustments) => void;
  onUpdateFrameSettings?: (updater: (prev: FrameSettings) => FrameSettings) => void;
  onUpdateSticker: (id: string, updater: (prev: StickerItem) => StickerItem) => void;
  onRemoveSticker: (id: string) => void;
  onSelectSampleImage: (sample: SampleImage) => void;
  onUploadClick: () => void;
  onOpenCamera?: () => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  image,
  frame,
  filter,
  adjustments,
  frameSettings,
  stickers,
  aspectRatio,
  onUpdateAdjustments,
  onUpdateFrameSettings,
  onUpdateSticker,
  onRemoveSticker,
  onSelectSampleImage,
  onUploadClick,
  onOpenCamera,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingSticker, setIsDraggingSticker] = useState(false);

  // Active pointers tracker for multi-touch (pinch-to-zoom & smooth touch drag)
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);

  // Re-render canvas on any state change
  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    renderCanvas({
      canvas: canvasRef.current,
      image,
      frame,
      filter,
      adjustments,
      frameSettings,
      stickers,
      aspectRatio,
      highRes: false,
    });
  }, [image, frame, filter, adjustments, frameSettings, stickers, aspectRatio]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Unified Pointer Down Handler (Mouse, Touch, Pen)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    // Track active pointer
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Capture pointer to track gestures even if finger leaves canvas boundary
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if not supported
    }

    // 1 Pointer: Single finger or mouse click for dragging photo or sticker
    if (activePointersRef.current.size === 1) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const { width, height } = canvasRef.current;
      const scaleX = width / (rect.width || 1);
      const scaleY = height / (rect.height || 1);
      const canvasX = mouseX * scaleX;
      const canvasY = mouseY * scaleY;

      // Check hit on stickers (in reverse order so top-most is selected)
      let hitSticker: StickerItem | null = null;
      for (let i = stickers.length - 1; i >= 0; i--) {
        const s = stickers[i];
        const sX = (s.x / 100) * width;
        const sY = (s.y / 100) * height;
        // Generous touch hit radius for mobile fingers
        const hitRadius = Math.max(45, 55 * s.scale);
        const dist = Math.hypot(canvasX - sX, canvasY - sY);
        if (dist < hitRadius) {
          hitSticker = s;
          break;
        }
      }

      if (hitSticker) {
        setSelectedStickerId(hitSticker.id);
        setIsDraggingSticker(true);
        setIsDraggingPhoto(false);
        setDragStartPos({ x: e.clientX, y: e.clientY });
        sounds.playPop();
      } else {
        setSelectedStickerId(null);
        setIsDraggingPhoto(true);
        setIsDraggingSticker(false);
        setDragStartPos({ x: e.clientX, y: e.clientY });
      }
    } else if (activePointersRef.current.size >= 2) {
      // 2 or more pointers: Touchscreen Pinch to Zoom!
      setIsDraggingPhoto(false);
      setIsDraggingSticker(false);
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      initialPinchDistRef.current = dist > 0 ? dist : 1;
      initialZoomRef.current = adjustments.zoom;
    }
  };

  // Unified Pointer Move Handler
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Handle 2-Finger Touchscreen Pinch-to-Zoom
    if (activePointersRef.current.size >= 2 && initialPinchDistRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = currentDist / initialPinchDistRef.current;
      const targetZoom = Math.max(0.5, Math.min(3.0, initialZoomRef.current * ratio));
      onUpdateAdjustments((prev) => ({
        ...prev,
        zoom: Math.round(targetZoom * 100) / 100,
      }));
      return;
    }

    // 1-Pointer Dragging Photo
    if (isDraggingPhoto) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleRatio = rect.width > 0 ? canvasRef.current.width / rect.width : 1;
      const dx = (e.clientX - dragStartPos.x) * scaleRatio;
      const dy = (e.clientY - dragStartPos.y) * scaleRatio;
      setDragStartPos({ x: e.clientX, y: e.clientY });
      onUpdateAdjustments((prev) => ({
        ...prev,
        panX: prev.panX + dx,
        panY: prev.panY + dy,
      }));
    } else if (isDraggingSticker && selectedStickerId) {
      // 1-Pointer Dragging Sticker
      const rect = canvasRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragStartPos.x) / (rect.width || 1)) * 100;
      const dy = ((e.clientY - dragStartPos.y) / (rect.height || 1)) * 100;
      setDragStartPos({ x: e.clientX, y: e.clientY });

      onUpdateSticker(selectedStickerId, (prev) => ({
        ...prev,
        x: Math.max(2, Math.min(98, prev.x + dx)),
        y: Math.max(2, Math.min(98, prev.y + dy)),
      }));
    }
  };

  // Unified Pointer Up & Cancel Handler
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointersRef.current.delete(e.pointerId);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    if (activePointersRef.current.size < 2) {
      initialPinchDistRef.current = null;
    }
    if (activePointersRef.current.size === 0) {
      setIsDraggingPhoto(false);
      setIsDraggingSticker(false);
    }
  };

  // Zoom helpers
  const handleZoom = (delta: number) => {
    sounds.playPop();
    onUpdateAdjustments((prev) => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(3.0, prev.zoom + delta)),
    }));
  };

  const handleResetPosition = () => {
    sounds.playPop();
    onUpdateAdjustments((prev) => ({
      ...prev,
      zoom: 1,
      panX: 0,
      panY: 0,
      rotation: 0,
    }));
  };

  const selectedSticker = stickers.find((s) => s.id === selectedStickerId);

  return (
    <div className="flex flex-col h-full items-center justify-between gap-3">
      {/* Sample Presets Quick-Bar */}
      <div className="w-full flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Coba Foto Lucu:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-nowrap">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                sounds.playPop();
                onSelectSampleImage(sample);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 text-xs font-semibold cursor-pointer hover:border-pink-500/50 transition-all flex-shrink-0"
            >
              <span>{sample.emoji}</span>
              <span>{sample.name}</span>
            </button>
          ))}
          <button
            onClick={() => {
              sounds.playPop();
              onUploadClick();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold cursor-pointer transition-all flex-shrink-0"
          >
            <Upload className="w-3 h-3" />
            <span>Upload Foto</span>
          </button>
          {onOpenCamera && (
            <button
              onClick={() => {
                sounds.playPop();
                onOpenCamera();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold cursor-pointer transition-all flex-shrink-0"
            >
              <Camera className="w-3 h-3 text-purple-400" />
              <span>Buka Kamera</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        style={{ touchAction: 'none' }}
        className="relative w-full h-[48vh] min-h-[300px] max-h-[480px] sm:h-[55vh] sm:max-h-[560px] lg:h-[620px] lg:max-h-[660px] flex items-center justify-center p-2 sm:p-5 bg-[#070a11]/90 rounded-2xl sm:rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden backdrop-blur-md touch-none select-none"
      >
        {/* Subtle grid backdrop pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="relative max-w-full max-h-full flex items-center justify-center shadow-2xl rounded-2xl overflow-visible">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'none' }}
            className={`max-w-full max-h-[42vh] sm:max-h-[50vh] lg:max-h-[560px] w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10 touch-none select-none ${
              isDraggingPhoto
                ? 'cursor-grabbing'
                : selectedStickerId
                ? 'cursor-move'
                : 'cursor-grab'
            }`}
          />

          {/* Floating Action Badge on top of canvas for selected sticker */}
          {selectedSticker && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex items-center gap-1 sm:gap-1.5 bg-slate-900/95 backdrop-blur-md border border-pink-500/50 px-2 sm:px-3 py-1 rounded-full shadow-xl animate-in fade-in max-w-[94%]">
              <span className="text-xs text-pink-300 font-bold max-w-[80px] sm:max-w-none truncate">
                {selectedSticker.content}
              </span>

              {/* Rotate sticker */}
              <button
                onClick={() => {
                  sounds.playPop();
                  onUpdateSticker(selectedSticker.id, (prev) => ({
                    ...prev,
                    rotation: (prev.rotation + 15) % 360,
                  }));
                }}
                title="Putar Stiker"
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-pink-400" />
              </button>

              {/* Scale Up */}
              <button
                onClick={() => {
                  sounds.playPop();
                  onUpdateSticker(selectedSticker.id, (prev) => ({
                    ...prev,
                    scale: Math.min(3, prev.scale + 0.2),
                  }));
                }}
                title="Perbesar Stiker"
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                +
              </button>

              {/* Scale Down */}
              <button
                onClick={() => {
                  sounds.playPop();
                  onUpdateSticker(selectedSticker.id, (prev) => ({
                    ...prev,
                    scale: Math.max(0.4, prev.scale - 0.2),
                  }));
                }}
                title="Perkecil Stiker"
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                -
              </button>

              {/* Delete */}
              <button
                onClick={() => {
                  sounds.playPop();
                  onRemoveSticker(selectedSticker.id);
                  setSelectedStickerId(null);
                }}
                title="Hapus Stiker"
                className="w-7 h-7 rounded-full hover:bg-rose-500/20 text-rose-400 flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Floating Quick Navigation Toolbars */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 bg-slate-900/95 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-700/80 shadow-2xl max-w-[96%] overflow-x-auto no-scrollbar z-20">
          <button
            onClick={() => handleZoom(-0.15)}
            title="Zoom Out"
            className="p-1 sm:p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-300 px-0.5 sm:px-1">
            {Math.round(adjustments.zoom * 100)}%
          </span>

          <button
            onClick={() => handleZoom(0.15)}
            title="Zoom In"
            className="p-1 sm:p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <div className="w-[1px] h-3.5 sm:h-4 bg-slate-700 mx-0.5 sm:mx-1" />

          <button
            onClick={handleResetPosition}
            title="Reset Posisi & Zoom"
            className="p-1 sm:p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>

          {/* Quick iPhone Frame Scale Control directly on canvas */}
          {frame === 'iphone' && onUpdateFrameSettings && (
            <>
              <div className="w-[1px] h-3.5 sm:h-4 bg-slate-700 mx-0.5 sm:mx-1" />
              <div className="flex items-center gap-0.5 sm:gap-1">
                <span className="text-[10px] sm:text-[11px] text-amber-400 font-bold hidden sm:inline">📱 Frame:</span>
                <button
                  onClick={() => {
                    sounds.playPop();
                    onUpdateFrameSettings((prev) => ({
                      ...prev,
                      iphoneFrameScale: Math.max(0.5, Math.round(((prev.iphoneFrameScale ?? 1.0) - 0.1) * 10) / 10),
                    }));
                  }}
                  title="Perkecil Skala Frame iPhone"
                  className="w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-amber-300 min-w-[28px] sm:min-w-[34px] text-center">
                  {Math.round((frameSettings.iphoneFrameScale ?? 1.0) * 100)}%
                </span>
                <button
                  onClick={() => {
                    sounds.playPop();
                    onUpdateFrameSettings((prev) => ({
                      ...prev,
                      iphoneFrameScale: Math.min(1.5, Math.round(((prev.iphoneFrameScale ?? 1.0) + 0.1) * 10) / 10),
                    }));
                  }}
                  title="Perbesar Skala Frame iPhone"
                  className="w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </>
          )}

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 pl-1 whitespace-nowrap">
            <Move className="w-3 h-3 text-pink-400" />
            <span className="hidden sm:inline">Tahan & Geser Foto</span>
            <span className="sm:hidden">Geser • Cubit Zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
};
