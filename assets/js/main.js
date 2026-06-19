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
      <header class="site-header" id="hdr">
        <div class="container nav">
          <a href="${BASE}index.html" class="brand">
            <img src="${BASE}assets/img/logo.jpeg" alt="ORYXIA Design — gravure laser">
          </a>
          <nav class="nav-links" id="navlinks">
            ${links}
            <a href="${BASE}contact.html" class="btn btn-or btn-sm nav-cta">Demander un devis</a>
          </nav>
          <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
        </div>
      </header>`;

    const hdr = document.getElementById("hdr");
    const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const burger = document.getElementById("burger");
    const navlinks = document.getElementById("navlinks");
    burger.addEventListener("click", () => navlinks.classList.toggle("open"));
    navlinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navlinks.classList.remove("open")));
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
                <a href="#" aria-label="Instagram">◐</a>
                <a href="#" aria-label="Facebook">f</a>
                <a href="#" aria-label="Pinterest">P</a>
                <a href="#" aria-label="TikTok">♪</a>
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
              <p>✉ contact@oryxia-design.fr</p>
              <p>☎ 06 00 00 00 00</p>
              <p>📍 France — Expédition partout</p>
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

  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    buildFooter();
    reveals();
    faq();
    galleryFilters();
    forms();
    estimator();
  });
})();
