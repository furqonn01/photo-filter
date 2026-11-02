import type {
  FrameType,
  FilterType,
  PhotoAdjustments,
  FrameSettings,
  StickerItem,
  AspectRatio,
} from '../types';
import { applyCanvasAdjustments, applySpecialFilter } from './filters';

export interface RenderCanvasOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement | null;
  frame: FrameType;
  filter: FilterType;
  adjustments: PhotoAdjustments;
  frameSettings: FrameSettings;
  stickers: StickerItem[];
  aspectRatio: AspectRatio;
  highRes?: boolean; // true when downloading
}

export function getCanvasDimensions(
  aspectRatio: AspectRatio,
  image: HTMLImageElement | null,
  frame: FrameType,
  highRes = false
): { width: number; height: number } {
  // 1. iPhone Camera Viewfinder: Standard 9:16 portrait format (540x960 preview / 1080x1920 highRes)
  if (frame === 'iphone') {
    const baseW = highRes ? 1080 : 540;
    return { width: baseW, height: Math.round((baseW * 16) / 9) };
  }

  // 2. Reels / TikTok: Standard 9:16 vertical format (540x960 preview / 1080x1920 highRes)
  if (frame === 'reels') {
    const baseW = highRes ? 1080 : 540;
    return { width: baseW, height: Math.round((baseW * 16) / 9) };
  }

  // 3. MacBook Photo Booth: Standard 4:3 inner view + title & bottom bars (640x556 preview / 1280x1112 highRes)
  if (frame === 'macbook') {
    const baseW = highRes ? 1280 : 640;
    const topBarHeight = highRes ? 60 : 30;
    const bottomBarHeight = highRes ? 92 : 46;
    return { width: baseW, height: Math.round((baseW * 3) / 4) + topBarHeight + bottomBarHeight };
  }

  // 4. Digicam 2000s: Standard 4:3 vintage CCD screen format (600x450 preview / 1200x900 highRes)
  if (frame === 'digicam') {
    const baseW = highRes ? 1200 : 600;
    return { width: baseW, height: Math.round((baseW * 3) / 4) };
  }

  // 5. Photobooth 4-cut vertical strip (인생네컷): Standard 2:3 ratio (450x675 preview / 900x1350 highRes)
  if (frame === 'photobooth_4cut') {
    const baseW = highRes ? 900 : 450;
    return { width: baseW, height: Math.round(baseW * 1.5) };
  }

  // 6. Polaroid: Standard 4:5 classic format (500x625 preview / 1000x1250 highRes)
  if (frame === 'polaroid') {
    const baseW = highRes ? 1000 : 500;
    return { width: baseW, height: Math.round(baseW * 1.25) };
  }

  // 7. Retro Music Player (iPod): Standard 3:4 format (540x720 preview / 1080x1440 highRes)
  if (frame === 'music_player') {
    const baseW = highRes ? 1080 : 540;
    return { width: baseW, height: Math.round((baseW * 4) / 3) };
  }

  // 8. Game Boy Camera: Standard 10:9 retro handheld ratio (480x533 preview / 960x1067 highRes)
  if (frame === 'gameboy') {
    const baseW = highRes ? 960 : 480;
    return { width: baseW, height: Math.round((baseW * 10) / 9) };
  }

  // 9. Frame 'none' (or free canvas): Custom user aspect ratio
  const base = highRes ? 1200 : 600;

  switch (aspectRatio) {
    case '1:1':
      return { width: base, height: base };
    case '4:5':
      return { width: base, height: Math.round((base * 5) / 4) };
    case '9:16':
      return { width: Math.round((base * 9) / 16), height: base };
    case '4:3':
      return { width: base, height: Math.round((base * 3) / 4) };
    case 'original':
    default:
      if (image && image.naturalWidth && image.naturalHeight) {
        const ratio = image.naturalHeight / image.naturalWidth;
        return { width: base, height: Math.round(base * ratio) };
      }
      return { width: base, height: base };
  }
}

// Main Canvas Render Pipeline
export function renderCanvas({
  canvas,
  image,
  frame,
  filter,
  adjustments,
  frameSettings,
  stickers,
  aspectRatio,
  highRes = false,
}: RenderCanvasOptions) {
  const { width, height } = getCanvasDimensions(aspectRatio, image, frame, highRes);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Determine viewport bounds for the photo based on frame
  let photoBounds = { x: 0, y: 0, w: width, h: height, radius: 0 };

  if (frame === 'macbook') {
    const topBarHeight = highRes ? 60 : 30;
    const bottomBarHeight = highRes ? 92 : 46;
    photoBounds = {
      x: 0,
      y: topBarHeight,
      w: width,
      h: height - topBarHeight - bottomBarHeight,
      radius: 0,
    };
  } else if (frame === 'polaroid') {
    const pad = width * 0.08;
    const bottomPad = width * 0.28;
    photoBounds = {
      x: pad,
      y: pad,
      w: width - pad * 2,
      h: height - pad - bottomPad,
      radius: 4,
    };
  } else if (frame === 'photobooth_4cut') {
    const pad = width * 0.07;
    const bottomPad = width * 0.22;
    photoBounds = {
      x: pad,
      y: pad,
      w: width - pad * 2,
      h: height - pad - bottomPad,
      radius: 12,
    };
  } else if (frame === 'gameboy') {
    const pad = 24 * (highRes ? 2 : 1);
    photoBounds = {
      x: pad,
      y: pad,
      w: width - pad * 2,
      h: height - pad * 2,
      radius: 8,
    };
  }

  // Draw background frame base (e.g. for polaroid / photobooth / macbook)
  drawFrameBackground(ctx, width, height, frame, frameSettings, highRes);

  // Draw Photo
  if (image && image.complete && image.naturalWidth > 0) {
    ctx.save();
    // Clip to photo area
    ctx.beginPath();
    if (photoBounds.radius > 0) {
      roundRect(ctx, photoBounds.x, photoBounds.y, photoBounds.w, photoBounds.h, photoBounds.radius);
    } else {
      ctx.rect(photoBounds.x, photoBounds.y, photoBounds.w, photoBounds.h);
    }
    ctx.clip();

    // Offscreen canvas for photo with CSS filters (brightness, contrast, saturation)
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = photoBounds.w;
    photoCanvas.height = photoBounds.h;
    const pCtx = photoCanvas.getContext('2d');

    if (pCtx) {
      pCtx.save();
      // Apply CSS basic filters
      pCtx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;

      // Transform context for pan, zoom, rotate, flip
      pCtx.translate(photoBounds.w / 2 + adjustments.panX, photoBounds.h / 2 + adjustments.panY);
      pCtx.rotate((adjustments.rotation * Math.PI) / 180);
      pCtx.scale(
        adjustments.zoom * (adjustments.flipH ? -1 : 1),
        adjustments.zoom * (adjustments.flipV ? -1 : 1)
      );

      // Fit image cover
      const imgAspect = image.naturalWidth / image.naturalHeight;
      const boxAspect = photoBounds.w / photoBounds.h;
      let drawW, drawH;
      if (imgAspect > boxAspect) {
        drawH = photoBounds.h;
        drawW = drawH * imgAspect;
      } else {
        drawW = photoBounds.w;
        drawH = drawW / imgAspect;
      }

      pCtx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
      pCtx.restore();

      // Apply special canvas filters (Thermal, Comic, Warhol, Y2K Flash, Vintage, etc.)
      applySpecialFilter(pCtx, photoBounds.w, photoBounds.h, filter);

      // Apply warmth, grain, vignette
      applyCanvasAdjustments(pCtx, photoBounds.w, photoBounds.h, adjustments);

      // Draw processed photo onto main canvas
      ctx.drawImage(photoCanvas, photoBounds.x, photoBounds.y);
    }
    ctx.restore();

    // Special Overlay Effect: Burung Terbang & Love-Love Merah (for girls / aesthetic)
    if (filter === 'birds_hearts') {
      drawBirdsAndHeartsEffect(ctx, photoBounds, highRes ? 2 : 1);
    }
  } else {
    // Empty state placeholder inside photo bounds
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(photoBounds.x, photoBounds.y, photoBounds.w, photoBounds.h);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pilih atau Ambil Foto', photoBounds.x + photoBounds.w / 2, photoBounds.y + photoBounds.h / 2);
    ctx.restore();

    if (filter === 'birds_hearts') {
      drawBirdsAndHeartsEffect(ctx, photoBounds, highRes ? 2 : 1);
    }
  }

  // Draw Frame UI & Overlays (MacBook bar, iPhone viewfinder, Reels icons, Digicam OSD)
  drawFrameForeground(ctx, width, height, frame, photoBounds, frameSettings, highRes);

  // Draw Stickers & Custom Texts
  drawStickers(ctx, photoBounds, stickers, highRes);
}

