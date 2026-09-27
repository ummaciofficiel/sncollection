/* ==========================================================================
   SN Collection — Page Contact
   ========================================================================== */
(async function () {
  const { escapeHtml } = SNUI;
  await SNUI.mountHeader("contact");
  SNUI.mountFooter();

  const s = await SNData.getSettings();

  document.getElementById("contact-info").innerHTML = `
    <h3>Nos coordonnées</h3>
    <div class="contact-line">${ICONS.mapPin}<div><strong>Adresse</strong><span>${escapeHtml(s.adresse)}</span></div></div>
    <div class="contact-line">${ICONS.phone}<div><strong>Téléphone</strong><span>${escapeHtml(s.telephone)}</span></div></div>
    <div class="contact-line">${ICONS.mail}<div><strong>E-mail</strong><span>${escapeHtml(s.email)}</span></div></div>
    <div class="contact-line">${ICONS.clock}<div><strong>Horaires</strong><span>Lundi – Samedi, 8h – 19h</span></div></div>
    ${s.whatsapp ? `<a href="https://wa.me/${s.whatsapp.replace(/[^0-9]/g, "")}" target="_blank" rel="noopener" class="btn btn-light" style="margin-top:12px;">${ICONS.whatsapp} Discuter sur WhatsApp</a>` : ""}
    <div class="map-embed">${escapeHtml(s.adresse)}</div>
  `;

  document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("contact-success").classList.add("show");
    e.target.reset();
    e.target.querySelector("button[type=submit]").insertAdjacentElement("beforebegin", document.getElementById("contact-success"));
  });
})();
