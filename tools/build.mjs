// Builds the static pages: node tools/build.mjs
// src/*.html -> ./*.html, expanding partials, photos and photo credits.
//   <!-- @partial name key="value" -->   inserts src/partials/name.html; {{key}} and {{if key=value:text}} resolve
//   <img data-photo="W3" alt="…">        fills src, srcset, width, height from assets/data/photos.json
//   <!-- @credits -->                     lists every photo used on that page, linked to its Commons page
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const src = join(root, 'src');
const photos = JSON.parse(readFileSync(join(root, 'assets/data/photos.json'), 'utf8'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const partial = (name, params) => {
  let html = readFileSync(join(src, 'partials', `${name}.html`), 'utf8');
  html = html.replace(/\{\{if (\w+)=([\w-]+):([^}]*)\}\}/g, (_, k, v, text) => (params[k] === v ? text : ''));
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] ?? '');
};

for (const file of readdirSync(src).filter((f) => f.endsWith('.html'))) {
  let html = readFileSync(join(src, file), 'utf8');
  html = html.replace(/<!-- @partial (\w+)((?:\s+\w+="[^"]*")*) -->/g, (_, name, attrs) => {
    const params = Object.fromEntries([...attrs.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    return partial(name, params);
  });

  const used = [];
  html = html.replace(/<img data-photo="(\w+)"([^>]*)>/g, (_, id, rest) => {
    const p = photos[id];
    if (!p) throw new Error(`${file}: unknown photo ${id}`);
    if (!used.includes(id)) used.push(id);
    const eager = /fetchpriority="high"|data-eager/.test(rest);
    return `<img src="${p.src}" srcset="${p.srcset}" width="${p.w}" height="${p.h}"${rest}${eager ? '' : ' loading="lazy"'} decoding="async">`;
  });

  const credits = used.map((id) => `<a href="${photos[id].page}">${esc(photos[id].artist)}</a> (${esc(photos[id].license)})`).join(', ');
  html = html.replace('<!-- @credits -->', `Photographs from Wikimedia Commons: ${credits}.`);

  writeFileSync(join(root, file), html);
  console.log(`${file}: ${used.length} photos`);
}
