/* ==========================================================================
   PHY528 — The Four Fundamental Interactions
   script.js
   ========================================================================== */

gsap.registerPlugin(MotionPathPlugin);

/* ==========================================================================
   1. AMBIENT PARTICLE FIELD (canvas)
   ========================================================================== */

(function initParticles() {
  const canvas = document.getElementById('particle-field');
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makeParticles() {
    const count = Math.round((w * h) / 26000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      hue: Math.random() > 0.5 ? '56,189,248' : '251,191,36',
      alpha: Math.random() * 0.5 + 0.15
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }

  resize();
  makeParticles();
  tick();
  window.addEventListener('resize', () => { resize(); makeParticles(); });
})();

/* ==========================================================================
   2. SCENE NAVIGATION FRAMEWORK
   ========================================================================== */

const SCENES = ['scene-00','scene-01','scene-02','scene-03','scene-04','scene-05','scene-06','scene-07'];
let currentIndex = 0;
let isPlaying = false;
let autoTimer = null;
const SCENE_DURATION = 9000; // ms auto-advance per scene

const dotsWrap = document.getElementById('transport-dots');
SCENES.forEach((id, i) => {
  const dot = document.createElement('div');
  dot.className = 'transport-dot';
  dot.dataset.index = i;
  dot.addEventListener('click', () => goToScene(i));
  dotsWrap.appendChild(dot);
});
const dotEls = Array.from(dotsWrap.children);

function updateTransportUI() {
  dotEls.forEach((d, i) => {
    d.classList.toggle('is-active', i === currentIndex);
    d.classList.toggle('is-passed', i < currentIndex);
  });
  document.getElementById('transport-label').textContent = `Scene ${currentIndex + 1} / ${SCENES.length}`;
  const pct = (currentIndex / (SCENES.length - 1)) * 100;
  document.getElementById('transport-progress-fill').style.width = pct + '%';
}

const sceneEnterFns = {};   // id -> function called on entering scene
const sceneExitFns = {};    // id -> function called on leaving scene

function goToScene(index, opts = {}) {
  if (index < 0 || index >= SCENES.length) return;
  const prevId = SCENES[currentIndex];
  const nextId = SCENES[index];
  if (prevId && sceneExitFns[prevId]) sceneExitFns[prevId]();

  document.querySelectorAll('.scene').forEach(el => el.classList.remove('is-active'));
  const nextEl = document.getElementById(nextId);
  nextEl.classList.add('is-active');

  currentIndex = index;
  updateTransportUI();

  if (sceneEnterFns[nextId]) sceneEnterFns[nextId]();

  if (isPlaying) restartAutoTimer();
}

function nextScene() { if (currentIndex < SCENES.length - 1) goToScene(currentIndex + 1); else pausePlayback(); }
function prevScene() { goToScene(currentIndex - 1); }

function restartAutoTimer() {
  clearTimeout(autoTimer);
  autoTimer = setTimeout(nextScene, SCENE_DURATION);
}

function playPlayback() {
  isPlaying = true;
  document.getElementById('icon-play').style.display = 'none';
  document.getElementById('icon-pause').style.display = 'block';
  restartAutoTimer();
}
function pausePlayback() {
  isPlaying = false;
  clearTimeout(autoTimer);
  document.getElementById('icon-play').style.display = 'block';
  document.getElementById('icon-pause').style.display = 'none';
}

document.getElementById('btn-next').addEventListener('click', () => { pausePlayback(); nextScene(); });
document.getElementById('btn-prev').addEventListener('click', () => { pausePlayback(); prevScene(); });
document.getElementById('btn-playpause').addEventListener('click', () => isPlaying ? pausePlayback() : playPlayback());

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { pausePlayback(); nextScene(); }
  if (e.key === 'ArrowLeft') { pausePlayback(); prevScene(); }
  if (e.key === ' ') { e.preventDefault(); isPlaying ? pausePlayback() : playPlayback(); }
});

document.getElementById('btn-start').addEventListener('click', () => { goToScene(1); playPlayback(); });
document.getElementById('btn-restart').addEventListener('click', () => { goToScene(0); pausePlayback(); });

/* ==========================================================================
   3. SCENE 00 — OPENING
   ========================================================================== */

