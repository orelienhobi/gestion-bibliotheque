import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Carrousel from "../components/Carrousel";
import Squelette from "../components/Squelette";
import ChampImage from "../components/ChampImage";

const FORMULAIRE_VIDE = { id: null, titre: "", auteur: "", nombre_exemplaires: 1, rangee: "" };

function CategorieDetail() {
  const { id } = useParams();
  const [categorie, setCategorie] = useState(null);
  const [livres, setLivres] = useState([]);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [fichierImage, setFichierImage] = useState(null);
  const [modeEdition, setModeEdition] = useState(false);

  const charger = () => {
    api.get(`categories/${id}/`).then((r) => setCategorie(r.data));
    api.get(`categories/${id}/livres/`).then((r) => setLivres(r.data));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const soumettre = (e) => {
    e.preventDefault();
    const donnees = new FormData();
    donnees.append("titre", formulaire.titre);
    donnees.append("auteur", formulaire.auteur);
    donnees.append("nombre_exemplaires", formulaire.nombre_exemplaires);
    donnees.append("rangee", formulaire.rangee);
    donnees.append("categorie", id);
    if (fichierImage) donnees.append("image", fichierImage);

    const requete = modeEdition
      ? api.patch(`livres/${formulaire.id}/`, donnees)
      : api.post("livres/", donnees);

    requete.then(() => {
      setFormulaire(FORMULAIRE_VIDE);
      setFichierImage(null);
      setModeEdition(false);
      charger();
    });
  };

  const modifier = (livre) => {
    setFormulaire({
      id: livre.id, titre: livre.titre, auteur: livre.auteur,
      nombre_exemplaires: livre.nombre_exemplaires, rangee: livre.rangee,
    });
    setModeEdition(true);
  };

  const annuler = () => {
    setFormulaire(FORMULAIRE_VIDE);
    setFichierImage(null);
    setModeEdition(false);
  };

  const supprimer = (livreId) => {
    if (window.confirm("Supprimer ce livre ?")) {
      api.delete(`livres/${livreId}/`).then(() => charger());
    }
  };

  if (categorie === null) return <Squelette lignes ={4}>Chargement...</Squelette>;

  return (
    <div>
      <Link to="/categories">&larr; Retour aux catégories</Link>
      <h1>{categorie.nom}</h1>

      <form onSubmit={soumettre}>
        <input name="titre" placeholder="Titre" value={formulaire.titre} onChange={gererChangement} required />
        <input name="auteur" placeholder="Auteur" value={formulaire.auteur} onChange={gererChangement} required />
        <input type="number" name="nombre_exemplaires" value={formulaire.nombre_exemplaires} onChange={gererChangement} min="1" />
        <input name="rangee" placeholder="Rangée (ex: D)" value={formulaire.rangee} onChange={gererChangement} />
        <ChampImage onFichierChange={setFichierImage} />
        <button type="submit">{modeEdition ? "Modifier" : "Ajouter un livre"}</button>
        {modeEdition && <button type="button" onClick={annuler}>Annuler</button>}
      </form>

      <Carrousel>
        {livres.map((livre) => {
          const rupture = livre.exemplaires_disponibles <= 0;
          return (
            <div key={livre.id} className={`carte-slide ${rupture ? "livre-rupture" : ""}`}>
              <div className="carte-slide-image">
                {livre.image ? <img src={livre.image} alt={livre.titre} /> : <div className="carte-slide-placeholder">📖</div>}
                {rupture && <span className="badge-rupture" title="Rupture de stock">⚠</span>}
              </div>
              <div className="carte-slide-corps">
                <h3>{livre.titre}</h3>
                <p>{livre.auteur}</p>
                <p className="texte-discret">Rangée {livre.rangee || "—"} · {livre.exemplaires_disponibles} dispo</p>
                <span className="actions-cellule">
                  <button className="btn-modifier" onClick={() => modifier(livre)}>Modifier</button>
                  <button className="btn-supprimer" onClick={() => supprimer(livre.id)}>Supprimer</button>
                </span>
              </div>
            </div>
          );
        })}
      </Carrousel>
      {livres.length === 0 && <p>Aucun livre dans cette catégorie.</p>}
    </div>
  );
}

export default CategorieDetail;