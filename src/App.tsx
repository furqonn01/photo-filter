import React, { useState, useRef, useEffect } from 'react';
import type {
  FrameType,
  FilterType,
  PhotoAdjustments,
  FrameSettings,
  StickerItem,
  AspectRatio,
} from './types';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import type { SampleImage } from './utils/sampleImages';
import { sounds } from './utils/sound';
import { Header } from './components/Header';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { FrameSelector } from './components/FrameSelector';
import { FilterSelector } from './components/FilterSelector';
import { FrameCustomizer } from './components/FrameCustomizer';
import { AdjustmentsPanel } from './components/AdjustmentsPanel';
import { StickerPanel } from './components/StickerPanel';
import { CameraModal } from './components/CameraModal';
import { ExportModal } from './components/ExportModal';
import { Laptop, Sparkles, Sliders, Smile, Settings2 } from 'lucide-react';

const INITIAL_ADJUSTMENTS: PhotoAdjustments = {
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
};

const INITIAL_FRAME_SETTINGS: FrameSettings = {
  macbookTitle: 'Photo Booth',
  macbookDark: false,
  iphoneGrid: true,
  iphoneCameraMode: 'PHOTO',
  iphoneZoomBadge: '1x',
  iphoneShowFocus: true,
  iphoneFrameScale: 1.0,
  reelsUsername: '@cutie.vibes',
  reelsCaption: 'Weekend vibes check ✨ #cutecore #reels',
  reelsLikes: '348.2K',
  reelsComments: '2,154',
  reelsAudio: 'Original Audio - Lo-Fi Acoustic Chill',
  digicamDate: '2004. 11. 02  21:30',
  digicamBattery: 100,
  digicamRec: true,
  photoboothColor: '#fbcfe8',
  photoboothText: '인생네컷 ♡ HARU FILM',
  photoboothDate: '2026. 11. 02  MEMORIES',
  polaroidCaption: 'Sweet Memories ♡',
  polaroidColor: '#ffffff',
  musicSongTitle: 'Cute Daydream',
  musicArtist: 'Lofi Chill Beats',
  musicProgress: 42,
};