gsap.set('#scene-00 .reveal-line', { y: 24, opacity: 0 });
gsap.set('#scene-00 .play-btn', { y: 14 });

gsap.set('#emblem-00', { scale: .85, opacity: 0 });
gsap.timeline({ delay: .2 })
  .to('#emblem-00', { scale: 1, opacity: 1, duration: 1 }, 0)
  .to('.eyebrow', { y: 0, opacity: 1, duration: .7, ease: 'power3.out' }, .3)
  .to('#scene-00 .title-hero .line', { y: 0, opacity: 1, duration: .8, ease: 'power3.out', stagger: .12 }, .5)
  .to('.subtitle', { y: 0, opacity: 1, duration: .7, ease: 'power3.out' }, 1.05)
  .to('.play-btn', { y: 0, opacity: 1, duration: .6, ease: 'power3.out' }, 1.3);

// continuous orbit rotation for opening emblem
gsap.to('.emblem-svg .o1', { rotation: '+=360', transformOrigin: '100px 100px', duration: 14, repeat: -1, ease: 'none' });
gsap.to('.emblem-svg .o2', { rotation: '+=360', transformOrigin: '100px 100px', duration: 18, repeat: -1, ease: 'none' });
gsap.to('.emblem-svg .o3', { rotation: '+=360', transformOrigin: '100px 100px', duration: 22, repeat: -1, ease: 'none' });

function orbitElectrons(selectorPrefix, rx, ry, cx, cy) {
  const els = document.querySelectorAll(selectorPrefix);
  els.forEach((el, i) => {
    const offset = { angle: (i / els.length) * Math.PI * 2 };
    gsap.to(offset, {
      angle: offset.angle + Math.PI * 2,
      duration: 3 + i,
      repeat: -1,
      ease: 'none',
      onUpdate: () => {
        el.setAttribute('cx', cx + Math.cos(offset.angle) * rx);
        el.setAttribute('cy', cy + Math.sin(offset.angle) * ry);
      }
    });
  });
}
orbitElectrons('.orbit-e', 90, 34, 100, 100);
orbitElectrons('.final-e', 130, 48, 150, 150);

/* ==========================================================================
   4. SCENE 01 — SCALE JOURNEY
   ========================================================================== */

const scaleCaptions = {
  galaxy: 'Beginning with galaxies — vast islands of stars bound by gravity —',
  solar: 'zooming into a single solar system, held in orbit by the same force —',
  earth: 'down to a single planet, shaped by all four forces working together —',
  human: 'to the scale of a human being, made of atoms bound by electric charge —',
  atom: 'into the atom itself, where electrons orbit a dense nucleus —',
  nucleus: 'inside the nucleus, where protons and neutrons are held by the strong force —',
  quark: 'and finally to quarks — the smallest constituents we know. Four forces. Every scale.'
};

let scaleTl = null;
sceneEnterFns['scene-01'] = function () {
  const stages = Array.from(document.querySelectorAll('.scale-stage'));
  const captionEl = document.getElementById('scale-caption');
  gsap.set(stages, { opacity: .15, scale: .75 });
  stages.forEach(s => s.classList.remove('is-current', 'is-passed'));

  scaleTl = gsap.timeline();
  stages.forEach((stage, i) => {
    scaleTl.call(() => {
      stages.forEach((s, j) => {
        s.classList.toggle('is-current', j === i);
        s.classList.toggle('is-passed', j < i);
      });
      const key = stage.dataset.stage;
      gsap.to(captionEl, {
        opacity: 0, duration: .2, onComplete: () => {
          captionEl.textContent = scaleCaptions[key];
          gsap.to(captionEl, { opacity: 1, duration: .3 });
        }
      });
    }, null, i * 1.05);
  });
};
sceneExitFns['scene-01'] = function () { if (scaleTl) scaleTl.kill(); };

/* ==========================================================================
   5. SCENE 02 — STRONG NUCLEAR FORCE
   ========================================================================== */

