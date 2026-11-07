import sharp from 'sharp';
import { points, edges } from './hand';

/** One headline metric per featured project; every value is taken from that project's own content. */
export const OG_METRICS: Record<string, { value: string; label: string }> = {
  'cpu-inference-bench': { value: '3.48×', label: 'INT8 speedup' },
  'sst-baselines': { value: '6 baselines', label: '2020-2025 test' },
  roadai: { value: '646', label: 'automated checks' },
  'gesture-control': { value: '29.9 FPS', label: 'camera + tracking, CPU' },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
/** Wrap a title onto at most two lines of ~max chars. */
function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  }
  return [...lines, cur];
}

// Same palette and motif as the site-wide og.png: dark bg, teal accent, MediaPipe hand landmarks.
export async function renderOg(title: string, metric: { value: string; label: string }): Promise<Buffer> {
  const bg = '#0a0e13', text = '#e6edf3', muted = '#9aa8b6', accent = '#2dd4bf';
  // map the hand's 330x380 viewBox box (from x30,y40) onto the right side of the 1200x630 canvas
  const k = 1.05, ox = 760 - 30 * k, oy = 120 - 40 * k;
  const X = (x: number) => (x * k + ox).toFixed(1), Y = (y: number) => (y * k + oy).toFixed(1);
  const hand = edges.map(([a, b]) => `<line x1="${X(points[a][0])}" y1="${Y(points[a][1])}" x2="${X(points[b][0])}" y2="${Y(points[b][1])}"/>`).join('')
    + points.map(([x, y], i) => `<circle stroke="none" cx="${X(x)}" cy="${Y(y)}" r="${i % 4 === 0 && i > 0 ? 7 : 6}"/>`).join('');
  const tl = wrap(title, 18);
  const titleSvg = tl.map((l, i) => `<text x="80" y="${200 + i * 70}" font-size="62" font-weight="700" fill="${text}" font-family="sans-serif">${esc(l)}</text>`).join('');
  const my = 200 + (tl.length - 1) * 70 + 120;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${bg}"/>
<g stroke="${accent}" stroke-opacity=".45" stroke-width="3" fill="${accent}" fill-opacity=".45">${hand}</g>
<text x="80" y="110" font-size="28" font-weight="700" fill="${muted}" font-family="monospace">diyor.dev / projects</text>
${titleSvg}
<text x="80" y="${my}" font-size="76" font-weight="700" fill="${accent}" font-family="monospace">${esc(metric.value)}</text>
<text x="80" y="${my + 50}" font-size="34" fill="${muted}" font-family="monospace">${esc(metric.label)}</text>
</svg>`;
  return sharp(Buffer.from(svg)).png({ palette: true }).toBuffer();
}
