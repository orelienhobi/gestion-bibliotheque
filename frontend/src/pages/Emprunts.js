import { useEffect, useState } from "react";
import api from "../services/api";
import TableauScroll from "../components/TableauScroll";

function Emprunts() {
  const [emprunts, setEmprunts] = useState([]);
  const [reservations, setReservations] = useState([]);

  const charger = () => {
    api.get("emprunts/").then((r) => setEmprunts(r.data));
    api.get("reservations/").then((r) => setReservations(r.data));
  };

  useEffect(() => { charger(); }, []);

  const valider = (id) => api.post(`emprunts/${id}/valider/`).then(charger);

  const refuser = (id) => {
    const motif = window.prompt("Motif du refus (facultatif) :", "");
    if (motif === null) return; // annulé
    api.post(`emprunts/${id}/refuser/`, { motif }).then(charger);
  };

  const retourner = (id) => api.post(`emprunts/${id}/retourner/`).then(charger);
  const convertirReservation = (id) => api.post(`reservations/${id}/convertir/`).then(charger);

  const enAttente = emprunts.filter((e) => e.statut === "en_attente");
  const enCours = emprunts.filter((e) => e.statut === "valide" && !e.date_retour_effective);

  return (
    <div>
      <h1>Gestion des emprunts</h1>

      <h2>Demandes en attente de validation</h2>
      {enAttente.length === 0 ? (
        <p className="carte-message carte-message-violette">Aucune demande en attente.</p>
      ) : (
        <TableauScroll>
          <table>
            <thead>
              <tr><th>Livre</th><th>Étudiant</th><th>Demandé le</th><th>Action</th></tr>
            </thead>
            <tbody>
            {enAttente.map((e) => (
              <tr key={e.id}>
                <td>{e.livre_titre}</td>
                <td>{e.etudiant_nom}</td>
                <td>{new Date(e.date_emprunt).toLocaleString()}</td>
                <td className="actions-cellule">
                  <button className="btn-succes" onClick={() => valider(e.id)}>Valider</button>
                  <button className="btn-supprimer" onClick={() => refuser(e.id)}>Refuser</button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </TableauScroll>
      )}

      <h2>Emprunts en cours</h2>
      {enCours.length === 0 ? (
        <p className="carte-message carte-message-verte">Aucun emprunt en cours.</p>
      ) : (
        <TableauScroll>
        <table>
          <thead>
            <tr><th>Livre</th><th>Étudiant</th><th>Échéance</th><th>Statut</th><th>Action</th></tr>
          </thead>
          <tbody>
            {enCours.map((e) => (
              <tr key={e.id} className={e.en_retard ? "ligne-retard" : ""}>
                <td>{e.livre_titre}</td>
                <td>{e.etudiant_nom}</td>
                <td>{e.date_echeance}</td>
                <td>{e.en_retard ? "En retard" : "À jour"}</td>
                <td className="actions-cellule">
                  <button className="btn-succes" onClick={() => retourner(e.id)}>Marquer comme retourné</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableauScroll>
      )}

      <h2>Réservations en attente</h2>
      {reservations.length === 0 ? (
        <p className="carte-message carte-message-verte">Aucun emprunt en cours.</p>
      ) : (
        <TableauScroll>
          <table>
            <thead>
              <tr><th>Livre</th><th>Étudiant</th><th>Statut</th><th>Action</th></tr>
            </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id} className={r.disponible ? "ligne-disponible" : ""}>
                <td>{r.livre_titre}</td>
                <td>{r.etudiant_nom}</td>
                <td>{r.disponible ? "Disponible — à retirer" : "En attente"}</td>
                <td className="actions-cellule">
                  {r.disponible && (
                    <button className="btn-succes" onClick={() => convertirReservation(r.id)}>Convertir en emprunt</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </TableauScroll>
      )}
    </div>
  );
}

export default Emprunts;