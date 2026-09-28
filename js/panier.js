/* ==========================================================================
   SN Collection — Page Panier
   ========================================================================== */
(async function () {
  const { formatPrice, escapeHtml } = SNUI;
  await SNUI.mountHeader("");
  SNUI.mountFooter();
  const settings = await SNData.getSettings();

  function render() {
    const items = SNCart.read();
    const root = document.getElementById("cart-root");

    if (!items.length) {
      root.innerHTML = `
        <div class="cart-empty">
          ${ICONS.bagX}
          <h3>Votre panier est vide</h3>
          <p>Découvrez nos dernières pièces et trouvez votre coup de cœur.</p>
          <a href="boutique.html" class="btn btn-primary">Découvrir la boutique</a>
        </div>`;
      return;
    }

    const subtotal = SNCart.total();
    const livraison = 0; // calculée à la livraison

    root.innerHTML = `
      <div class="cart-layout">
        <div>
          ${items.map((it) => `
            <div class="cart-row" data-key="${it.id}::${it.taille}::${it.couleur}">
              <img src="${it.image || ""}" alt="${escapeHtml(it.nom)}" onerror="this.style.background='var(--rose-pale)'; this.src='';">
              <div>
                <div class="cart-row__name">${escapeHtml(it.nom)}</div>
                <div class="cart-row__meta">${it.taille ? `Taille : ${escapeHtml(it.taille)}` : ""} ${it.couleur ? ` · Couleur : ${escapeHtml(it.couleur)}` : ""}</div>
                <div class="qty-stepper" style="margin-top:10px; transform:scale(.9); transform-origin:left;">
                  <button type="button" class="q-minus">−</button>
                  <input type="number" value="${it.qty}" min="1" readonly>
                  <button type="button" class="q-plus">+</button>
                </div>
                <a class="cart-row__remove" href="#">Retirer</a>
              </div>
              <div class="cart-row__price">${formatPrice(it.prix * it.qty)}</div>
            </div>
          `).join("")}
        </div>
        <div class="cart-summary">
          <h3>Récapitulatif</h3>
          <div class="summary-line"><span>Sous-total</span><span>${formatPrice(subtotal)}</span></div>
          <div class="summary-line"><span>Livraison</span><span>Calculée à la livraison</span></div>
          <div class="summary-line total"><span>Total</span><span>${formatPrice(subtotal)}</span></div>
          <div class="form-grid" style="margin-top:20px;">
            <div class="field"><label>Nom complet</label><input type="text" id="co-nom" placeholder="Votre nom"></div>
            <div class="field"><label>Téléphone</label><input type="tel" id="co-tel" placeholder="Ex : 07 00 00 00 00"></div>
            <div class="field"><label>Adresse de livraison</label><textarea id="co-adresse" placeholder="Commune, quartier, indications..."></textarea></div>
          </div>
          <button class="btn btn-primary btn-block" id="checkout-btn" style="margin-top:16px;">${ICONS.whatsapp} Commander via WhatsApp</button>
          <p class="form-note">Vous serez redirigée vers WhatsApp pour confirmer votre commande et choisir votre mode de paiement : Orange Money, Wave, Djamo ou espèces à la livraison.</p>
        </div>
      </div>
    `;

    root.querySelectorAll(".cart-row").forEach((row) => {
      const [id, taille, couleur] = row.dataset.key.split("::");
      const input = row.querySelector("input[type=number]");
      row.querySelector(".q-minus").addEventListener("click", () => {
        SNCart.updateQty(id, taille, couleur, Math.max(1, parseInt(input.value, 10) - 1));
        render();
      });
      row.querySelector(".q-plus").addEventListener("click", () => {
        SNCart.updateQty(id, taille, couleur, parseInt(input.value, 10) + 1);
        render();
      });
      row.querySelector(".cart-row__remove").addEventListener("click", (e) => {
        e.preventDefault();
        SNCart.remove(id, taille, couleur);
        render();
      });
    });

    document.getElementById("checkout-btn").addEventListener("click", () => {
      const nom = document.getElementById("co-nom").value.trim();
      const tel = document.getElementById("co-tel").value.trim();
      const adresse = document.getElementById("co-adresse").value.trim();
      const lignes = items.map((it) => `• ${it.nom}${it.taille ? " (Taille " + it.taille + ")" : ""} x${it.qty} — ${formatPrice(it.prix * it.qty)}`).join("%0A");
      const msg = `Bonjour SN Collection, je souhaite passer une commande :%0A%0A${lignes}%0A%0ATotal : ${formatPrice(subtotal)}%0A%0ANom : ${encodeURIComponent(nom)}%0ATéléphone : ${encodeURIComponent(tel)}%0AAdresse : ${encodeURIComponent(adresse)}`;
      const phone = (settings.whatsapp || "").replace(/[^0-9]/g, "");
      if (!phone) {
        SNUI.showToast("Numéro WhatsApp non configuré. Contactez-nous directement.");
        return;
      }
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    });
  }

  render();
})();
