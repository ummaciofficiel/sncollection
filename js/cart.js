/* ==========================================================================
   SN Collection — Panier (stocké dans le navigateur du visiteur)
   ========================================================================== */
(function (global) {
  const KEY = "sn_cart_v1";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) { return []; }
  }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent("cart:change", { detail: { items } }));
  }

  function lineKey(id, taille, couleur) {
    return [id, taille || "", couleur || ""].join("::");
  }

  function add(product, opts) {
    opts = opts || {};
    const qty = opts.qty || 1;
    const items = read();
    const key = lineKey(product.id, opts.taille, opts.couleur);
    const existing = items.find((it) => lineKey(it.id, it.taille, it.couleur) === key);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        nom: product.nom,
        prix: product.prix,
        image: (product.images && product.images[0]) || "",
        taille: opts.taille || "",
        couleur: opts.couleur || "",
        qty
      });
    }
    write(items);
    return items;
  }

  function updateQty(id, taille, couleur, qty) {
    let items = read();
    const key = lineKey(id, taille, couleur);
    items = items.map((it) => (lineKey(it.id, it.taille, it.couleur) === key ? { ...it, qty: Math.max(1, qty) } : it));
    write(items);
  }

  function remove(id, taille, couleur) {
    const key = lineKey(id, taille, couleur);
    const items = read().filter((it) => lineKey(it.id, it.taille, it.couleur) !== key);
    write(items);
  }

  function clear() { write([]); }

  function count() {
    return read().reduce((n, it) => n + it.qty, 0);
  }
  function total() {
    return read().reduce((sum, it) => sum + it.qty * it.prix, 0);
  }

  global.SNCart = { read, add, updateQty, remove, clear, count, total };
})(window);
