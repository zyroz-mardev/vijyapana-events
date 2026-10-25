// Writes src/partials/hallplan.html: a sample hall plan drawn as SVG, one rect per stall.
// Run: node tools/hallplan.mjs (then node tools/build.mjs)
import { writeFileSync } from 'node:fs';

const U = 20;            // one frontage unit, 3 m
const DEPTH = 24;        // one row deep
const AISLE = 22;
const HALVES = [40, 320]; // left and right blocks, 12 units each, a cross aisle between
const patterns = [
  ['s1', 's1', 's2', 'c2', 's1', 's1', 's2', 's2'],
  ['s2', 's1', 's1', 'c4', 's2', 's2'],
  ['c2', 's1', 's1', 's2', 's2', 's1', 's1', 'c2'],
  ['s1', 's2', 's1', 's2', 'c2', 's2', 's1', 's1'],
  ['s2', 's2', 'c4', 's1', 's1', 's2'],
  ['s1', 's1', 's1', 's1', 'c2', 's2', 's2', 's1', 's1'],
];
const pairs = [['A', 'B'], ['C', 'D'], ['E', 'F']];
const rects = [];
const labels = [];
const count = {};
const next = (row) => (count[row] = (count[row] || 0) + 1);
let y = 52;
let p = 0;
for (const [r1, r2] of pairs) {
  labels.push(`<text class="aisle-label" x="32" y="${y + 16}" text-anchor="end">${r1}</text>`, `<text class="aisle-label" x="32" y="${y + DEPTH + 16}" text-anchor="end">${r2}</text>`);
  for (const x0 of HALVES) {
    let x = x0;
    for (const item of patterns[p++ % patterns.length]) {
      const w = Number(item.slice(1)) * U;
      if (item[0] === 's') {
        const size = Number(item.slice(1)) * 9;
        rects.push({ x, y, w, h: DEPTH, name: `${r1}-${next(r1)}`, size, kind: 'shell scheme', cls: 'stall--shell' });
        rects.push({ x, y: y + DEPTH, w, h: DEPTH, name: `${r2}-${next(r2)}`, size, kind: 'shell scheme', cls: 'stall--shell' });
      } else {
        const n = next(r1); next(r2);
        rects.push({ x, y, w, h: DEPTH * 2, name: `${r1}${r2}-${n}`, size: Number(item.slice(1)) * 18, kind: 'custom build, open on four sides', cls: 'stall--custom' });
      }
      x += w;
    }
  }
  y += DEPTH * 2 + AISLE;
}
const bottom = y;
rects.push({ x: 40, y: bottom, w: 200, h: 52, name: 'P-1', size: 240, kind: 'state pavilion', cls: 'stall--pavilion' });
const stallCount = rects.length;

const r = (s) => `<rect class="stall ${s.cls}" x="${s.x + 1}" y="${s.y + 1}" width="${s.w - 2}" height="${s.h - 2}" data-name="${s.name}" data-size="${s.size}" data-kind="${s.kind}"/>`;
const svg = `<svg viewBox="0 0 600 ${bottom + 92}" role="group" tabindex="0" aria-label="Sample hall plan with ${stallCount} stalls. Use the arrow keys to move from stall to stall.">
  <rect class="hall" x="14" y="24" width="572" height="${bottom + 52 - 24 + 14}"/>
  <text class="aisle-label" x="300" y="44" text-anchor="middle">Hall 3, 40,000 sq ft</text>
  ${labels.join('\n  ')}
  ${rects.map(r).join('\n  ')}
  <text class="aisle-label" x="140" y="${bottom + 30}" text-anchor="middle">Pavilion</text>
  <rect class="stall stall--service" x="${420 + 1}" y="${bottom + 1}" width="138" height="50"/>
  <text class="aisle-label" x="490" y="${bottom + 30}" text-anchor="middle">Café and services</text>
  <line class="door" x1="262" y1="${bottom + 66}" x2="338" y2="${bottom + 66}"/>
  <text class="aisle-label" x="300" y="${bottom + 84}" text-anchor="middle">Entrance</text>
</svg>`;

const html = `<figure class="plan stock" data-plan>
  ${svg}
  <figcaption class="plan__caption">
    <output aria-live="polite">Sample plan, Hall 3, ${stallCount} stalls</output>
    <span class="plan__legend"><span><i class="k-shell"></i>Shell</span><span><i class="k-custom"></i>Custom</span><span><i class="k-pav"></i>Pavilion</span></span>
  </figcaption>
</figure>
`;
writeFileSync(new URL('../src/partials/hallplan.html', import.meta.url), html);
console.log(`hallplan: ${stallCount} stalls`);
