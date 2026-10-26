/* Vijyapana Events: every interaction on the site, in one file.
   The pages are complete without it; this only adds motion and the working controls. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const onFrame = (fn) => { let queued = false; return () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; fn(); }); }; };
  const scrollers = [];
  addEventListener('scroll', onFrame(() => scrollers.forEach((f) => f())), { passive: true });
  addEventListener('resize', onFrame(() => scrollers.forEach((f) => f())));

  /* ---------- nav: hides going down, returns going up ---------- */
  const nav = $('.site-nav');
  if (nav) {
    let lastY = scrollY;
    scrollers.push(() => {
      const y = scrollY;
      nav.classList.toggle('is-scrolled', y > 8);
      const menuOpen = nav.querySelector('.menu-btn[aria-expanded="true"]');
      if (!menuOpen && !nav.contains(document.activeElement)) nav.classList.toggle('is-hidden', y > lastY && y > 320);
      if (y < lastY) nav.classList.remove('is-hidden');
      lastY = y;
    });
    const btn = $('.menu-btn', nav), panel = $('.menu-panel', nav);
    btn?.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
      panel.hidden = !open;
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn?.getAttribute('aria-expanded') === 'true') { btn.click(); btn.focus(); } });
  }

  /* ---------- reveals, once ---------- */
  $$('[data-stagger]').forEach((group) => [...group.children].forEach((c, i) => c.style.setProperty('--i', i)));
  const seen = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    if (e.target.matches('.plan')) e.target.classList.add('is-drawn');
    seen.unobserve(e.target);
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('[data-reveal], .settle, .occ__rail, .handled__rows li, .plan').forEach((el) => seen.observe(el));

  /* hero lines wait for the fonts */
  const ready = (document.fonts?.ready ?? Promise.resolve()).then(() => new Promise((r) => setTimeout(r, 80)));
  ready.then(() => $$('.lines-in').forEach((el) => el.classList.add('is-in')));

  /* ---------- the air: a slow WebGL field behind the hero and the close ---------- */
  const air = (() => {
    const canvas = $('.air');
    if (!canvas) return null;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!gl) { canvas.remove(); return null; }
    const rgb = (name) => (css(name).match(/[\d.]+/g) || ['241', '236', '229']).slice(0, 3).map((v) => Number(v) / 255);
    const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const fs = `precision mediump float;
      uniform vec2 r;uniform float t;uniform vec2 p;uniform float pv;uniform vec3 base,veil,amber,tint;uniform float ta;
      float h(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 q){vec2 i=floor(q),f=fract(q);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
      float fbm(vec2 q){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(q);q=q*2.03+vec2(3.1,1.7);a*=.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/r;vec2 q=uv*vec2(r.x/r.y,1.)*1.5;float tt=t*.03;
        vec2 d=uv-p;d.x*=r.x/r.y;float g=exp(-dot(d,d)*14.)*pv;
        vec2 a1=vec2(fbm(q+vec2(0.,-tt)),fbm(q+vec2(5.2,1.3-tt)));
        vec2 b1=vec2(fbm(q+3.*a1+vec2(1.7,9.2)+g*1.6),fbm(q+3.*a1+vec2(8.3,2.8)-tt*.6));
        float f=fbm(q+2.4*b1);
        vec3 v=mix(veil,tint,ta);
        vec3 c=base;
        c=mix(c,v,smoothstep(.38,.86,f)*.8);
        c=mix(c,mix(amber,tint,ta*.6),smoothstep(.55,.95,b1.x)*.5);
        c=mix(c,veil,g*.35);
        gl_FragColor=vec4(c,1.);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return null; }
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = Object.fromEntries(['r', 't', 'p', 'pv', 'base', 'veil', 'amber', 'tint', 'ta'].map((k) => [k, gl.getUniformLocation(prog, k)]));
    gl.uniform3fv(u.base, rgb('--air-base')); gl.uniform3fv(u.veil, rgb('--air-veil')); gl.uniform3fv(u.amber, rgb('--air-amber'));
    const tints = { wed: rgb('--air-rose'), exh: rgb('--air-slate'), corp: rgb('--air-ochre') };
    let tintCol = tints.wed, ta = 0, taTarget = 0;
    const P = { x: 0.7, y: 0.5, tx: 0.7, ty: 0.5, v: 0 };
    const size = () => { canvas.width = Math.max(2, Math.round(innerWidth * 0.5)); canvas.height = Math.max(2, Math.round(innerHeight * 0.5)); gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(u.r, canvas.width, canvas.height); };
    size(); addEventListener('resize', onFrame(() => { size(); if (!running) draw(); }));
    if (finePointer) addEventListener('pointermove', (e) => { P.tx = e.clientX / innerWidth; P.ty = 1 - e.clientY / innerHeight; P.v = Math.min(1, P.v + 0.06); }, { passive: true });
    let t = 7, last = performance.now(), running = false, visibleZones = new Set();
    const draw = () => {
      P.x += (P.tx - P.x) * 0.06; P.y += (P.ty - P.y) * 0.06; P.v *= 0.975;
      ta += (taTarget - ta) * 0.04;
      gl.uniform1f(u.t, t); gl.uniform2f(u.p, P.x, P.y); gl.uniform1f(u.pv, P.v); gl.uniform3fv(u.tint, tintCol); gl.uniform1f(u.ta, ta);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const loop = (now) => {
      if (!running) return;
      t += Math.min(0.05, (now - last) / 1000); last = now;
      draw(); requestAnimationFrame(loop);
    };
    const sync = () => {
      const run = !reduced && !document.hidden && visibleZones.size > 0;
      if (run && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
      if (!run) running = false;
    };
    const zones = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? visibleZones.add(e.target) : visibleZones.delete(e.target))); sync(); });
    $$('[data-air]').forEach((z) => zones.observe(z));
    document.addEventListener('visibilitychange', sync);
    const api = { tint(kind, now) { if (tints[kind]) { tintCol = tints[kind]; taTarget = 0.85; } else taTarget = 0; if (now) { ta = taTarget; draw(); } } };
    // a service page breathes in its own occasion's colour
    if (document.body.dataset.occ) api.tint(document.body.dataset.occ, true); else draw();
    return api;
  })();

  /* ---------- the hero print, turning through the three occasions ---------- */
  const cycle = $('[data-cycle]');
  if (cycle && !reduced) {
    const prints = $$(':scope > img[data-key]', cycle);
    const metas = $$('[data-print-meta]', cycle.closest('figure'));
    let at = 0, timer = 0, inView = true;
    const show = (i) => {
      at = i;
      const kind = prints[i].dataset.key;
      prints.forEach((img, j) => img.classList.toggle('is-shown', j === i));
      metas.forEach((m) => (m.hidden = m.dataset.printMeta !== kind));
      air?.tint(kind);
    };
    const run = () => {
      clearInterval(timer);
      if (inView && !document.hidden && prints.length > 1) timer = setInterval(() => show((at + 1) % prints.length), 5000);
    };
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; run(); }).observe(cycle);
    document.addEventListener('visibilitychange', run);
  }

  /* ---------- statement: words ink in as it scrolls past ---------- */
  $$('.ink-words').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
    const spans = $$('.w', el);
    if (reduced) { spans.forEach((s) => s.classList.add('on')); return; }
    const update = () => {
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.38), 0, 1);
      const n = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle('on', i < n));
    };
    scrollers.push(update); update();
  });

  /* ---------- tabs: strips, days, the organiser and exhibitor switch ---------- */
  $$('[data-tabs]').forEach((wrap) => {
    const tabs = $$('[role="tab"]', wrap);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const live = panels[0]?.parentElement;
    live?.classList.add('is-live');
    const select = (i, focus) => {
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      panels.forEach((p, j) => {
        if (!p) return;
        const was = !p.hidden;
        p.hidden = i !== j;
        if (i === j && !was) { p.classList.remove('is-entering'); void p.offsetWidth; p.classList.add('is-entering'); }
      });
      if (focus) tabs[i].focus();
    };
    const start = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
    panels.forEach((p, j) => p && (p.hidden = j !== start));
    tabs.forEach((t, i) => {
      t.tabIndex = i === start ? 0 : -1;
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        const k = e.key; let n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % tabs.length;
        if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        if (k === 'Home') n = 0; if (k === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
    });
  });
  $$('.occ__label, .day__list, .duo__rows').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));

  /* ---------- how an event runs: the sheet follows the stage in view ---------- */
  $$('[data-chapter]').forEach((ch) => {
    const steps = $$('.chapter__steps li', ch), states = $$('.sheet__state', ch), ticks = $$('.sheet__ticks span', ch);
    const set = (i) => {
      steps.forEach((s, j) => s.classList.toggle('is-current', i === j));
      states.forEach((s, j) => { s.classList.toggle('is-current', i === j); s.setAttribute('aria-hidden', String(i !== j)); });
      ticks.forEach((t, j) => t.classList.toggle('on', j <= i));
    };
    set(0);
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) set(steps.indexOf(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));
  });

  /* ---------- the work: filter and a preview print ---------- */
  $$('[data-work]').forEach((w) => {
    const rows = $$('.work__list li', w), imgs = $$('.work__preview img', w), meta = $('.work__preview [data-meta]', w);
    const preview = (li) => {
      imgs.forEach((im) => im.classList.toggle('is-shown', im.dataset.key === li.dataset.key));
      rows.forEach((r) => $('.work__row', r).classList.toggle('is-current', r === li));
      if (meta) meta.textContent = li.dataset.place || '';
    };
    rows.forEach((li) => { const a = $('.work__row', li); a.addEventListener('pointerenter', () => preview(li)); a.addEventListener('focus', () => preview(li)); });
    if (rows[0]) preview(rows[0]);
    $$('[data-filter]', w).forEach((chip, _, chips) => chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      const f = chip.dataset.filter;
      rows.forEach((li, i) => {
        const keep = f === 'all' || li.dataset.kind === f;
        if (keep) {
          li.hidden = false;
          li.style.transitionDelay = reduced ? '0ms' : `${i * 35}ms`;
          requestAnimationFrame(() => requestAnimationFrame(() => li.classList.remove('is-out')));
        } else {
          li.style.transitionDelay = '0ms';
          li.classList.add('is-out');
          setTimeout(() => { if (li.classList.contains('is-out')) li.hidden = true; }, reduced ? 0 : 380);
        }
      });
      const first = rows.find((li) => f === 'all' || li.dataset.kind === f);
      if (first) preview(first);
    }));
  });

  /* ---------- figures tick up once ---------- */
  const fmt = new Intl.NumberFormat('en-IN');
  const counter = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    counter.unobserve(e.target);
    const el = e.target, end = Number(el.dataset.count), t0 = performance.now(), dur = 1500;
    const tick = (now) => { const k = clamp((now - t0) / dur, 0, 1); const eased = 1 - Math.pow(2, -10 * k); el.textContent = fmt.format(Math.round(end * (k === 1 ? 1 : eased))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  if (!reduced) $$('[data-count]').forEach((el) => counter.observe(el));

  /* ---------- the brief, typeset as you choose ---------- */
  $$('form[data-brief]').forEach((form) => {
    const out = (k) => $(`[data-out="${k}"]`, form.closest('.brief__card'));
    const help = $('.brief__help', form);
    const range = $('input[type="range"]', form), rangeOut = $('output[for]', form);
    const press = (el, text) => { if (!el || el.textContent === text) return; el.textContent = text; if (!reduced) { el.classList.remove('is-pressed'); void el.offsetWidth; el.classList.add('is-pressed'); } };
    const sync = () => {
      const occ = $('input[name="occasion"]:checked', form);
      const city = form.elements.city.value.trim(), when = form.elements.date.value.trim();
      const n = fmt.format(Number(range.value));
      press(out('occasion'), occ?.dataset.phrase || 'An event');
      press(out('city'), city || 'a city to be chosen');
      press(out('when'), when || 'date to be fixed');
      press(out('people'), n);
      press(out('unit'), occ?.dataset.unit || 'guests');
      if (rangeOut) rangeOut.textContent = n;
    };
    form.addEventListener('input', sync); form.addEventListener('change', sync); sync();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const invalid = $$('input[required]', form).find((i) => !i.value.trim());
      $$('input[required]', form).forEach((i) => i.toggleAttribute('aria-invalid', !i.value.trim()));
      if (invalid) { help.textContent = 'Add your name and an email address or phone number, so a planner can reply.'; invalid.focus(); return; }
      const sentence = form.closest('.brief__card').querySelector('.brief__sentence').textContent.replace(/\s+/g, ' ').trim();
      const name = form.elements.name.value.trim(), contact = form.elements.contact.value.trim(), notes = form.elements.notes?.value.trim();
      const body = `${sentence}\n\nName: ${name}\nReply to: ${contact}${notes ? `\n\nNotes: ${notes}` : ''}\n`;
      const to = form.getAttribute('action').replace(/^mailto:/, '');
      location.href = `mailto:${to}?subject=${encodeURIComponent(`Event brief from ${name}`)}&body=${encodeURIComponent(body)}`;
      help.textContent = `Your email app should now open with this brief written out. If it does not, write to ${to}.`;
    });
  });

  /* ---------- hall plan: explore stall by stall ---------- */
  $$('[data-plan]').forEach((plan) => {
    const svg = $('svg', plan), stalls = $$('.stall:not(.stall--service)', plan), out = $('output', plan);
    if (!reduced) stalls.forEach((s, i) => (s.style.transitionDelay = `${(i % 40) * 18 + Math.floor(i / 40) * 120}ms`));
    setTimeout(() => stalls.forEach((s) => (s.style.transitionDelay = '')), 2600);
    let cur = -1;
    const pick = (i) => {
      cur = i;
      stalls.forEach((s, j) => s.classList.toggle('is-current', i === j));
      const s = stalls[i];
      if (s && out) out.textContent = `Stall ${s.dataset.name}, ${s.dataset.size} sq m, ${s.dataset.kind}`;
    };
    stalls.forEach((s, i) => s.addEventListener('pointerenter', () => pick(i)));
    svg.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      pick(((cur < 0 ? -1 : cur) + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + stalls.length) % stalls.length);
    });
    svg.addEventListener('focus', () => { if (cur < 0) pick(0); });
  });

  /* ---------- countdown spine fills with the scroll ---------- */
  $$('.countdown__list').forEach((list) => {
    const spine = $('.countdown__spine', list);
    const update = () => { const r = list.getBoundingClientRect(); spine.style.setProperty('--p', clamp((innerHeight * 0.62 - r.top) / r.height, 0, 1).toFixed(3)); };
    if (!reduced) { scrollers.push(update); update(); }
  });

  /* ---------- show sheet: the cue follows the reader ---------- */
  $$('[data-cues]').forEach((wrap) => {
    const rows = $$('.cues li', wrap), clock = $('.clock output', wrap);
    const update = () => {
      const mid = innerHeight * 0.5; let cur = 0;
      rows.forEach((r, i) => { if (r.getBoundingClientRect().top < mid) cur = i; });
      rows.forEach((r, i) => { r.classList.toggle('is-current', i === cur); r.classList.toggle('is-done', i < cur); });
      if (clock) clock.textContent = $('time', rows[cur]).textContent;
    };
    scrollers.push(update); update();
  });

  /* ---------- the badge on its lanyard ---------- */
  $$('.lanyard').forEach((el) => {
    let a = reduced ? 0 : 0.2, v = 0, raf = 0, grab = null, last = performance.now();
    const render = () => (el.style.transform = `rotate(${a}rad)`);
    const step = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      if (!grab) { const acc = -24 * a - 2.6 * v; v += acc * dt; a += v * dt; }
      render();
      if (grab || Math.abs(a) > 0.0006 || Math.abs(v) > 0.0006) raf = requestAnimationFrame(step); else { a = 0; v = 0; render(); raf = 0; }
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } };
    if (!reduced) ready.then(kick);
    el.addEventListener('pointerdown', (e) => {
      const r = el.getBoundingClientRect();
      grab = { x: e.clientX, a, top: r.top, px: e.clientX, pt: performance.now() };
      el.setPointerCapture(e.pointerId); el.classList.add('is-grabbed'); kick();
    });
    el.addEventListener('pointermove', (e) => {
      if (!grab) return;
      const now = performance.now();
      const len = Math.max(200, e.clientY - grab.top + 300);
      const na = clamp(grab.a + (e.clientX - grab.x) / len, -0.45, 0.45);
      v = (na - a) / Math.max(0.008, (now - grab.pt) / 1000); a = na; grab.pt = now;
    });
    const release = () => { if (!grab) return; grab = null; el.classList.remove('is-grabbed'); v = clamp(v, -4, 4); kick(); };
    el.addEventListener('pointerup', release); el.addEventListener('pointercancel', release);
    el.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); v += e.key === 'ArrowLeft' ? -1.4 : 1.4; kick(); } });
  });

  /* ---------- rails: drag to scroll with a mouse ---------- */
  $$('.rail').forEach((rail) => {
    let down = null, moved = false;
    rail.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = { x: e.clientX, s: rail.scrollLeft }; moved = false; });
    addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - down.x; if (Math.abs(dx) > 4) { moved = true; rail.classList.add('is-dragging'); } rail.scrollLeft = down.s - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = null; rail.classList.remove('is-dragging'); });
    rail.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    rail.addEventListener('dragstart', (e) => e.preventDefault());
  });
})();
