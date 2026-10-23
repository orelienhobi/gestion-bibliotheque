import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Carrousel from "../components/Carrousel";
import ChampImage from "../components/ChampImage";
import ModaleConfirmation from "../components/ModaleConfirmation";

const FORMULAIRE_VIDE = { id: null, nom: "" };

function ImageCategorie({ src, alt }) {
  const [erreur, setErreur] = useState(false);
  if (!src || erreur) {
    return <div className="carte-slide-placeholder">📚</div>;
  }
  return <img src={src} alt={alt} onError={() => setErreur(true)} />;
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [fichierImage, setFichierImage] = useState(null);
  const [modeEdition, setModeEdition] = useState(false);
  const [categorieASupprimer, setCategorieASupprimer] = useState(null);
  const [erreur, setErreur] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [cleTelechargement, setCleTelechargement] = useState(0);

  const charger = () => {
    api.get("categories/").then((r) => setCategories(r.data)).catch((e) => {
      console.error("Erreur chargement catégories :", e);
      setErreur("Impossible de charger les catégories.");
    });
  };

  useEffect(() => {
    charger();
  }, []);

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const reinitialiserFormulaire = () => {
    setFormulaire(FORMULAIRE_VIDE);
    setFichierImage(null);
    setModeEdition(false);
    setCleTelechargement((c) => c + 1); // force ChampImage à se remonter et vider son aperçu
  };

  const soumettre = (e) => {
    e.preventDefault();
    setErreur("");
    setEnvoiEnCours(true);

    const donnees = new FormData();
    donnees.append("nom", formulaire.nom);
    if (fichierImage) donnees.append("image", fichierImage);

    const requete = modeEdition
      ? api.patch(`categories/${formulaire.id}/`, donnees)
      : api.post("categories/", donnees);

    requete
      .then(() => {
        reinitialiserFormulaire();
        charger();
      })
      .catch((erreurRequete) => {
        console.error("Erreur création/modification catégorie :", erreurRequete);
        const detail = erreurRequete.response?.data;
        const messageServeur = detail
          ? (typeof detail === "string" ? detail : Object.values(detail).flat().join(" "))
          : null;
        setErreur(
          messageServeur ||
          (erreurRequete.response
            ? `Erreur ${erreurRequete.response.status} : la demande a été refusée par le serveur.`
            : "Impossible de contacter le serveur. Vérifiez votre connexion.")
        );
      })
      .finally(() => setEnvoiEnCours(false));
  };

  const modifier = (cat, e) => {
    e.preventDefault();
    setFormulaire({ id: cat.id, nom: cat.nom });
    setModeEdition(true);
  };

  const demanderSuppression = (cat, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCategorieASupprimer(cat);
  };

  const confirmerSuppression = () => {
    api.delete(`categories/${categorieASupprimer.id}/`)
      .then(() => {
        setCategorieASupprimer(null);
        charger();
      })
      .catch((e) => {
        console.error("Erreur suppression catégorie :", e);
        setErreur("Impossible de supprimer cette catégorie.");
        setCategorieASupprimer(null);
      });
  };

  return (
    <div>
      <h1>Catégories</h1>

      <form onSubmit={soumettre}>
        <ChampImage key={cleTelechargement} onFichierChange={setFichierImage} />
        <input name="nom" placeholder="Nom de la catégorie" value={formulaire.nom} onChange={gererChangement} required />
        <button type="submit" disabled={envoiEnCours}>
          {envoiEnCours ? "Envoi..." : modeEdition ? "Modifier" : "Ajouter"}
        </button>
        {modeEdition && <button type="button" onClick={reinitialiserFormulaire}>Annuler</button>}
      </form>

      {erreur && <p className="message-erreur">{erreur}</p>}

      <Carrousel>
        {categories.map((cat) => (
          <Link to={`/categories/${cat.id}`} key={cat.id} className="carte-slide">
            <div className="carte-slide-image">
              <ImageCategorie src={cat.image} alt={cat.nom} />
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
      {categories.length === 0 && <p className="carte-message carte-message-verte">Aucune catégorie pour l'instant.</p>}

      <ModaleConfirmation
        ouverte={!!categorieASupprimer}
        titre="Supprimer la catégorie"
        message={`Voulez-vous vraiment supprimer « ${categorieASupprimer?.nom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setCategorieASupprimer(null)}
      />
    </div>
  );
}

export default Categories;