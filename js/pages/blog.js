/* ==========================================================================
   SN Collection — Page Blog (liste)
   ========================================================================== */
(async function () {
  const { escapeHtml } = SNUI;
  await SNUI.mountHeader("blog");
  SNUI.mountFooter();

  const posts = await SNData.getBlogPosts();

  function formatDate(d) {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  const grid = document.getElementById("blog-grid");
  grid.innerHTML = posts.length ? posts.map((p) => `
    <a class="blog-card" href="article.html?id=${encodeURIComponent(p.id)}">
      <div class="blog-card__media">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.titre)}" loading="lazy">` : SNUI.placeholderBlock("Photo à venir")}</div>
      <div class="blog-card__date">${formatDate(p.date)}</div>
      <div class="blog-card__title">${escapeHtml(p.titre)}</div>
      <p class="blog-card__excerpt">${escapeHtml(p.extrait)}</p>
    </a>
  `).join("") : `<div class="empty-state" style="grid-column:1/-1;">${ICONS.image}<p>Les premiers articles arrivent très bientôt.</p></div>`;
})();
