import { useEffect, useState } from "react";
import api from "../services/api";
import Squelette from "../components/Squelette";
import EtatVide from "../components/EtatVide";
import { FaInbox } from "react-icons/fa";

const LIBELLES_STATUT = {
  en_attente: "En attente", valide: "Validé", refuse: "Refusé", expire: "Expiré",
};

function Historique() {
  const [emprunts, setEmprunts] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [tri, setTri] = useState({ champ: "date_emprunt", ordre: "desc" });

  useEffect(() => {
    api.get("emprunts/").then((r) => setEmprunts(r.data));
  }, []);

  if (emprunts === null) return <Squelette lignes={5} />;

  const changerTri = (champ) => {
    setTri((precedent) =>
      precedent.champ === champ
        ? { champ, ordre: precedent.ordre === "asc" ? "desc" : "asc" }
        : { champ, ordre: "asc" }
    );
  };

  let filtres = emprunts.filter((e) => {
    if (filtreStatut && e.statut !== filtreStatut) return false;
    const date = new Date(e.date_emprunt);
    if (dateDebut && date < new Date(dateDebut)) return false;
    if (dateFin && date > new Date(dateFin + "T23:59:59")) return false;
    return true;
  });

  filtres = [...filtres].sort((a, b) => {
    const valeurA = a[tri.champ] || "";
    const valeurB = b[tri.champ] || "";
    const resultat = valeurA > valeurB ? 1 : valeurA < valeurB ? -1 : 0;
    return tri.ordre === "asc" ? resultat : -resultat;
  });

  const fleche = (champ) => (tri.champ === champ ? (tri.ordre === "asc" ? " ▲" : " ▼") : "");

  return (
    <div>
      <h1>Historique des emprunts</h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="valide">Validé</option>
          <option value="refuse">Refusé</option>
          <option value="expire">Expiré</option>
        </select>
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
      </form>

      {filtres.length === 0 ? (
        <EtatVide icone={<FaInbox />} texte="Aucun emprunt ne correspond à ces filtres." couleur="violette" />
      ) : (
        <table>
          <thead>
            <tr>
              <th className="th-triable" onClick={() => changerTri("livre_titre")}>Livre{fleche("livre_titre")}</th>
              <th className="th-triable" onClick={() => changerTri("etudiant_nom")}>Étudiant{fleche("etudiant_nom")}</th>
              <th className="th-triable" onClick={() => changerTri("date_emprunt")}>Demande{fleche("date_emprunt")}</th>
              <th>Échéance</th><th>Retour</th>
              <th className="th-triable" onClick={() => changerTri("statut")}>Statut{fleche("statut")}</th>
            </tr>
          </thead>
          <tbody>
            {filtres.map((e) => (
              <tr key={e.id} className={e.en_retard ? "ligne-retard" : ""}>
                <td>{e.livre_titre}</td>
                <td>{e.etudiant_nom}</td>
                <td>{new Date(e.date_emprunt).toLocaleDateString()}</td>
                <td>{e.date_echeance || "—"}</td>
                <td>{e.date_retour_effective || "—"}</td>
                <td>{LIBELLES_STATUT[e.statut] || e.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Historique;