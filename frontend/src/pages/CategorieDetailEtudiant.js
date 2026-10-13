import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Carrousel from "../components/Carrousel";
import Squelette from "../components/Squelette";

function CategorieDetailEtudiant() {
  const { id } = useParams();
  const [categorie, setCategorie] = useState(null);
  const [livres, setLivres] = useState([]);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const charger = () => {
    api.get(`categories/${id}/`).then((r) => setCategorie(r.data));
    api.get(`categories/${id}/livres/`).then((r) => setLivres(r.data));
  };

  useEffect(() => { charger(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const emprunter = (livreId) => {
    setMessage("");
    setErreur("");
    api
      .post("emprunts/", { livre: livreId })
      .then(() => {
        setMessage("Demande envoyée ! Elle doit être validée par le responsable sous 5h.");
        charger();
      })
      .catch((error) => setErreur(error.response?.data?.erreur || "Erreur lors de la demande."));
  };

  const reserver = (livreId) => {
    api.post("reservations/", { livre: livreId }).then(() => {
      setMessage("Réservation enregistrée — vous serez prioritaire dès qu'un exemplaire se libère.");
      setErreur("");
      charger();
    });
  };

  if (categorie ===null) return <Squelette lignes = {4}>Chargement...</Squelette>;

  return (
    <div>
      <Link to="/espace-etudiant/catalogue">&larr; Retour au catalogue</Link>
      <h1>{categorie.nom}</h1>

      {message && <p className="message-succes">{message}</p>}
      {erreur && <p className="message-erreur">{erreur}</p>}

      <Carrousel>
        {livres.map((livre) => {
          const rupture = livre.exemplaires_disponibles <= 0;
          return (
            <div key={livre.id} className={`carte-slide ${rupture ? "livre-rupture" : ""}`}>
              <div className="carte-slide-image">
                {livre.image ? <img src={livre.image} alt={livre.titre} /> : <div className="carte-slide-placeholder">📖</div>}
              </div>
              <div className="carte-slide-corps">
                <h3>{livre.titre}</h3>
                <p>{livre.auteur}</p>
                <p className="texte-discret">Rangée {livre.rangee || "—"}</p>
                {rupture ? (
                  <button className="btn-modifier" onClick={() => reserver(livre.id)}>Réserver</button>
                ) : (
                  <button className="btn-succes" onClick={() => emprunter(livre.id)}>Emprunter</button>
                )}
              </div>
            </div>
          );
        })}
      </Carrousel>
      {livres.length === 0 && <p>Aucun livre dans cette catégorie.</p>}
    </div>
  );
}

export default CategorieDetailEtudiant;