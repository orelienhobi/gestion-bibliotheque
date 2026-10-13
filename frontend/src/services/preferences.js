const DEFAUTS = {
  theme: "clair",
  accent: "violet",
  police: "normale",
  inactivite: "0",
};

export function lirePreference(cle) {
  return localStorage.getItem(`pref_${cle}`) || DEFAUTS[cle];
}

export function appliquerPreferences() {
  const html = document.documentElement;
  html.dataset.theme = lirePreference("theme");
  html.dataset.accent = lirePreference("accent");
  html.dataset.police = lirePreference("police");
  html.lang = localStorage.getItem("langue") || "fr";
}

export function ecrirePreference(cle, valeur) {
  localStorage.setItem(`pref_${cle}`, valeur);
  appliquerPreferences();
  window.dispatchEvent(new Event("preferences-maj"));
}