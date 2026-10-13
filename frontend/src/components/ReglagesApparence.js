import { useState } from "react";
import { lirePreference, ecrirePreference } from "../services/preferences";
import { langueCourante, changerLangue, t } from "../i18n";

const THEMES = [["clair", "Clair"], ["sombre", "Sombre"]];
const ACCENTS = [
  ["violet", "Violet", "#7c4dff"],
  ["vert", "Vert", "#16a34a"],
  ["bleu", "Bleu", "#2563eb"],
];
const POLICES = [["normale", "Normale"], ["agrandie", "Agrandie"]];

function ReglagesApparence() {
  const [theme, setTheme] = useState(lirePreference("theme"));
  const [accent, setAccent] = useState(lirePreference("accent"));
  const [police, setPolice] = useState(lirePreference("police"));

  const choisir = (cle, valeur, setter) => {
    setter(valeur);
    ecrirePreference(cle, valeur);
  };

  return (
    <div className="reglages-colonne">
      <div className="bloc-reglage">
        <strong>Thème</strong>
        <div className="choix-groupe">
          {THEMES.map(([valeur, libelle]) => (
            <button
              type="button" key={valeur}
              className={`choix ${theme === valeur ? "actif" : ""}`}
              onClick={() => choisir("theme", valeur, setTheme)}
            >
              {libelle}
            </button>
          ))}
        </div>
      </div>

      <div className="bloc-reglage">
        <strong>Couleur d'accent</strong>
        <div className="choix-groupe">
          {ACCENTS.map(([valeur, libelle, couleur]) => (
            <button
              type="button" key={valeur}
              className={`choix ${accent === valeur ? "actif" : ""}`}
              onClick={() => choisir("accent", valeur, setAccent)}
            >
              <span className="pastille" style={{ backgroundColor: couleur }} />
              {libelle}
            </button>
          ))}
        </div>
      </div>

      <div className="bloc-reglage">
        <strong>Taille de police</strong>
        <div className="choix-groupe">
          {POLICES.map(([valeur, libelle]) => (
            <button
              type="button" key={valeur}
              className={`choix ${police === valeur ? "actif" : ""}`}
              onClick={() => choisir("police", valeur, setPolice)}
            >
              {libelle}
            </button>
          ))}
        </div>
      </div>

      <div className="bloc-reglage">
        <strong>{t("langue")}</strong>
        <select value={langueCourante()} onChange={(e) => changerLangue(e.target.value)}>
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
        <small className="texte-discret">
          Ces réglages sont enregistrés sur ce navigateur uniquement. Le changement de langue recharge la page.
        </small>
      </div>
    </div>
  );
}

export default ReglagesApparence;