// Rounded rectangle helper
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Background for frames like Polaroid or Photobooth
function drawFrameBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: FrameType,
  settings: FrameSettings,
  _highRes: boolean
) {
  if (frame === 'polaroid') {
    ctx.fillStyle = settings.polaroidColor || '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle paper texture drop shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
  } else if (frame === 'photobooth_4cut') {
    // Photobooth pastel backdrop
    ctx.fillStyle = settings.photoboothColor || '#fbcfe8';
    ctx.fillRect(0, 0, width, height);

    // Subtle cute pattern (tiny dots)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    const dotSpacing = 28;
    for (let x = 14; x < width; x += dotSpacing) {
      for (let y = 14; y < height; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (frame === 'macbook') {
    ctx.fillStyle = settings.macbookDark ? '#1e1e1e' : '#e2e8f0';
    ctx.fillRect(0, 0, width, height);
  }
}

// Frame UI & Overlays
function drawFrameForeground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: FrameType,
  photoBounds: { x: number; y: number; w: number; h: number },
  settings: FrameSettings,
  highRes: boolean
) {
  const scale = highRes ? 2 : 1;

  switch (frame) {
    case 'macbook': {
      const topH = 30 * scale;
      const bottomH = 46 * scale;
      const isDark = settings.macbookDark;

      // Top Title Bar with realistic macOS gradient
      const topGrad = ctx.createLinearGradient(0, 0, 0, topH);
      if (isDark) {
        topGrad.addColorStop(0, '#323234');
        topGrad.addColorStop(1, '#1e1e20');
      } else {
        topGrad.addColorStop(0, '#f2f2f3');
        topGrad.addColorStop(1, '#dbdbdc');
      }
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, topH);

      // Traffic Lights (Red, Yellow, Green) with authentic macOS icons
      const dotY = topH / 2;
      const dotR = 6 * scale;
      const dots = [
        { x: 18 * scale, c: '#ff5f56', border: '#e0443e', type: 'close' },
        { x: 38 * scale, c: '#ffbd2e', border: '#dea123', type: 'min' },
        { x: 58 * scale, c: '#27c93f', border: '#1aab29', type: 'max' },
      ];

      dots.forEach((dot) => {
        // Base circle
        ctx.beginPath();
        ctx.arc(dot.x, dotY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = dot.c;
        ctx.fill();
        ctx.strokeStyle = dot.border;
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();

        // Inner authentic glyphs
        ctx.save();
        ctx.lineWidth = 1 * scale;
        ctx.lineCap = 'round';
        if (dot.type === 'close') {
          ctx.strokeStyle = 'rgba(77, 0, 0, 0.65)';
          const crossSize = 2.4 * scale;
          ctx.beginPath();
          ctx.moveTo(dot.x - crossSize, dotY - crossSize);
          ctx.lineTo(dot.x + crossSize, dotY + crossSize);
          ctx.moveTo(dot.x + crossSize, dotY - crossSize);
          ctx.lineTo(dot.x - crossSize, dotY + crossSize);
          ctx.stroke();
        } else if (dot.type === 'min') {
          ctx.strokeStyle = 'rgba(92, 61, 0, 0.7)';
          const minLen = 2.6 * scale;
          ctx.beginPath();
          ctx.moveTo(dot.x - minLen, dotY);
          ctx.lineTo(dot.x + minLen, dotY);
          ctx.stroke();
        } else if (dot.type === 'max') {
          ctx.strokeStyle = 'rgba(0, 77, 0, 0.7)';
          const arrowS = 2.2 * scale;
          ctx.beginPath();
          ctx.moveTo(dot.x - arrowS, dotY + arrowS);
          ctx.lineTo(dot.x + arrowS, dotY - arrowS);
          ctx.lineTo(dot.x + arrowS, dotY - arrowS + 2 * scale);
          ctx.moveTo(dot.x + arrowS, dotY - arrowS);
          ctx.lineTo(dot.x + arrowS - 2 * scale, dotY - arrowS);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Window Title with camera icon
      ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
      ctx.font = `600 ${12 * scale}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(settings.macbookTitle || 'Photo Booth', width / 2, dotY);

      // Bottom Control Bar
      const botY = height - bottomH;
      const botGrad = ctx.createLinearGradient(0, botY, 0, height);
      if (isDark) {
        botGrad.addColorStop(0, '#28282b');
        botGrad.addColorStop(1, '#1a1a1c');
      } else {
        botGrad.addColorStop(0, '#e5e5e6');
        botGrad.addColorStop(1, '#cccccc');
      }
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, botY, width, bottomH);

      // Top and bottom edge dividers
      ctx.fillStyle = isDark ? '#3d3d40' : '#b5b5b8';
      ctx.fillRect(0, topH - 1, width, 1);
      ctx.fillRect(0, botY, width, 1);

      // Left Mode Switcher (1-Shot, 4-Burst, Video)
      const modeStartX = 18 * scale;
      const modeY = botY + bottomH / 2;

      // Mode 1: Single Still Photo
      ctx.strokeStyle = isDark ? '#94a3b8' : '#475569';
      ctx.lineWidth = 1.2 * scale;
      roundRect(ctx, modeStartX, modeY - 8 * scale, 15 * scale, 16 * scale, 2 * scale);
      ctx.stroke();

      // Mode 2: 4-Shot Grid
      const m2X = modeStartX + 22 * scale;
      ctx.strokeRect(m2X, modeY - 8 * scale, 7 * scale, 7 * scale);
      ctx.strokeRect(m2X + 8 * scale, modeY - 8 * scale, 7 * scale, 7 * scale);
      ctx.strokeRect(m2X, modeY, 7 * scale, 7 * scale);
      ctx.strokeRect(m2X + 8 * scale, modeY, 7 * scale, 7 * scale);

      // Mode 3: Video Camera Icon
      const m3X = m2X + 24 * scale;
      roundRect(ctx, m3X, modeY - 6 * scale, 12 * scale, 12 * scale, 2 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(m3X + 12 * scale, modeY - 2 * scale);
      ctx.lineTo(m3X + 18 * scale, modeY - 7 * scale);
      ctx.lineTo(m3X + 18 * scale, modeY + 7 * scale);
      ctx.lineTo(m3X + 12 * scale, modeY + 2 * scale);
      ctx.closePath();
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.fill();

      // Central Shutter Button (Authentic Photo Booth Red Glossy Dome with Chrome Rim)
      const shutterX = width / 2;
      const shutterY = botY + bottomH / 2;
      const shutterR = 17 * scale;

      // Outer Chrome Rim with Bevel
      const chromeGrad = ctx.createLinearGradient(
        shutterX - shutterR,
        shutterY - shutterR,
        shutterX + shutterR,
        shutterY + shutterR
      );
      chromeGrad.addColorStop(0, '#ffffff');
      chromeGrad.addColorStop(0.3, '#d1d5db');
      chromeGrad.addColorStop(0.7, '#6b7280');
      chromeGrad.addColorStop(1, '#e5e7eb');
      ctx.beginPath();
      ctx.arc(shutterX, shutterY, shutterR + 3 * scale, 0, Math.PI * 2);
      ctx.fillStyle = chromeGrad;
      ctx.fill();

      // Red Dome with Specular Highlight
      const redGrad = ctx.createRadialGradient(
        shutterX - 4 * scale,
        shutterY - 5 * scale,
        2 * scale,
        shutterX,
        shutterY,
        shutterR
      );
      redGrad.addColorStop(0, '#ff6b6b');
      redGrad.addColorStop(0.4, '#e11d48');
      redGrad.addColorStop(0.85, '#9f1239');
      redGrad.addColorStop(1, '#4c0519');
      ctx.beginPath();
      ctx.arc(shutterX, shutterY, shutterR, 0, Math.PI * 2);
      ctx.fillStyle = redGrad;
      ctx.fill();

      // White Camera Silhouette Icon inside Red Button
      ctx.fillStyle = '#ffffff';
      const camW = 14 * scale;
      const camH = 10 * scale;
      roundRect(ctx, shutterX - camW / 2, shutterY - camH / 2 + 1 * scale, camW, camH, 2 * scale);
      ctx.fill();
      // Camera bump
      ctx.fillRect(shutterX - camW * 0.25, shutterY - camH / 2 - 1.5 * scale, camW * 0.5, 2.5 * scale);
      // Lens circle
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(shutterX, shutterY + 1 * scale, 2.8 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Right Side "Effects" Button with 3x3 Grid
      const fxW = 74 * scale;
      const fxH = 24 * scale;
      const fxX = width - fxW - 16 * scale;
      const fxY = shutterY - fxH / 2;

      // Effects Pill Button
      ctx.fillStyle = isDark ? '#333336' : '#dedede';
      roundRect(ctx, fxX, fxY, fxW, fxH, 6 * scale);
      ctx.fill();
      ctx.strokeStyle = isDark ? '#4a4a4e' : '#b5b5b8';
      ctx.lineWidth = 1 * scale;
      roundRect(ctx, fxX, fxY, fxW, fxH, 6 * scale);
      ctx.stroke();

      // 3x3 Grid Icon
      const gridStartX = fxX + 9 * scale;
      const gridStartY = shutterY - 4.5 * scale;
      ctx.fillStyle = isDark ? '#ffffff' : '#333333';
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.fillRect(gridStartX + c * 3.5 * scale, gridStartY + r * 3.5 * scale, 2 * scale, 2 * scale);
        }
      }

      // "Effects" Text
      ctx.fillStyle = isDark ? '#ffffff' : '#222222';
      ctx.font = `600 ${10.5 * scale}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Effects', fxX + 24 * scale, shutterY + 0.5 * scale);

      break;
    }

    case 'iphone': {
      // iPhone Camera Interface (Ultra-realistic iOS Camera Viewfinder)
      ctx.save();
      const frameScale = settings.iphoneFrameScale ?? 1.0;
      const baseScale = scale * frameScale;
      const topBarH = 68 * baseScale;
      const bottomBarH = 115 * baseScale;

      // Dark translucent bars
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, width, topBarH);
      ctx.fillRect(0, height - bottomBarH, width, bottomBarH);

      // 1. TOP BAR ICONS:
      // A. Authentic iOS Flash Icon with AUTO badge
      const flashX = 28 * baseScale;
      const flashY = topBarH * 0.52;

      // Circle badge
      ctx.beginPath();
      ctx.arc(flashX, flashY, 13 * baseScale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1 * baseScale;
      ctx.stroke();

      // iOS Lightning Bolt Vector
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(flashX + 1 * baseScale, flashY - 7 * baseScale);
      ctx.lineTo(flashX - 5 * baseScale, flashY + 0.5 * baseScale);
      ctx.lineTo(flashX - 0.5 * baseScale, flashY + 0.5 * baseScale);
      ctx.lineTo(flashX - 2.5 * baseScale, flashY + 7 * baseScale);
      ctx.lineTo(flashX + 5 * baseScale, flashY - 1 * baseScale);
      ctx.lineTo(flashX + 0.5 * baseScale, flashY - 1 * baseScale);
      ctx.closePath();
      ctx.fill();

      // "AUTO" label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = `700 ${9 * baseScale}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('AUTO', flashX + 16 * baseScale, flashY + 3 * baseScale);

      // B. Authentic iOS Night Mode Pill (Crescent moon + 1s)
      const nightX = width / 2 - 32 * baseScale;
      const nightY = flashY;
      ctx.beginPath();
      roundRect(ctx, nightX - 22 * baseScale, nightY - 11 * baseScale, 44 * baseScale, 22 * baseScale, 11 * baseScale);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.2 * baseScale;
      roundRect(ctx, nightX - 22 * baseScale, nightY - 11 * baseScale, 44 * baseScale, 22 * baseScale, 11 * baseScale);
      ctx.stroke();

      // Crescent Moon Vector
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(nightX - 8 * baseScale, nightY, 5 * baseScale, 0.6 * Math.PI, 1.8 * Math.PI, false);
      ctx.arc(nightX - 6 * baseScale, nightY, 4.2 * baseScale, 1.7 * Math.PI, 0.7 * Math.PI, true);
      ctx.closePath();
      ctx.fill();

      ctx.font = `700 ${10 * baseScale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('1s', nightX + 1 * baseScale, nightY + 3.5 * baseScale);

      // C. Authentic iOS Live Photo Icon (3 Concentric Rings, Outer Segmented)
      const liveX = width / 2 + 32 * baseScale;
      const liveY = flashY;

      // Outer 8 dashed arcs
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.4 * baseScale;
      ctx.save();
      ctx.setLineDash([3 * baseScale, 3 * baseScale]);
      ctx.beginPath();
      ctx.arc(liveX, liveY, 10 * baseScale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Middle continuous ring
      ctx.beginPath();
      ctx.arc(liveX, liveY, 6 * baseScale, 0, Math.PI * 2);
      ctx.stroke();

      // Center solid dot
      ctx.beginPath();
      ctx.arc(liveX, liveY, 2 * baseScale, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.fill();

      // D. Exposure Drawer Chevron (Center Top)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * baseScale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 5 * baseScale, 16 * baseScale);
      ctx.lineTo(width / 2, 12 * baseScale);
      ctx.lineTo(width / 2 + 5 * baseScale, 16 * baseScale);
      ctx.stroke();

      // 2. RULE OF THIRDS GRID (if enabled)
      if (settings.iphoneGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 0.8 * baseScale;
        // Verticals
        ctx.beginPath();
        ctx.moveTo(width / 3, topBarH);
        ctx.lineTo(width / 3, height - bottomBarH);
        ctx.moveTo((width * 2) / 3, topBarH);
        ctx.lineTo((width * 2) / 3, height - bottomBarH);
        // Horizontals
        const viewH = height - topBarH - bottomBarH;
        ctx.moveTo(0, topBarH + viewH / 3);
        ctx.lineTo(width, topBarH + viewH / 3);
        ctx.moveTo(0, topBarH + (viewH * 2) / 3);
        ctx.lineTo(width, topBarH + (viewH * 2) / 3);
        ctx.stroke();
      }

      // 3. AUTHENTIC iOS YELLOW FOCUS BOX & SUN SLIDER
      if (settings.iphoneShowFocus) {
        const cx = width * 0.5;
        const cy = topBarH + (height - topBarH - bottomBarH) * 0.44;
        const boxSize = 64 * baseScale;
        const cornerLen = 10 * baseScale;

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.2 * baseScale;

        // 4 Corner Brackets
        // Top-left
        ctx.beginPath();
        ctx.moveTo(cx - boxSize / 2, cy - boxSize / 2 + cornerLen);
        ctx.lineTo(cx - boxSize / 2, cy - boxSize / 2);
        ctx.lineTo(cx - boxSize / 2 + cornerLen, cy - boxSize / 2);
        // Top-right
        ctx.moveTo(cx + boxSize / 2 - cornerLen, cy - boxSize / 2);
        ctx.lineTo(cx + boxSize / 2, cy - boxSize / 2);
        ctx.lineTo(cx + boxSize / 2, cy - boxSize / 2 + cornerLen);
        // Bottom-left
        ctx.moveTo(cx - boxSize / 2, cy + boxSize / 2 - cornerLen);
        ctx.lineTo(cx - boxSize / 2, cy + boxSize / 2);
        ctx.lineTo(cx - boxSize / 2 + cornerLen, cy + boxSize / 2);
        // Bottom-right
        ctx.moveTo(cx + boxSize / 2 - cornerLen, cy + boxSize / 2);
        ctx.lineTo(cx + boxSize / 2, cy + boxSize / 2);
        ctx.lineTo(cx + boxSize / 2, cy + boxSize / 2 - cornerLen);
        ctx.stroke();

        // Right side vertical exposure bar & Sun Slider
        const sunX = cx + boxSize / 2 + 18 * baseScale;
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
        ctx.lineWidth = 1 * baseScale;
        ctx.beginPath();
        ctx.moveTo(sunX, cy - boxSize / 2);
        ctx.lineTo(sunX, cy + boxSize / 2);
        ctx.stroke();

        // Vector Sun Icon
        const sunR = 4 * baseScale;
        ctx.beginPath();
        ctx.arc(sunX, cy, sunR, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.fill();

        // 8 Radiating Sun Rays
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.2 * baseScale;
        for (let a = 0; a < 8; a++) {
          const rad = (a * Math.PI) / 4;
          const r1 = sunR + 1.8 * baseScale;
          const r2 = sunR + 4.2 * baseScale;
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
          ctx.lineTo(sunX + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
          ctx.stroke();
        }
      }

      // 4. AUTHENTIC iOS ZOOM DIAL BADGES (.5, 1x, 2, 3)
      const zoomBadges = ['0.5', '1x', '2', '3'];
      const activeZoom = settings.iphoneZoomBadge || '1x';
      const badgeY = height - bottomBarH - 26 * baseScale;

      // Dark translucent pill capsule
      const pillW = 160 * baseScale;
      const pillH = 30 * baseScale;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      roundRect(ctx, width / 2 - pillW / 2, badgeY - pillH / 2, pillW, pillH, pillH / 2);
      ctx.fill();

      zoomBadges.forEach((z, idx) => {
        const bX = width / 2 + (idx - 1.5) * 38 * baseScale;
        const isActive = z === activeZoom;

        if (isActive) {
          ctx.beginPath();
          ctx.arc(bX, badgeY, 12 * baseScale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
          ctx.fill();
        }

        ctx.fillStyle = isActive ? '#facc15' : '#ffffff';
        ctx.font = `700 ${11 * baseScale}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(z === '0.5' ? '.5' : z, bX, badgeY);
      });

      // 5. iOS CAMERA MODES SELECTOR
      const modes = ['CINEMATIC', 'VIDEO', 'PHOTO', 'PORTRAIT', 'PANO'];
      const activeMode = settings.iphoneCameraMode || 'PHOTO';
      const modeY = height - bottomBarH + 24 * baseScale;

      modes.forEach((m, idx) => {
        const isCurrent = m === activeMode;
        const mX = width / 2 + (idx - 2) * 66 * baseScale;
        ctx.fillStyle = isCurrent ? '#facc15' : 'rgba(255, 255, 255, 0.65)';
        ctx.font = `700 ${11.5 * baseScale}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m, mX, modeY);
      });

      // 6. BOTTOM SHUTTER BUTTON (Apple iOS Signature Shutter)
      const shutterY = height - 52 * baseScale;
      const sX = width / 2;

      // Outer White Ring
      ctx.beginPath();
      ctx.arc(sX, shutterY, 32 * baseScale, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5 * baseScale;
      ctx.stroke();

      // Inner Solid White Disc
      ctx.beginPath();
      ctx.arc(sX, shutterY, 26 * baseScale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // 7. FLIP CAMERA ICON (Apple SF Symbols style)
      const flipX = width - 48 * baseScale;
      const flipY = shutterY;

      // Circle badge
      ctx.beginPath();
      ctx.arc(flipX, flipY, 20 * baseScale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fill();

      // Circular arrows
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8 * baseScale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(flipX, flipY, 11 * baseScale, -0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(flipX, flipY, 11 * baseScale, 0.8 * Math.PI + 0.3, -0.2 * Math.PI - 0.3);
      ctx.stroke();

      // Arrowheads
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(flipX + 8 * baseScale, flipY - 11 * baseScale);
      ctx.lineTo(flipX + 13 * baseScale, flipY - 6 * baseScale);
      ctx.lineTo(flipX + 6 * baseScale, flipY - 5 * baseScale);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(flipX - 8 * baseScale, flipY + 11 * baseScale);
      ctx.lineTo(flipX - 13 * baseScale, flipY + 6 * baseScale);
      ctx.lineTo(flipX - 6 * baseScale, flipY + 5 * baseScale);
      ctx.closePath();
      ctx.fill();

      // Camera body silhouette inside flip circle
      roundRect(ctx, flipX - 4 * baseScale, flipY - 3 * baseScale, 8 * baseScale, 6 * baseScale, 1.5 * baseScale);
      ctx.fill();

      // 8. GALLERY PREVIEW SQUARE (Bottom Left)
      const gallX = 28 * baseScale;
      const gallY = shutterY - 19 * baseScale;
      const gallSize = 38 * baseScale;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * baseScale;
      roundRect(ctx, gallX, gallY, gallSize, gallSize, 7 * baseScale);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      roundRect(ctx, gallX, gallY, gallSize, gallSize, 7 * baseScale);
      ctx.fill();

      ctx.restore();
      break;
    }

    case 'reels': {
      // Instagram / TikTok Reels Vertical Overlay (Authentic Instagram UI)
      ctx.save();

      // Gradient scrims
      const topScrim = ctx.createLinearGradient(0, 0, 0, 110 * scale);
      topScrim.addColorStop(0, 'rgba(0,0,0,0.65)');
      topScrim.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topScrim;
      ctx.fillRect(0, 0, width, 110 * scale);

      const botScrim = ctx.createLinearGradient(0, height - 200 * scale, 0, height);
      botScrim.addColorStop(0, 'rgba(0,0,0,0)');
      botScrim.addColorStop(0.4, 'rgba(0,0,0,0.4)');
      botScrim.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = botScrim;
      ctx.fillRect(0, height - 200 * scale, width, 200 * scale);

      // Top Reels header
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${20 * scale}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Reels', 20 * scale, 38 * scale);

      // Down chevron next to Reels
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(76 * scale, 32 * scale);
      ctx.lineTo(81 * scale, 37 * scale);
      ctx.lineTo(86 * scale, 32 * scale);
      ctx.stroke();

      // Top-right camera icon with notch
      const topCamX = width - 26 * scale;
      const topCamY = 32 * scale;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * scale;
      roundRect(ctx, topCamX - 10 * scale, topCamY - 7 * scale, 20 * scale, 15 * scale, 3 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(topCamX, topCamY + 0.5 * scale, 3.5 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(topCamX - 4 * scale, topCamY - 9 * scale, 8 * scale, 2.5 * scale);

      // Right Action Bar (Instagram Heart, Comment, Share, More, Audio)
      const actionX = width - 36 * scale;
      const startY = height - 280 * scale;

      // 1. INSTAGRAM VECTOR HEART (Authentic White Outline with Drop Shadow)
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.4 * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const hY = startY;
      const hS = 13 * scale;
      ctx.beginPath();
      ctx.moveTo(actionX, hY - hS * 0.35);
      ctx.bezierCurveTo(actionX - hS * 0.65, hY - hS * 1.1, actionX - hS * 1.2, hY - hS * 0.3, actionX - hS * 1.2, hY + hS * 0.2);
      ctx.bezierCurveTo(actionX - hS * 1.2, hY + hS * 0.7, actionX - hS * 0.35, hY + hS * 1.15, actionX, hY + hS * 1.45);
      ctx.bezierCurveTo(actionX + hS * 0.35, hY + hS * 1.15, actionX + hS * 1.2, hY + hS * 0.7, actionX + hS * 1.2, hY + hS * 0.2);
      ctx.bezierCurveTo(actionX + hS * 1.2, hY - hS * 0.3, actionX + hS * 0.65, hY - hS * 1.1, actionX, hY - hS * 0.35);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${11 * scale}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(settings.reelsLikes || '342.8K', actionX, hY + 28 * scale);

      // 2. INSTAGRAM VECTOR COMMENT BUBBLE (Authentic Speech Bubble, NO sliced chord!)
      const cY = startY + 58 * scale;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.4 * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const cR = 10.5 * scale;
      ctx.beginPath();
      // Start at bottom-left corner of circle (angle 0.72 * PI)
      // Arc travels clockwise: bottom-left -> top-left -> top -> right -> bottom
      ctx.arc(actionX, cY - 2 * scale, cR, 0.72 * Math.PI, 0.45 * Math.PI, false);
      // Pointed tail extending to bottom-left
      ctx.lineTo(actionX - 11.5 * scale, cY + 10.5 * scale);
      // Connect cleanly back to starting edge of arc without cutting through circle
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${11 * scale}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(settings.reelsComments || '1,894', actionX, cY + 26 * scale);

      // 3. INSTAGRAM VECTOR PAPER AIRPLANE (Share)
      const sY = startY + 120 * scale;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.4 * scale;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const pS = 12 * scale;
      ctx.beginPath();
      // Nose pointing top-right
      ctx.moveTo(actionX + pS * 0.95, sY - pS * 0.95);
      // Left wing
      ctx.lineTo(actionX - pS * 0.95, sY - pS * 0.05);
      // Center notch
      ctx.lineTo(actionX - pS * 0.15, sY + pS * 0.25);
      // Bottom wing
      ctx.lineTo(actionX + pS * 0.25, sY + pS * 0.95);
      ctx.closePath();
      ctx.stroke();

      // Center fold crease
      ctx.beginPath();
      ctx.moveTo(actionX - pS * 0.15, sY + pS * 0.25);
      ctx.lineTo(actionX + pS * 0.95, sY - pS * 0.95);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${11 * scale}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Share', actionX, sY + 26 * scale);

      // 4. INSTAGRAM 3-DOTS MORE
      const dotY = startY + 178 * scale;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#ffffff';
      for (let d = -1; d <= 1; d++) {
        ctx.beginPath();
        ctx.arc(actionX, dotY + d * 6.5 * scale, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 5. SPINNING VINYL ALBUM DISC
      const vinylY = height - 48 * scale;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      // Vinyl record body
      ctx.beginPath();
      ctx.arc(actionX, vinylY, 16 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();

      // Concentric track grooves
      ctx.beginPath();
      ctx.arc(actionX, vinylY, 12 * scale, 0, Math.PI * 2);
      ctx.arc(actionX, vinylY, 8 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1 * scale;
      ctx.stroke();

      // Center album art sticker
      ctx.beginPath();
      ctx.arc(actionX, vinylY, 5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.restore();

      // Bottom User Details
      const userX = 20 * scale;
      const maxCaptionW = width - userX - 80 * scale;

      // Multi-line caption word-wrap to prevent truncation
      const captionText = settings.reelsCaption || 'Aesthetic vibe check ✨ #fyp #reels';
      ctx.font = `400 ${12.5 * scale}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;

      const words = captionText.split(' ');
      const captionLines: string[] = [];
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        if (ctx.measureText(testLine).width <= maxCaptionW) {
          currentLine = testLine;
        } else {
          if (captionLines.length === 0) {
            captionLines.push(currentLine);
            currentLine = words[i];
          } else {
            // Second line overflow: truncate cleanly with "... more"
            let truncated = currentLine;
            while (truncated.length > 0 && ctx.measureText(truncated + '... more').width > maxCaptionW) {
              truncated = truncated.slice(0, -1);
            }
            captionLines.push(truncated + '... more');
            currentLine = '';
            break;
          }
        }
      }
      if (currentLine && captionLines.length < 2) {
        captionLines.push(currentLine);
      }

      const lineCount = Math.max(1, captionLines.length);
      const infoY = height - (52 + lineCount * 18 + 24) * scale;

      // Profile avatar ring with gradient
      const avatarGrad = ctx.createLinearGradient(userX, infoY - 16 * scale, userX + 32 * scale, infoY + 16 * scale);
      avatarGrad.addColorStop(0, '#f43f5e');
      avatarGrad.addColorStop(1, '#a855f7');
      ctx.beginPath();
      ctx.arc(userX + 16 * scale, infoY, 16 * scale, 0, Math.PI * 2);
      ctx.fillStyle = avatarGrad;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();

      // Avatar inner icon
      ctx.fillStyle = '#ffffff';
      ctx.font = `${14 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('💖', userX + 16 * scale, infoY + 5 * scale);

      // Username
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${14 * scale}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(settings.reelsUsername || '@cutie.vibes', userX + 40 * scale, infoY + 4 * scale);

      // Instagram Verified Blue Badge
      const userWidth = ctx.measureText(settings.reelsUsername || '@cutie.vibes').width;
      const badgeX = userX + 44 * scale + userWidth;
      const badgeY = infoY;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 6 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#0ea5e9';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(badgeX - 2.5 * scale, badgeY);
      ctx.lineTo(badgeX - 0.5 * scale, badgeY + 2 * scale);
      ctx.lineTo(badgeX + 3 * scale, badgeY - 2 * scale);
      ctx.stroke();

      // Follow Button Pill
      const followX = badgeX + 14 * scale;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1 * scale;
      roundRect(ctx, followX, infoY - 11 * scale, 56 * scale, 22 * scale, 7 * scale);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${10.5 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Follow', followX + 28 * scale, infoY + 4 * scale);

      // Render Multi-line Wrapped Caption
      ctx.fillStyle = '#ffffff';
      ctx.font = `400 ${12.5 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'left';
      captionLines.forEach((line, idx) => {
        ctx.fillText(line, userX, infoY + (24 + idx * 18) * scale);
      });

      // Audio Banner ticker with musical note
      const audioY = infoY + (24 + lineCount * 18 + 6) * scale;
      ctx.font = `600 ${11.5 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(`♫ ${settings.reelsAudio || 'Original Sound - Cute Chill Lo-Fi'}`, userX, audioY);

      ctx.restore();
      break;
    }

    case 'digicam': {
      // Y2K Digicam 2000s Vintage OSD Overlay
      ctx.save();
      ctx.font = `700 ${14 * scale}px "VT323", "Share Tech Mono", monospace`;

      // Top Left: Battery & SD Card
      ctx.fillStyle = '#22c55e'; // Green
      ctx.textAlign = 'left';
      ctx.fillText('■■■ 100%', 20 * scale, 30 * scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('SD 2GB [9999]', 20 * scale, 48 * scale);

      // Top Right: REC Status & Mode
      if (settings.digicamRec) {
        ctx.fillStyle = '#ef4444'; // Red
        ctx.beginPath();
        ctx.arc(width - 70 * scale, 25 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText('REC', width - 60 * scale, 30 * scale);
      } else {
        ctx.fillStyle = '#22c55e';
        ctx.fillText('STBY', width - 60 * scale, 30 * scale);
      }
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.fillText('RAW + FINE', width - 20 * scale, 48 * scale);

      // Center Autofocus Crosshair Brackets
      const cX = width / 2;
      const cY = height / 2;
      const bW = 40 * scale;
      const bH = 40 * scale;
      const cLen = 12 * scale;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5 * scale;
      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(cX - bW, cY - bH + cLen);
      ctx.lineTo(cX - bW, cY - bH);
      ctx.lineTo(cX - bW + cLen, cY - bH);
      // Top-right corner
      ctx.moveTo(cX + bW - cLen, cY - bH);
      ctx.lineTo(cX + bW, cY - bH);
      ctx.lineTo(cX + bW, cY - bH + cLen);
      // Bottom-left corner
      ctx.moveTo(cX - bW, cY + bH - cLen);
      ctx.lineTo(cX - bW, cY + bH);
      ctx.lineTo(cX - bW + cLen, cY + bH);
      // Bottom-right corner
      ctx.moveTo(cX + bW - cLen, cY + bH);
      ctx.lineTo(cX + bW, cY + bH);
      ctx.lineTo(cX + bW, cY + bH - cLen);
      ctx.stroke();

      // Bottom Left: Retro Timestamp in Orange Digital Font
      const now = new Date();
      const dateStr =
        settings.digicamDate ||
        `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}  ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      ctx.fillStyle = '#f97316'; // Classic bright amber/orange
      ctx.font = `700 ${18 * scale}px "VT323", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(dateStr, 20 * scale, height - 24 * scale);

      // Bottom Right: Camera Parameters (F2.8, 1/125, ISO 400)
      ctx.fillStyle = '#ffffff';
      ctx.font = `600 ${13 * scale}px "VT323", monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('F2.8  1/125s  ISO 400', width - 20 * scale, height - 24 * scale);

      ctx.restore();
      break;
    }

    case 'photobooth_4cut': {
      // Korean Photobooth (인생네컷 / Haru Film) frame details
      ctx.save();
      const bottomAreaY = photoBounds.y + photoBounds.h;
      const bottomH = height - bottomAreaY;

      // Bottom Korean stamp and date
      ctx.fillStyle = '#1e1b4b'; // Deep navy or black
      ctx.font = `700 ${18 * scale}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(settings.photoboothText || '인생네컷 ♡ HARU FILM', width / 2, bottomAreaY + bottomH * 0.42);

      ctx.font = `500 ${11 * scale}px "VT323", monospace`;
      ctx.fillStyle = '#475569';
      ctx.fillText(settings.photoboothDate || '2026. 11. 02  MEMORIES', width / 2, bottomAreaY + bottomH * 0.7);

      // Cute cute stamps on bottom left and right
      ctx.font = `${18 * scale}px sans-serif`;
      ctx.fillText('✨', width * 0.18, bottomAreaY + bottomH * 0.55);
      ctx.fillText('🌸', width * 0.82, bottomAreaY + bottomH * 0.55);

      ctx.restore();
      break;
    }

    case 'polaroid': {
      // Polaroid bottom caption and cute washi tape
      ctx.save();
      const bottomAreaY = photoBounds.y + photoBounds.h;
      const bottomH = height - bottomAreaY;

      // Handwritten caption
      ctx.fillStyle = '#1f2937';
      ctx.font = `700 ${22 * scale}px "Caveat", cursive, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(settings.polaroidCaption || 'Sweet Memories ♡', width / 2, bottomAreaY + bottomH * 0.52);

      // Washi Tape at top center
      const tapeW = 70 * scale;
      const tapeH = 18 * scale;
      const tapeX = width / 2 - tapeW / 2;
      const tapeY = photoBounds.y - tapeH / 2;

      ctx.save();
      ctx.translate(tapeX + tapeW / 2, tapeY + tapeH / 2);
      ctx.rotate(-0.04);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.75)'; // Soft pastel washi tape
      ctx.fillRect(-tapeW / 2, -tapeH / 2, tapeW, tapeH);
      // Tape edge zigzag
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.strokeRect(-tapeW / 2, -tapeH / 2, tapeW, tapeH);
      ctx.restore();

      ctx.restore();
      break;
    }

    case 'music_player': {
      // Spotify / Apple Music glass player overlay
      ctx.save();
      const cardH = 80 * scale;
      const cardY = height - cardH - 20 * scale;
      const cardW = width - 40 * scale;
      const cardX = 20 * scale;

      // Frosted Glass Card
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      roundRect(ctx, cardX, cardY, cardW, cardH, 16 * scale);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1 * scale;
      ctx.stroke();

      // Mini Album thumbnail
      const thumbSize = 52 * scale;
      const thumbX = cardX + 14 * scale;
      const thumbY = cardY + 14 * scale;
      roundRect(ctx, thumbX, thumbY, thumbSize, thumbSize, 8 * scale);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.font = `${24 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🎵', thumbX + thumbSize / 2, thumbY + thumbSize / 2 + 8 * scale);

      // Song Title & Artist
      const textX = thumbX + thumbSize + 14 * scale;
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${14 * scale}px system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(settings.musicSongTitle || 'Cute Daydream', textX, cardY + 28 * scale);

      ctx.fillStyle = '#94a3b8';
      ctx.font = `500 ${11 * scale}px system-ui, sans-serif`;
      ctx.fillText(settings.musicArtist || 'Lofi Beats & Chill', textX, cardY + 44 * scale);

      // Progress bar
      const barX = textX;
      const barY = cardY + 58 * scale;
      const barW = cardW - (textX - cardX) - 20 * scale;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      roundRect(ctx, barX, barY, barW, 4 * scale, 2 * scale);
      ctx.fill();

      // Filled Progress
      const fillW = (barW * (settings.musicProgress || 45)) / 100;
      ctx.fillStyle = '#38bdf8';
      roundRect(ctx, barX, barY, fillW, 4 * scale, 2 * scale);
      ctx.fill();

      ctx.restore();
      break;
    }

    case 'gameboy': {
      // Vintage Nintendo GameBoy Camera Screen Bezel
      ctx.save();
      const bezelPad = 24 * scale;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 12 * scale;
      ctx.strokeRect(bezelPad, bezelPad, width - bezelPad * 2, height - bezelPad * 2);

      // GameBoy Camera logo
      ctx.fillStyle = '#94a3b8';
      ctx.font = `800 ${12 * scale}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('GAME BOY', bezelPad + 14 * scale, height - bezelPad - 8 * scale);

      ctx.fillStyle = '#f43f5e';
      ctx.font = `italic 700 ${10 * scale}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('CAMERA', bezelPad + 85 * scale, height - bezelPad - 8 * scale);

      // Battery LED
      ctx.beginPath();
      ctx.arc(bezelPad + 14 * scale, bezelPad + 16 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = `600 ${8 * scale}px sans-serif`;
      ctx.fillText('BATTERY', bezelPad + 24 * scale, bezelPad + 19 * scale);

      ctx.restore();
      break;
    }

    case 'none':
    default:
      break;
  }
}

// Draw Stickers & Doodles
function drawStickers(
  ctx: CanvasRenderingContext2D,
  photoBounds: { x: number; y: number; w: number; h: number },
  stickers: StickerItem[],
  highRes: boolean
) {
  const scaleMultiplier = highRes ? 2 : 1;

  stickers.forEach((sticker) => {
    // Coordinate calculation: percentage within photo bounds
    const sX = photoBounds.x + (sticker.x / 100) * photoBounds.w;
    const sY = photoBounds.y + (sticker.y / 100) * photoBounds.h;

    ctx.save();
    ctx.translate(sX, sY);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.scale(sticker.scale * scaleMultiplier, sticker.scale * scaleMultiplier);

    if (sticker.type === 'emoji') {
      ctx.font = '36px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.content, 0, 0);
    } else if (sticker.type === 'badge') {
      // Cute aesthetic sticker badge with rounded borders
      ctx.font = '700 16px "Fredoka", "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(sticker.content);
      const padX = 14;
      const bW = metrics.width + padX * 2;
      const bH = 32;

      // Drop shadow for sticker feel
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      roundRect(ctx, -bW / 2 + 2, -bH / 2 + 2, bW, bH, 16);
      ctx.fill();

      // White outline sticker border
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, -bW / 2 - 2, -bH / 2 - 2, bW + 4, bH + 4, 18);
      ctx.fill();

      // Badge fill
      ctx.fillStyle = sticker.color || '#ec4899';
      roundRect(ctx, -bW / 2, -bH / 2, bW, bH, 16);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(sticker.content, 0, 1);
    } else if (sticker.type === 'text') {
      ctx.font = `700 24px "${sticker.fontFamily || 'Caveat'}", cursive, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Text stroke for readability
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 4;
      ctx.strokeText(sticker.content, 0, 0);

      ctx.fillStyle = sticker.color || '#ffffff';
      ctx.fillText(sticker.content, 0, 0);
    }

    ctx.restore();
  });
}

// ============================================================================
// Special Effect for Girls / Aesthetic: Burung Terbang & Love-Love Merah
// ============================================================================
function drawBirdsAndHeartsEffect(
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; w: number; h: number },
  scale: number
) {
  ctx.save();

  // Draw romantic soft pink blush & light radiance in corners
  const aura = ctx.createRadialGradient(
    bounds.x + bounds.w * 0.7,
    bounds.y + bounds.h * 0.3,
    10 * scale,
    bounds.x + bounds.w * 0.7,
    bounds.y + bounds.h * 0.3,
    bounds.w * 0.6
  );
  aura.addColorStop(0, 'rgba(255, 100, 140, 0.2)');
  aura.addColorStop(0.6, 'rgba(255, 180, 200, 0.08)');
  aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);

  // 1. FLYING WHITE DOVES / BIRDS IN FLIGHT (Burung Terbang Cantik)
  // Bird 1: Prominent white dove soaring gracefully near upper left
  drawFlyingDove(
    ctx,
    bounds.x + bounds.w * 0.22,
    bounds.y + bounds.h * 0.2,
    30 * scale,
    -18,
    0.95
  );

  // Bird 2: Companion dove soaring upper right
  drawFlyingDove(
    ctx,
    bounds.x + bounds.w * 0.78,
    bounds.y + bounds.h * 0.15,
    24 * scale,
    14,
    0.92
  );

  // Distant flock of birds
  drawFlyingDove(
    ctx,
    bounds.x + bounds.w * 0.48,
    bounds.y + bounds.h * 0.09,
    13 * scale,
    -8,
    0.72
  );
  drawFlyingDove(
    ctx,
    bounds.x + bounds.w * 0.58,
    bounds.y + bounds.h * 0.07,
    10 * scale,
    -5,
    0.65
  );
  drawFlyingDove(
    ctx,
    bounds.x + bounds.w * 0.64,
    bounds.y + bounds.h * 0.1,
    12 * scale,
    -12,
    0.68
  );

  // 2. GLOSSY 3D RED HEARTS (Love-love Merah Berkilau Cantik)
  const hearts = [
    { x: 0.15, y: 0.34, size: 22 * scale, rot: -16 },
    { x: 0.26, y: 0.24, size: 28 * scale, rot: 12 },
    { x: 0.82, y: 0.30, size: 26 * scale, rot: 18 },
    { x: 0.88, y: 0.44, size: 20 * scale, rot: -10 },
    { x: 0.12, y: 0.60, size: 24 * scale, rot: 15 },
    { x: 0.22, y: 0.76, size: 30 * scale, rot: -12 },
    { x: 0.75, y: 0.70, size: 26 * scale, rot: 8 },
    { x: 0.85, y: 0.84, size: 22 * scale, rot: -20 },
    // Cute tiny floating hearts
    { x: 0.36, y: 0.18, size: 14 * scale, rot: 5 },
    { x: 0.72, y: 0.20, size: 15 * scale, rot: -8 },
    { x: 0.30, y: 0.88, size: 14 * scale, rot: 14 },
    { x: 0.66, y: 0.86, size: 16 * scale, rot: -15 },
  ];

  hearts.forEach((h) => {
    drawGlossyRedHeart(
      ctx,
      bounds.x + bounds.w * h.x,
      bounds.y + bounds.h * h.y,
      h.size,
      h.rot
    );
  });

  // 3. FAIRY SPARKLES & GLITTER STARS
  const sparkles = [
    { x: 0.28, y: 0.16, s: 8 * scale, c: '#ffffff' },
    { x: 0.20, y: 0.27, s: 6 * scale, c: '#ffd1dc' },
    { x: 0.76, y: 0.24, s: 9 * scale, c: '#ffffff' },
    { x: 0.86, y: 0.36, s: 7 * scale, c: '#ffe4e6' },
    { x: 0.15, y: 0.70, s: 8 * scale, c: '#ffffff' },
    { x: 0.80, y: 0.76, s: 10 * scale, c: '#ffd1dc' },
    { x: 0.50, y: 0.14, s: 7 * scale, c: '#ffffff' },
  ];

  sparkles.forEach((sp) => {
    drawSparkleStar(
      ctx,
      bounds.x + bounds.w * sp.x,
      bounds.y + bounds.h * sp.y,
      sp.s,
      sp.c
    );
  });

  ctx.restore();
}

