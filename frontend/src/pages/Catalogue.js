import { useEffect, useState } from "react";
import api from "../services/api";
import { estConnecte } from "../services/auth";

const FORMULAIRE_VIDE = {
  id: null,
  titre: "",
  auteur: "",
  genre: "",
  isbn: "",
  nombre_exemplaires: 1,
  rangee: "",
};

function Catalogue() {
  const [livres, setLivres] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [genreFiltre, setGenreFiltre] = useState("");
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [modeEdition, setModeEdition] = useState(false);

  const chargerLivres = () => {
    const params = {};
    if (recherche) params.search = recherche;
    if (genreFiltre) params.genre = genreFiltre;
    api.get("livres/", { params }).then((response) => setLivres(response.data));
  };

  useEffect(() => {
    chargerLivres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche, genreFiltre]);

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const soumettreFormulaire = (e) => {
    e.preventDefault();
    const requete = modeEdition
      ? api.put(`livres/${formulaire.id}/`, formulaire)
      : api.post("livres/", formulaire);

    requete.then(() => {
      setFormulaire(FORMULAIRE_VIDE);
      setModeEdition(false);
      chargerLivres();
    });
  };

  const modifierLivre = (livre) => {
    setFormulaire(livre);
    setModeEdition(true);
  };

  const annulerEdition = () => {
    setFormulaire(FORMULAIRE_VIDE);
    setModeEdition(false);
  };

  const supprimerLivre = (id) => {
    if (window.confirm("Supprimer ce livre ?")) {
      api.delete(`livres/${id}/`).then(() => chargerLivres());
    }
  };

  return (
    <div>
      <h1>Catalogue des livres</h1>

      <div className="barre-filtres">
        <input
          type="text"
          placeholder="Rechercher (titre, auteur, ISBN)"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filtrer par genre"
          value={genreFiltre}
          onChange={(e) => setGenreFiltre(e.target.value)}
        />
      </div>

      {estConnecte() && (
        <form onSubmit={soumettreFormulaire}>
          <input name="titre" placeholder="Titre" value={formulaire.titre} onChange={gererChangement} required />
          <input name="auteur" placeholder="Auteur" value={formulaire.auteur} onChange={gererChangement} required />
          <input name="genre" placeholder="Genre" value={formulaire.genre} onChange={gererChangement} required />
          <input name="isbn" placeholder="ISBN" value={formulaire.isbn} onChange={gererChangement} required />
          <input
            type="number"
            name="nombre_exemplaires"
            value={formulaire.nombre_exemplaires}
            onChange={gererChangement}
            min="1"
          />
          <input name="rangee" placeholder="Rangée (ex: D)" value={formulaire.rangee} onChange={gererChangement} />
          <button type="submit">{modeEdition ? "Modifier" : "Ajouter"}</button>
          {modeEdition && (
            <button type="button" onClick={annulerEdition}>
              Annuler
            </button>
          )}
        </form>
      )}

      <ul className="liste-livres">
        {livres.map((livre) => (
          <li key={livre.id}>
            <span>
              {livre.titre} — {livre.auteur} ({livre.exemplaires_disponibles} disponible(s))
              {livre.rangee && ` — Rangée ${livre.rangee}`}
            </span>
            {estConnecte() && (
              <span>
                <button onClick={() => modifierLivre(livre)}>Modifier</button>
                <button onClick={() => supprimerLivre(livre.id)}>Supprimer</button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Catalogue;