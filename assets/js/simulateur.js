/* =========================================================
   ORYXIA DESIGN — Simulateur de gravure (rendu réaliste)
   Métal réellement réfléchissant (reflets d'environnement,
   grain, marques de tour) ; seule la zone gravée est altérée
   (creux mats patinés + arêtes polies), comme une vraie pièce.
   100% côté client.
   ========================================================= */
(function () {
  "use strict";

  const canvas = document.getElementById("sim-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const S = 760;
  canvas.width = S; canvas.height = S;

  // calque hors-écran : on dessine la face de la pièce dessus,
  // puis on l'incline en perspective (vue 3D) sur le canvas visible.
  const med = document.createElement("canvas"); med.width = med.height = S;
  const mctx = med.getContext("2d");

  const state = {
    img: null, shape: "round", material: "laiton",
    contrast: 50, brightness: 0, depth: 70, detail: 55, invert: false, polish: 60,
    tilt: false, text: "ORYXIA", subtext: "Édition limitée", showText: true,
  };
  const DEFAULT_IMG = "assets/img/logo.jpeg";

  // kind: metal | anodized | wood
  const MAT = {
    laiton: { kind: "metal", shadow: [60, 42, 16], mid: [170, 130, 60], high: [248, 230, 165], patina: [40, 28, 12], spec: [255, 250, 228], reflect: 1.0 },
    or:     { kind: "metal", shadow: [78, 56, 14], mid: [196, 158, 60], high: [255, 236, 170], patina: [60, 44, 12], spec: [255, 252, 232], reflect: 1.0 },
    argent: { kind: "metal", shadow: [74, 78, 86], mid: [176, 180, 190], high: [255, 255, 255], patina: [60, 62, 70], spec: [255, 255, 255], reflect: 1.0 },
    bronze: { kind: "metal", shadow: [44, 26, 12], mid: [142, 92, 48], high: [232, 180, 126], patina: [34, 20, 10], spec: [255, 228, 190], reflect: 0.85 },
    noir:   { kind: "anodized", shadow: [14, 14, 17], mid: [26, 26, 31], high: [60, 60, 70], reveal: [200, 202, 210], spec: [150, 150, 160], reflect: 0.30 },
    bois:   { kind: "wood", shadow: [70, 44, 22], mid: [150, 100, 58], high: [206, 160, 110], burn: [46, 26, 12], spec: [120, 90, 60], reflect: 0.18 },
  };

  /* ---------- géométrie & grain (cache par taille) ---------- */
  let GEO = null;
  function geometry() {
    if (GEO) return GEO;
    const rad = new Float32Array(S * S), ang = new Float32Array(S * S);
    const ny0 = new Float32Array(S * S), nx0 = new Float32Array(S * S);
    const cx = S / 2, cy = S / 2, R = 300;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, ax = (x - cx) / R, ay = (y - cy) / R;
      nx0[i] = ax; ny0[i] = ay; rad[i] = Math.sqrt(ax * ax + ay * ay); ang[i] = Math.atan2(ay, ax);
    }
    GEO = { rad, ang, nx0, ny0, grain: makeGrain(S), wood: makeWood(S) };
    return GEO;
  }
  function makeGrain(size) {
    const sc = document.createElement("canvas"); sc.width = sc.height = Math.round(size * 0.06);
    const sx = sc.getContext("2d"); const id = sx.createImageData(sc.width, sc.height);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    sx.putImageData(id, 0, 0);
    const bc = document.createElement("canvas"); bc.width = bc.height = size;
    const bx = bc.getContext("2d"); bx.imageSmoothingEnabled = true; bx.drawImage(sc, 0, 0, size, size);
    // 2e octave
    const sc2 = document.createElement("canvas"); sc2.width = sc2.height = Math.round(size * 0.18);
    const s2 = sc2.getContext("2d"); const id2 = s2.createImageData(sc2.width, sc2.height);
    for (let i = 0; i < id2.data.length; i += 4) { const v = Math.random() * 255; id2.data[i] = id2.data[i + 1] = id2.data[i + 2] = v; id2.data[i + 3] = 90; }
    s2.putImageData(id2, 0, 0); bx.drawImage(sc2, 0, 0, size, size);
    const d = bx.getImageData(0, 0, size, size).data; const g = new Float32Array(size * size);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) g[p] = d[i] / 255;
    return g;
  }
  function makeWood(size) {
    // veines de bois : bruit étiré horizontalement + anneaux
    const g = GEO ? GEO.grain : null;
    const w = new Float32Array(size * size);
    const sc = document.createElement("canvas"); sc.width = Math.round(size * 0.5); sc.height = Math.round(size * 0.03);
    const sx = sc.getContext("2d"); const id = sx.createImageData(sc.width, sc.height);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    sx.putImageData(id, 0, 0);
    const bc = document.createElement("canvas"); bc.width = bc.height = size; const bx = bc.getContext("2d");
    bx.imageSmoothingEnabled = true; bx.drawImage(sc, 0, 0, size, size);
    const d = bx.getImageData(0, 0, size, size).data;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = y * size + x; const veins = Math.abs(Math.sin((y + d[i * 4] * 0.25) * 0.18));
      w[i] = veins;
    }
    return w;
  }

  /* ---------- carte de hauteur depuis l'image ----------
     Le motif est embossé sur un champ PLAT (baseline 0.5) :
     le fond de l'image (mesuré sur ses bords) reste au niveau du champ,
     seuls les détails s'élèvent (clair) ou se creusent (sombre). */
  function heightField(placeR, ox, oy) {
    const fd = Math.round(placeR * 2);
    const off = document.createElement("canvas"); off.width = off.height = fd;
    const o = off.getContext("2d");
    const iw = state.img.width, ih = state.img.height, sc = Math.max(fd / iw, fd / ih);
    const dw = iw * sc, dh = ih * sc;
    o.drawImage(state.img, (fd - dw) / 2, (fd - dh) / 2, dw, dh);
    const data = o.getImageData(0, 0, fd, fd).data;
    const lum = new Float32Array(fd * fd);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const a = data[i + 3] / 255;
      lum[p] = ((0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255) * a;
    }
    // baseline = médiane approx du pourtour (fond de l'image)
    const edge = [];
    for (let x = 0; x < fd; x += 4) { edge.push(lum[x], lum[(fd - 1) * fd + x]); }
    for (let y = 0; y < fd; y += 4) { edge.push(lum[y * fd], lum[y * fd + fd - 1]); }
    edge.sort((a, b) => a - b); const base = edge[edge.length >> 1] || 0;
    const gain = (state.contrast / 100) * 2.0 + 0.8;
    const bright = state.brightness / 100 * 0.4;
    const Hf = new Float32Array(S * S).fill(0.5);
    for (let y = 0; y < fd; y++) for (let x = 0; x < fd; x++) {
      const gx = x + ox, gy = y + oy; if (gx < 0 || gy < 0 || gx >= S || gy >= S) continue;
      let h = 0.5 + (lum[y * fd + x] - base) * gain + bright;
      Hf[gy * S + gx] = h < 0 ? 0 : h > 1 ? 1 : h;
    }
    if (state.invert) for (let i = 0; i < Hf.length; i++) Hf[i] = 1 - Hf[i];
    return Hf;
  }

  /* ---------- gravure d'un pixel (selon la matière) ---------- */
  const _e = [0, 0, 0];
  function engrave(R0, G0, B0, h, dlf, sp, m, kind, polish) {
    const rf = Math.pow(Math.max(0, (0.5 - h) / 0.5), 1.3);   // creux sous le champ
    const ph = Math.max(0, Math.min(1, (h - 0.5) / 0.5));     // reliefs au-dessus
    if (kind === "anodized") {
      R0 = lerp(R0, m.reveal[0], ph * 0.92); G0 = lerp(G0, m.reveal[1], ph * 0.92); B0 = lerp(B0, m.reveal[2], ph * 0.92);
      R0 *= (1 + dlf * 0.3); G0 *= (1 + dlf * 0.3); B0 *= (1 + dlf * 0.3);
    } else if (kind === "wood") {
      R0 = lerp(R0, m.burn[0], ph * 0.8); G0 = lerp(G0, m.burn[1], ph * 0.8); B0 = lerp(B0, m.burn[2], ph * 0.8);
      R0 *= (1 + dlf * 0.4); G0 *= (1 + dlf * 0.4); B0 *= (1 + dlf * 0.4);
    } else {
      R0 = lerp(R0, m.patina[0], rf * 0.55); G0 = lerp(G0, m.patina[1], rf * 0.55); B0 = lerp(B0, m.patina[2], rf * 0.55);
      R0 *= (1 + dlf * 0.9); G0 *= (1 + dlf * 0.9); B0 *= (1 + dlf * 0.9);
      R0 = lerp(R0, m.high[0], ph * 0.35); G0 = lerp(G0, m.high[1], ph * 0.35); B0 = lerp(B0, m.high[2], ph * 0.35);
      const g = sp * polish * 0.85; R0 += m.spec[0] * g; G0 += m.spec[1] * g; B0 += m.spec[2] * g;
    }
    _e[0] = R0; _e[1] = G0; _e[2] = B0; return _e;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  const _c = [0, 0, 0]; // scratch (évite une allocation par pixel)
  function metalColor(e, m) {
    const t = Math.max(0, Math.min(1, e / 1.25));
    if (t < 0.5) { const k = t / 0.5; _c[0] = lerp(m.shadow[0], m.mid[0], k); _c[1] = lerp(m.shadow[1], m.mid[1], k); _c[2] = lerp(m.shadow[2], m.mid[2], k); }
    else { const k = (t - 0.5) / 0.5; _c[0] = lerp(m.mid[0], m.high[0], k); _c[1] = lerp(m.mid[1], m.high[1], k); _c[2] = lerp(m.mid[2], m.high[2], k); }
    return _c;
  }
  function angBand(ang, c, w, a) { let d = ang - c; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a * Math.exp(-(d * d) / w); }

  /* ---------- rendu rond (médaille / disque) sur le calque ---------- */
  function renderRound(cyShift, octx) {
    const m = MAT[state.material];
    const G = geometry();
    const cx = S / 2, cy = S / 2 + (cyShift || 0), R = 300;
    const fieldR = Math.round(R * 0.78);
    const fieldRn = fieldR / R;
    const Hf = state.img ? heightField(fieldR, Math.round(cx - fieldR), Math.round(cy - fieldR)) : null;

    // normales
    let nx, ny, nz, diff, spec;
    if (Hf) {
      const strength = (state.depth / 100) * 7 + 1, detail = (state.detail / 100) * 2.2 + 0.5;
      const L = [-0.4, -0.6, 0.69]; const Ll = Math.hypot(L[0], L[1], L[2]); L[0] /= Ll; L[1] /= Ll; L[2] /= Ll;
      const Hh = [L[0], L[1], L[2] + 1]; const Hl = Math.hypot(Hh[0], Hh[1], Hh[2]); Hh[0] /= Hl; Hh[1] /= Hl; Hh[2] /= Hl;
      diff = new Float32Array(S * S); spec = new Float32Array(S * S);
      const shin = 18 + state.polish / 100 * 50;
      for (let y = 1; y < S - 1; y++) for (let x = 1; x < S - 1; x++) {
        const i = y * S + x;
        const dx = (Hf[i + 1] - Hf[i - 1]) * detail, dy = (Hf[i + S] - Hf[i - S]) * detail;
        let ax = -dx * strength, ay = -dy * strength, az = 1; const nl = Math.sqrt(ax * ax + ay * ay + 1); ax /= nl; ay /= nl; az /= nl;
        diff[i] = ax * L[0] + ay * L[1] + az * L[2] - L[2];
        let sp = ax * Hh[0] + ay * Hh[1] + az * Hh[2]; spec[i] = sp > 0 ? Math.pow(sp, shin) : 0;
      }
    }

    const out = ctx.createImageData(S, S); const o = out.data;
    const { rad, ang, nx0, ny0, grain, wood } = G;
    const isWood = m.kind === "wood", isAno = m.kind === "anodized";
    const polish = state.polish / 100;
    const rimIn = 0.80, rimOut = 0.965;

    for (let i = 0; i < S * S; i++) {
      const r = rad[i]; let R0, G0, B0;
      if (r > 1.0) continue; // hors du disque -> transparent

      // --- champ métal lisse et poli ---
      const a = ang[i], topg = -ny0[i] * 0.5 + 0.5, ao = 1 - 0.45 * r * r;
      let env = 0.45 + 0.34 * topg * ao + 0.012 * Math.sin(a * 46) * r * m.reflect + (grain[i] - 0.5) * (isWood ? 0.10 : 0.05);
      let c = metalColor(env, m);
      R0 = c[0]; G0 = c[1]; B0 = c[2];
      if (isWood) { const v = wood[i]; R0 *= (0.8 + 0.35 * v); G0 *= (0.8 + 0.32 * v); B0 *= (0.78 + 0.3 * v); }

      if (r <= fieldRn) {
        // --- zone gravée (motif embossé sur champ plat) ---
        if (Hf) { const e = engrave(R0, G0, B0, Hf[i], diff[i] || 0, spec[i] || 0, m, m.kind, polish); R0 = e[0]; G0 = e[1]; B0 = e[2]; }
      } else {
        // --- bordure : gorge + rim bombé poli + tranche ---
        const facing = (-nx0[i] * 0.5 - ny0[i] * 0.72) / (r || 1e-3); // +1 = vers la lumière
        if (r < rimIn) {
          // gorge incuse (sépare champ et bordure)
          const gk = Math.max(0, Math.min(1, (r - fieldRn) / (rimIn - fieldRn)));
          const groove = Math.sin(gk * Math.PI) * 0.75;
          R0 *= (1 - groove); G0 *= (1 - groove); B0 *= (1 - groove);
        } else if (r <= rimOut) {
          // rim bombé poli (reflet directionnel)
          const u = (r - rimIn) / (rimOut - rimIn);
          const bulge = Math.sin(u * Math.PI);
          let lit = 0.42 + bulge * (0.42 + 0.55 * facing) + (grain[i] - 0.5) * 0.02;
          const c2 = metalColor(0.2 + lit * 1.05, m);
          const eIn = Math.max(0, (0.06 - u) / 0.06), eOut = Math.max(0, (u - 0.94) / 0.06);
          const k = (1 - eIn * 0.5) * (1 - eOut * 0.55);
          R0 = c2[0] * k; G0 = c2[1] * k; B0 = c2[2] * k;
        } else {
          // tranche externe sombre + léger reflet de chant
          const e = (r - rimOut) / (1 - rimOut);
          const catch_ = Math.max(0, facing) * Math.max(0, 1 - Math.abs(e - 0.25) / 0.25);
          R0 = m.shadow[0] * (0.35 + 0.25 * e) + m.high[0] * catch_ * 0.55;
          G0 = m.shadow[1] * (0.35 + 0.25 * e) + m.high[1] * catch_ * 0.55;
          B0 = m.shadow[2] * (0.35 + 0.25 * e) + m.high[2] * catch_ * 0.55;
        }
      }

      // léger softbox sur tout le disque
      const x = i % S, y = (i / S) | 0;
      const hx = (x - cx + 90) / (R * 0.7), hy = (y - cy + 120) / (R * 0.5);
      const hl = Math.exp(-(hx * hx + hy * hy)) * 42;
      o[i * 4] = Math.min(255, R0 + hl); o[i * 4 + 1] = Math.min(255, G0 + hl); o[i * 4 + 2] = Math.min(255, B0 + hl); o[i * 4 + 3] = 255;
    }
    octx.putImageData(out, 0, 0);
    // textes gravés
    if (state.showText) { drawCurvedText(octx, cx, cy, R - 14, state.text.toUpperCase(), m, false); if (state.subtext) drawCurvedText(octx, cx, cy, R - 14, state.subtext.toUpperCase(), m, true); }
  }

  /* ---------- rendu rectangulaire (plaque / carré / médaillon) ---------- */
  function renderRect(type, octx) {
    const m = MAT[state.material];
    const G = geometry();
    const cx = S / 2, cy = S / 2;
    let w, h, radc;
    if (type === "tag") { w = 300; h = 480; radc = 40; }
    else if (type === "square") { w = 460; h = 460; radc = 26; }
    else { w = 540; h = 380; radc = 18; }
    const x0 = cx - w / 2, y0 = cy - h / 2, border = 34;
    const fieldR = Math.min(w, h) / 2 - border;
    const Hf = state.img ? heightField(fieldR, Math.round(cx - fieldR), Math.round(cy - fieldR - (state.showText ? 18 : 0))) : null;

    let diff, spec;
    if (Hf) {
      const strength = (state.depth / 100) * 7 + 1, detail = (state.detail / 100) * 2.2 + 0.5;
      const L = [-0.4, -0.6, 0.69]; const Ll = Math.hypot(L[0], L[1], L[2]); L[0] /= Ll; L[1] /= Ll; L[2] /= Ll;
      const Hh = [L[0], L[1], L[2] + 1]; const Hl = Math.hypot(Hh[0], Hh[1], Hh[2]); Hh[0] /= Hl; Hh[1] /= Hl; Hh[2] /= Hl;
      diff = new Float32Array(S * S); spec = new Float32Array(S * S);
      const shin = 18 + state.polish / 100 * 50;
      for (let y = 1; y < S - 1; y++) for (let x = 1; x < S - 1; x++) {
        const i = y * S + x; const dx = (Hf[i + 1] - Hf[i - 1]) * detail, dy = (Hf[i + S] - Hf[i - S]) * detail;
        let ax = -dx * strength, ay = -dy * strength, az = 1; const nl = Math.sqrt(ax * ax + ay * ay + 1); ax /= nl; ay /= nl; az /= nl;
        diff[i] = ax * L[0] + ay * L[1] + az * L[2] - L[2];
        let sp = ax * Hh[0] + ay * Hh[1] + az * Hh[2]; spec[i] = sp > 0 ? Math.pow(sp, shin) : 0;
      }
    }
    const out = ctx.createImageData(S, S); const o = out.data;
    const { grain, wood } = G;
    const isWood = m.kind === "wood", isAno = m.kind === "anodized";
    const polish = state.polish / 100;
    const fyShift = state.showText ? 18 : 0;

    for (let i = 0; i < S * S; i++) {
      const x = i % S, y = (i / S) | 0;
      const insideR = (x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h);
      // coins arrondis (approx)
      let inside = insideR;
      if (insideR) {
        const dxl = Math.min(x - x0, x0 + w - x), dyl = Math.min(y - y0, y0 + h - y);
        if (dxl < radc && dyl < radc) { const ddx = radc - dxl, ddy = radc - dyl; if (ddx * ddx + ddy * ddy > radc * radc) inside = false; }
      }
      if (!inside) continue; // hors de la plaque -> transparent
      // métal de base : dégradé diagonal + grain
      const gv = ((x - x0) / w + (y - y0) / h) / 2;
      let env = 0.30 + m.reflect * (0.6 * Math.exp(-Math.pow((gv - 0.32) / 0.18, 2)) + 0.25 * Math.exp(-Math.pow((gv - 0.78) / 0.22, 2)));
      env += (grain[i] - 0.5) * (isWood ? 0.10 : 0.05);
      let c = metalColor(env, m); let R0 = c[0], G0 = c[1], B0 = c[2];
      if (isWood) { const v = wood[i]; R0 *= (0.8 + 0.35 * v); G0 *= (0.8 + 0.32 * v); B0 *= (0.78 + 0.3 * v); }

      const inField = (x > x0 + border && x < x0 + w - border && y > y0 + border + fyShift && y < y0 + h - border + fyShift);
      // bordure biseautée
      const edgeDist = Math.min(x - x0, x0 + w - x, y - y0, y0 + h - y);
      if (edgeDist < border) {
        const bt = edgeDist / border, bevel = Math.sin(bt * Math.PI);
        R0 = lerp(R0 * 0.7, m.high[0], bevel * 0.5); G0 = lerp(G0 * 0.7, m.high[1], bevel * 0.5); B0 = lerp(B0 * 0.7, m.high[2], bevel * 0.5);
      }
      if (inField && Hf) { const e = engrave(R0, G0, B0, Hf[i], diff[i] || 0, spec[i] || 0, m, m.kind, polish); R0 = e[0]; G0 = e[1]; B0 = e[2]; }
      const hx = (x - cx + 80) / (w * 0.7), hy = (y - cy + 90) / (h * 0.7); const hl = Math.exp(-(hx * hx + hy * hy)) * 34;
      o[i * 4] = Math.min(255, R0 + hl); o[i * 4 + 1] = Math.min(255, G0 + hl); o[i * 4 + 2] = Math.min(255, B0 + hl); o[i * 4 + 3] = 255;
    }
    octx.putImageData(out, 0, 0);
    if (type === "tag") { octx.beginPath(); octx.arc(cx, y0 + 40, 20, 0, Math.PI * 2); octx.lineWidth = 12; octx.strokeStyle = `rgb(${m.shadow})`; octx.stroke(); octx.fillStyle = "#0a0a0c"; octx.fill(); }
    if (state.showText) drawFlatText(octx, cx, y0 + h - 44, m);
  }

  /* ---------- ruban (médaille) : deux pans drapés ---------- */
  function ribbonGrad(x0, x1, hi, mid, lo) {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, lo); g.addColorStop(.35, mid); g.addColorStop(.5, hi); g.addColorStop(.65, mid); g.addColorStop(1, lo);
    return g;
  }
  function drawRibbon(cx, topY) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    const top = 18, sp = 26; // demi-écart au sommet de la pièce
    // pan gauche
    ctx.beginPath();
    ctx.moveTo(cx - 70, top); ctx.lineTo(cx - 18, top);
    ctx.lineTo(cx - sp + 6, topY); ctx.lineTo(cx - sp - 28, topY); ctx.closePath();
    ctx.fillStyle = ribbonGrad(cx - 78, cx - 10, "#d83048", "#a51f30", "#5e0e18"); ctx.fill();
    // pan droit
    ctx.beginPath();
    ctx.moveTo(cx + 18, top); ctx.lineTo(cx + 70, top);
    ctx.lineTo(cx + sp + 28, topY); ctx.lineTo(cx + sp - 6, topY); ctx.closePath();
    ctx.fillStyle = ribbonGrad(cx + 10, cx + 78, "#d83048", "#a51f30", "#5e0e18"); ctx.fill();
    ctx.shadowColor = "transparent";
    // pli central (revers plus sombre)
    ctx.beginPath();
    ctx.moveTo(cx - 18, top); ctx.lineTo(cx + 18, top);
    ctx.lineTo(cx + sp - 6, topY); ctx.lineTo(cx - sp + 6, topY); ctx.closePath();
    ctx.fillStyle = "rgba(60,8,14,.85)"; ctx.fill();
    // lieserés dorés
    ctx.strokeStyle = "rgba(230,180,34,.5)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 64, top); ctx.lineTo(cx - sp - 22, topY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 64, top); ctx.lineTo(cx + sp + 22, topY); ctx.stroke();
    ctx.restore();
  }

  /* ---------- textes ---------- */
  function rgb(c, a) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a == null ? 1 : a})`; }
  function drawFlatText(tctx, cx, y, m) {
    tctx.save(); tctx.textAlign = "center"; tctx.font = "700 38px Cinzel, serif";
    tctx.fillStyle = rgb(m.shadow, .95); tctx.fillText(state.text.toUpperCase(), cx, y + 1.5);
    tctx.fillStyle = rgb(m.high, .85); tctx.fillText(state.text.toUpperCase(), cx, y - 1);
    if (state.subtext) { tctx.font = "400 17px Jost, sans-serif"; tctx.fillStyle = rgb(m.shadow, .9); tctx.fillText(state.subtext, cx, y + 26); }
    tctx.restore();
  }
  function drawCurvedText(tctx, cx, cy, radius, text, m, bottom) {
    tctx.save(); tctx.translate(cx, cy); tctx.font = "700 25px Cinzel, serif"; tctx.textAlign = "center"; tctx.textBaseline = "middle";
    const chars = text.split(""); const arc = Math.min(Math.PI * 0.92, chars.length * 0.13); const step = arc / Math.max(chars.length, 1);
    const start = bottom ? Math.PI / 2 + arc / 2 : -Math.PI / 2 - arc / 2;
    chars.forEach((ch, i) => {
      const an = bottom ? start - step * i : start + step * i;
      tctx.save(); tctx.rotate(an); tctx.translate(0, bottom ? radius : -radius); if (bottom) tctx.rotate(Math.PI);
      tctx.fillStyle = rgb(m.shadow, .95); tctx.fillText(ch, 0, 1.4);
      tctx.fillStyle = rgb(m.high, .8); tctx.fillText(ch, 0, -0.4); tctx.restore();
    });
    tctx.restore();
  }

  /* ---------- scène (fond pierre + ombre portée) ---------- */
  function drawScene(shadowCx, shadowCy, shadowR) {
    const g = geometry().grain;
    const out = ctx.createImageData(S, S), o = out.data;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const vx = (x - S / 2) / (S * 0.72), vy = (y - S / 2) / (S * 0.72);
      const vig = Math.max(0, 1 - (vx * vx + vy * vy));
      let st = (13 + g[i] * 20) * vig;
      const sx = (x - shadowCx) / (shadowR * 1.2), sy = (y - shadowCy) / (shadowR * 0.86);
      const sh = Math.pow(Math.max(0, 1 - (sx * sx + sy * sy)), 1.7);
      st *= (1 - 0.85 * sh);
      o[i * 4] = st; o[i * 4 + 1] = st; o[i * 4 + 2] = st * 1.08; o[i * 4 + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  }

  /* ---------- inclinaison 3D (perspective par tranches) ---------- */
  function drawTilted(src, dst, topInset, botInset, topY, botY, offY) {
    const step = 2;
    for (let y = 0; y < S; y += step) {
      const tY = y / (S - 1);
      const w = lerp(S - 2 * topInset, S - 2 * botInset, tY);
      const dx = (S - w) / 2;
      const dy = lerp(topY, botY, tY) + offY;
      const dh = (botY - topY) / S * step + 1.2;
      dst.drawImage(src, 0, y, S, step, dx, dy, w, dh);
    }
  }
  // version sombre de la face -> sert de tranche (épaisseur)
  function buildEdge() {
    const e = document.createElement("canvas"); e.width = e.height = S;
    const ec = e.getContext("2d");
    ec.drawImage(med, 0, 0);
    ec.globalCompositeOperation = "source-atop";
    ec.fillStyle = "rgba(18,11,4,0.62)"; ec.fillRect(0, 0, S, S);
    ec.globalCompositeOperation = "source-over";
    return e;
  }

  /* ---------- rendu principal (throttle rAF) ---------- */
  let pending = false;
  function render() {
    if (pending) return; pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const tilt = state.tilt;

      // 1) dessine la face de la pièce sur le calque (transparent autour)
      mctx.clearRect(0, 0, S, S);
      if (state.shape === "medal" || state.shape === "round") renderRound(0, mctx);
      else renderRect(state.shape, mctx);

      // 2) scène (fond + ombre portée, position selon la vue)
      drawScene(S / 2, tilt ? S / 2 + 70 : S / 2 + 30, 300);

      // 3) ruban (médaille) derrière la pièce
      if (state.shape === "medal") drawRibbon(S / 2, tilt ? 150 : S / 2 - 222);

      // 4) compose la pièce (inclinée en 3D ou à plat)
      if (tilt) {
        const params = [66, 34, 60, S - 78]; // topInset, botInset, topY, botY (incl. douce -> reste rond)
        const edge = buildEdge();
        drawTilted(edge, ctx, params[0], params[1], params[2], params[3], 20); // tranche
        drawTilted(med, ctx, params[0], params[1], params[2], params[3], 0);   // face
      } else {
        ctx.drawImage(med, 0, 0);
      }

      // 5) filigrane + invite
      ctx.save(); ctx.font = "600 13px Jost, sans-serif"; ctx.fillStyle = "rgba(230,180,34,.5)"; ctx.textAlign = "right";
      ctx.fillText("Simulation ORYXIA Design", S - 18, S - 16); ctx.restore();
      if (!state.img) {
        ctx.save(); ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.font = "600 22px Cinzel, serif"; ctx.fillText("Importez une image", S / 2, S / 2 + 8);
        ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.font = "300 14px Jost, sans-serif"; ctx.fillText("pour visualiser la gravure", S / 2, S / 2 + 34);
        ctx.restore();
      }
    });
  }

  /* ---------- image ---------- */
  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => { const img = new Image(); img.onload = () => { state.img = img; render(); }; img.src = e.target.result; };
    reader.readAsDataURL(file);
  }
  // exemple par défaut : le logo ORYXIA déjà gravé
  function loadDefault() {
    const img = new Image();
    img.onload = () => { state.img = img; render(); };
    img.onerror = () => { state.img = null; render(); };
    img.src = DEFAULT_IMG;
  }

  /* ---------- UI ---------- */
  function bind() {
    const file = document.getElementById("sim-file"), dz = document.getElementById("sim-drop");
    if (dz) {
      dz.addEventListener("click", () => file.click());
      dz.addEventListener("dragover", e => { e.preventDefault(); dz.classList.add("drag"); });
      dz.addEventListener("dragleave", () => dz.classList.remove("drag"));
      dz.addEventListener("drop", e => { e.preventDefault(); dz.classList.remove("drag"); loadFile(e.dataTransfer.files[0]); });
    }
    if (file) file.addEventListener("change", e => loadFile(e.target.files[0]));
    document.querySelectorAll("[data-shape]").forEach(b => b.addEventListener("click", () => { document.querySelectorAll("[data-shape]").forEach(x => x.classList.remove("active")); b.classList.add("active"); state.shape = b.dataset.shape; render(); }));
    document.querySelectorAll("[data-mat]").forEach(b => b.addEventListener("click", () => { document.querySelectorAll("[data-mat]").forEach(x => x.classList.remove("active")); b.classList.add("active"); state.material = b.dataset.mat; render(); }));
    const sl = (id, key, suf = "") => { const el = document.getElementById(id); if (!el) return; const v = document.getElementById(id + "-val"); el.value = state[key]; if (v) v.textContent = el.value + suf; el.addEventListener("input", () => { state[key] = +el.value; if (v) v.textContent = el.value + suf; render(); }); };
    sl("ctl-depth", "depth", "%"); sl("ctl-detail", "detail", "%"); sl("ctl-polish", "polish", "%"); sl("ctl-contrast", "contrast", "%"); sl("ctl-bright", "brightness");
    document.getElementById("ctl-invert")?.addEventListener("change", e => { state.invert = e.target.checked; render(); });
    document.getElementById("ctl-tilt")?.addEventListener("change", e => { state.tilt = e.target.checked; render(); });
    document.getElementById("ctl-showtext")?.addEventListener("change", e => { state.showText = e.target.checked; render(); });
    document.getElementById("ctl-text")?.addEventListener("input", e => { state.text = e.target.value; render(); });
    document.getElementById("ctl-subtext")?.addEventListener("input", e => { state.subtext = e.target.value; render(); });
    document.getElementById("sim-download")?.addEventListener("click", () => { const a = document.createElement("a"); a.download = "oryxia-simulation-gravure.png"; a.href = canvas.toDataURL("image/png"); a.click(); });
    document.getElementById("sim-reset")?.addEventListener("click", () => { loadDefault(); });
  }

  bind(); loadDefault();
})();
