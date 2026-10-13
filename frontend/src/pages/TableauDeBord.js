import { useEffect, useState } from "react";
import { FaUsers, FaBook } from "react-icons/fa";
import api from "../services/api";

function TableauDeBord() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("statistiques/").then((r) => setStats(r.data));
  }, []);

  if (!stats) return <p className="chargement">Chargement du tableau de bord...</p>;

  const donneesGraphique = [
    { label: "Emprunts en cours", valeur: stats.emprunts_en_cours },
    { label: "Livres rendus", valeur: stats.livres_rendus },
    { label: "Emprunts ce mois-ci", valeur: stats.emprunts_ce_mois },
    { label: "Emprunts en retard", valeur: stats.emprunts_en_retard },
    { label: "Catégories", valeur: stats.nombre_categories },
    { label: "Demandes en attente", valeur: stats.demandes_en_attente },
  ];
  const max = Math.max(...donneesGraphique.map((d) => d.valeur), 1);

  return (
    <div>
      <div className="bandeau-violet">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de l'activité de la bibliothèque</p>
        </div>
      </div>

      <div className="rangee-compteurs-principaux">
        <div className="carte-compteur-principal carte-compteur-violette">
          <div className="carte-icone-grande"><FaUsers /></div>
          <div>
            <span className="carte-valeur-grande">{stats.nombre_membres}</span>
            <span className="carte-label-grande">Étudiants inscrits</span>
          </div>
        </div>
        <div className="carte-compteur-principal carte-compteur-verte">
          <div className="carte-icone-grande"><FaBook /></div>
          <div>
            <span className="carte-valeur-grande">{stats.nombre_livres}</span>
            <span className="carte-label-grande">Livres au catalogue</span>
          </div>
        </div>
      </div>

      <h2>Activité de la bibliothèque</h2>
      <div className="graphique-barres">
        {donneesGraphique.map((d, i) => (
          <div className="barre-ligne" key={d.label}>
            <span className="barre-label">{d.label}</span>
            <div className="barre-piste">
              <div
                className={`barre-remplissage ${i % 2 === 0 ? "barre-violette" : "barre-verte"}`}
                style={{ width: `${(d.valeur / max) * 100}%` }}
              />
            </div>
            <span className="barre-valeur">{d.valeur}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableauDeBord;