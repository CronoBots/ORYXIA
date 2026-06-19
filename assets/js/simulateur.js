/* =========================================================
   ORYXIA DESIGN — Simulateur de gravure
   Charge une image et simule le rendu gravé sur médaille/plaque.
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
    shape: "medal",      // medal | round | square | tag | plaque
    material: "or",      // or | argent | bronze | noir | bois
    contrast: 35,
    brightness: 0,
    depth: 85,           // intensité de gravure
    invert: false,
    text: "ORYXIA",
    subtext: "Édition limitée",
    showText: true,
  };

  const MATERIALS = {
    or:     { name: "Or",      base: "#caa24a", light: "#fbe9a8", dark: "#8a6a1e", engrave: "#5a4310", ring: "#e8c766" },
    argent: { name: "Argent",  base: "#c4c6cc", light: "#ffffff", dark: "#7c7e86", engrave: "#54565c", ring: "#e9eaee" },
    bronze: { name: "Bronze",  base: "#b07a45", light: "#e6b07a", dark: "#6e441f", engrave: "#3f2a14", ring: "#cf975c" },
    noir:   { name: "Noir mat",base: "#1d1d22", light: "#3a3a42", dark: "#0c0c0f", engrave: "#d8c79a", ring: "#2a2a30" },
    bois:   { name: "Bois",    base: "#a9743f", light: "#d6a86a", dark: "#6e451f", engrave: "#3a2310", ring: "#c08a4f" },
  };

  /* ---------- Traitement image -> masque de gravure ---------- */
  function buildEngravingPattern(diameter) {
    const off = document.createElement("canvas");
    off.width = off.height = diameter;
    const octx = off.getContext("2d");
    if (!state.img) return off;

    // Cadrage "cover" centré
    const iw = state.img.width, ih = state.img.height;
    const scale = Math.max(diameter / iw, diameter / ih);
    const dw = iw * scale, dh = ih * scale;
    octx.drawImage(state.img, (diameter - dw) / 2, (diameter - dh) / 2, dw, dh);

    const mat = MATERIALS[state.material];
    const eng = hexToRgb(mat.engrave);
    const imgData = octx.getImageData(0, 0, diameter, diameter);
    const d = imgData.data;
    const contrast = (state.contrast / 100) * 1.8 + 1;   // 1 -> 2.8
    const bright = state.brightness * 1.2;
    const depth = state.depth / 100;

    for (let i = 0; i < d.length; i += 4) {
      // Luminance
      let lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      // Contraste + luminosité
      lum = (lum - 128) * contrast + 128 + bright;
      lum = Math.max(0, Math.min(255, lum));
      let dark = 1 - lum / 255;            // 1 = très sombre = gravé fort
      if (state.invert) dark = 1 - dark;
      const a = Math.min(255, dark * 255 * depth);
      d[i] = eng.r; d[i + 1] = eng.g; d[i + 2] = eng.b; d[i + 3] = a;
    }
    octx.putImageData(imgData, 0, 0);

    // Léger flou pour adoucir (effet matière gravée)
    return off;
  }

  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  /* ---------- Rendu du support métallique ---------- */
  function metalGradient(cx, cy, r, mat) {
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, mat.light);
    g.addColorStop(0.35, mat.base);
    g.addColorStop(0.55, mat.dark);
    g.addColorStop(0.75, mat.base);
    g.addColorStop(1, mat.light);
    return g;
  }

  function drawRibbon(cx, topY, mat) {
    // Ruban de médaille
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

  function render() {
    const mat = MATERIALS[state.material];
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Fond studio
    const bg = ctx.createRadialGradient(SIZE / 2, SIZE * 0.4, 60, SIZE / 2, SIZE / 2, SIZE * 0.75);
    bg.addColorStop(0, "#202028");
    bg.addColorStop(1, "#0a0a0c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const cx = SIZE / 2;
    let cy = SIZE / 2;

    if (state.shape === "medal") {
      cy = SIZE / 2 + 40;
      drawRibbon(cx, cy - 200, mat);
    }

    const isRound = state.shape === "medal" || state.shape === "round";

    if (state.shape === "plaque" || state.shape === "tag") {
      // Plaque / médaillon rectangulaire
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

      // Liseré
      roundedRect(x + 16, y + 16, w - 32, h - 32, rad - 6);
      ctx.lineWidth = 3; ctx.strokeStyle = mat.dark; ctx.stroke();

      // Gravure
      const pat = buildEngravingPattern(Math.min(w, h) - 70);
      roundedRect(x + 30, y + 30, w - 60, h - 60, rad - 8);
      ctx.save(); ctx.clip();
      const pSize = Math.min(w, h) - 70;
      ctx.drawImage(pat, cx - pSize / 2, cy - pSize / 2 - (state.showText ? 26 : 0));
      ctx.restore();

      if (state.shape === "tag") {
        ctx.beginPath(); ctx.arc(cx, y + 42, 22, 0, Math.PI * 2);
        ctx.lineWidth = 14; ctx.strokeStyle = mat.dark; ctx.stroke();
        ctx.fillStyle = "#0a0a0c"; ctx.fill();
      }
      drawText(cx, y + h - 70, mat);
      drawSheen(cx, cy, Math.max(w, h) / 2);

    } else if (state.shape === "square") {
      const s = 460;
      const x = cx - s / 2, y = cy - s / 2;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24;
      roundedRect(x, y, s, s, 26);
      ctx.fillStyle = metalGradient(cx, cy, s / 2, mat);
      ctx.fill();
      ctx.restore();
      roundedRect(x + 18, y + 18, s - 36, s - 36, 18);
      ctx.lineWidth = 3; ctx.strokeStyle = mat.dark; ctx.stroke();
      const pat = buildEngravingPattern(s - 80);
      roundedRect(x + 36, y + 36, s - 72, s - 72, 14);
      ctx.save(); ctx.clip();
      ctx.drawImage(pat, x + 40, y + 40 - (state.showText ? 20 : 0));
      ctx.restore();
      drawText(cx, y + s - 60, mat);
      drawSheen(cx, cy, s / 2);

    } else {
      // MÉDAILLE / DISQUE ROND
      const r = 215;

      // Ombre portée
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.65)"; ctx.shadowBlur = 55; ctx.shadowOffsetY = 26;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = metalGradient(cx, cy, r, mat);
      ctx.fill();
      ctx.restore();

      // Anneau extérieur en relief
      ctx.beginPath(); ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
      ctx.lineWidth = 16; ctx.strokeStyle = mat.ring; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r - 16, 0, Math.PI * 2);
      ctx.lineWidth = 3; ctx.strokeStyle = mat.dark; ctx.stroke();

      // Perles décoratives sur l'anneau
      ctx.fillStyle = mat.dark;
      const beads = 60;
      for (let i = 0; i < beads; i++) {
        const ang = (i / beads) * Math.PI * 2;
        const bx = cx + Math.cos(ang) * (r - 6);
        const by = cy + Math.sin(ang) * (r - 6);
        ctx.beginPath(); ctx.arc(bx, by, 2.2, 0, Math.PI * 2); ctx.fill();
      }

      // Champ intérieur (légèrement creusé)
      const innerR = r - 34;
      ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      const ig = ctx.createRadialGradient(cx - 40, cy - 50, 30, cx, cy, innerR);
      ig.addColorStop(0, mat.light); ig.addColorStop(0.6, mat.base); ig.addColorStop(1, mat.dark);
      ctx.fillStyle = ig; ctx.fill();

      // Texte courbé en haut (anneau)
      if (state.showText) drawCurvedText(cx, cy, r - 21, state.text.toUpperCase(), mat);

      // Gravure image
      const dia = innerR * 2 - 26;
      const pat = buildEngravingPattern(dia);
      ctx.save();
      ctx.beginPath();
      const yOffset = state.showText ? 8 : 0;
      ctx.arc(cx, cy + yOffset, innerR - 18, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(pat, cx - dia / 2, cy + yOffset - dia / 2);
      ctx.restore();

      // Sous-texte gravé en bas
      if (state.showText && state.subtext) drawCurvedText(cx, cy, r - 21, state.subtext.toUpperCase(), mat, true);

      drawSheen(cx, cy, r);
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

  function drawText(cx, y, mat) {
    if (!state.showText) return;
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = mat.engrave;
    ctx.font = "700 40px Cinzel, serif";
    ctx.fillText(state.text.toUpperCase(), cx, y);
    if (state.subtext) {
      ctx.font = "400 18px Jost, sans-serif";
      ctx.fillStyle = mat.dark;
      ctx.fillText(state.subtext, cx, y + 28);
    }
    ctx.restore();
  }

  function drawCurvedText(cx, cy, radius, text, mat, bottom) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = mat.engrave;
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
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  }

  function drawSheen(cx, cy, r) {
    ctx.save();
    ctx.beginPath();
    if (state.shape === "plaque" || state.shape === "tag" || state.shape === "square") {
      ctx.rect(cx - r, cy - r, r * 2, r * 2);
    } else {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    }
    ctx.clip();
    const sh = ctx.createLinearGradient(cx - r, cy - r, cx + r * 0.3, cy + r * 0.2);
    sh.addColorStop(0, "rgba(255,255,255,.28)");
    sh.addColorStop(0.25, "rgba(255,255,255,.05)");
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
    ctx.fillText("pour visualiser la gravure", cx, cy + 22);
    ctx.restore();
  }

  /* ---------- Chargement image ---------- */
  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { state.img = img; render(); document.getElementById("sim-empty")?.classList.add("hidden"); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- Branchements UI ---------- */
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
      el.addEventListener("input", () => { state[key] = +el.value; if (val) val.textContent = el.value + suffix; render(); });
    };
    bindSlider("ctl-contrast", "contrast", "%");
    bindSlider("ctl-bright", "brightness");
    bindSlider("ctl-depth", "depth", "%");

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
    document.getElementById("sim-reset")?.addEventListener("click", () => {
      state.img = null; render();
    });
  }

  bind();
  render();
})();
