/* ==========================================================================
   SN Collection — Page Article de blog
   ========================================================================== */
(async function () {
  const { escapeHtml, qs } = SNUI;
  await SNUI.mountHeader("blog");
  SNUI.mountFooter();

  const id = qs("id");
  const posts = await SNData.getBlogPosts();
  const post = posts.find((p) => p.id === id) || posts[0];

  function formatDate(d) {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  if (!post) {
    document.getElementById("article-root").innerHTML = `<div class="empty-state">${ICONS.image}<p>Cet article est introuvable.</p><a href="blog.html" class="btn btn-primary" style="margin-top:14px;">Retour au blog</a></div>`;
    return;
  }

  document.title = `${post.titre} — SN Collection`;
  document.getElementById("page-title").textContent = document.title;
  document.getElementById("crumb-title").textContent = post.titre;

  document.getElementById("article-root").innerHTML = `
    <div class="article-hero">
      <p class="eyebrow">${formatDate(post.date)} · ${escapeHtml(post.auteur)}</p>
      <h1>${escapeHtml(post.titre)}</h1>
    </div>
    <div class="article-media">${post.image ? `<img src="${post.image}" alt="${escapeHtml(post.titre)}">` : SNUI.placeholderBlock("Photo à venir")}</div>
    <div class="article-body">
      ${(post.contenu || post.extrait || "Contenu à venir.").split(/\n+/).map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
    </div>
  `;

  const others = posts.filter((p) => p.id !== post.id).slice(0, 3);
  if (others.length) {
    document.getElementById("more-section").style.display = "";
    document.getElementById("more-grid").innerHTML = others.map((p) => `
      <a class="blog-card" href="article.html?id=${encodeURIComponent(p.id)}">
        <div class="blog-card__media">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.titre)}" loading="lazy">` : SNUI.placeholderBlock("Photo à venir")}</div>
        <div class="blog-card__date">${formatDate(p.date)}</div>
        <div class="blog-card__title">${escapeHtml(p.titre)}</div>
        <p class="blog-card__excerpt">${escapeHtml(p.extrait)}</p>
      </a>
    `).join("");
  }
})();
