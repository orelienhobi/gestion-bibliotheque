import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaBookOpen } from "react-icons/fa";
import { connecter, estResponsable } from "../services/auth";
import useInfosBibliotheque from "../hooks/useInfosBibliotheque";

function TitreBibliotheque({ nom }) {
  // « G. Bibliothèque » : la première lettre est mise en valeur
  if (nom.length > 2 && nom[1] === ".") {
    return (
      <>
        <span className="lettre-logo">{nom[0]}</span>
        {nom.slice(1)}
      </>
    );
  }
  return <>{nom}</>;
}

function Connexion() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();
  const infos = useInfosBibliotheque();

  const soumettre = (e) => {
    e.preventDefault();
    setErreur("");
    connecter(username, password)
      .then(() => navigate(estResponsable() ? "/" : "/espace-etudiant"))
      .catch((error) => {
        setErreur(error.response?.data?.erreur || "Identifiants incorrects.");
      });
  };

  return (
    <div className="page-connexion">
      <div className="carte-connexion">
        <div className="logo-connexion">
          {infos?.logo ? <img src={infos.logo} alt="" /> : <FaBookOpen size={30} />}
        </div>
        <h1 className="titre-logo-bibliotheque">
          <TitreBibliotheque nom={infos?.nom_bibliotheque || "G. Bibliothèque"} />
        </h1>
        <p className="sous-titre-connexion">Votre savoir, à portée de main</p>

        <form onSubmit={soumettre}>
          <div className="champ-icone">
            <FaUser />
            <input type="text" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="champ-icone">
            <FaLock />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="bouton-connexion">Se connecter</button>
        </form>

        {erreur && <p className="message-erreur">{erreur}</p>}

        <p className="lien-secondaire-connexion">
          Étudiant sans compte ? <Link to="/inscription">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

export default Connexion;