(function buildStrongVisual() {
  const nucleons = document.getElementById('strong-nucleons');
  const gluons = document.getElementById('strong-gluons');
  const positions = [
    { x: 170, y: 170, type: 'p' }, { x: 230, y: 170, type: 'n' },
    { x: 170, y: 230, type: 'n' }, { x: 230, y: 230, type: 'p' },
    { x: 200, y: 145, type: 'n' }, { x: 200, y: 255, type: 'p' }
  ];
  positions.forEach((pos, i) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', pos.x); c.setAttribute('cy', pos.y); c.setAttribute('r', 22);
    c.setAttribute('fill', pos.type === 'p' ? 'var(--gold)' : 'var(--blue)');
    c.setAttribute('class', 'nucleon nucleon-' + i);
    c.dataset.baseX = pos.x; c.dataset.baseY = pos.y;
    nucleons.appendChild(c);
  });
  for (let i = 0; i < 5; i++) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    g.setAttribute('r', 3); g.setAttribute('fill', 'var(--green)'); g.setAttribute('class', 'gluon gluon-' + i);
    g.setAttribute('cx', 200); g.setAttribute('cy', 200);
    gluons.appendChild(g);
  }
})();

function revealStats(sceneId) {
  const cards = document.querySelectorAll('#' + sceneId + ' .stat-card');
  gsap.set(cards, { opacity: 0, y: 14 });
  gsap.to(cards, { opacity: 1, y: 0, duration: .6, ease: 'power2.out', stagger: .1, delay: .3 });
}

let strongTl = null;
sceneEnterFns['scene-02'] = function () {
  revealStats('scene-02');
  const nucleons = document.querySelectorAll('#strong-nucleons .nucleon');
  const gluons = document.querySelectorAll('#strong-gluons .gluon');
  const caption = document.getElementById('strong-caption');
  gsap.set(nucleons, { x: 0, y: 0 });

  strongTl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
  // repel phase
  strongTl.call(() => caption.textContent = 'Without the strong force, protons repel — the nucleus flies apart.')
    .to(nucleons, {
      x: (i, t) => (parseFloat(t.dataset.baseX) - 200) * 1.8,
      y: (i, t) => (parseFloat(t.dataset.baseY) - 200) * 1.8,
      duration: 1.6, ease: 'power1.out', stagger: .02
    })
    .to({}, { duration: .5 })
    .call(() => caption.textContent = 'The strong force overpowers repulsion, binding nucleons tightly together.')
    .to(nucleons, { x: 0, y: 0, duration: 1.3, ease: 'back.out(1.4)', stagger: .03 })
    .to(gluons, {
      motionPath: { path: [{ x: 0, y: 0 }, { x: 30, y: -20 }, { x: -25, y: 25 }, { x: 0, y: 0 }], curviness: 2 },
      duration: 2, ease: 'sine.inOut', stagger: .15, repeat: 1
    }, '-=1')
    .to({}, { duration: 1.5 });
};
sceneExitFns['scene-02'] = function () { if (strongTl) strongTl.kill(); };

/* ==========================================================================
   6. SCENE 03 — ELECTROMAGNETIC FORCE
   ========================================================================== */

(function buildEMVisual() {
  const fieldLines = document.getElementById('em-field-lines');
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 200 + Math.cos(angle) * 16);
    line.setAttribute('y1', 200 + Math.sin(angle) * 16);
    line.setAttribute('x2', 200 + Math.cos(angle) * 60);
    line.setAttribute('y2', 200 + Math.sin(angle) * 60);
    line.setAttribute('stroke', 'var(--gold)');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('opacity', '0.5');
    line.setAttribute('class', 'field-line');
    fieldLines.appendChild(line);
  }
})();

let emOrbitTween = null;
let emPhotonTl = null;
sceneEnterFns['scene-03'] = function () {
  revealStats('scene-03');
  const angleObj = { a: 0 };
  emOrbitTween = gsap.to(angleObj, {
    a: Math.PI * 2, duration: 4, repeat: -1, ease: 'none',
    onUpdate: () => {
      const x = 200 + Math.cos(angleObj.a) * 140;
      const y = 200 + Math.sin(angleObj.a) * 52;
      document.getElementById('em-electron').setAttribute('cx', x);
      document.getElementById('em-electron').setAttribute('cy', y);
    }
  });
  gsap.to('#em-field-lines', { rotation: 360, transformOrigin: '200px 200px', duration: 20, repeat: -1, ease: 'none' });

  const photonWrap = document.getElementById('em-photons');
  emPhotonTl = gsap.timeline({ repeat: -1 });
  for (let i = 0; i < 3; i++) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    p.setAttribute('r', 4); p.setAttribute('fill', 'var(--blue)'); p.setAttribute('opacity', '0');
    photonWrap.appendChild(p);
    emPhotonTl.set(p, { attr: { cx: 200, cy: 200 }, opacity: 1 }, i * 1.3)
      .to(p, { attr: { cx: 200 + 300 * Math.cos(i * 2), cy: 200 + 300 * Math.sin(i * 2) }, opacity: 0, duration: 1.6, ease: 'power1.out' }, i * 1.3);
  }
};
sceneExitFns['scene-03'] = function () {
  if (emOrbitTween) emOrbitTween.kill();
  if (emPhotonTl) emPhotonTl.kill();
  gsap.killTweensOf('#em-field-lines');
  document.getElementById('em-photons').innerHTML = '';
};