// Helper: Flying Dove Vector
function drawFlyingDove(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number,
  opacity: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.globalAlpha = opacity;

  // Soft glowing white aura
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 10 * (size / 24);

  // Dove Silhouette / Outline
  ctx.beginPath();
  // Beak tip
  ctx.moveTo(size * 0.45, -size * 0.05);
  ctx.lineTo(size * 0.58, -size * 0.02);
  ctx.lineTo(size * 0.42, size * 0.05);

  // Upstretched Left Wing
  ctx.bezierCurveTo(size * 0.25, -size * 0.35, size * 0.1, -size * 0.85, -size * 0.15, -size * 0.95);
  ctx.bezierCurveTo(-size * 0.05, -size * 0.65, -size * 0.02, -size * 0.35, -size * 0.1, -size * 0.08);

  // Tail
  ctx.bezierCurveTo(-size * 0.3, -size * 0.02, -size * 0.52, size * 0.06, -size * 0.65, size * 0.18);
  ctx.lineTo(-size * 0.48, size * 0.22);
  ctx.lineTo(-size * 0.62, size * 0.3);
  ctx.bezierCurveTo(-size * 0.42, size * 0.26, -size * 0.22, size * 0.16, 0, size * 0.12);

  // Gliding Downstretched Right Wing
  ctx.bezierCurveTo(size * 0.05, size * 0.38, -size * 0.05, size * 0.68, -size * 0.22, size * 0.78);
  ctx.bezierCurveTo(-size * 0.04, size * 0.52, size * 0.16, size * 0.32, size * 0.28, size * 0.12);
  ctx.closePath();

  // Pure pearl white gradient
  const doveGrad = ctx.createLinearGradient(-size * 0.5, -size * 0.5, size * 0.5, size * 0.5);
  doveGrad.addColorStop(0, '#ffffff');
  doveGrad.addColorStop(0.7, '#f8fafc');
  doveGrad.addColorStop(1, '#f1f5f9');
  ctx.fillStyle = doveGrad;
  ctx.fill();

  // Subtle wing feather feather line
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
  ctx.lineWidth = Math.max(0.8, size * 0.04);
  ctx.stroke();

  ctx.restore();
}

