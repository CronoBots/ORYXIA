/* =========================================================
   ORYXIA DESIGN — Scripts principaux
   ========================================================= */
(function () {
  "use strict";

  // Détecte le préfixe de chemin (utile si pages dans un sous-dossier)
  const BASE = "";

  // Réseaux sociaux : renseignez l'URL pour afficher l'icône (laisser vide = masqué).
  const SOCIAL = {
    instagram: "",
    facebook: "",
    pinterest: "",
    tiktok: ""
  };
  const SOCIAL_SVG = {
    instagram: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.3 1.4-1.3h1.4V5.6c-.7-.1-1.5-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4v2.2H7.9V14h2.4v7h3.2z"/></svg>`,
    pinterest: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.6 2 4 5.6 4 8.8c0 1.9.7 3.6 2.3 4.3.3.1.5 0 .5-.3l.2-.8c.1-.3 0-.4-.1-.6-.4-.5-.7-1.1-.7-2 0-2.5 1.9-4.8 5-4.8 2.7 0 4.2 1.7 4.2 3.9 0 2.9-1.3 5.3-3.1 5.3-1 0-1.8-.8-1.5-1.9.3-1.3.9-2.6.9-3.5 0-.8-.4-1.5-1.3-1.5-1.1 0-1.9 1.1-1.9 2.6 0 1 .3 1.6.3 1.6s-1.2 5-1.4 5.9c-.3 1.4-.1 3.2 0 3.4 0 .1.2.1.3 0 .1-.1 1.6-2 2.1-3.8l.8-3c.4.8 1.5 1.4 2.7 1.4 3.5 0 5.9-3.2 5.9-7.5C20 5.1 17 2 12 2z"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16.6 3c.3 2 1.5 3.4 3.4 3.6v2.5c-1.1 0-2.3-.4-3.4-1v5.5c0 3.3-2.4 5.4-5.3 5.4-2.9 0-5.1-2.3-5.1-5.1 0-3 2.4-5.2 5.4-4.9v2.6c-.3-.1-.7-.2-1-.2-1.3 0-2.3 1.1-2.3 2.5 0 1.4 1 2.5 2.4 2.5 1.5 0 2.6-1.1 2.6-2.9V3h2.9z"/></svg>`
  };
  function socialsHTML() {
    const items = Object.keys(SOCIAL)
      .filter(k => SOCIAL[k])
      .map(k => `<a href="${SOCIAL[k]}" target="_blank" rel="noopener" aria-label="${k}" title="${k.charAt(0).toUpperCase() + k.slice(1)}">${SOCIAL_SVG[k]}</a>`)
      .join("");
    return items ? `<div class="socials">${items}</div>` : "";
  }

  /* ---------- Jeu d'icônes SVG (trait fin doré) ---------- */
  const ICO = {
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.8a3 3 0 0 1 0 5.7"/><path d="M17.5 19a5.5 5.5 0 0 0-3-4.9"/>',
    leaf: '<path d="M5 19C5 11 11 6 19 6c0 8-5 14-13 13Z"/><path d="M5 19c3-4 6-6 10-7"/>',
    bulb: '<path d="M9.5 18h5"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3Z"/>',
    timer: '<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V9.5"/><path d="M9.5 2.5h5"/><path d="M18.8 6.2l1.4-1.4"/>',
    sparkle: '<path d="M12 3l1.8 5.6L19 10.4l-5.2 1.8L12 18l-1.8-5.8L5 10.4l5.2-1.8Z"/>',
    wood: '<path d="M7 6h9a3 6 0 0 1 0 12H7"/><ellipse cx="7" cy="12" rx="3" ry="6"/><circle cx="7" cy="12" r="2.3"/><circle cx="7" cy="12" r="0.6" fill="currentColor" stroke="none"/>',
    gear: '<path d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/><circle cx="12" cy="12" r="3"/>',
    glass: '<path d="M6 5h12l-1.1 13.6a1.4 1.4 0 0 1-1.4 1.3H8.5a1.4 1.4 0 0 1-1.4-1.3Z"/><path d="M7 11h10"/>',
    bag: '<path d="M5 8h14l-1 12H6Z"/><path d="M8.5 8a3.5 3.5 0 0 1 7 0"/>',
    medal: '<path d="M8.5 3l3 5.2M15.5 3l-3 5.2"/><circle cx="12" cy="15" r="5.5"/><path d="M12 12.4l.9 1.9 2 .2-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.2Z"/>',
    scissors: '<circle cx="6" cy="6.5" r="2.3"/><circle cx="6" cy="17.5" r="2.3"/><path d="M8 7.6L20 17.5M8 16.4L20 6.5"/>',
    stone: '<path d="M4 15.5l3.5-7.5 5-1.5 6.5 4 .5 5-7.5 3.5-8-1Z"/><path d="M7.5 8l3 5.5 8.5-1"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11"/><path d="M12 9c-1.2-3-5-2.8-5-.6 0 1.2 3 .6 5 .6Zm0 0c1.2-3 5-2.8 5-.6 0 1.2-3 .6-5 .6Z"/>',
    building: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M9.5 21v-2.5h5V21"/>',
    bolt: '<path d="M13 2.5L5.5 13H11l-1 8.5L18.5 11H13Z"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 1.9-1 1.4-2-.6-1.3.4-2.6 1.6-2.6H17a4 4 0 0 0 4-4c0-4.9-4-7.5-9-9.4Z"/><circle cx="8" cy="11.5" r="1" fill="currentColor" stroke="none"/><circle cx="11.5" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9.5" r="1" fill="currentColor" stroke="none"/>',
    box: '<path d="M3 8l9-4 9 4-9 4Z"/><path d="M3 8v8.2l9 4 9-4V8"/><path d="M12 12v8.2"/>',
    statue: '<path d="M7 8.5a5 5 0 0 1 10 0v4.5a5 5 0 0 1-10 0Z"/><path d="M7.2 13c-.2 3-.2 7-.2 8h10c0-1 0-5-.2-8"/><path d="M9.5 9.2h1.2M13.3 9.2h1.2M10 12.2h4"/>',
    contrast: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor" stroke="none"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.6-4.6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7.5l8 5.5 8-5.5"/>',
    phone: '<path d="M5 4h3l1.6 4-2.1 1.5a11 11 0 0 0 5 5L13 12.4l4 1.6V18a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    pin: '<path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.6 2"/>',
    chat: '<path d="M20 4H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3v4l4.2-4H20a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Z"/><path d="M8 9.5h8M8 12.5h5"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.5 2.6 14.5 0 17M12 3.5c-2.6 2.5-2.6 14.5 0 17"/>',
    upload: '<path d="M12 16V5M7.5 9.5L12 5l4.5 4.5"/><path d="M5 19h14"/>'
  };
  const EMOJI2ICO = {
    "🎯": "target", "🤝": "users", "🌱": "leaf", "💡": "bulb", "⏱": "timer",
    "✨": "sparkle", "✦": "sparkle", "🪵": "wood", "⚙": "gear", "🥃": "glass",
    "👜": "bag", "🏅": "medal", "✂": "scissors", "🪨": "stone", "🎁": "gift",
    "🏢": "building", "⚡": "bolt", "🎨": "palette", "📦": "box", "🗿": "statue",
    "🌓": "contrast", "🔍": "search", "✉": "mail", "☎": "phone", "📍": "pin",
    "🕒": "clock", "💬": "chat", "◐": "globe", "⬆": "upload"
  };
  function renderIcons() {
    const sel = ".card .ico, .info-card .ic, .testi .ic-badge, .dropzone .dz-ico";
    document.querySelectorAll(sel).forEach(el => {
      const key = el.textContent.replace(/[\uFE0F\u200D]/g, "").trim();
      const name = EMOJI2ICO[key];
      if (name) { el.classList.add("ico-svg"); el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICO[name]}</svg>`; }
    });
  }

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
              ${socialsHTML()}
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
              <p>📍 <a href="https://www.google.com/maps/search/?api=1&query=Rue%20des%20Chapelles%2031%2C%205080%20Rhisnes" target="_blank" rel="noopener" style="color:inherit">Rue des Chapelles 31, 5080 Rhisnes (Belgique)</a></p>
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
    box.innerHTML =
      '<button class="lb-close" aria-label="Fermer">✕</button>' +
      '<button class="lb-nav lb-prev" aria-label="Image précédente">‹</button>' +
      '<button class="lb-nav lb-next" aria-label="Image suivante">›</button>' +
      '<figure class="lb-figure"><img alt=""><figcaption class="lb-cap"></figcaption></figure>' +
      '<div class="lb-count"></div>' +
      '<button class="lb-save" aria-label="Enregistrer">Enregistrer</button>';
    document.body.appendChild(box);
    const big = box.querySelector("img");
    const cap = box.querySelector(".lb-cap");
    const count = box.querySelector(".lb-count");
    const prevBtn = box.querySelector(".lb-prev");
    const nextBtn = box.querySelector(".lb-next");

    let list = [];      // images visibles au moment de l'ouverture
    let current = 0;

    const show = (i) => {
      if (!list.length) return;
      current = (i + list.length) % list.length;
      const im = list[current];
      const src = im.currentSrc || im.src;
      big.style.opacity = "0";
      const pre = new Image();
      pre.onload = () => { big.src = src; big.alt = im.alt || ""; big.style.opacity = "1"; };
      pre.src = src;
      cap.textContent = im.alt || "";
      count.textContent = (current + 1) + " / " + list.length;
      const solo = list.length < 2;
      prevBtn.style.display = solo ? "none" : "";
      nextBtn.style.display = solo ? "none" : "";
      count.style.display = solo ? "none" : "";
    };
    const open = (im) => {
      list = [...imgs].filter(x => x.offsetParent !== null); // respecte les filtres
      const idx = list.indexOf(im);
      show(idx < 0 ? 0 : idx);
      box.classList.add("show"); document.body.classList.add("menu-open");
    };
    const close = () => { box.classList.remove("show"); document.body.classList.remove("menu-open"); };
    const next = () => show(current + 1);
    const prev = () => show(current - 1);

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

    imgs.forEach(im => { im.style.cursor = "zoom-in"; im.addEventListener("click", () => open(im)); });
    box.querySelector(".lb-save").addEventListener("click", (e) => { e.stopPropagation(); save(); });
    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prev(); });
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); next(); });
    box.addEventListener("click", (e) => { if (e.target === box || e.target.classList.contains("lb-close") || e.target.classList.contains("lb-figure")) close(); });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("show")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    });
    // Balayage tactile (mobile)
    let sx = 0, sy = 0;
    box.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    box.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
    }, { passive: true });
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

  /* Bouton WhatsApp flottant */
  function whatsapp() {
    const num = "32495369670"; // +32 495 36 96 70
    const msg = encodeURIComponent("Bonjour ORYXIA Design, je vous contacte via votre site pour un projet de gravure.");
    const a = document.createElement("a");
    a.id = "wa-btn"; a.href = `https://wa.me/${num}?text=${msg}`;
    a.target = "_blank"; a.rel = "noopener"; a.setAttribute("aria-label", "Discuter sur WhatsApp");
    a.innerHTML = '<svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor"><path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.3.6 4.5 1.8 6.4L3 29l7.3-2.2c1.8 1 3.8 1.5 5.7 1.5 7 0 12.5-5.5 12.5-12.5S23 3 16 3zm0 22.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.3 1.3 1.3-4.2-.2-.4a10 10 0 0 1-1.6-5.4C5.8 9.8 10.3 5.3 16 5.3s10.2 4.5 10.2 10.2S21.7 25.8 16 25.8zm5.7-7.6c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1a8.3 8.3 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.8.7.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4l-.6-.5z"/></svg>';
    document.body.appendChild(a);
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

  /* ---------- Timeline procédé : remplissage du rail au scroll ---------- */
  function stepsTimeline() {
    const steps = document.querySelector(".steps");
    if (!steps) return;
    const update = () => {
      const r = steps.getBoundingClientRect();
      const fillY = window.innerHeight * 0.5;
      const p = Math.max(0, Math.min(1, (fillY - r.top) / Math.max(1, r.height)));
      steps.style.setProperty("--steps-progress", p.toFixed(3));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- Blocage du zoom (pincer / double-tap) — iOS inclus ---------- */
  function lockZoom() {
    // Pincer (geste iOS Safari, qui ignore user-scalable=no)
    ["gesturestart", "gesturechange", "gestureend"].forEach(ev =>
      document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
    // Pincer à deux doigts (autres navigateurs)
    document.addEventListener("touchmove", e => {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    // Double-tap pour zoomer (sécurité en plus de touch-action: manipulation)
    let lastTouch = 0;
    document.addEventListener("touchend", e => {
      const now = Date.now();
      if (now - lastTouch <= 300) e.preventDefault();
      lastTouch = now;
    }, { passive: false });
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    buildFooter();
    renderIcons();
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
    whatsapp();
    stepsTimeline();
    lockZoom();
  });
})();
