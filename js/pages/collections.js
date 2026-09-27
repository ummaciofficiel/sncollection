/* ==========================================================================
   SN Collection — Page Collections
   ========================================================================== */
(async function () {
  const { escapeHtml } = SNUI;
  await SNUI.mountHeader("collections");
  SNUI.mountFooter();

  const [collections, categories] = await Promise.all([SNData.getCollections(), SNData.getCategories()]);

  document.getElementById("collections-grid").innerHTML = collections.map((c) => `
    <a class="cat-card" href="boutique.html?categorie=${encodeURIComponent(c.lien_categorie)}" style="aspect-ratio:4/3.2;">
      ${c.image
        ? `<img src="${c.image}" alt="${escapeHtml(c.nom)}" loading="lazy"><div class="cat-card__scrim"></div>`
        : `<div class="cat-card__placeholder">${ICONS.image}</div><div class="cat-card__scrim"></div>`
      }
      <div class="cat-card__label"><strong style="font-size:1.35rem;">${escapeHtml(c.nom)}</strong><span>${escapeHtml(c.description || "")}</span></div>
    </a>
  `).join("");

  document.getElementById("category-grid").innerHTML = categories.map((c) => `
    <a class="cat-card" href="boutique.html?categorie=${encodeURIComponent(c.nom)}">
      ${c.image
        ? `<img src="${c.image}" alt="${escapeHtml(c.nom)}" loading="lazy"><div class="cat-card__scrim"></div>`
        : `<div class="cat-card__placeholder">${ICONS.image}</div><div class="cat-card__scrim"></div>`
      }
      <div class="cat-card__label"><strong>${escapeHtml(c.nom)}</strong><span>Découvrir ${ICONS.arrowRight}</span></div>
    </a>
  `).join("");
})();
