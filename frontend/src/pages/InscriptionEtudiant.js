import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

const FORMULAIRE_VIDE = { username: "", password: "", confirmation: "", nom_complet: "", email: "", telephone: "" };

function InscriptionEtudiant() {
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const soumettre = (e) => {
    e.preventDefault();
    setErreur("");

    if (formulaire.password !== formulaire.confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    const { confirmation, ...donnees } = formulaire;
    axios
      .post(`${API_URL}/api/inscription/`, donnees)
      .then(() => navigate("/connexion"))
      .catch((error) => setErreur(error.response?.data?.erreur || "Erreur lors de l'inscription."));
  };

  return (
    <div className="page-connexion">
      <div className="carte-connexion">
        <h1>Inscription étudiant</h1>
        <p className="sous-titre-connexion">Créez votre compte pour emprunter des livres</p>
        <form onSubmit={soumettre}>
          <input
            name="nom_complet" placeholder="Nom et prénom" value={formulaire.nom_complet} onChange={gererChangement}
            pattern="[A-Za-zÀ-ÿ\s'\-]+" title="Lettres, espaces, tirets et apostrophes uniquement" required
          />
          <input name="username" placeholder="Nom d'utilisateur" value={formulaire.username} onChange={gererChangement} required />
          <input
            type="password" name="password" placeholder="Mot de passe (8 caractères minimum)"
            value={formulaire.password} onChange={gererChangement} minLength={8} required
          />
          <input
            type="password" name="confirmation" placeholder="Confirmez le mot de passe"
            value={formulaire.confirmation} onChange={gererChangement} minLength={8} required
          />
          <input type="email" name="email" placeholder="Email" value={formulaire.email} onChange={gererChangement} />
          <input
            name="telephone" placeholder="Téléphone" value={formulaire.telephone} onChange={gererChangement}
            pattern="\+?\d{7,15}" title="Entre 7 et 15 chiffres, + optionnel au début"
          />
          <button type="submit" className="bouton-connexion">S'inscrire</button>
        </form>
        {erreur && <p className="message-erreur">{erreur}</p>}
        <p className="lien-secondaire-connexion">Déjà inscrit ? <Link to="/connexion">Se connecter</Link></p>
      </div>
    </div>
  );
}

export default InscriptionEtudiant;