import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ModalConfirmation from "../components/ModalConfirmation";

const EDITION_VIDE = { id: null, nom_complet: "", email: "", telephone: "" };

function Etudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [rechercheNom, setRechercheNom] = useState("");
  const [rechercheEmail, setRechercheEmail] = useState("");
  const [rechercheTelephone, setRechercheTelephone] = useState("");
  const [edition, setEdition] = useState(EDITION_VIDE);
  const [enEdition, setEnEdition] = useState(false);
  const [etudiantASupprimer, setEtudiantASupprimer] = useState(null);

  const charger = () => {
    api.get("etudiants/").then((r) => setEtudiants(r.data));
  };

  useEffect(() => { charger(); }, []);

  const resultats = etudiants.filter((e) =>
    (e.nom_complet || "").toLowerCase().includes(rechercheNom.toLowerCase()) &&
    (e.email || "").toLowerCase().includes(rechercheEmail.toLowerCase()) &&
    (e.telephone || "").toLowerCase().includes(rechercheTelephone.toLowerCase())
  );

  const ouvrirEdition = (etu, e) => {
    e.preventDefault();
    setEdition({ id: etu.id, nom_complet: etu.nom_complet, email: etu.email, telephone: etu.telephone });
    setEnEdition(true);
  };

  const gererChangementEdition = (e) => setEdition({ ...edition, [e.target.name]: e.target.value });

  const enregistrerEdition = (e) => {
    e.preventDefault();
    api.patch(`etudiants/${edition.id}/`, edition).then(() => {
      setEnEdition(false);
      setEdition(EDITION_VIDE);
      charger();
    });
  };

  const demanderSuppression = (etu, e) => {
    e.preventDefault();
    setEtudiantASupprimer(etu);
  };

  const confirmerSuppression = () => {
    api.delete(`etudiants/${etudiantASupprimer.id}/`).then(() => {
      setEtudiantASupprimer(null);
      charger();
    });
  };

  return (
    <div>
      <h1>Étudiants</h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <input placeholder="Rechercher par nom et prénom" value={rechercheNom} onChange={(e) => setRechercheNom(e.target.value)} />
        <input placeholder="Rechercher par email" value={rechercheEmail} onChange={(e) => setRechercheEmail(e.target.value)} />
        <input placeholder="Rechercher par téléphone" value={rechercheTelephone} onChange={(e) => setRechercheTelephone(e.target.value)} />
      </form>

      {enEdition && (
        <form onSubmit={enregistrerEdition}>
          <input name="nom_complet" placeholder="Nom et prénom" value={edition.nom_complet} onChange={gererChangementEdition}
            pattern="[A-Za-zÀ-ÿ\s'\-]+" title="Lettres, espaces, tirets et apostrophes uniquement" required />
          <input type="email" name="email" placeholder="Email" value={edition.email} onChange={gererChangementEdition} />
          <input name="telephone" placeholder="Téléphone" value={edition.telephone} onChange={gererChangementEdition}
            pattern="\+?\d{7,15}" title="Entre 7 et 15 chiffres, + optionnel au début" />
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={() => { setEnEdition(false); setEdition(EDITION_VIDE); }}>Annuler</button>
        </form>
      )}

      <table>
        <thead>
          <tr><th>Nom et prénom</th><th>Email</th><th>Téléphone</th><th>Emprunts</th><th>Action</th></tr>
        </thead>
        <tbody>
          {resultats.map((etu) => (
            <tr key={etu.id}>
              <td><Link to={`/etudiants/${etu.id}`}>{etu.nom_complet}</Link></td>
              <td>{etu.email || "—"}</td>
              <td>{etu.telephone || "—"}</td>
              <td>{etu.nombre_emprunts}</td>
              <td className="actions-cellule">
                <button className="btn-modifier" onClick={(e) => ouvrirEdition(etu, e)}>Modifier</button>
                <button className="btn-supprimer" onClick={(e) => demanderSuppression(etu, e)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalConfirmation
        ouverte={!!etudiantASupprimer}
        titre="Supprimer l'étudiant"
        message={`Voulez-vous vraiment supprimer « ${etudiantASupprimer?.nom_complet} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setEtudiantASupprimer(null)}
      />
    </div>
  );
}

export default Etudiants;