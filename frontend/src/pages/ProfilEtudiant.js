import { useEffect, useState } from "react";
import api from "../services/api";
import ChampImage from "../components/ChampImage";

function ProfilEtudiant() {
  const [profil, setProfil] = useState(null);
  const [fichierPhoto, setFichierPhoto] = useState(null);
  const [message, setMessage] = useState("");

  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [messageMdp, setMessageMdp] = useState("");
  const [erreurMdp, setErreurMdp] = useState("");

  useEffect(() => {
    api.get("mon-profil/").then((r) => setProfil(r.data));
  }, []);

  if (!profil) return <p className="chargement">Chargement...</p>;

  const gererChangement = (e) => setProfil({ ...profil, [e.target.name]: e.target.value });

  const soumettreProfil = (e) => {
    e.preventDefault();
    const donnees = new FormData();
    donnees.append("nom_complet", profil.nom_complet);
    donnees.append("email", profil.email || "");
    donnees.append("telephone", profil.telephone || "");
    if (fichierPhoto) donnees.append("photo", fichierPhoto);

    api.patch("mon-profil/", donnees).then((r) => {
      setProfil(r.data);
      setFichierPhoto(null);
      setMessage("Profil mis à jour avec succès.");
    });
  };

  const soumettreMotDePasse = (e) => {
    e.preventDefault();
    setMessageMdp("");
    setErreurMdp("");
    api
      .post("changer-mot-de-passe/", {
        ancien_mot_de_passe: ancienMotDePasse,
        nouveau_mot_de_passe: nouveauMotDePasse,
      })
      .then(() => {
        setMessageMdp("Mot de passe modifié avec succès.");
        setAncienMotDePasse("");
        setNouveauMotDePasse("");
      })
      .catch((error) => setErreurMdp(error.response?.data?.erreur || "Erreur."));
  };

  return (
    <div>
      <h1>Mon profil</h1>

      <form onSubmit={soumettreProfil}>
        <ChampImage onFichierChange={setFichierPhoto} apercuInitial={profil.photo} />
        <input name="nom_complet" value={profil.nom_complet} onChange={gererChangement} required />
        <input name="email" value={profil.email} onChange={gererChangement} />
        <input name="telephone" value={profil.telephone} onChange={gererChangement} />
        <button type="submit">Enregistrer</button>
      </form>
      {message && <p className="carte-message carte-message-verte">{message}</p>}

      <h2>Changer le mot de passe</h2>
      <form onSubmit={soumettreMotDePasse}>
        <input type="password" placeholder="Mot de passe actuel" value={ancienMotDePasse} onChange={(e) => setAncienMotDePasse(e.target.value)} required />
        <input type="password" placeholder="Nouveau mot de passe" value={nouveauMotDePasse} onChange={(e) => setNouveauMotDePasse(e.target.value)} required />
        <button type="submit">Modifier le mot de passe</button>
      </form>
      {messageMdp && <p className="carte-message carte-message-verte">{messageMdp}</p>}
      {erreurMdp && <p className="message-erreur">{erreurMdp}</p>}
    </div>
  );
}

export default ProfilEtudiant;