// Helper: 3D Glossy Ruby Red Heart
function drawGlossyRedHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rot: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);

  // 1. Soft glowing red aura
  const aura = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 1.5);
  aura.addColorStop(0, 'rgba(255, 30, 90, 0.45)');
  aura.addColorStop(0.6, 'rgba(255, 0, 60, 0.15)');
  aura.addColorStop(1, 'rgba(255, 0, 60, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // 2. Heart Shape via Cubic Bezier Curves
  ctx.beginPath();
  const topY = -size * 0.35;
  const botY = size * 0.65;
  ctx.moveTo(0, topY + size * 0.25);
  // Top left lobe
  ctx.bezierCurveTo(-size * 0.5, -size * 0.6, -size * 0.8, -size * 0.1, 0, botY);
  // Top right lobe
  ctx.bezierCurveTo(size * 0.8, -size * 0.1, size * 0.5, -size * 0.6, 0, topY + size * 0.25);
  ctx.closePath();

  // Deep ruby red gradient
  const grad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.65);
  grad.addColorStop(0, '#ff2a6d');
  grad.addColorStop(0.35, '#f43f5e');
  grad.addColorStop(0.7, '#e11d48');
  grad.addColorStop(1, '#9f1239');
  ctx.fillStyle = grad;
  ctx.fill();

  // 3. 3D Glossy White Crescent Highlight on Top-Left Lobe
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.25,
    -size * 0.15,
    size * 0.18,
    size * 0.09,
    -0.65,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fill();

  // Secondary tiny highlight dot
  ctx.beginPath();
  ctx.arc(-size * 0.38, -size * 0.05, size * 0.04, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fill();

  ctx.restore();
}

// Helper: 4-Point Sparkle Star
function drawSparkleStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);

  // Soft sparkle glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  // 4-Point Star
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(0, 0, size, 0);
  ctx.quadraticCurveTo(0, 0, 0, size);
  ctx.quadraticCurveTo(0, 0, -size, 0);
  ctx.quadraticCurveTo(0, 0, 0, -size);
  ctx.closePath();
  ctx.fill();

  // Center bright dot
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.restore();
}
