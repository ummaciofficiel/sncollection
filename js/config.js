/* ==========================================================================
   CONFIGURATION DU SITE — SN Collection
   ==========================================================================
   C'est le SEUL fichier technique que vous aurez peut-être à modifier.

   1. Créez votre Google Sheet à partir du modèle fourni (voir README.md).
   2. Partagez-le en mode "Toute personne disposant du lien : Lecteur".
   3. Copiez l'identifiant du classeur (dans l'URL, entre /d/ et /edit) et
      collez-le ci-dessous, entre les guillemets.
   4. Enregistrez ce fichier. Le site va automatiquement lire vos données.

   Tant que SHEET_ID vaut "" (vide), le site utilise les données de
   démonstration fournies dans /data afin de ne jamais s'afficher vide.
   ========================================================================== */

window.SITE_CONFIG = {
  // Exemple : "1A2b3C4d5E6f7G8h9I0jKlmnopqrstuvwxyz1234567"
  SHEET_ID: "1_6fmTPEUTvnQrQnPo7Lzwa3QDk62dr-OEgss-nX0RlU",

  // Noms des onglets de votre Google Sheet (ne changez que si vous avez
  // renommé les onglets dans votre propre classeur).
  SHEETS: {
    produits: "Produits",
    categories: "Categories",
    collections: "Collections",
    blog: "Blog",
    parametres: "Parametres"
  },

  // Durée (en minutes) pendant laquelle les données lues sont gardées en
  // mémoire sur l'appareil du visiteur avant d'être rafraîchies.
  CACHE_MINUTES: 10,

  // Devise affichée sur le site
  CURRENCY: "F CFA",

  // Numéro WhatsApp pour le bouton de contact rapide (indicatif inclus, sans "+" ni espaces)
  WHATSAPP: "2250714555631"
};
