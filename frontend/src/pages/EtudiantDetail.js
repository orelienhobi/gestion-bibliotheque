import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Squelette from "../components/Squelette";
import TableauScroll from "../components/TableauScroll";

function EtudiantDetail() {
  const { id } = useParams();
  const [etudiant, setEtudiant] = useState(null);
  const [emprunts, setEmprunts] = useState([]);

  useEffect(() => {
    api.get(`etudiants/${id}/`).then((r) => setEtudiant(r.data));
    api.get(`etudiants/${id}/emprunts/`).then((r) => setEmprunts(r.data));
  }, [id]);

  if (etudiant === null) return <Squelette lignes = {4}>Chargement...</Squelette>;

  return (
    <div>
      <Link to="/etudiants">&larr; Retour à la liste des étudiants</Link>
      <h1>{etudiant.nom_complet}</h1>
      <p>Email : {etudiant.email || "—"}</p>
      <p>Téléphone : {etudiant.telephone || "—"}</p>

      <h2>Historique des emprunts</h2>
      {emprunts.length === 0 ? (
        <p>Aucun emprunt pour cet étudiant.</p>
      ) : (
        <TableauScroll>
        <table>
          <thead>
            <tr><th>Livre</th><th>Demande</th><th>Échéance</th><th>Retour</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {emprunts.map((emprunt) => (
              <tr key={emprunt.id} className={emprunt.en_retard ? "ligne-retard" : ""}>
                <td>{emprunt.livre_titre}</td>
                <td>{new Date(emprunt.date_emprunt).toLocaleDateString()}</td>
                <td>{emprunt.date_echeance || "—"}</td>
                <td>{emprunt.date_retour_effective || "—"}</td>
                <td>{emprunt.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </TableauScroll>
      )}
    </div>
  );
}

export default EtudiantDetail;