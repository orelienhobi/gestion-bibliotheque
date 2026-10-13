import { useEffect, useState } from "react";
import api from "../services/api";
import Squelette from "../components/Squelette";
import ReglagesApparence from "../components/ReglagesApparence";
import ReglageInactivite from "../components/ReglageInactivite";
import HistoriqueConnexions from "../components/HistoriqueConnexions";
import { deconnecter } from "../services/auth";
import { t } from "../i18n";

const PREFERENCES = [
  ["notif_validation", "Mon emprunt est validé"],
  ["notif_refus", "Ma demande est refusée"],
  ["notif_expiration", "Ma demande expire"],
  ["notif_reservation", "Un livre que j'ai réservé est disponible"],
];

function SectionNotifications() {
  const [profil, setProfil] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("mon-profil/").then((r) => setProfil(r.data));
  }, []);

  if (!profil) return <Squelette lignes={4} />;

  const basculer = (cle) => {
    api.patch("mon-profil/", { [cle]: !profil[cle] }).then((r) => {
      setProfil(r.data);
      setMessage("Préférence enregistrée.");
    });
  };

  return (
    <div className="reglages-colonne">
      <div className="bloc-reglage">
        <strong>Je souhaite être notifié lorsque :</strong>
        {PREFERENCES.map(([cle, libelle]) => (
          <label className="interrupteur" key={cle}>
            <input type="checkbox" checked={profil[cle]} onChange={() => basculer(cle)} />
            {libelle}
          </label>
        ))}
        <small className="texte-discret">
          Le responsable peut aussi désactiver certains types de notification pour toute la bibliothèque.
        </small>
      </div>
      {message && <p className="carte-message carte-message-verte">{message}</p>}
    </div>
  );
}

function SectionCompte() {
  const [ouvert, setOuvert] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");

  const supprimer = (e) => {
    e.preventDefault();
    setErreur("");
    api
      .post("supprimer-mon-compte/", { mot_de_passe: motDePasse })
      .then(() => {
        deconnecter();
        window.location.href = "/connexion";
      })
      .catch((error) => setErreur(error.response?.data?.erreur || "Erreur lors de la suppression."));
  };

  return (
    <div className="reglages-colonne">
      <ReglageInactivite />
      <HistoriqueConnexions />

      <div className="zone-danger">
        <strong>Supprimer mon compte</strong>
        <p>
          Cette action est définitive : votre compte, votre profil, vos notifications et tout votre historique d'emprunts seront supprimés.
        </p>
        {!ouvert ? (
          <button type="button" className="btn-supprimer" onClick={() => setOuvert(true)}>
            Supprimer mon compte
          </button>
        ) : (
          <form onSubmit={supprimer} className="formulaire-reglages">
            <input
              type="password" placeholder="Confirmez avec votre mot de passe"
              value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required
            />
            <div className="actions-cellule">
              <button type="submit" className="btn-supprimer">Confirmer la suppression</button>
              <button type="button" onClick={() => { setOuvert(false); setMotDePasse(""); setErreur(""); }}>Annuler</button>
            </div>
          </form>
        )}
        {erreur && <p className="message-erreur">{erreur}</p>}
      </div>
    </div>
  );
}

function ParametresEtudiant() {
  const [onglet, setOnglet] = useState("apparence");

  const ONGLETS = [
    ["apparence", t("onglet_apparence")],
    ["notifications", t("notifications")],
    ["compte", t("onglet_compte")],
  ];

  return (
    <div>
      <h1>{t("parametres")}</h1>

      <div className="onglets">
        {ONGLETS.map(([cle, libelle]) => (
          <button type="button" key={cle} className={`onglet ${onglet === cle ? "actif" : ""}`} onClick={() => setOnglet(cle)}>
            {libelle}
          </button>
        ))}
      </div>

      {onglet === "apparence" && <ReglagesApparence />}
      {onglet === "notifications" && <SectionNotifications />}
      {onglet === "compte" && <SectionCompte />}
    </div>
  );
}

export default ParametresEtudiant;