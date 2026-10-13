import { useState } from "react";
import { lirePreference, ecrirePreference } from "../services/preferences";

const OPTIONS = [
  ["0", "Désactivée"],
  ["5", "5 minutes"],
  ["15", "15 minutes"],
  ["30", "30 minutes"],
  ["60", "1 heure"],
];

function ReglageInactivite() {
  const [valeur, setValeur] = useState(lirePreference("inactivite"));

  const changer = (e) => {
    setValeur(e.target.value);
    ecrirePreference("inactivite", e.target.value);
  };

  return (
    <div className="bloc-reglage">
      <strong>Déconnexion automatique après inactivité</strong>
      <select value={valeur} onChange={changer}>
        {OPTIONS.map(([v, libelle]) => (
          <option key={v} value={v}>{libelle}</option>
        ))}
      </select>
      <small className="texte-discret">Enregistré sur ce navigateur uniquement.</small>
    </div>
  );
}

export default ReglageInactivite;