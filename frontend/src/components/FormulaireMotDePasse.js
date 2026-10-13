import { useState } from "react";
import api from "../services/api";

function FormulaireMotDePasse() {
  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const soumettre = (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");

    if (nouveau !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    api
      .post("changer-mot-de-passe/", {
        ancien_mot_de_passe: ancien,
        nouveau_mot_de_passe: nouveau,
        confirmation_mot_de_passe: confirmation,
      })
      .then(() => {
        setMessage("Mot de passe modifié avec succès.");
        setAncien(""); setNouveau(""); setConfirmation("");
      })
      .catch((error) => setErreur(error.response?.data?.erreur || "Erreur lors de la modification."));
  };

  return (
    <div className="bloc-reglage">
      <strong>Changer le mot de passe</strong>
      <form onSubmit={soumettre} className="formulaire-reglages">
        <input type="password" placeholder="Mot de passe actuel" value={ancien} onChange={(e) => setAncien(e.target.value)} required />
        <input type="password" placeholder="Nouveau mot de passe (8 caractères minimum)" value={nouveau} onChange={(e) => setNouveau(e.target.value)} minLength={8} required />
        <input type="password" placeholder="Confirmez le nouveau mot de passe" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} minLength={8} required />
        <button type="submit">Modifier le mot de passe</button>
      </form>
      {message && <p className="carte-message carte-message-verte">{message}</p>}
      {erreur && <p className="message-erreur">{erreur}</p>}
    </div>
  );
}

export default FormulaireMotDePasse;