/* ==========================================================================
   SN Collection — Page Produit
   ========================================================================== */
(async function () {
  const { formatPrice, renderStars, escapeHtml, qs } = SNUI;

  await SNUI.mountHeader("boutique");
  SNUI.mountFooter();

  const id = qs("id");
  const products = await SNData.getProducts();
  const product = products.find((p) => p.id === id) || products[0];

  if (!product) {
    document.getElementById("product-root").innerHTML = `<div class="empty-state">${ICONS.image}<p>Cet article est introuvable.</p><a href="boutique.html" class="btn btn-primary" style="margin-top:14px;">Retour à la boutique</a></div>`;
    return;
  }

  document.title = `${product.nom} — SN Collection`;
  document.getElementById("page-title").textContent = document.title;
  document.getElementById("crumb-name").textContent = product.nom;

  let currentImage = 0;
  const images = product.images && product.images.length ? product.images : [];

  function mainMediaHtml() {
    if (!images.length) return `<div class="gallery__main">${SNUI.placeholderBlock("Photo à venir")}</div>`;
    return `<div class="gallery__main"><img src="${images[currentImage]}" alt="${escapeHtml(product.nom)}" id="main-image"></div>`;
  }

  function thumbsHtml() {
    if (images.length < 2) return "";
    return `<div class="gallery__thumbs">${images.map((img, i) => `
      <button class="${i === currentImage ? "is-active" : ""}" data-i="${i}"><img src="${img}" alt=""></button>
    `).join("")}</div>`;
  }

  const sizeOptions = product.tailles && product.tailles.length ? product.tailles : [];

  document.getElementById("product-root").innerHTML = `
    <div class="product-detail">
      <div class="gallery">${thumbsHtml()}${mainMediaHtml()}</div>
      <div>
        ${product.badge ? `<span class="pd-badge">${escapeHtml(product.badge)}</span>` : ""}
        <h1 class="pd-title">${escapeHtml(product.nom)}</h1>
        <div class="pd-rating">${renderStars(product.note, product.avis)}</div>
        <div class="pd-price"><span>${formatPrice(product.prix)}</span>${product.ancienPrix ? `<del>${formatPrice(product.ancienPrix)}</del>` : ""}</div>
        <p class="pd-desc">${escapeHtml(product.description) || "Description à venir prochainement pour cet article."}</p>

        ${sizeOptions.length ? `
        <div class="pd-block">
          <label>Taille</label>
          <div class="size-options" id="size-options">
            ${sizeOptions.map((t, i) => `<button data-size="${escapeHtml(t)}" class="${i === 0 ? "is-active" : ""}">${escapeHtml(t)}</button>`).join("")}
          </div>
        </div>` : ""}

        <div class="pd-block">
          <label>Quantité</label>
          <div class="qty-stepper">
            <button type="button" id="qty-minus">−</button>
            <input type="number" id="qty-input" value="1" min="1" readonly>
            <button type="button" id="qty-plus">+</button>
          </div>
        </div>

        <div class="pd-actions">
          <button class="btn btn-primary" id="add-to-cart" ${product.enStock ? "" : "disabled"}>${ICONS.bag} ${product.enStock ? "Ajouter au panier" : "Article épuisé"}</button>
          <a href="panier.html" class="btn btn-outline" id="buy-now">Acheter maintenant</a>
        </div>

        <div class="pd-meta">
          <span><strong>Catégorie :</strong> ${escapeHtml(product.categorie)}</span>
          ${product.couleurs.length ? `<span><strong>Couleur :</strong> ${escapeHtml(product.couleurs.join(", "))}</span>` : ""}
          <span><strong>Disponibilité :</strong> ${product.enStock ? "En stock" : "Rupture de stock"}</span>
        </div>

        <div class="accordion">
          <div class="accordion-item is-open">
            <button type="button">Détails du produit ${ICONS.chevron}</button>
            <div class="accordion-item__body" style="max-height:200px;"><p>${escapeHtml(product.description) || "Tissu wax authentique. Coupe soignée et finitions main. Entretien : lavage délicat à froid, séchage à l'ombre."}</p></div>
          </div>
          <div class="accordion-item">
            <button type="button">Livraison &amp; retours ${ICONS.chevron}</button>
            <div class="accordion-item__body"><p>Livraison en 24 à 72h à Abidjan, 3 à 7 jours dans le reste de la Côte d'Ivoire. Paiement à la livraison disponible. Retours acceptés sous 7 jours si l'article n'a pas été porté.</p></div>
          </div>
          <div class="accordion-item">
            <button type="button">Avis (${product.avis || 0}) ${ICONS.chevron}</button>
            <div class="accordion-item__body"><p>${product.avis ? "Consultez les avis de nos clientes ou laissez le vôtre après votre achat." : "Soyez la première à laisser un avis sur cet article."}</p></div>
          </div>
        </div>
      </div>
    </div>
  `;

  /* Galerie */
  document.querySelectorAll(".gallery__thumbs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentImage = parseInt(btn.dataset.i, 10);
      document.getElementById("main-image").src = images[currentImage];
      document.querySelectorAll(".gallery__thumbs button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  /* Taille */
  let selectedSize = sizeOptions[0] || "";
  document.querySelectorAll("#size-options button").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedSize = btn.dataset.size;
      document.querySelectorAll("#size-options button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  /* Quantité */
  const qtyInput = document.getElementById("qty-input");
  document.getElementById("qty-minus").addEventListener("click", () => { qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1); });
  document.getElementById("qty-plus").addEventListener("click", () => { qtyInput.value = parseInt(qtyInput.value, 10) + 1; });

  /* Accordéon */
  document.querySelectorAll(".accordion-item").forEach((item) => {
    const body = item.querySelector(".accordion-item__body");
    item.querySelector("button").addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      document.querySelectorAll(".accordion-item").forEach((i) => { i.classList.remove("is-open"); i.querySelector(".accordion-item__body").style.maxHeight = null; });
      if (!open) { item.classList.add("is-open"); body.style.maxHeight = body.scrollHeight + "px"; }
    });
  });

  /* Ajout au panier */
  document.getElementById("add-to-cart").addEventListener("click", () => {
    const qty = parseInt(qtyInput.value, 10) || 1;
    SNCart.add(product, { qty, taille: selectedSize });
    SNUI.showToast(`${product.nom} ajouté au panier`, { linkHref: "panier.html", linkText: "Voir le panier" });
  });
  document.getElementById("buy-now").addEventListener("click", () => {
    const qty = parseInt(qtyInput.value, 10) || 1;
    SNCart.add(product, { qty, taille: selectedSize });
  });

  /* Produits similaires */
  const related = products.filter((p) => p.categorie === product.categorie && p.id !== product.id).slice(0, 4);
  if (related.length) {
    document.getElementById("related-section").style.display = "";
    document.getElementById("related-grid").innerHTML = related.map((p) => `
      <a class="product-card" href="produit.html?id=${encodeURIComponent(p.id)}">
        <div class="product-card__media">
          ${p.badge ? `<span class="product-card__badge">${escapeHtml(p.badge)}</span>` : ""}
          ${SNUI.productMedia(p.images, p.nom, "Photo à venir")}
        </div>
        <div class="product-card__cat">${escapeHtml(p.categorie)}</div>
        <div class="product-card__name">${escapeHtml(p.nom)}</div>
        <div class="product-card__price"><strong>${formatPrice(p.prix)}</strong></div>
        ${renderStars(p.note, p.avis)}
      </a>
    `).join("");
  }
})();