export function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [frame, setFrame] = useState<FrameType>('macbook');
  const [filter, setFilter] = useState<FilterType>('normal');
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(INITIAL_ADJUSTMENTS);
  const [frameSettings, setFrameSettings] = useState<FrameSettings>(INITIAL_FRAME_SETTINGS);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:3');

  const [activeTab, setActiveTab] = useState<'frames' | 'filters' | 'customize' | 'adjust' | 'stickers'>('frames');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sample image on initial mount
  useEffect(() => {
    loadImageFromUrl(SAMPLE_IMAGES[0].dataUrl);
  }, []);

  const loadImageFromUrl = (url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
    };
    img.src = url;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadImageFromUrl(event.target.result as string);
          sounds.playPop();
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop file support
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadImageFromUrl(event.target.result as string);
          sounds.playPop();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Switch Frame with smart Aspect Ratio adjustments
  const handleSelectFrame = (newFrame: FrameType) => {
    setFrame(newFrame);
    if (newFrame === 'iphone' || newFrame === 'reels') {
      setAspectRatio('9:16');
    } else if (newFrame === 'macbook' || newFrame === 'digicam') {
      setAspectRatio('4:3');
    } else if (newFrame === 'polaroid' || newFrame === 'photobooth_4cut' || newFrame === 'music_player') {
      setAspectRatio('4:5');
    } else if (newFrame === 'gameboy') {
      setAspectRatio('1:1');
    }
  };

  const handleResetAll = () => {
    setAdjustments(INITIAL_ADJUSTMENTS);
    setFrameSettings(INITIAL_FRAME_SETTINGS);
    setFilter('normal');
    setStickers([]);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-pink-500 selection:text-white"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <Header
        onOpenCamera={() => setIsCameraOpen(true)}
        onUploadClick={handleTriggerUpload}
        onExportClick={() => setIsExportOpen(true)}
        onReset={handleResetAll}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">
        {/* Left Column: Canvas Preview Workspace (8 Cols) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <CanvasWorkspace
            image={image}
            frame={frame}
            filter={filter}
            adjustments={adjustments}
            frameSettings={frameSettings}
            stickers={stickers}
            aspectRatio={aspectRatio}
            onUpdateAdjustments={setAdjustments}
            onUpdateFrameSettings={setFrameSettings}
            onUpdateSticker={(id, updater) =>
              setStickers((prev) => prev.map((s) => (s.id === id ? updater(s) : s)))
            }
            onRemoveSticker={(id) =>
              setStickers((prev) => prev.filter((s) => s.id !== id))
            }
            onSelectSampleImage={(sample: SampleImage) => loadImageFromUrl(sample.dataUrl)}
            onUploadClick={handleTriggerUpload}
            onOpenCamera={() => setIsCameraOpen(true)}
          />
        </section>

        {/* Right Column: Controls & Filter Panels (5 Cols) */}
        <aside className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-3.5">
          {/* Navigation Pill Tabs */}
          <div className="sticky top-[56px] sm:top-[64px] z-30 lg:static flex bg-slate-900/95 p-1 sm:p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md overflow-x-auto no-scrollbar gap-1 text-xs shadow-lg lg:shadow-none">
            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('frames');
              }}
              className={`flex-1 min-w-[62px] sm:min-w-[70px] py-2 px-2 sm:px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'frames'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Frame</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('filters');
              }}
              className={`flex-1 min-w-[62px] sm:min-w-[70px] py-2 px-2 sm:px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'filters'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            {frame !== 'none' && (
              <button
                onClick={() => {
                  sounds.playPop();
                  setActiveTab('customize');
                }}
                className={`flex-1 min-w-[62px] sm:min-w-[70px] py-2 px-2 sm:px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'customize'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Kustom</span>
              </button>
            )}

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('adjust');
              }}
              className={`flex-1 min-w-[62px] sm:min-w-[70px] py-2 px-2 sm:px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'adjust'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Slider</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('stickers');
              }}
              className={`flex-1 min-w-[62px] sm:min-w-[70px] py-2 px-2 sm:px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'stickers'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Stiker</span>
            </button>
          </div>

          {/* Active Tab Panel Content */}
          <div className="flex-1 space-y-3.5 lg:overflow-y-auto lg:max-h-[640px] pr-0.5 pb-10 lg:pb-0">
            {activeTab === 'frames' && (
              <>
                <FrameSelector currentFrame={frame} onSelectFrame={handleSelectFrame} />
                <FrameCustomizer
                  currentFrame={frame}
                  settings={frameSettings}
                  onUpdateSettings={setFrameSettings}
                />
              </>
            )}

            {activeTab === 'filters' && (
              <FilterSelector currentFilter={filter} onSelectFilter={setFilter} />
            )}

            {activeTab === 'customize' && (
              <FrameCustomizer
                currentFrame={frame}
                settings={frameSettings}
                onUpdateSettings={setFrameSettings}
              />
            )}

            {activeTab === 'adjust' && (
              <AdjustmentsPanel
                adjustments={adjustments}
                onChange={setAdjustments}
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                frame={frame}
              />
            )}

            {activeTab === 'stickers' && (
              <StickerPanel
                stickers={stickers}
                onAddSticker={(s) => setStickers((prev) => [...prev, s])}
                onRemoveSticker={(id) =>
                  setStickers((prev) => prev.filter((s) => s.id !== id))
                }
                onClearStickers={() => setStickers([])}
              />
            )}
          </div>
        </aside>
      </main>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => loadImageFromUrl(dataUrl)}
      />

      {/* Export / Download Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        image={image}
        frame={frame}
        filter={filter}
        adjustments={adjustments}
        frameSettings={frameSettings}
        stickers={stickers}
        aspectRatio={aspectRatio}
      />
    </div>
  );
}

export default App;
