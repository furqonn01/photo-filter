// Cute SVG / Canvas based sample images for instant tryout
export interface SampleImage {
  id: string;
  name: string;
  emoji: string;
  dataUrl: string;
}

// Generate cute gradient & illustration data URLs
function createSampleSvg(
  bgGradient: [string, string],
  emoji: string,
  subtext: string,
  decorations: string
): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}"/>
        <stop offset="100%" stop-color="${bgGradient[1]}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.2"/>
      </radialGradient>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="15" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="800" height="1000" fill="url(#grad)"/>
    <rect width="800" height="1000" fill="url(#glow)"/>
    
    <!-- Decorative background elements -->
    ${decorations}
    
    <!-- Central Avatar/Subject Silhouette & Emoji -->
    <circle cx="400" cy="420" r="160" fill="white" fill-opacity="0.2" filter="url(#softGlow)"/>
    <circle cx="400" cy="420" r="140" fill="white" fill-opacity="0.9"/>
    
    <!-- Character Face / Emoji -->
    <text x="400" y="475" font-size="140" text-anchor="middle" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${emoji}</text>
    
    <!-- Cute Badge & Text -->
    <rect x="250" y="630" width="300" height="44" rx="22" fill="white" fill-opacity="0.25"/>
    <text x="400" y="660" font-size="20" font-weight="700" fill="white" text-anchor="middle" font-family="system-ui, sans-serif" letter-spacing="2">${subtext}</text>
  </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample_cat',
    name: 'Mochi Cat',
    emoji: '🐱',
    dataUrl: createSampleSvg(
      ['#ff9a9e', '#fecfef'],
      '🐱',
      '✨ MOCHI CAT ✨',
      `
      <circle cx="150" cy="180" r="80" fill="#ffffff" fill-opacity="0.15"/>
      <circle cx="680" cy="220" r="110" fill="#ffffff" fill-opacity="0.15"/>
      <text x="120" y="320" font-size="48">🌸</text>
      <text x="680" y="400" font-size="48">✨</text>
      <text x="180" y="750" font-size="44">🎀</text>
      <text x="620" y="720" font-size="52">💖</text>
      `
    ),
  },
  {
    id: 'sample_bunny',
    name: 'Strawberry Bunny',
    emoji: '🐰',
    dataUrl: createSampleSvg(
      ['#a18cd1', '#fbc2eb'],
      '🐰',
      '🍓 SWEET BUNNY 🍓',
      `
      <circle cx="200" cy="200" r="90" fill="#ffffff" fill-opacity="0.12"/>
      <circle cx="650" cy="780" r="130" fill="#ffffff" fill-opacity="0.15"/>
      <text x="140" y="260" font-size="42">🍓</text>
      <text x="660" y="280" font-size="46">⭐</text>
      <text x="140" y="800" font-size="50">🧸</text>
      <text x="650" y="550" font-size="40">🌷</text>
      `
    ),
  },
  {
    id: 'sample_bear',
    name: 'Honey Bear',
    emoji: '🧸',
    dataUrl: createSampleSvg(
      ['#ffecd2', '#fcb69f'],
      '🧸',
      '🍯 HONEY COZY 🍯',
      `
      <circle cx="650" cy="200" r="90" fill="#ffffff" fill-opacity="0.2"/>
      <circle cx="150" cy="750" r="100" fill="#ffffff" fill-opacity="0.15"/>
      <text x="660" y="320" font-size="46">☕</text>
      <text x="120" y="260" font-size="42">🥞</text>
      <text x="640" y="760" font-size="46">✨</text>
      `
    ),
  },
  {
    id: 'sample_cool',
    name: 'Y2K Cyber Girl',
    emoji: '😎',
    dataUrl: createSampleSvg(
      ['#4facfe', '#00f2fe'],
      '😎',
      '⚡ Y2K CYBER BOOTH ⚡',
      `
      <circle cx="200" cy="250" r="100" fill="#ffffff" fill-opacity="0.2"/>
      <text x="160" y="280" font-size="48">💿</text>
      <text x="650" y="300" font-size="48">👾</text>
      <text x="680" y="750" font-size="52">⚡</text>
      <text x="120" y="780" font-size="44">🎧</text>
      `
    ),
  },
];