/* ==========================================================================
   7. SCENE 04 — WEAK NUCLEAR FORCE (beta decay)
   ========================================================================== */

let weakTl = null;
sceneEnterFns['scene-04'] = function () {
  revealStats('scene-04');
  const wrap = document.getElementById('weak-decay');
  const caption = document.getElementById('weak-caption');
  wrap.innerHTML = `
    <circle id="w-neutron" cx="200" cy="200" r="30" fill="var(--blue)" />
    <text id="w-label" x="200" y="206" text-anchor="middle" font-family="JetBrains Mono" font-size="13" fill="#0F172A" font-weight="600">n</text>
    <circle id="w-boson" cx="200" cy="200" r="0" fill="var(--purple, #A78BFA)" opacity="0" />
    <circle id="w-electron" cx="200" cy="200" r="6" fill="var(--green)" opacity="0" />
    <circle id="w-antineutrino" cx="200" cy="200" r="4" fill="#E2E8F0" opacity="0" />
  `;
  const neutron = document.getElementById('w-neutron');
  const label = document.getElementById('w-label');
  const boson = document.getElementById('w-boson');
  const electron = document.getElementById('w-electron');
  const antineutrino = document.getElementById('w-antineutrino');

  weakTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
  weakTl
    .call(() => caption.textContent = 'A neutron sits inside the nucleus, unstable.')
    .to(neutron, { duration: .8 })
    .call(() => caption.textContent = 'It emits a W boson — the weak force carrier.')
    .to(boson, { r: 10, opacity: 1, duration: .5 })
    .to(boson, { opacity: 0, r: 0, duration: .5, delay: .3 })
    .call(() => caption.textContent = 'The boson decays into an electron and antineutrino.')
    .to(neutron, { attr: { fill: 'var(--gold)' }, duration: .5 }, '<')
    .call(() => { label.textContent = 'p'; })
    .to(electron, { opacity: 1, attr: { cx: 260, cy: 130 }, duration: 1.1, ease: 'power2.out' }, '<')
    .to(antineutrino, { opacity: 1, attr: { cx: 130, cy: 260 }, duration: 1.1, ease: 'power2.out' }, '<')
    .call(() => caption.textContent = 'The neutron has become a proton — beta decay complete.')
    .to({}, { duration: 1.8 })
    .to([electron, antineutrino], { opacity: 0, duration: .4 })
    .set([electron, antineutrino], { attr: { cx: 200, cy: 200 } })
    .set(neutron, { attr: { fill: 'var(--blue)' } })
    .call(() => { label.textContent = 'n'; })
    .to({}, { duration: .6 });
};
sceneExitFns['scene-04'] = function () { if (weakTl) weakTl.kill(); };

/* ==========================================================================
   8. SCENE 05 — GRAVITATIONAL FORCE
   ========================================================================== */

