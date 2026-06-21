/* =========================================================
   ORYXIA DESIGN — Scripts principaux
   ========================================================= */
(function () {
  "use strict";

  // Détecte le préfixe de chemin (utile si pages dans un sous-dossier)
  const BASE = "";

  /* ---------- En-tête partagé ---------- */
  const NAV = [
    { label: "Accueil", href: "index.html" },
    {
      label: "Services", href: "services.html", children: [
        { label: "Vue d'ensemble", href: "services.html" },
        { label: "Gravure sur bois", href: "services.html#bois" },
        { label: "Gravure sur métal", href: "services.html#metal" },
        { label: "Gravure sur verre", href: "services.html#verre" },
        { label: "Cuir & maroquinerie", href: "services.html#cuir" },
        { label: "Médailles & trophées", href: "services.html#medailles" },
        { label: "Découpe laser", href: "services.html#decoupe" },
      ]
    },
    { label: "Réalisations", href: "realisations.html" },
    { label: "Simulateur", href: "simulateur.html" },
    { label: "Tarifs", href: "tarifs.html" },
    {
      label: "À propos", href: "a-propos.html", children: [
        { label: "L'atelier", href: "a-propos.html" },
        { label: "Notre procédé", href: "processus.html" },
        { label: "FAQ", href: "faq.html" },
      ]
    },
    { label: "Contact", href: "contact.html" },
  ];

  function buildHeader() {
    const host = document.getElementById("site-header");
    if (!host) return;
    const current = (location.pathname.split("/").pop() || "index.html");

    const links = NAV.map(item => {
      const active = item.href.split("#")[0] === current ? "active" : "";
      if (item.children) {
        const sub = item.children.map(c => `<a href="${BASE}${c.href}">${c.label}</a>`).join("");
        return `<div class="has-drop"><a href="${BASE}${item.href}" class="${active}">${item.label}</a><div class="drop">${sub}</div></div>`;
      }
      return `<a href="${BASE}${item.href}" class="${active}">${item.label}</a>`;
    }).join("");

    host.innerHTML = `
      <a href="#main" class="skip-link">Aller au contenu</a>
      <header class="site-header" id="hdr">
        <div class="container nav">
          <a href="${BASE}index.html" class="brand">
            <img src="${BASE}assets/img/logo.jpeg" alt="ORYXIA Design — gravure laser" width="120" height="50">
          </a>
          <nav class="nav-links" id="navlinks" aria-label="Navigation principale">
            ${links}
            <a href="${BASE}contact.html" class="btn btn-or btn-sm nav-cta">Demander un devis</a>
          </nav>
          <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false"><span></span><span></span><span></span></button>
        </div>
      </header>`;

    // cible du lien d'évitement
    const firstSection = document.querySelector("section");
    if (firstSection && !firstSection.id) { firstSection.id = "main"; firstSection.setAttribute("tabindex", "-1"); }

    const hdr = document.getElementById("hdr");
    const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const burger = document.getElementById("burger");
    const navlinks = document.getElementById("navlinks");
    const setMenu = (open) => {
      navlinks.classList.toggle("open", open);
      burger.classList.toggle("active", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-open", open);
    };
    burger.addEventListener("click", () => setMenu(!navlinks.classList.contains("open")));
    navlinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
    // referme le menu si on repasse en bureau
    window.addEventListener("resize", () => { if (window.innerWidth > 760) setMenu(false); });
  }

  function buildFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    const year = new Date().getFullYear();
    host.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <img src="${BASE}assets/img/logo.jpeg" alt="ORYXIA Design">
              <p>Atelier de gravure laser de précision. Nous transformons vos idées en pièces uniques, sur tous supports, avec une finition d'exception.</p>
              <div class="socials">
                <a href="#" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg></a>
                <a href="#" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.3 1.4-1.3h1.4V5.6c-.7-.1-1.5-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4v2.2H7.9V14h2.4v7h3.2z"/></svg></a>
                <a href="#" aria-label="Pinterest" title="Pinterest"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.6 2 4 5.6 4 8.8c0 1.9.7 3.6 2.3 4.3.3.1.5 0 .5-.3l.2-.8c.1-.3 0-.4-.1-.6-.4-.5-.7-1.1-.7-2 0-2.5 1.9-4.8 5-4.8 2.7 0 4.2 1.7 4.2 3.9 0 2.9-1.3 5.3-3.1 5.3-1 0-1.8-.8-1.5-1.9.3-1.3.9-2.6.9-3.5 0-.8-.4-1.5-1.3-1.5-1.1 0-1.9 1.1-1.9 2.6 0 1 .3 1.6.3 1.6s-1.2 5-1.4 5.9c-.3 1.4-.1 3.2 0 3.4 0 .1.2.1.3 0 .1-.1 1.6-2 2.1-3.8l.8-3c.4.8 1.5 1.4 2.7 1.4 3.5 0 5.9-3.2 5.9-7.5C20 5.1 17 2 12 2z"/></svg></a>
                <a href="#" aria-label="TikTok" title="TikTok"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16.6 3c.3 2 1.5 3.4 3.4 3.6v2.5c-1.1 0-2.3-.4-3.4-1v5.5c0 3.3-2.4 5.4-5.3 5.4-2.9 0-5.1-2.3-5.1-5.1 0-3 2.4-5.2 5.4-4.9v2.6c-.3-.1-.7-.2-1-.2-1.3 0-2.3 1.1-2.3 2.5 0 1.4 1 2.5 2.4 2.5 1.5 0 2.6-1.1 2.6-2.9V3h2.9z"/></svg></a>
              </div>
            </div>
            <div>
              <h4>Navigation</h4>
              <a href="${BASE}index.html">Accueil</a>
              <a href="${BASE}services.html">Services</a>
              <a href="${BASE}realisations.html">Réalisations</a>
              <a href="${BASE}simulateur.html">Simulateur</a>
              <a href="${BASE}tarifs.html">Tarifs</a>
            </div>
            <div>
              <h4>Services</h4>
              <a href="${BASE}services.html#bois">Gravure sur bois</a>
              <a href="${BASE}services.html#metal">Gravure sur métal</a>
              <a href="${BASE}services.html#verre">Gravure sur verre</a>
              <a href="${BASE}services.html#medailles">Médailles & trophées</a>
              <a href="${BASE}services.html#decoupe">Découpe laser</a>
            </div>
            <div>
              <h4>Contact</h4>
              <p>✉ contact@oryxia.be</p>
              <p>☎ <a href="tel:+32495369670" style="color:inherit">0495 36 96 70</a></p>
              <p>📍 Rue des Chapelles 31, 5080 Rhisnes (Belgique)</p>
              <p style="margin-top:-4px;font-size:.85rem">Expédition Belgique &amp; France</p>
              <a href="${BASE}contact.html" class="btn btn-ghost btn-sm" style="margin-top:10px">Nous écrire</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${year} ORYXIA Design — Tous droits réservés.</span>
            <span><a href="${BASE}mentions-legales.html">Mentions légales</a> · <a href="${BASE}mentions-legales.html#cgv">CGV</a> · <a href="${BASE}mentions-legales.html#confidentialite">Confidentialité</a></span>
          </div>
        </div>
      </footer>`;
  }

  /* ---------- Animations d'apparition ---------- */
  function reveals() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- FAQ accordéon ---------- */
  function faq() {
    document.querySelectorAll(".faq-q").forEach(q => {
      q.addEventListener("click", () => {
        const item = q.closest(".faq-item");
        const open = item.classList.contains("open");
        // ferme les autres (comportement accordéon doux)
        item.parentElement.querySelectorAll(".faq-item.open").forEach(o => { if (o !== item) o.classList.remove("open"); });
        item.classList.toggle("open", !open);
      });
    });
  }

  /* ---------- Filtres galerie ---------- */
  function galleryFilters() {
    const btns = document.querySelectorAll(".filter-btn");
    const items = document.querySelectorAll(".gallery .g-item");
    if (!btns.length) return;
    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      const f = b.dataset.filter;
      items.forEach(it => {
        const show = f === "all" || it.dataset.cat === f;
        it.style.display = show ? "" : "none";
      });
    }));
  }

  /* ---------- Formulaires (démo, sans backend) ---------- */
  function forms() {
    document.querySelectorAll("form[data-demo]").forEach(f => {
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const ok = f.querySelector(".form-success");
        if (ok) { ok.classList.add("show"); ok.scrollIntoView({ behavior: "smooth", block: "center" }); }
        f.reset();
      });
    });
  }

  /* ---------- Estimateur de prix (page tarifs) ---------- */
  function estimator() {
    const el = document.getElementById("estimator");
    if (!el) return;
    const out = document.getElementById("est-result");
    const update = () => {
      const mat = +el.querySelector("#est-mat").value;
      const surf = +el.querySelector("#est-surf").value;
      const qty = +el.querySelector("#est-qty").value;
      const comp = +el.querySelector("#est-comp").value;
      const base = 12;
      let unit = (base + mat + surf * 0.04) * comp;
      // dégressif selon quantité
      if (qty >= 50) unit *= 0.7; else if (qty >= 20) unit *= 0.8; else if (qty >= 10) unit *= 0.88;
      const total = Math.max(unit * qty, 12);
      out.querySelector(".est-unit").textContent = unit.toFixed(2) + " €";
      out.querySelector(".est-total").textContent = total.toFixed(2) + " €";
      el.querySelectorAll("output").forEach(o => {
        const t = document.getElementById(o.htmlFor);
        if (t) o.textContent = t.value;
      });
    };
    el.querySelectorAll("input, select").forEach(i => i.addEventListener("input", update));
    update();
  }

  /* ============ EFFETS & ANIMATIONS PREMIUM ============ */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Barre de progression + retour en haut */
  function scrollUI() {
    const bar = document.createElement("div"); bar.id = "scroll-progress"; document.body.appendChild(bar);
    const top = document.createElement("button"); top.id = "to-top"; top.innerHTML = "↑"; top.setAttribute("aria-label", "Haut de page"); document.body.appendChild(top);
    top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
      // masque le bouton dès que le pied de page apparaît (anti-chevauchement)
      const footer = document.querySelector(".site-footer");
      const nearBottom = footer
        ? footer.getBoundingClientRect().top < window.innerHeight - 40
        : window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 200;
      top.classList.toggle("show", window.scrollY > 500 && !nearBottom);
    };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  /* Apparition en cascade des grilles */
  function gridReveals() {
    const groups = document.querySelectorAll(".grid, .price-grid, .testi, .gallery");
    if (!("IntersectionObserver" in window)) { groups.forEach(g => g.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.1 });
    groups.forEach(g => io.observe(g));
  }

  /* Lightbox (agrandissement des visuels) */
  function lightbox() {
    const imgs = document.querySelectorAll(".g-img, .visual.render img, .product-shot img");
    if (!imgs.length) return;
    const box = document.createElement("div"); box.id = "lightbox";
    box.innerHTML = '<button class="lb-close" aria-label="Fermer">✕</button><img alt=""><button class="lb-save" aria-label="Enregistrer">⬇ Enregistrer</button>';
    document.body.appendChild(box);
    const big = box.querySelector("img");
    const open = (src, alt) => { big.src = src; big.alt = alt || ""; box.classList.add("show"); document.body.classList.add("menu-open"); };
    const close = () => { box.classList.remove("show"); document.body.classList.remove("menu-open"); };
    const save = async () => {
      try {
        const resp = await fetch(big.src); const blob = await resp.blob();
        const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
        const name = (big.alt || "oryxia").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "." + ext;
        const file = new File([blob], name, { type: blob.type || "image/jpeg" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: "ORYXIA Design" }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
        const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.download = name; a.href = url; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
      } catch (e) { window.open(big.src, "_blank"); }
    };
    imgs.forEach(im => { im.style.cursor = "zoom-in"; im.addEventListener("click", () => open(im.currentSrc || im.src, im.alt)); });
    box.querySelector(".lb-save").addEventListener("click", (e) => { e.stopPropagation(); save(); });
    box.addEventListener("click", (e) => { if (e.target === box || e.target.classList.contains("lb-close")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* Compteurs animés */
  function counters() {
    const els = document.querySelectorAll(".count[data-to]");
    if (!els.length) return;
    const run = (el) => {
      const to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0);
      const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "", dur = 1400;
      let start = null;
      const step = (t) => {
        if (!start) start = t; const p = Math.min((t - start) / dur, 1);
        const val = (to * (1 - Math.pow(1 - p, 3)));
        el.textContent = pre + (dec ? val.toFixed(dec).replace(".", ",") : Math.round(val)) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(e => e.textContent = (e.dataset.prefix || "") + e.dataset.to + (e.dataset.suffix || "")); return; }
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: 0.5 });
    els.forEach(e => io.observe(e));
  }

  /* Boutons magnétiques */
  function magnetic() {
    if (!finePointer || reduce) return;
    document.querySelectorAll(".btn-lg").forEach(b => {
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener("mouseleave", () => { b.style.transform = ""; });
    });
  }

  /* Cartes : tilt 3D + halo qui suit la souris */
  function tiltCards() {
    if (!finePointer || reduce) return;
    document.querySelectorAll(".card, .price").forEach(c => {
      c.addEventListener("mousemove", (e) => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", px * 100 + "%"); c.style.setProperty("--my", py * 100 + "%");
        c.style.transform = `perspective(900px) translateY(-8px) rotateX(${(.5 - py) * 7}deg) rotateY(${(px - .5) * 9}deg)`;
      });
      c.addEventListener("mouseleave", () => { c.style.transform = ""; });
    });
  }

  /* Logo du hero en parallaxe */
  function heroParallax() {
    if (!finePointer || reduce) return;
    const logo = document.querySelector(".hero-logo"); const hero = document.querySelector(".hero");
    if (!logo || !hero) return;
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      logo.style.transform = `translate(${x * 26}px, ${y * 22}px) rotate(${x * 3}deg)`;
    });
    hero.addEventListener("mouseleave", () => { logo.style.transform = ""; });
  }

  /* Curseur lumineux doré (desktop) */
  function cursorGlow() {
    if (!finePointer || reduce) return;
    const g = document.createElement("div"); g.id = "cursor-glow"; document.body.appendChild(g);
    window.addEventListener("mousemove", (e) => { g.style.opacity = "1"; g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px"; });
    window.addEventListener("mouseleave", () => g.style.opacity = "0");
  }

  /* Particules dorées (hero + en-têtes de page) */
  function particles() {
    if (reduce) return;
    const host = document.querySelector(".hero") || document.querySelector(".page-hero");
    if (!host) return;
    const cv = document.createElement("canvas"); cv.className = "fx-particles"; host.prepend(cv);
    const cx = cv.getContext("2d"); let w, h, parts;
    const N = Math.min(70, Math.round(window.innerWidth / 22));
    const resize = () => { w = cv.width = host.offsetWidth; h = cv.height = host.offsetHeight; };
    const make = () => Array.from({ length: N }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + .4,
      vy: -(Math.random() * .35 + .12), vx: (Math.random() - .5) * .25,
      a: Math.random() * .5 + .15, tw: Math.random() * Math.PI * 2,
    }));
    resize(); parts = make();
    let raf;
    const tick = () => {
      cx.clearRect(0, 0, w, h);
      parts.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.tw += .04;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        const al = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        cx.fillStyle = `rgba(245,208,97,${al})`;
        cx.shadowColor = "rgba(230,180,34,.8)"; cx.shadowBlur = 8; cx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); parts = make(); tick(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    buildFooter();
    reveals();
    faq();
    galleryFilters();
    forms();
    estimator();
    // effets premium
    scrollUI();
    gridReveals();
    lightbox();
    counters();
    magnetic();
    tiltCards();
    heroParallax();
    cursorGlow();
    particles();
  });
})();
