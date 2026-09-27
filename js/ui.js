/* ==========================================================================
   SN Collection — Composants d'interface partagés (en-tête, pied de page...)
   ========================================================================== */
(function (global) {
  const I = global.ICONS;

  function formatPrice(n) {
    const cur = (global.SITE_CONFIG && global.SITE_CONFIG.CURRENCY) || "F CFA";
    if (n === null || n === undefined || isNaN(n)) return "";
    return Math.round(n).toLocaleString("fr-FR") + " " + cur;
  }

  function renderStars(note, avis, opts) {
    opts = opts || {};
    const full = Math.round(note || 0);
    let html = '<span class="stars">';
    for (let i = 1; i <= 5; i++) html += i <= full ? I.star : I.starOutline;
    if (!opts.hideCount) html += `<span class="count">(${avis || 0})</span>`;
    html += "</span>";
    return html;
  }

  function placeholderBlock(label) {
    return `<div class="product-card__placeholder">${I.image}<span>${label || "Photo à venir"}</span></div>`;
  }

  function productMedia(images, alt, label) {
    if (images && images.length && images[0]) {
      return `<img src="${images[0]}" alt="${escapeHtml(alt || "")}" loading="lazy">`;
    }
    return placeholderBlock(label);
  }

  function escapeHtml(s) {
    return (s || "").toString()
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  const NAV_LINKS = [
    { key: "accueil", href: "index.html", label: "Accueil" },
    { key: "boutique", href: "boutique.html", label: "Boutique" },
    { key: "collections", href: "collections.html", label: "Collections" },
    { key: "apropos", href: "a-propos.html", label: "À propos" },
    { key: "blog", href: "blog.html", label: "Blog" },
    { key: "contact", href: "contact.html", label: "Contact" }
  ];

  function navHtml(active, cls) {
    return NAV_LINKS.map(
      (l) => `<a href="${l.href}" class="${l.key === active ? "active" : ""} ${cls || ""}">${l.label}</a>`
    ).join("");
  }

  function mobileNavHtml(active) {
    const items = NAV_LINKS.map(
      (l) => `<a href="${l.href}" class="${l.key === active ? "active" : ""}"><span>${l.label}</span>${I.chevron}</a>`
    ).join("");
    return items +
      `<a href="compte.html"><span>Mon compte</span>${I.chevron}</a>` +
      `<a href="panier.html"><span>Panier <span class="mobile-nav__badge" id="cart-count-mobile">0</span></span>${I.chevron}</a>`;
  }

  async function mountHeader(active) {
    const el = document.getElementById("site-header");
    if (!el) return;
    let settings = {};
    try { settings = await global.SNData.getSettings(); } catch (e) {}

    el.innerHTML = `
      <div class="top-bar">
        <div class="container">
          <span>${I.truck} Livraison rapide en Côte d'Ivoire</span>
          <span>${I.cash} Paiement à la livraison</span>
          <span>${I.headset} Service client 7j/7</span>
        </div>
      </div>
      <header class="site-header">
        <div class="container">
          <a href="index.html" class="brand"><img src="assets/logo.png" alt="SN Collection"></a>
          <nav class="main-nav">${navHtml(active)}</nav>
          <div class="header-actions">
            <form class="search-box" role="search" action="boutique.html" method="get">
              ${I.search}
              <input type="search" name="q" placeholder="Rechercher un article...">
            </form>
            <a href="compte.html" class="icon-btn" aria-label="Mon compte">${I.user}</a>
            <a href="panier.html" class="icon-btn" aria-label="Panier">${I.bag}<span class="cart-badge" id="cart-badge" hidden>0</span></a>
            <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Menu"><span class="burger"><span></span><span></span><span></span></span></button>
          </div>
        </div>
      </header>
      <div class="mobile-nav" id="mobile-nav">
        <div class="mobile-nav__overlay"></div>
        <div class="mobile-nav__panel">
          <div class="mobile-nav__top">
            <img src="assets/logo.png" alt="SN Collection">
            <button class="mobile-nav__close" id="mobile-nav-close" aria-label="Fermer">${I.close}</button>
          </div>
          <nav>${mobileNavHtml(active)}</nav>
          <div class="mobile-nav__social">
            ${settings.facebook ? `<a href="${settings.facebook}" aria-label="Facebook" target="_blank" rel="noopener">${I.facebook}</a>` : ""}
            ${settings.instagram ? `<a href="${settings.instagram}" aria-label="Instagram" target="_blank" rel="noopener">${I.instagram}</a>` : ""}
            ${settings.tiktok ? `<a href="${settings.tiktok}" aria-label="TikTok" target="_blank" rel="noopener">${I.tiktok}</a>` : ""}
            ${settings.youtube ? `<a href="${settings.youtube}" aria-label="YouTube" target="_blank" rel="noopener">${I.youtube}</a>` : ""}
          </div>
          <div class="mobile-nav__promo">
            <div class="mobile-nav__promo-card">La mode au service de votre confiance. <a href="boutique.html" style="text-decoration:underline; border:none; display:inline; padding:0;">Découvrir la boutique →</a></div>
          </div>
        </div>
      </div>
    `;

    const toggle = document.getElementById("menu-toggle");
    const closeBtn = document.getElementById("mobile-nav-close");
    const panel = document.getElementById("mobile-nav");
    const openMenu = () => { panel.classList.add("open"); toggle && toggle.classList.add("is-open"); document.body.style.overflow = "hidden"; };
    const closeMenu = () => { panel.classList.remove("open"); toggle && toggle.classList.remove("is-open"); document.body.style.overflow = ""; };
    toggle && toggle.addEventListener("click", openMenu);
    closeBtn && closeBtn.addEventListener("click", closeMenu);
    panel && panel.querySelector(".mobile-nav__overlay").addEventListener("click", closeMenu);
    panel && panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

    refreshCartBadge();
    document.addEventListener("cart:change", refreshCartBadge);
  }

  function refreshCartBadge() {
    const n = global.SNCart ? global.SNCart.count() : 0;
    const badge = document.getElementById("cart-badge");
    const mobileCount = document.getElementById("cart-count-mobile");
    if (badge) { badge.textContent = n; badge.hidden = n === 0; }
    if (mobileCount) mobileCount.textContent = n;
  }

  async function mountFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    let s = {};
    try { s = await global.SNData.getSettings(); } catch (e) {}
    const year = new Date().getFullYear();

    el.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <img src="assets/logo.png" alt="SN Collection">
              <p>${escapeHtml(s.hero_texte || "")}</p>
              <div class="footer-social">
                ${s.facebook ? `<a href="${s.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${I.facebook}</a>` : ""}
                ${s.instagram ? `<a href="${s.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.instagram}</a>` : ""}
                ${s.tiktok ? `<a href="${s.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${I.tiktok}</a>` : ""}
                ${s.whatsapp ? `<a href="https://wa.me/${s.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${I.whatsapp}</a>` : ""}
                ${s.youtube ? `<a href="${s.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${I.youtube}</a>` : ""}
              </div>
            </div>
            <div class="footer-col">
              <h4>Liens utiles</h4>
              <ul>
                <li><a href="index.html">Accueil</a></li>
                <li><a href="boutique.html">Boutique</a></li>
                <li><a href="collections.html">Collections</a></li>
                <li><a href="a-propos.html">À propos</a></li>
                <li><a href="contact.html">Contact</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Service client</h4>
              <ul>
                <li><a href="contact.html">Questions fréquentes</a></li>
                <li><a href="contact.html">Livraison</a></li>
                <li><a href="contact.html">Retours &amp; échanges</a></li>
                <li><a href="contact.html">Suivi de commande</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Contact</h4>
              <ul>
                <li class="contact-line">${I.mapPin}<span>${escapeHtml(s.adresse || "")}</span></li>
                <li class="contact-line">${I.phone}<span>${escapeHtml(s.telephone || "")}</span></li>
                <li class="contact-line">${I.mail}<span>${escapeHtml(s.email || "")}</span></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${year} SN Collection. Tous droits réservés.</span>
            <div class="payment-icons">
              <span>VISA</span><span>MC</span><span>OM</span><span>MTN MoMo</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function showToast(message, opts) {
    opts = opts || {};
    let toast = document.getElementById("sn-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "sn-toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `${I.checkCircle}<span>${message}</span>${opts.linkHref ? `<a href="${opts.linkHref}">${opts.linkText || "Voir"}</a>` : ""}`;
    requestAnimationFrame(() => toast.classList.add("show"));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  /* ---------- Animations d'apparition au défilement ---------- */
  const REVEAL_SELECTOR = ".product-card, .cat-card, .blog-card, .value-card, .timeline-item, .section-head, .contact-info-card, .cart-summary";
  const revealIO = "IntersectionObserver" in global ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }) : null;

  function observeReveal(root) {
    if (!revealIO) return;
    const nodes = root.matches && root.matches(REVEAL_SELECTOR) ? [root] : [...root.querySelectorAll(REVEAL_SELECTOR)];
    nodes.forEach((el, i) => {
      if (el.dataset.revealInit) return;
      el.dataset.revealInit = "1";
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min(i % 8, 8) * 0.06 + "s";
      revealIO.observe(el);
    });
  }

  if (global.MutationObserver) {
    new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) observeReveal(n); }));
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  document.addEventListener("DOMContentLoaded", () => observeReveal(document.body));

  global.SNUI = {
    formatPrice, renderStars, placeholderBlock, productMedia, escapeHtml, qs,
    mountHeader, mountFooter, showToast, debounce, refreshCartBadge
  };
})(window);
