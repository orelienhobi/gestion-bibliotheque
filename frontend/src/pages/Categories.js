import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Carrousel from "../components/Carrousel";
import ChampImage from "../components/ChampImage";
import ModaleConfirmation from "../components/ModalConfirmation";

const FORMULAIRE_VIDE = { id: null, nom: "" };

function Categories() {
  const [categories, setCategories] = useState([]);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [fichierImage, setFichierImage] = useState(null);
  const [modeEdition, setModeEdition] = useState(false);

  const charger = () => {
    api.get("categories/").then((r) => setCategories(r.data));
  };

  useEffect(() => { charger(); }, []);

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const soumettre = (e) => {
    e.preventDefault();
    const donnees = new FormData();
    donnees.append("nom", formulaire.nom);
    if (fichierImage) donnees.append("image", fichierImage);

    const requete = modeEdition
      ? api.patch(`categories/${formulaire.id}/`, donnees)
      : api.post("categories/", donnees);

    requete.then(() => {
      setFormulaire(FORMULAIRE_VIDE);
      setFichierImage(null);
      setModeEdition(false);
      charger();
    });
  };

  const modifier = (cat, e) => {
    e.preventDefault();
    setFormulaire({ id: cat.id, nom: cat.nom });
    setModeEdition(true);
  };

  const annuler = () => {
    setFormulaire(FORMULAIRE_VIDE);
    setFichierImage(null);
    setModeEdition(false);
  };

  const supprimer = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Supprimer cette catégorie ?")) {
      api.delete(`categories/${id}/`).then(() => charger());
    }
  };

  const [categorieASupprimer, setCategorieASupprimer] = useState(null);

const demanderSuppression = (cat, e) => {
  e.preventDefault();
  e.stopPropagation();
  setCategorieASupprimer(cat);
};

const confirmerSuppression = () => {
  api.delete(`categories/${categorieASupprimer.id}/`).then(() => {
    setCategorieASupprimer(null);
    charger();
  });
};

  <ModaleConfirmation
  ouverte={!!categorieASupprimer}
  titre="Supprimer la catégorie"
  message={`Voulez-vous vraiment supprimer « ${categorieASupprimer?.nom} » ?`}
  onConfirmer={confirmerSuppression}
  onAnnuler={() => setCategorieASupprimer(null)}
/>
  return (
    <div>
      <h1>Catégories</h1>

      <form onSubmit={soumettre}>
        <ChampImage onFichierChange={setFichierImage} />
        <input name="nom" placeholder="Nom de la catégorie" value={formulaire.nom} onChange={gererChangement} required />
        <button type="submit">{modeEdition ? "Modifier" : "Ajouter"}</button>
        {modeEdition && <button type="button" onClick={annuler}>Annuler</button>}
      </form>

      <Carrousel>
        {categories.map((cat) => (
          <Link to={`/categories/${cat.id}`} key={cat.id} className="carte-slide">
            <div className="carte-slide-image">
              {cat.image ? <img src={cat.image} alt={cat.nom} /> : <div className="carte-slide-placeholder">📚</div>}
            </div>
            <div className="carte-slide-corps">
              <h3>{cat.nom}</h3>
              <p>{cat.nombre_livres} livre(s)</p>
              <span className="actions-cellule">
                <button className="btn-modifier" onClick={(e) => modifier(cat, e)}>Modifier</button>
                <button className="btn-supprimer" onClick={(e) => demanderSuppression(cat, e)}>Supprimer</button>
              </span>
            </div>
          </Link>
        ))}
      </Carrousel>
      {categories.length === 0 && <p>Aucune catégorie pour l'instant.</p>}
    </div>
  );
}

export default Categories;