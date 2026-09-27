/* ==========================================================================
   SN Collection — Page d'accueil
   ========================================================================== */
(async function () {
  const { formatPrice, renderStars, productMedia, escapeHtml } = SNUI;

  await SNUI.mountHeader("accueil");
  SNUI.mountFooter();

  const [settings, products, categories] = await Promise.all([
    SNData.getSettings(),
    SNData.getProducts(),
    SNData.getCategories()
  ]);

  document.title = `${settings.hero_titre} — ${settings.hero_sous_titre}`;

  /* ---------- Icônes des avantages ---------- */
  document.getElementById("icon-truck").innerHTML = ICONS.truck;
  document.getElementById("icon-cash").innerHTML = ICONS.cash;
  document.getElementById("icon-rotate").innerHTML = ICONS.rotate;
  document.getElementById("icon-headset").innerHTML = ICONS.headset;

  /* ---------- Hero slider ---------- */
  const heroImages = ["assets/hero-1.jpg", "assets/hero-2.jpg", "assets/hero-3.jpg"];
  const slidesHtml = heroImages.map((img, i) => `
    <div class="hero-slide ${i === 0 ? "is-active" : ""}" style="background-image:url('${img}')">
      <div class="hero-slide__scrim"></div>
      <div class="hero-slide__content">
        <div class="hero-slide__text">
          <p class="eyebrow">Nouvelle saison</p>
          <h1>${escapeHtml(settings.hero_titre)}<em>${escapeHtml(settings.hero_sous_titre)}</em></h1>
          <p>${escapeHtml(settings.hero_texte)}</p>
          <div class="hero-slide__actions">
            <a href="boutique.html" class="btn btn-primary">Découvrir la boutique</a>
            <a href="collections.html" class="btn btn-outline">Nos collections</a>
          </div>
        </div>
      </div>
    </div>`).join("");

  const slider = document.getElementById("hero-slider");
  slider.innerHTML = slidesHtml + `
    <button class="hero-arrow prev" aria-label="Précédent">${ICONS.arrowLeft}</button>
    <button class="hero-arrow next" aria-label="Suivant">${ICONS.arrowRight}</button>
    <div class="hero-dots">${heroImages.map((_, i) => `<button class="${i === 0 ? "is-active" : ""}" aria-label="Image ${i + 1}"></button>`).join("")}</div>
  `;

  let current = 0;
  const slideEls = slider.querySelectorAll(".hero-slide");
  const dotEls = slider.querySelectorAll(".hero-dots button");
  function goTo(i) {
    current = (i + slideEls.length) % slideEls.length;
    slideEls.forEach((s, idx) => s.classList.toggle("is-active", idx === current));
    dotEls.forEach((d, idx) => d.classList.toggle("is-active", idx === current));
  }
  slider.querySelector(".prev").addEventListener("click", () => goTo(current - 1));
  slider.querySelector(".next").addEventListener("click", () => goTo(current + 1));
  dotEls.forEach((d, idx) => d.addEventListener("click", () => goTo(idx)));
  let auto = setInterval(() => goTo(current + 1), 6000);
  slider.addEventListener("mouseenter", () => clearInterval(auto));
  slider.addEventListener("mouseleave", () => { auto = setInterval(() => goTo(current + 1), 6000); });

  /* ---------- Catégories ---------- */
  const catGrid = document.getElementById("category-grid");
  catGrid.innerHTML = categories.slice(0, 8).map((c) => `
    <a class="cat-card" href="boutique.html?categorie=${encodeURIComponent(c.nom)}">
      ${c.image
        ? `<img src="${c.image}" alt="${escapeHtml(c.nom)}" loading="lazy"><div class="cat-card__scrim"></div>`
        : `<div class="cat-card__placeholder">${ICONS.image}</div><div class="cat-card__scrim"></div>`
      }
      <div class="cat-card__label"><strong>${escapeHtml(c.nom)}</strong><span>Découvrir ${ICONS.arrowRight}</span></div>
    </a>
  `).join("");

  /* ---------- Bannière promo ---------- */
  document.getElementById("promo-banner").style.backgroundImage = "url('assets/promo-banner.jpg')";
  document.getElementById("promo-title").textContent = settings.banniere_titre;
  document.getElementById("promo-text").textContent = settings.banniere_texte;

  /* ---------- Grilles produits ---------- */
  function productCard(p) {
    return `
      <a class="product-card" href="produit.html?id=${encodeURIComponent(p.id)}">
        <div class="product-card__media">
          ${p.badge ? `<span class="product-card__badge ${p.badge.toLowerCase() === "promo" ? "promo" : ""}">${escapeHtml(p.badge)}</span>` : ""}
          <button class="product-card__wish icon-btn" style="position:absolute;" aria-label="Ajouter aux favoris" onclick="event.preventDefault()">${ICONS.heart}</button>
          ${productMedia(p.images, p.nom, "Photo à venir")}
        </div>
        <div class="product-card__cat">${escapeHtml(p.categorie)}</div>
        <div class="product-card__name">${escapeHtml(p.nom)}</div>
        <div class="product-card__price"><strong>${formatPrice(p.prix)}</strong>${p.ancienPrix ? `<del>${formatPrice(p.ancienPrix)}</del>` : ""}</div>
        ${renderStars(p.note, p.avis)}
      </a>`;
  }

  const featured = products.filter((p) => p.vedette).slice(0, 4);
  const fallbackFeatured = featured.length ? featured : products.slice(0, 4);
  document.getElementById("featured-grid").innerHTML = fallbackFeatured.map(productCard).join("");

  const nouveautes = products.filter((p) => p.nouveaute).slice(0, 4);
  const fallbackNew = nouveautes.length ? nouveautes : products.slice(4, 8);
  document.getElementById("new-grid").innerHTML = fallbackNew.length
    ? fallbackNew.map(productCard).join("")
    : `<div class="empty-state">${ICONS.image}<p>Les nouveautés arrivent très bientôt.</p></div>`;

  /* ---------- Témoignages (contenu éditorial) ---------- */
  const testimonials = [
    { nom: "Aïcha K.", ville: "Abidjan", texte: "La qualité du tissu est vraiment au rendez-vous et la coupe tombe parfaitement. Livraison rapide en plus !" },
    { nom: "Fatou D.", ville: "Yamoussoukro", texte: "Ma robe pour le mariage de ma sœur venait de chez SN Collection, j'ai reçu tellement de compliments." },
    { nom: "Grace A.", ville: "Bouaké", texte: "Un service client à l'écoute et des modèles qu'on ne voit pas partout. Je recommande sans hésiter." }
  ];
  document.getElementById("testimonials-grid").innerHTML = testimonials.map((t) => `
    <div class="value-card" style="text-align:left;">
      ${renderStars(5, 0, { hideCount: true })}
      <p style="margin-top:12px;">« ${escapeHtml(t.texte)} »</p>
      <strong style="color:var(--ink); font-family:var(--font-body);">${escapeHtml(t.nom)}</strong>
      <div style="font-size:.8rem; color:var(--grey);">${escapeHtml(t.ville)}</div>
    </div>
  `).join("");

  /* ---------- Newsletter (démo : stockage local) ---------- */
  document.getElementById("newsletter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("newsletter-msg").hidden = false;
    e.target.reset();
  });
})();
