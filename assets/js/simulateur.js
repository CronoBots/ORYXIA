/* =========================================================
   ORYXIA DESIGN — Simulateur de gravure (moteur relief)
   Transforme une image en gravure métallique en relief :
   carte de hauteur -> normales (Sobel) -> éclairage directionnel
   + spéculaire + patine, teinté à la matière choisie.
   100% côté client (aucun envoi de fichier).
   ========================================================= */
(function () {
  "use strict";

  const canvas = document.getElementById("sim-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const SIZE = 760;
  canvas.width = SIZE;
  canvas.height = SIZE;

  // État
  const state = {
    img: null,
    shape: "medal",       // medal | round | square | tag | plaque
    material: "laiton",   // laiton | or | argent | bronze | noir | bois
    contrast: 45,
    brightness: 0,
    depth: 70,            // profondeur du relief
    detail: 55,           // finesse / netteté du relief
    invert: false,        // creux <-> relief
    polish: 55,           // intensité des reflets métalliques
    text: "ORYXIA",
    subtext: "Édition limitée",
    showText: true,
  };

  // Palettes métal : [ombre, médian, lumière] en RGB
  const MATERIALS = {
    laiton: { name: "Laiton", shadow: [34, 22, 8],  mid: [150, 108, 44], high: [243, 221, 150], ring: [196, 152, 70], spec: [255, 246, 210] },
    or:     { name: "Or",     shadow: [58, 42, 8],  mid: [196, 158, 60], high: [255, 233, 168], ring: [232, 199, 102], spec: [255, 250, 224] },
    argent: { name: "Argent", shadow: [54, 56, 62], mid: [176, 178, 188], high: [255, 255, 255], ring: [220, 222, 228], spec: [255, 255, 255] },
    bronze: { name: "Bronze", shadow: [33, 18, 8],  mid: [138, 90, 44],  high: [230, 176, 122], ring: [180, 120, 70],  spec: [255, 226, 188] },
    noir:   { name: "Noir mat", shadow: [6, 6, 8],  mid: [42, 42, 50],   high: [120, 120, 134], ring: [60, 60, 70],    spec: [180, 180, 190] },
    bois:   { name: "Bois",   shadow: [40, 24, 12], mid: [151, 99, 58],  high: [216, 180, 132], ring: [176, 120, 70],  spec: [235, 210, 170] },
  };

  /* ---------- Carte de hauteur depuis l'image ---------- */
  function buildHeightMap(d) {
    const off = document.createElement("canvas");
    off.width = off.height = d;
    const octx = off.getContext("2d");
    // Cadrage "cover" centré
    const iw = state.img.width, ih = state.img.height;
    const scale = Math.max(d / iw, d / ih);
    const dw = iw * scale, dh = ih * scale;
    octx.drawImage(state.img, (d - dw) / 2, (d - dh) / 2, dw, dh);

    const data = octx.getImageData(0, 0, d, d).data;
    const contrast = (state.contrast / 100) * 2.2 + 0.6;   // ~0.6 -> 2.8
    const bright = state.brightness / 100 * 0.5;
    const H = new Float32Array(d * d);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const a = data[i + 3] / 255;
      // luminance perçue ; les zones transparentes deviennent "fond" (médian)
      let lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      lum = lum * a + 0.5 * (1 - a);
      lum = (lum - 0.5) * contrast + 0.5 + bright;
      H[p] = Math.max(0, Math.min(1, lum));
    }
    // Lissage léger (réduit le bruit, adoucit la matière)
    return blur(H, d, 1);
  }

  function blur(src, d, r) {
    if (r <= 0) return src;
    const tmp = new Float32Array(d * d);
    const out = new Float32Array(d * d);
    const win = r * 2 + 1;
    // horizontal
    for (let y = 0; y < d; y++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += src[y * d + Math.min(d - 1, Math.max(0, x))];
      for (let x = 0; x < d; x++) {
        tmp[y * d + x] = acc / win;
        const add = src[y * d + Math.min(d - 1, x + r + 1)];
        const sub = src[y * d + Math.max(0, x - r)];
        acc += add - sub;
      }
    }
    // vertical
    for (let x = 0; x < d; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[Math.min(d - 1, Math.max(0, y)) * d + x];
      for (let y = 0; y < d; y++) {
        out[y * d + x] = acc / win;
        const add = tmp[Math.min(d - 1, y + r + 1) * d + x];
        const sub = tmp[Math.max(0, y - r) * d + x];
        acc += add - sub;
      }
    }
    return out;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- Rendu relief (emboss + éclairage) ---------- */
  function buildReliefPattern(diameter) {
    const d = diameter;
    const off = document.createElement("canvas");
    off.width = off.height = d;
    const octx = off.getContext("2d");
    if (!state.img) return off;

    let H = buildHeightMap(d);
    if (state.invert) for (let i = 0; i < H.length; i++) H[i] = 1 - H[i];

    const mat = MATERIALS[state.material];
    const sh = mat.shadow, md = mat.mid, hi = mat.high, sp = mat.spec;

    const strength = (state.depth / 100) * 7 + 0.8;   // amplitude des pentes
    const detail = (state.detail / 100) * 2.2 + 0.4;  // gain sur les gradients
    const polish = state.polish / 100;                // reflets
    const shininess = 8 + polish * 60;
    const ambient = 0.30;
    const diffK = 0.95;

    // Lumière directionnelle (haut-gauche, comme une photo d'atelier)
    let Lx = -0.38, Ly = -0.62, Lz = 0.68;
    const Ll = Math.hypot(Lx, Ly, Lz); Lx /= Ll; Ly /= Ll; Lz /= Ll;
    // Demi-vecteur (Blinn) avec vue de face V=(0,0,1)
    let Hx = Lx, Hy = Ly, Hz = Lz + 1;
    const Hl = Math.hypot(Hx, Hy, Hz); Hx /= Hl; Hy /= Hl; Hz /= Hl;

    const out = octx.createImageData(d, d);
    const o = out.data;

    for (let y = 0; y < d; y++) {
      const yu = y > 0 ? y - 1 : 0;
      const yd = y < d - 1 ? y + 1 : d - 1;
      for (let x = 0; x < d; x++) {
        const xl = x > 0 ? x - 1 : 0;
        const xr = x < d - 1 ? x + 1 : d - 1;
        const idx = y * d + x;

        // Gradient (Sobel simplifié)
        const dX = (H[y * d + xr] - H[y * d + xl]) * detail;
        const dY = (H[yd * d + x] - H[yu * d + x]) * detail;

        // Normale de surface
        let nx = -dX * strength, ny = -dY * strength, nz = 1;
        const nl = Math.sqrt(nx * nx + ny * ny + 1);
        nx /= nl; ny /= nl; nz /= nl;

        // Éclairage
        const diff = Math.max(0, nx * Lx + ny * Ly + nz * Lz);
        let spec = nx * Hx + ny * Hy + nz * Hz;
        spec = spec > 0 ? Math.pow(spec, shininess) * polish * 1.4 : 0;

        const h = H[idx];
        // Patine : les creux (h faible) s'assombrissent
        let light = (ambient + diff * diffK) * (0.5 + 0.5 * h);

        // Couleur métallique selon l'intensité
        let r, g, b;
        const t = Math.min(1.3, light) / 1.3;
        if (t < 0.5) {
          const k = t / 0.5;
          r = lerp(sh[0], md[0], k); g = lerp(sh[1], md[1], k); b = lerp(sh[2], md[2], k);
        } else {
          const k = (t - 0.5) / 0.5;
          r = lerp(md[0], hi[0], k); g = lerp(md[1], hi[1], k); b = lerp(md[2], hi[2], k);
        }
        // Reflet spéculaire (glint métallique)
        r += sp[0] * spec; g += sp[1] * spec; b += sp[2] * spec;

        const j = idx * 4;
        o[j] = r > 255 ? 255 : r;
        o[j + 1] = g > 255 ? 255 : g;
        o[j + 2] = b > 255 ? 255 : b;
        o[j + 3] = 255;
      }
    }
    octx.putImageData(out, 0, 0);
    return off;
  }

  /* ---------- Support métallique ---------- */
  function rgb(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a == null ? 1 : a})`; }

  function metalGradient(cx, cy, r, mat) {
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, rgb(mat.high));
    g.addColorStop(0.35, rgb(mat.ring));
    g.addColorStop(0.55, rgb(mat.shadow));
    g.addColorStop(0.75, rgb(mat.ring));
    g.addColorStop(1, rgb(mat.high));
    return g;
  }

  function drawRibbon(cx, topY) {
    const w = 120;
    ctx.save();
    const grd = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    grd.addColorStop(0, "#7a1320"); grd.addColorStop(0.5, "#c0233a"); grd.addColorStop(1, "#7a1320");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, 40);
    ctx.lineTo(cx - 28, topY);
    ctx.lineTo(cx + 28, topY);
    ctx.lineTo(cx + w / 2, 40);
    ctx.lineTo(cx + w / 2 - 22, 40);
    ctx.lineTo(cx, topY - 60);
    ctx.lineTo(cx - w / 2 + 22, 40);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function roundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fieldBase(cx, cy, r, mat) {
    const ig = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.1, cx, cy, r);
    ig.addColorStop(0, rgb(mat.high)); ig.addColorStop(0.5, rgb(mat.mid)); ig.addColorStop(1, rgb(mat.shadow));
    return ig;
  }

  function render() {
    const mat = MATERIALS[state.material];
    ctx.clearRect(0, 0, SIZE, SIZE);

    const bg = ctx.createRadialGradient(SIZE / 2, SIZE * 0.4, 60, SIZE / 2, SIZE / 2, SIZE * 0.75);
    bg.addColorStop(0, "#1c1c22"); bg.addColorStop(1, "#0a0a0c");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, SIZE, SIZE);

    const cx = SIZE / 2;
    let cy = SIZE / 2;

    if (state.shape === "medal") { cy = SIZE / 2 + 40; drawRibbon(cx, cy - 200); }

    if (state.shape === "plaque" || state.shape === "tag") {
      const w = state.shape === "tag" ? 300 : 520;
      const h = state.shape === "tag" ? 480 : 360;
      const x = cx - w / 2, y = cy - h / 2;
      const rad = state.shape === "tag" ? 40 : 18;

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24;
      roundedRect(x, y, w, h, rad);
      ctx.fillStyle = metalGradient(cx, cy, Math.max(w, h) / 2, mat);
      ctx.fill();
      ctx.restore();

      roundedRect(x + 16, y + 16, w - 32, h - 32, rad - 6);
      ctx.lineWidth = 3; ctx.strokeStyle = rgb(mat.shadow); ctx.stroke();

      const fieldW = w - 60, fieldH = h - 60, fieldY = state.showText ? y + 24 : y + 30;
      roundedRect(x + 30, fieldY, fieldW, h - (state.showText ? 96 : 60), rad - 8);
      ctx.save(); ctx.clip();
      ctx.fillStyle = fieldBase(cx, cy, Math.max(w, h) / 2, mat); ctx.fillRect(x, y, w, h);
      if (state.img) {
        const pSize = Math.min(fieldW, fieldH);
        const pat = buildReliefPattern(pSize);
        ctx.drawImage(pat, cx - pSize / 2, fieldY + (h - 96) / 2 - pSize / 2);
      }
      ctx.restore();

      if (state.shape === "tag") {
        ctx.beginPath(); ctx.arc(cx, y + 42, 22, 0, Math.PI * 2);
        ctx.lineWidth = 14; ctx.strokeStyle = rgb(mat.shadow); ctx.stroke();
        ctx.fillStyle = "#0a0a0c"; ctx.fill();
      }
      drawText(cx, y + h - 60, mat);
      drawSheen(cx, cy, Math.max(w, h) / 2, false);

    } else if (state.shape === "square") {
      const s = 460;
      const x = cx - s / 2, y = cy - s / 2;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24;
      roundedRect(x, y, s, s, 26);
      ctx.fillStyle = metalGradient(cx, cy, s / 2, mat); ctx.fill();
      ctx.restore();
      roundedRect(x + 18, y + 18, s - 36, s - 36, 18);
      ctx.lineWidth = 3; ctx.strokeStyle = rgb(mat.shadow); ctx.stroke();

      const fs = s - 80;
      roundedRect(x + 36, y + 36, fs, fs - (state.showText ? 30 : 0), 14);
      ctx.save(); ctx.clip();
      ctx.fillStyle = fieldBase(cx, cy, s / 2, mat); ctx.fillRect(x, y, s, s);
      if (state.img) { const pat = buildReliefPattern(fs); ctx.drawImage(pat, x + 40, y + 40 - (state.showText ? 16 : 0)); }
      ctx.restore();
      drawText(cx, y + s - 52, mat);
      drawSheen(cx, cy, s / 2, false);

    } else {
      // MÉDAILLE / DISQUE ROND
      const r = 215;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.65)"; ctx.shadowBlur = 55; ctx.shadowOffsetY = 26;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = metalGradient(cx, cy, r, mat); ctx.fill();
      ctx.restore();

      // Anneau en relief
      ctx.beginPath(); ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
      ctx.lineWidth = 16; ctx.strokeStyle = rgb(mat.ring); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r - 16, 0, Math.PI * 2);
      ctx.lineWidth = 3; ctx.strokeStyle = rgb(mat.shadow); ctx.stroke();

      // Perles décoratives
      ctx.fillStyle = rgb(mat.shadow);
      const beads = 72;
      for (let i = 0; i < beads; i++) {
        const ang = (i / beads) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * (r - 6), cy + Math.sin(ang) * (r - 6), 2.2, 0, Math.PI * 2); ctx.fill();
      }

      const innerR = r - 34;
      ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.fillStyle = fieldBase(cx, cy, innerR, mat); ctx.fill();

      if (state.showText) drawCurvedText(cx, cy, r - 21, state.text.toUpperCase(), mat, false);

      // Relief image
      if (state.img) {
        const dia = (innerR - 14) * 2;
        const pat = buildReliefPattern(dia);
        ctx.save();
        ctx.beginPath();
        const yOffset = state.showText ? 6 : 0;
        ctx.arc(cx, cy + yOffset, innerR - 16, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(pat, cx - dia / 2, cy + yOffset - dia / 2);
        ctx.restore();
      }

      if (state.showText && state.subtext) drawCurvedText(cx, cy, r - 21, state.subtext.toUpperCase(), mat, true);
      drawSheen(cx, cy, r, true);
    }

    // Filigrane discret
    ctx.save();
    ctx.font = "600 13px Jost, sans-serif";
    ctx.fillStyle = "rgba(230,180,34,.45)";
    ctx.textAlign = "right";
    ctx.fillText("Simulation ORYXIA Design", SIZE - 18, SIZE - 16);
    ctx.restore();

    if (!state.img) drawPlaceholderHint(cx, cy);
  }

  /* ---------- Texte gravé (léger emboss) ---------- */
  function engravedText(txt, x, y, mat) {
    ctx.fillStyle = rgb(mat.shadow, .9);
    ctx.fillText(txt, x, y + 1.5);
    ctx.fillStyle = rgb(mat.high, .9);
    ctx.fillText(txt, x, y - 1);
  }

  function drawText(cx, y, mat) {
    if (!state.showText) return;
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "700 40px Cinzel, serif";
    engravedText(state.text.toUpperCase(), cx, y, mat);
    if (state.subtext) {
      ctx.font = "400 18px Jost, sans-serif";
      ctx.fillStyle = rgb(mat.shadow);
      ctx.fillText(state.subtext, cx, y + 28);
    }
    ctx.restore();
  }

  function drawCurvedText(cx, cy, radius, text, mat, bottom) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.font = "700 26px Cinzel, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const chars = text.split("");
    const arc = Math.min(Math.PI * 0.9, chars.length * 0.13);
    const step = arc / Math.max(chars.length, 1);
    let start = bottom ? Math.PI / 2 + arc / 2 : -Math.PI / 2 - arc / 2;
    chars.forEach((ch, i) => {
      const ang = bottom ? start - step * i : start + step * i;
      ctx.save();
      ctx.rotate(ang);
      ctx.translate(0, bottom ? radius : -radius);
      if (bottom) ctx.rotate(Math.PI);
      ctx.fillStyle = rgb(mat.shadow, .9); ctx.fillText(ch, 0, 1.5);
      ctx.fillStyle = rgb(mat.high, .85); ctx.fillText(ch, 0, -0.5);
      ctx.restore();
    });
    ctx.restore();
  }

  function drawSheen(cx, cy, r, round) {
    ctx.save();
    ctx.beginPath();
    if (round) ctx.arc(cx, cy, r, 0, Math.PI * 2); else ctx.rect(cx - r, cy - r, r * 2, r * 2);
    ctx.clip();
    const sh = ctx.createLinearGradient(cx - r, cy - r, cx + r * 0.3, cy + r * 0.2);
    sh.addColorStop(0, "rgba(255,255,255,.22)");
    sh.addColorStop(0.25, "rgba(255,255,255,.04)");
    sh.addColorStop(0.5, "rgba(255,255,255,0)");
    ctx.fillStyle = sh;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }

  function drawPlaceholderHint(cx, cy) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.font = "600 22px Cinzel, serif";
    ctx.fillText("Importez une image", cx, cy - 6);
    ctx.font = "300 15px Jost, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillText("pour visualiser la gravure en relief", cx, cy + 22);
    ctx.restore();
  }

  /* ---------- Chargement image ---------- */
  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { state.img = img; render(); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- UI ---------- */
  function bind() {
    const file = document.getElementById("sim-file");
    const dz = document.getElementById("sim-drop");
    if (dz) {
      dz.addEventListener("click", () => file.click());
      dz.addEventListener("dragover", e => { e.preventDefault(); dz.classList.add("drag"); });
      dz.addEventListener("dragleave", () => dz.classList.remove("drag"));
      dz.addEventListener("drop", e => { e.preventDefault(); dz.classList.remove("drag"); loadFile(e.dataTransfer.files[0]); });
    }
    if (file) file.addEventListener("change", e => loadFile(e.target.files[0]));

    document.querySelectorAll("[data-shape]").forEach(b => b.addEventListener("click", () => {
      document.querySelectorAll("[data-shape]").forEach(x => x.classList.remove("active"));
      b.classList.add("active"); state.shape = b.dataset.shape; render();
    }));
    document.querySelectorAll("[data-mat]").forEach(b => b.addEventListener("click", () => {
      document.querySelectorAll("[data-mat]").forEach(x => x.classList.remove("active"));
      b.classList.add("active"); state.material = b.dataset.mat; render();
    }));

    const bindSlider = (id, key, suffix = "") => {
      const el = document.getElementById(id); if (!el) return;
      const val = document.getElementById(id + "-val");
      el.value = state[key];
      if (val) val.textContent = el.value + suffix;
      el.addEventListener("input", () => { state[key] = +el.value; if (val) val.textContent = el.value + suffix; render(); });
    };
    bindSlider("ctl-depth", "depth", "%");
    bindSlider("ctl-detail", "detail", "%");
    bindSlider("ctl-polish", "polish", "%");
    bindSlider("ctl-contrast", "contrast", "%");
    bindSlider("ctl-bright", "brightness");

    document.getElementById("ctl-invert")?.addEventListener("change", e => { state.invert = e.target.checked; render(); });
    document.getElementById("ctl-showtext")?.addEventListener("change", e => { state.showText = e.target.checked; render(); });
    document.getElementById("ctl-text")?.addEventListener("input", e => { state.text = e.target.value; render(); });
    document.getElementById("ctl-subtext")?.addEventListener("input", e => { state.subtext = e.target.value; render(); });

    document.getElementById("sim-download")?.addEventListener("click", () => {
      const a = document.createElement("a");
      a.download = "oryxia-simulation-gravure.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    });
    document.getElementById("sim-reset")?.addEventListener("click", () => { state.img = null; render(); });
  }

  bind();
  render();
})();
