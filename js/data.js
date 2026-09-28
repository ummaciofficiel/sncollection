/* ==========================================================================
   SN Collection — Chargement des données (Google Sheet ou démonstration)
   ========================================================================== */
(function (global) {
  const CFG = global.SITE_CONFIG || {};
  const CACHE_MS = (CFG.CACHE_MINUTES || 10) * 60 * 1000;

  function normalizeKey(k) {
    return (k || "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // enlève les accents
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function normalizeRow(row) {
    const out = {};
    Object.keys(row).forEach((k) => {
      out[normalizeKey(k)] = typeof row[k] === "string" ? row[k].trim() : row[k];
    });
    return out;
  }

  function csvUrl(tabName) {
    return `https://docs.google.com/spreadsheets/d/${CFG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&t=${Date.now()}`;
  }

  function parseCsv(text) {
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    return (result.data || []).map(normalizeRow);
  }

  async function fetchSheetTab(tabKey) {
    const tabName = CFG.SHEETS && CFG.SHEETS[tabKey];
    if (!CFG.SHEET_ID || !tabName) return null;
    try {
      const res = await fetch(csvUrl(tabName), { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const text = await res.text();
      if (/<html/i.test(text)) throw new Error("Réponse invalide (feuille non partagée publiquement ?)");
      return parseCsv(text);
    } catch (err) {
      console.warn(`[SN Collection] Impossible de lire l'onglet "${tabName}" du Google Sheet :`, err.message);
      return null;
    }
  }

  async function fetchLocalJson(file) {
    try {
      const res = await fetch(`data/${file}`, { cache: "no-store" });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      return [];
    }
  }

  function cacheGet(key) {
    try {
      const raw = localStorage.getItem("sn_cache_" + key);
      if (!raw) return null;
      const { t, data } = JSON.parse(raw);
      if (Date.now() - t > CACHE_MS) return null;
      return data;
    } catch (e) { return null; }
  }
  function cacheSet(key, data) {
    try {
      localStorage.setItem("sn_cache_" + key, JSON.stringify({ t: Date.now(), data }));
    } catch (e) {}
  }

  async function getTable(key, localFile) {
    const cached = cacheGet(key);
    if (cached) return cached;
    let rows = await fetchSheetTab(key);
    if (!rows || rows.length === 0) {
      rows = await fetchLocalJson(localFile);
      rows = rows.map((r) => ({ ...r, _demo: true }));
    }
    cacheSet(key, rows);
    return rows;
  }

  function toBool(v) {
    if (typeof v === "boolean") return v;
    const s = (v || "").toString().trim().toLowerCase();
    return ["oui", "yes", "true", "1", "vrai", "x"].includes(s);
  }
  function toNumber(v, fallback) {
    if (v === undefined || v === null || v === "") return fallback;
    const n = parseFloat(String(v).replace(/[^\d.-]/g, ""));
    return isNaN(n) ? fallback : n;
  }

  function mapProduct(p) {
    const images = [p.image_1, p.image_2, p.image_3, p.image_4]
      .concat(p.image ? [p.image] : [])
      .filter(Boolean);
    return {
      id: p.id || p.identifiant || cryptoRandomId(p.nom),
      nom: p.nom || p.nom_du_produit || "Article sans nom",
      categorie: p.categorie || "Non classé",
      prix: toNumber(p.prix, 0),
      ancienPrix: toNumber(p.ancien_prix || p.prix_barre, null),
      images,
      description: p.description || "",
      tailles: (p.tailles || "").split(",").map((s) => s.trim()).filter(Boolean),
      couleurs: (p.couleurs || "").split(",").map((s) => s.trim()).filter(Boolean),
      badge: p.badge || "",
      note: toNumber(p.note, 4.8),
      avis: toNumber(p.avis || p.nombre_avis, 0),
      enStock: p.stock === undefined || p.stock === "" ? true : toBool(p.stock),
      vedette: toBool(p.vedette || p.en_vedette),
      nouveaute: toBool(p.nouveaute || p.nouveau),
      _demo: !!p._demo
    };
  }

  function cryptoRandomId(seed) {
    return "p_" + (seed || "x").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) + "-" + Math.random().toString(36).slice(2, 6);
  }

  function mapCategory(c) {
    return {
      nom: c.nom || "",
      slug: c.slug || normalizeKey(c.nom),
      image: c.image || "",
      description: c.description || ""
    };
  }
  function mapCollection(c) {
    return {
      nom: c.nom || "",
      image: c.image || "",
      description: c.description || "",
      lien_categorie: c.lien_categorie || c.categorie || ""
    };
  }
  function mapBlog(b) {
    return {
      id: b.id || cryptoRandomId(b.titre),
      titre: b.titre || "",
      image: b.image || "",
      extrait: b.extrait || "",
      contenu: b.contenu || "",
      date: b.date || "",
      auteur: b.auteur || "SN Collection"
    };
  }

  const DEFAULT_SETTINGS = {
    hero_titre: "SN Collection",
    hero_sous_titre: "Votre style, notre signature",
    hero_texte: "Découvrez notre collection de vêtements, accessoires et bien plus, pour toutes les femmes qui veulent allier élégance, confort et authenticité.",
    banniere_titre: "Élégante aujourd'hui, unique toujours.",
    banniere_texte: "Chaque saison, une nouvelle histoire de style à raconter.",
    telephone: "+225 07 14 55 56 31",
    whatsapp: CFG.WHATSAPP || "",
    moyens_paiement: "Orange Money, Wave, Djamo, Espèces à la livraison",
    email: "contact@sncollection.ci",
    adresse: "Abidjan, Côte d'Ivoire",
    facebook: "", instagram: "", tiktok: "", youtube: ""
  };

  async function getSettings() {
    const rows = await getTable("parametres", "parametres.sample.json");
    const out = { ...DEFAULT_SETTINGS };
    rows.forEach((r) => {
      const key = normalizeKey(r.cle || r.key);
      const val = r.valeur !== undefined ? r.valeur : r.value;
      if (key) out[key] = val;
    });
    return out;
  }

  async function getProducts() {
    const rows = await getTable("produits", "produits.sample.json");
    return rows.map(mapProduct);
  }
  async function getCategories() {
    const rows = await getTable("categories", "categories.sample.json");
    return rows.map(mapCategory);
  }
  async function getCollections() {
    const rows = await getTable("collections", "collections.sample.json");
    return rows.map(mapCollection);
  }
  async function getBlogPosts() {
    const rows = await getTable("blog", "blog.sample.json");
    return rows.map(mapBlog);
  }

  global.SNData = { getProducts, getCategories, getCollections, getBlogPosts, getSettings, toNumber, toBool };
})(window);
