import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Timer, AlertCircle, Smartphone, Loader2 } from 'lucide-react';
import { sounds } from '../utils/sound';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [countdownSetting, setCountdownSetting] = useState<0 | 3 | 5>(3);
  const [currentCountdown, setCurrentCountdown] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [flash, setFlash] = useState(false);

  // Stop active camera stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsVideoReady(false);
  }, []);

  // Robust Tiered Camera Stream Acquisition
  const startStream = useCallback(async (desiredFacing: 'user' | 'environment') => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsVideoReady(false);

    // Stop existing stream first
    stopStream();

    // Check WebRTC support
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg(
        'Browser tidak mengizinkan akses WebRTC langsung (biasanya karena koneksi HTTP pada jaringan lokal). Klik tombol "Buka Kamera HP" di bawah.'
      );
      setIsLoading(false);
      return;
    }

    let acquiredStream: MediaStream | null = null;

    // Attempt 1: Ideal facingMode + 720p HD resolution
    try {
      acquiredStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: desiredFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err1) {
      console.warn('Camera Attempt 1 (HD) failed, trying Attempt 2 (Relaxed):', err1);
      // Attempt 2: Relaxed resolution with ideal facingMode
      try {
        acquiredStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: desiredFacing } },
          audio: false,
        });
      } catch (err2) {
        console.warn('Camera Attempt 2 (Relaxed) failed, trying Attempt 3 (Generic fallback):', err2);
        // Attempt 3: Generic basic video constraint (universal for all laptop & USB webcams)
        try {
          acquiredStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err3: unknown) {
          console.error('All camera attempts failed:', err3);
          const e = err3 as Error;
          if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
            setErrorMsg('Izin akses kamera belum diizinkan. Klik ikon gembok/kamera di samping URL browser Anda dan pilih "Izinkan" (Allow).');
          } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
            setErrorMsg('Kamera/Webcam tidak ditemukan. Jika menggunakan HP, gunakan tombol "Kamera Bawaan HP" di bawah.');
          } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
            setErrorMsg('Kamera sedang dipakai oleh aplikasi lain (seperti Zoom atau browser lain). Tutup aplikasi tersebut lalu coba lagi.');
          } else {
            setErrorMsg(`Tidak dapat mengakses kamera (${e.message || 'Error'}). Silakan gunakan tombol Kamera Bawaan HP.`);
          }
          setIsLoading(false);
          return;
        }
      }
    }

    if (acquiredStream) {
      streamRef.current = acquiredStream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = acquiredStream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;

        video.onloadedmetadata = () => {
          video
            .play()
            .then(() => {
              setIsVideoReady(true);
              setIsLoading(false);
            })
            .catch((playErr) => {
              console.warn('Video play error:', playErr);
              setIsVideoReady(true);
              setIsLoading(false);
            });
        };
      } else {
        setIsLoading(false);
      }
    }
  }, [stopStream]);

  // Launch camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startStream(facingMode);
    } else {
      stopStream();
      setCurrentCountdown(null);
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startStream, stopStream]);

  // Fallback / Mobile Native Camera Capture via file input
  const handleNativeCameraClick = () => {
    sounds.playPop();
    nativeCameraInputRef.current?.click();
  };

  const handleNativeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          sounds.playShutter();
          onCapture(event.target.result as string);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Handle countdown & capture
  const takeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('Video not ready yet for snapshot');
      return;
    }

    // Trigger visual flash
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    // Audio shutter sound
    sounds.playShutter();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror if front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onCapture(dataUrl);
      onClose();
    }
  };

  const handleStartCapture = () => {
    if (countdownSetting === 0) {
      takeSnapshot();
      return;
    }

    setCurrentCountdown(countdownSetting);
    sounds.playBeep(false);

    let count = countdownSetting;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCurrentCountdown(count);
        sounds.playBeep(false);
      } else {
        clearInterval(interval);
        setCurrentCountdown(null);
        sounds.playBeep(true);
        takeSnapshot();
      }
    }, 1000);
  };

  const toggleFacingMode = () => {
    sounds.playPop();
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in">
      {/* Hidden Native Camera File Input for Mobile / Tablet */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture={facingMode === 'user' ? 'user' : 'environment'}
        onChange={handleNativeCapture}
        className="hidden"
      />

      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Flash overlay */}
        {flash && (
          <div className="absolute inset-0 z-40 bg-white pointer-events-none animate-out fade-out duration-300" />
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-pink-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">Ambil Foto Langsung</h3>
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

        {/* Viewfinder Video Area */}
        <div className="relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300 z-10 bg-slate-950/80">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              <p className="text-xs font-semibold">Menghubungkan ke kamera...</p>
            </div>
          )}

          {errorMsg ? (
            <div className="p-6 text-center max-w-md space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <div className="space-y-1.5">
                <p className="text-sm text-slate-200 font-semibold">{errorMsg}</p>
                <p className="text-xs text-slate-400">
                  Untuk pengguna laptop, periksa izin kamera browser. Untuk pengguna HP, gunakan tombol di bawah.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => startStream(facingMode)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700"
                >
                  Coba Ulang Kamera
                </button>
                <button
                  onClick={handleNativeCameraClick}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-4 h-4" /> Buka Kamera HP
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Viewfinder crosshair */}
              {isVideoReady && (
                <div className="absolute inset-0 pointer-events-none border border-white/20 m-6 rounded-2xl flex items-center justify-center">
                  <div className="w-10 h-10 border border-white/40 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                  </div>
                </div>
              )}

              {/* Countdown big badge */}
              {currentCountdown !== null && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                  <div className="w-24 h-24 rounded-full bg-pink-500 text-white flex items-center justify-center text-5xl font-black shadow-2xl animate-ping duration-1000">
                    {currentCountdown}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 flex items-center justify-between gap-2 sm:gap-4 border-t border-slate-800">
          {/* Countdown toggle */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                sounds.playPop();
                setCountdownSetting(0);
              }}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                countdownSetting === 0 ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              0s
            </button>
            <button
              onClick={() => {
                sounds.playPop();
                setCountdownSetting(3);
              }}
              className={`px-2 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer ${
                countdownSetting === 3 ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Timer className="w-3 h-3" /> 3s
            </button>
            <button
              onClick={() => {
                sounds.playPop();
                setCountdownSetting(5);
              }}
              className={`px-2 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer ${
                countdownSetting === 5 ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Timer className="w-3 h-3" /> 5s
            </button>
          </div>

          {/* Shutter Button */}
          <button
            onClick={handleStartCapture}
            disabled={!isVideoReady || currentCountdown !== null}
            title="Ambil Foto"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-white flex items-center justify-center bg-pink-500 hover:bg-pink-600 active:scale-95 transition-all shadow-xl shadow-pink-500/30 cursor-pointer disabled:opacity-50"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
            </div>
          </button>

          {/* Right Controls: Flip & Mobile Camera Fallback */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleFacingMode}
              title="Balik Kamera Depan / Belakang"
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNativeCameraClick}
              title="Gunakan Kamera HP Bawaan"
              className="p-2.5 sm:p-3 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 transition cursor-pointer flex items-center gap-1"
            >
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