let gravityTl = null;
let gravityEarthTween = null;
let gravityMoonTween = null;
sceneEnterFns['scene-05'] = function () {
  revealStats('scene-05');
  const wrap = document.getElementById('gravity-scene');
  const caption = document.getElementById('gravity-caption');
  wrap.innerHTML = `
    <ellipse cx="90" cy="330" rx="60" ry="8" fill="#000" opacity="0.15"/>
    <path id="g-tree" d="M90 330 L90 220" stroke="#3f5d45" stroke-width="6" stroke-linecap="round"/>
    <circle cx="90" cy="200" r="34" fill="#22C55E" opacity="0.55"/>
    <circle id="g-apple" cx="90" cy="220" r="9" fill="var(--gold)"/>
    <g id="g-orbit-system" transform="translate(280,180)">
      <circle r="26" fill="var(--gold)"/>
      <ellipse rx="70" ry="26" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      <circle id="g-earth" r="9" fill="var(--blue)" cx="70" cy="0"/>
      <ellipse id="g-moon-orbit" rx="18" ry="7" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" cx="70" cy="0"/>
      <circle id="g-moon" r="3.5" fill="#CBD5E1"/>
    </g>
  `;
  gsap.set('#g-apple', { y: 0 });

  gravityTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
  gravityTl
    .call(() => caption.textContent = 'An apple falls — pulled straight down by gravity.')
    .to('#g-apple', { attr: { cy: 322 }, duration: 1.1, ease: 'power2.in' })
    .to('#g-apple', { opacity: 0, duration: .3 })
    .set('#g-apple', { attr: { cy: 220 }, opacity: 1 })
    .call(() => caption.textContent = 'The Moon orbits Earth. Earth orbits the Sun. The Moon obeys the same law.', [], '+=0.2');

  const earthAngle = { a: 0 };
  const moonAngle = { a: 0 };
  gravityEarthTween = gsap.to(earthAngle, {
    a: Math.PI * 2, duration: 6, repeat: -1, ease: 'none',
    onUpdate: () => {
      const x = Math.cos(earthAngle.a) * 70;
      const y = Math.sin(earthAngle.a) * 26;
      const earth = document.getElementById('g-earth');
      const moonOrbit = document.getElementById('g-moon-orbit');
      if (earth) { earth.setAttribute('cx', x); earth.setAttribute('cy', y); }
      if (moonOrbit) { moonOrbit.setAttribute('cx', x); moonOrbit.setAttribute('cy', y); }
    }
  });
  gravityMoonTween = gsap.to(moonAngle, {
    a: Math.PI * 2, duration: 1.4, repeat: -1, ease: 'none',
    onUpdate: () => {
      const earth = document.getElementById('g-earth');
      const moon = document.getElementById('g-moon');
      if (!earth || !moon) return;
      const ex = parseFloat(earth.getAttribute('cx'));
      const ey = parseFloat(earth.getAttribute('cy'));
      moon.setAttribute('cx', ex + Math.cos(moonAngle.a) * 18);
      moon.setAttribute('cy', ey + Math.sin(moonAngle.a) * 7);
    }
  });
};
sceneExitFns['scene-05'] = function () {
  if (gravityTl) gravityTl.kill();
  if (gravityEarthTween) gravityEarthTween.kill();
  if (gravityMoonTween) gravityMoonTween.kill();
  document.getElementById('gravity-scene').innerHTML = '';
};

/* ==========================================================================
   9. SCENE 06 — COMPARISON TABLE
   ========================================================================== */

sceneEnterFns['scene-06'] = function () {
  gsap.set('.ct-row:not(.ct-head)', { opacity: 0, x: -18 });
  gsap.to('.ct-row:not(.ct-head)', { opacity: 1, x: 0, duration: .6, ease: 'power2.out', stagger: .15, delay: .2 });
};

/* ==========================================================================
   10. SCENE 07 — CONCLUSION
   ========================================================================== */

sceneEnterFns['scene-07'] = function () {
  gsap.set('#scene-07 .reveal-line, #scene-07 .core-emblem--final', { opacity: 0, y: 16 });
  const tl = gsap.timeline();
  tl.to('#emblem-final', { opacity: 1, y: 0, duration: .9, ease: 'power3.out' })
    .to('.closing-line', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, '-=.4')
    .to('.thank-you', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, '-=.4')
    .to('.closing-course', { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, '-=.4')
    .to('.play-btn--ghost', { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, '-=.3');
  gsap.to('.final-o1', { rotation: '+=360', transformOrigin: '150px 150px', duration: 16, repeat: -1, ease: 'none' });
  gsap.to('.final-o2', { rotation: '+=360', transformOrigin: '150px 150px', duration: 20, repeat: -1, ease: 'none' });
  gsap.to('.final-o3', { rotation: '+=360', transformOrigin: '150px 150px', duration: 24, repeat: -1, ease: 'none' });
};

/* ==========================================================================
   11. BOOT
   ========================================================================== */

document.getElementById('scene-00').classList.add('is-active');
updateTransportUI();


