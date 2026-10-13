const DICTIONNAIRE = {
  fr: {
    tableau_de_bord: "Tableau de bord",
    categorie: "Catégorie",
    emprunt: "Emprunt",
    etudiant: "Étudiant",
    historique: "Historique",
    parametres: "Paramètres",
    deconnexion: "Déconnexion",
    rechercher: "Rechercher",
    catalogue: "Catalogue",
    mes_emprunts: "Mes emprunts",
    notifications: "Notifications",
    mon_profil: "Mon profil",
    onglet_regles: "Règles d'emprunt",
    onglet_informations: "Informations",
    onglet_apparence: "Apparence",
    onglet_securite: "Compte et sécurité",
    onglet_compte: "Compte",
    langue: "Langue",
  },
  en: {
    tableau_de_bord: "Dashboard",
    categorie: "Category",
    emprunt: "Loans",
    etudiant: "Students",
    historique: "History",
    parametres: "Settings",
    deconnexion: "Log out",
    rechercher: "Search",
    catalogue: "Catalogue",
    mes_emprunts: "My loans",
    notifications: "Notifications",
    mon_profil: "My profile",
    onglet_regles: "Loan rules",
    onglet_informations: "Information",
    onglet_apparence: "Appearance",
    onglet_securite: "Account & security",
    onglet_compte: "Account",
    langue: "Language",
  },
};

export function langueCourante() {
  return localStorage.getItem("langue") || "fr";
}

export function changerLangue(langue) {
  localStorage.setItem("langue", langue);
  window.location.reload();
}

export function t(cle) {
  const langue = langueCourante();
  return (DICTIONNAIRE[langue] && DICTIONNAIRE[langue][cle]) || DICTIONNAIRE.fr[cle] || cle;
}