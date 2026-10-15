import { useEffect, useState } from "react";
import api from "../services/api";
import Squelette from "../components/Squelette";
import EtatVide from "../components/EtatVide";
import { FaInbox } from "react-icons/fa";
import TableauScroll from "../components/TableauScroll";

const LIBELLES_STATUT = {
  en_attente: "En attente", valide: "Validé", refuse: "Refusé", expire: "Expiré",
};

function MesEmpruntsEtudiant() {
  const [emprunts, setEmprunts] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState("");

  useEffect(() => {
    api.get("emprunts/").then((r) => setEmprunts(r.data));
  }, []);

  if (emprunts === null) return <Squelette lignes={4} />;

  const filtres = filtreStatut ? emprunts.filter((e) => e.statut === filtreStatut) : emprunts;

  return (
    <div>
      <h1>Mes emprunts</h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="valide">Validé</option>
          <option value="refuse">Refusé</option>
          <option value="expire">Expiré</option>
        </select>
      </form>

      {filtres.length === 0 ? (
        <EtatVide icone={<FaInbox />} texte="Aucun emprunt pour ce filtre." couleur="violette" />
      ) : (
        <TableauScroll>
          <table>
            <thead>
              <tr><th>Livre</th><th>Demande</th><th>Échéance</th><th>Retour</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {filtres.map((e) => (
              <tr key={e.id} className={e.en_retard ? "ligne-retard" : ""}>
                <td>{e.livre_titre}</td>
                <td>{new Date(e.date_emprunt).toLocaleDateString()}</td>
                <td>{e.date_echeance || "—"}</td>
                <td>{e.date_retour_effective || "—"}</td>
                <td>{LIBELLES_STATUT[e.statut] || e.statut}{e.motif_refus ? ` — ${e.motif_refus}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </TableauScroll>
      )}
    </div>
  );
}

export default MesEmpruntsEtudiant;