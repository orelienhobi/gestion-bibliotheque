import { useEffect } from "react";
import { deconnecter } from "../services/auth";
import { lirePreference } from "../services/preferences";

const EVENEMENTS = ["mousemove", "keydown", "click", "scroll"];

export default function useInactivite() {
  useEffect(() => {
    let minuteur;
    let nettoyer = () => {};

    const configurer = () => {
      nettoyer();
      const minutes = parseInt(lirePreference("inactivite"), 10);
      if (!minutes) return;

      const reinitialiser = () => {
        clearTimeout(minuteur);
        minuteur = setTimeout(() => {
          deconnecter();
          window.location.href = "/connexion";
        }, minutes * 60 * 1000);
      };

      EVENEMENTS.forEach((e) => window.addEventListener(e, reinitialiser));
      reinitialiser();

      nettoyer = () => {
        clearTimeout(minuteur);
        EVENEMENTS.forEach((e) => window.removeEventListener(e, reinitialiser));
      };
    };

    configurer();
    window.addEventListener("preferences-maj", configurer);
    return () => {
      nettoyer();
      window.removeEventListener("preferences-maj", configurer);
    };
  }, []);
}