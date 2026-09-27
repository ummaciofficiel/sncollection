/* ==========================================================================
   SN Collection — Page Boutique
   ========================================================================== */
(async function () {
  const { formatPrice, renderStars, productMedia, escapeHtml, qs } = SNUI;
  const PER_PAGE = 8;

  await SNUI.mountHeader("boutique");
  SNUI.mountFooter();

  const [products, categories] = await Promise.all([SNData.getProducts(), SNData.getCategories()]);

  const state = {
    categorie: qs("categorie") || "",
    q: (qs("q") || "").toLowerCase(),
    tailles: new Set(),
    prixMax: 100000,
    tri: "pertinence",
    page: 1
  };

  const maxPrice = Math.max(100000, ...products.map((p) => p.prix || 0));
  document.getElementById("price-range").max = maxPrice;
  document.getElementById("price-range").value = maxPrice;
  document.getElementById("price-max-label").textContent = maxPrice.toLocaleString("fr-FR");
  state.prixMax = maxPrice;

  /* ---------- Filtres : catégories ---------- */
  const catNames = categories.length ? categories.map((c) => c.nom) : [...new Set(products.map((p) => p.categorie))];
  document.getElementById("filter-categories").innerHTML = catNames.map((nom) => `
    <label><input type="checkbox" name="cat" value="${escapeHtml(nom)}" ${state.categorie === nom ? "checked" : ""}> ${escapeHtml(nom)}</label>
  `).join("");
  if (state.categorie) {
    document.querySelectorAll('input[name=cat]').forEach((cb) => { if (cb.value !== state.categorie) cb.checked = false; });
  }

  /* ---------- Filtres : tailles ---------- */
  const allSizes = [...new Set(products.flatMap((p) => p.tailles))].filter(Boolean);
  document.getElementById("filter-sizes").innerHTML = allSizes.map((t) => `
    <label><input type="checkbox" name="taille" value="${escapeHtml(t)}"> ${escapeHtml(t)}</label>
  `).join("");

  function readFilters() {
    state.categories = [...document.querySelectorAll('input[name=cat]:checked')].map((c) => c.value);
    state.tailles = new Set([...document.querySelectorAll('input[name=taille]:checked')].map((c) => c.value));
    state.prixMax = parseInt(document.getElementById("price-range").value, 10);
    state.tri = document.getElementById("sort-select").value;
    state.page = 1;
    render();
  }

  document.getElementById("filters").addEventListener("change", readFilters);
  document.getElementById("sort-select").addEventListener("change", readFilters);
  document.getElementById("price-range").addEventListener("input", (e) => {
    document.getElementById("price-max-label").textContent = parseInt(e.target.value, 10).toLocaleString("fr-FR");
  });

  document.getElementById("mobile-filter-btn").addEventListener("click", () => {
    document.getElementById("filters").classList.toggle("open");
  });

  function productCard(p) {
    return `
      <a class="product-card" href="produit.html?id=${encodeURIComponent(p.id)}">
        <div class="product-card__media">
          ${p.badge ? `<span class="product-card__badge ${p.badge.toLowerCase() === "promo" ? "promo" : ""}">${escapeHtml(p.badge)}</span>` : ""}
          ${!p.enStock ? `<span class="product-card__badge" style="background:var(--grey);">Épuisé</span>` : ""}
          <button class="product-card__wish icon-btn" style="position:absolute;" aria-label="Ajouter aux favoris" onclick="event.preventDefault()">${ICONS.heart}</button>
          ${productMedia(p.images, p.nom, "Photo à venir")}
        </div>
        <div class="product-card__cat">${escapeHtml(p.categorie)}</div>
        <div class="product-card__name">${escapeHtml(p.nom)}</div>
        <div class="product-card__price"><strong>${formatPrice(p.prix)}</strong>${p.ancienPrix ? `<del>${formatPrice(p.ancienPrix)}</del>` : ""}</div>
        ${renderStars(p.note, p.avis)}
      </a>`;
  }

  function applyFilters() {
    let list = products.slice();
    if (state.categories && state.categories.length) list = list.filter((p) => state.categories.includes(p.categorie));
    if (state.q) list = list.filter((p) => p.nom.toLowerCase().includes(state.q) || p.categorie.toLowerCase().includes(state.q));
    if (state.tailles && state.tailles.size) list = list.filter((p) => p.tailles.some((t) => state.tailles.has(t)));
    list = list.filter((p) => p.prix <= state.prixMax);

    if (state.tri === "prix-asc") list.sort((a, b) => a.prix - b.prix);
    else if (state.tri === "prix-desc") list.sort((a, b) => b.prix - a.prix);
    else if (state.tri === "note") list.sort((a, b) => b.note - a.note);

    return list;
  }

  function render() {
    const list = applyFilters();
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * PER_PAGE;
    const pageItems = list.slice(start, start + PER_PAGE);

    document.getElementById("result-count").textContent = `${total} article${total > 1 ? "s" : ""}`;
    const grid = document.getElementById("product-grid");
    grid.innerHTML = pageItems.length
      ? pageItems.map(productCard).join("")
      : `<div class="empty-state" style="grid-column:1/-1;">${ICONS.image}<p>Aucun article ne correspond à votre recherche pour le moment.</p></div>`;

    const pagination = document.getElementById("pagination");
    if (totalPages <= 1) { pagination.innerHTML = ""; return; }
    let html = `<button ${state.page === 1 ? "disabled" : ""} data-p="${state.page - 1}">${ICONS.arrowLeft}</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="${i === state.page ? "is-active" : ""}" data-p="${i}">${i}</button>`;
    }
    html += `<button ${state.page === totalPages ? "disabled" : ""} data-p="${state.page + 1}">${ICONS.arrowRight}</button>`;
    pagination.innerHTML = html;
    pagination.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      state.page = parseInt(b.dataset.p, 10);
      render();
      window.scrollTo({ top: document.querySelector(".shop-layout").offsetTop - 100, behavior: "smooth" });
    }));
  }

  readFilters();
})();
