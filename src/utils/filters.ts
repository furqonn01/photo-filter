import type { FilterType, PhotoAdjustments } from '../types';

export function applyCanvasAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adjustments: PhotoAdjustments
) {
  // Vignette
  if (adjustments.vignette > 0) {
    const radius = Math.max(width, height) * 0.7;
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      radius * 0.3,
      width / 2,
      height / 2,
      radius
    );
    const alpha = (adjustments.vignette / 100) * 0.85;
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.5, `rgba(0,0,0,${alpha * 0.3})`);
    gradient.addColorStop(1, `rgba(0,0,0,${alpha})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Warmth
  if (adjustments.warmth !== 0) {
    ctx.save();
    if (adjustments.warmth > 0) {
      // Warm (amber/orange)
      ctx.fillStyle = `rgba(255, 170, 50, ${Math.abs(adjustments.warmth) / 250})`;
      ctx.globalCompositeOperation = 'color';
      ctx.fillRect(0, 0, width, height);
    } else {
      // Cool (cyan/blue)
      ctx.fillStyle = `rgba(40, 150, 255, ${Math.abs(adjustments.warmth) / 250})`;
      ctx.globalCompositeOperation = 'color';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  // Film Grain
  if (adjustments.grain > 0) {
    const grainIntensity = (adjustments.grain / 100) * 35;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const step = 4; // every pixel
    for (let i = 0; i < data.length; i += step) {
      const noise = (Math.random() - 0.5) * grainIntensity;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);
  }
}

// Special Canvas Filters (Photo Booth & Aesthetics)
export function applySpecialFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: FilterType
) {
  if (filter === 'normal') return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  switch (filter) {
    case 'birds_hearts': {
      // Soft romantic rosy beauty tone for girls
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.09 + 18);     // Warm glowing red
        data[i + 1] = Math.min(255, data[i + 1] * 1.02 + 8); // Balanced green
        data[i + 2] = Math.min(255, data[i + 2] * 1.05 + 14); // Soft pink tone
      }
      ctx.putImageData(imgData, 0, 0);

      // Rosy blush & soft bloom vignette
      ctx.save();
      const bloomGrad = ctx.createRadialGradient(
        width / 2, height * 0.45, width * 0.2,
        width / 2, height * 0.45, Math.max(width, height) * 0.7
      );
      bloomGrad.addColorStop(0, 'rgba(255, 235, 240, 0.22)');
      bloomGrad.addColorStop(0.6, 'rgba(255, 180, 195, 0.12)');
      bloomGrad.addColorStop(1, 'rgba(220, 20, 60, 0.18)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = bloomGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      break;
    }

    case 'macbook_squeeze': {
      // Photo Booth Squeeze Distortion: pinch towards center
      const copy = new Uint8ClampedArray(data);
      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(width, height) / 2;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let srcX = x;
          let srcY = y;

          if (dist < maxR) {
            const factor = Math.pow(dist / maxR, 0.45);
            srcX = cx + dx * factor;
            srcY = cy + dy * factor;
          }

          const sx = Math.floor(Math.min(width - 1, Math.max(0, srcX)));
          const sy = Math.floor(Math.min(height - 1, Math.max(0, srcY)));

          const dstIdx = (y * width + x) * 4;
          const srcIdx = (sy * width + sx) * 4;

          data[dstIdx] = copy[srcIdx];
          data[dstIdx + 1] = copy[srcIdx + 1];
          data[dstIdx + 2] = copy[srcIdx + 2];
          data[dstIdx + 3] = copy[srcIdx + 3];
        }
      }
      ctx.putImageData(imgData, 0, 0);
      break;
    }

    case 'macbook_thermal': {
      // Infrared Thermal Heatmap palette
      for (let i = 0; i < data.length; i += 4) {
        const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
        let r = 0, g = 0, b = 0;

        if (lum < 0.2) {
          // Black to deep blue
          b = Math.floor((lum / 0.2) * 255);
        } else if (lum < 0.4) {
          // Blue to purple
          const t = (lum - 0.2) / 0.2;
          r = Math.floor(t * 180);
          b = 255;
        } else if (lum < 0.6) {
          // Purple to red
          const t = (lum - 0.4) / 0.2;
          r = 180 + Math.floor(t * 75);
          b = Math.floor((1 - t) * 255);
        } else if (lum < 0.8) {
          // Red to yellow
          const t = (lum - 0.6) / 0.2;
          r = 255;
          g = Math.floor(t * 240);
        } else {
          // Yellow to white
          const t = (lum - 0.8) / 0.2;
          r = 255;
          g = 240 + Math.floor(t * 15);
          b = Math.floor(t * 255);
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
      ctx.putImageData(imgData, 0, 0);
      break;
    }

    case 'macbook_comic': {
      // Comic book cel-shading & halftone dots
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          let lum = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);

          // Posterize / Quantize colors
          data[idx] = Math.round(data[idx] / 64) * 64;
          data[idx + 1] = Math.round(data[idx + 1] / 64) * 64;
          data[idx + 2] = Math.round(data[idx + 2] / 64) * 64;

          // Comic dot pattern
          const dot = (x % 4 === 0 && y % 4 === 0);
          if (dot && lum < 160) {
            data[idx] = Math.floor(data[idx] * 0.7);
            data[idx + 1] = Math.floor(data[idx + 1] * 0.7);
            data[idx + 2] = Math.floor(data[idx + 2] * 0.7);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      break;
    }

    case 'macbook_popart': {
      // 4-Quadrant Andy Warhol Pop Art
      const midX = Math.floor(width / 2);
      const midY = Math.floor(height / 2);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const lum = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;
          const isHigh = lum > 0.5;

          if (x < midX && y < midY) {
            // Top-Left: Neon Cyan & Hot Pink
            data[idx] = isHigh ? 255 : 0;
            data[idx + 1] = isHigh ? 105 : 230;
            data[idx + 2] = isHigh ? 180 : 255;
          } else if (x >= midX && y < midY) {
            // Top-Right: Yellow & Deep Purple
            data[idx] = isHigh ? 255 : 90;
            data[idx + 1] = isHigh ? 230 : 20;
            data[idx + 2] = isHigh ? 30 : 150;
          } else if (x < midX && y >= midY) {
            // Bottom-Left: Lime Green & Indigo
            data[idx] = isHigh ? 80 : 40;
            data[idx + 1] = isHigh ? 240 : 20;
            data[idx + 2] = isHigh ? 100 : 120;
          } else {
            // Bottom-Right: Orange & Electric Blue
            data[idx] = isHigh ? 255 : 20;
            data[idx + 1] = isHigh ? 130 : 80;
            data[idx + 2] = isHigh ? 40 : 240;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      break;
    }

    case 'y2k_flash': {
      // Y2K Digicam Flash: Bright blown-out center with soft dreamy skin tone and cool vignette
      ctx.putImageData(imgData, 0, 0);
      ctx.save();
      const flashGrad = ctx.createRadialGradient(
        width / 2, height * 0.42, 40,
        width / 2, height * 0.42, Math.max(width, height) * 0.75
      );
      flashGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      flashGrad.addColorStop(0.3, 'rgba(255, 245, 235, 0.25)');
      flashGrad.addColorStop(0.7, 'rgba(10, 20, 45, 0.2)');
      flashGrad.addColorStop(1, 'rgba(0, 5, 25, 0.6)');

      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = flashGrad;
      ctx.fillRect(0, 0, width, height);

      // Flash highlight center
      const centerFlash = ctx.createRadialGradient(
        width / 2, height * 0.42, 0,
        width / 2, height * 0.42, Math.max(width, height) * 0.35
      );
      centerFlash.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      centerFlash.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = centerFlash;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      break;
    }

    case 'vintage_35mm': {
      // Warm analog film grading + subtle light leak
      for (let i = 0; i < data.length; i += 4) {
        // Film curve: lift blacks, warm tones
        data[i] = Math.min(255, data[i] * 1.1 + 15);     // Red
        data[i + 1] = Math.min(255, data[i + 1] * 1.02 + 8); // Green
        data[i + 2] = Math.max(10, data[i + 2] * 0.9 - 5);   // Blue (warm/yellow shift)
      }
      ctx.putImageData(imgData, 0, 0);

      // Light Leak in top-right or corner
      ctx.save();
      const leakGrad = ctx.createRadialGradient(
        width * 0.9, 0, 10,
        width * 0.8, 0, width * 0.7
      );
      leakGrad.addColorStop(0, 'rgba(255, 110, 40, 0.45)');
      leakGrad.addColorStop(0.5, 'rgba(255, 50, 80, 0.2)');
      leakGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = leakGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      break;
    }

    case 'pastel_dream': {
      // Soft peach/pink dreamy pastel tone
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.08 + 20);     // soft peach/pink
        data[i + 1] = Math.min(255, data[i + 1] * 1.03 + 12);
        data[i + 2] = Math.min(255, data[i + 2] * 1.1 + 18);
      }
      ctx.putImageData(imgData, 0, 0);

      ctx.save();
      ctx.fillStyle = 'rgba(255, 182, 193, 0.15)'; // Light pink bloom
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      break;
    }

    case 'cyber_neon': {
      // Cyan and Magenta duotone
      for (let i = 0; i < data.length; i += 4) {
        const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
        // Shadow = Deep Cyber Magenta/Purple, Highlight = Neon Aqua/Cyan
        data[i] = Math.floor((1 - lum) * 160 + lum * 20);
        data[i + 1] = Math.floor((1 - lum) * 20 + lum * 245);
        data[i + 2] = Math.floor((1 - lum) * 200 + lum * 255);
      }
      ctx.putImageData(imgData, 0, 0);
      break;
    }

    case 'noir_bw': {
      // High-contrast noir black & white
      for (let i = 0; i < data.length; i += 4) {
        let lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        // Contrast S-curve
        lum = ((lum / 255 - 0.5) * 1.35 + 0.5) * 255;
        lum = Math.min(255, Math.max(0, lum));
        data[i] = lum;
        data[i + 1] = lum;
        data[i + 2] = lum;
      }
      ctx.putImageData(imgData, 0, 0);
      break;
    }

    case 'vhs_glitch': {
      // RGB Chromatic Aberration & Scanlines
      const copy = new Uint8ClampedArray(data);
      const shift = Math.floor(width * 0.012); // ~1% horizontal offset

      for (let y = 0; y < height; y++) {
        const isScanline = y % 4 === 0;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const rX = Math.min(width - 1, x + shift);
          const bX = Math.max(0, x - shift);

          const rIdx = (y * width + rX) * 4;
          const bIdx = (y * width + bX) * 4;

          let r = copy[rIdx];
          let g = copy[idx + 1];
          let b = copy[bIdx + 2];

          if (isScanline) {
            r = Math.floor(r * 0.75);
            g = Math.floor(g * 0.75);
            b = Math.floor(b * 0.75);
          }

          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      break;
    }
  }
}
