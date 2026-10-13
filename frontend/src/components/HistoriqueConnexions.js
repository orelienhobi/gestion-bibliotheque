import { useEffect, useState } from "react";
import api from "../services/api";

function HistoriqueConnexions() {
  const [connexions, setConnexions] = useState(null);

  useEffect(() => {
    api.get("historique-connexions/").then((r) => setConnexions(r.data));
  }, []);

  return (
    <div className="bloc-reglage">
      <strong>Dernières connexions</strong>
      {connexions === null ? (
        <p className="chargement">Chargement...</p>
      ) : connexions.length === 0 ? (
        <p className="texte-discret">Aucune connexion enregistrée.</p>
      ) : (
        <ul className="liste-connexions">
          {connexions.map((c) => (
            <li key={c.id}>
              <span>{new Date(c.date).toLocaleString()}</span>
              <span className="texte-discret">
                {c.adresse_ip || "IP inconnue"} — {c.navigateur.slice(0, 60) || "navigateur inconnu"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HistoriqueConnexions;