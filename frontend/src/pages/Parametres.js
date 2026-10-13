import { useEffect, useState } from "react";
import api from "../services/api";
import Squelette from "../components/Squelette";
import ChampImage from "../components/ChampImage";
import ReglagesApparence from "../components/ReglagesApparence";
import ReglageInactivite from "../components/ReglageInactivite";
import HistoriqueConnexions from "../components/HistoriqueConnexions";
import FormulaireMotDePasse from "../components/FormulaireMotDePasse";
import { t } from "../i18n";

const CHAMPS_REGLES = [
  {
    nom: "duree_emprunt_jours", min: 1, max: 90,
    libelle: "Durée d'emprunt par défaut (jours)",
    aide: "Appliquée à chaque emprunt validé.",
  },
  {
    nom: "seuil_retards_blocage", min: 1, max: 20,
    libelle: "Retards avant blocage d'un étudiant",
    aide: "Un étudiant qui atteint ce nombre d'emprunts en retard ne peut plus faire de demande.",
  },
  {
    nom: "delai_expiration_heures", min: 1, max: 168,
    libelle: "Délai d'expiration d'une demande (heures)",
    aide: "Une demande non validée au-delà de ce délai est annulée automatiquement.",
  },
  {
    nom: "max_emprunts_simultanes", min: 0, max: 20,
    libelle: "Emprunts simultanés maximum par étudiant",
    aide: "Demandes en attente et emprunts en cours. 0 = illimité.",
  },
];

const TYPES_NOTIFICATION = [
  { cle: "validation", titre: "Emprunt validé", variables: "{livre}, {date_echeance}" },
  { cle: "refus", titre: "Demande refusée", variables: "{livre}, {motif}" },
  { cle: "expiration", titre: "Demande expirée", variables: "{livre}, {delai}" },
  { cle: "reservation", titre: "Réservation disponible", variables: "{livre}" },
];

function SectionRegles({ parametres, enregistrer }) {
  const [form, setForm] = useState(
    Object.fromEntries(CHAMPS_REGLES.map((c) => [c.nom, parametres[c.nom]]))
  );

  const changer = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const soumettre = (e) => {
    e.preventDefault();
    enregistrer(form);
  };

  return (
    <form onSubmit={soumettre} className="formulaire-reglages">
      {CHAMPS_REGLES.map((c) => (
        <label className="champ-reglage" key={c.nom}>
          <span>{c.libelle}</span>
         <input type="number" min={c.min} max={c.max} name={c.nom} value={form[c.nom]} onChange={changer} required />
          <small>{c.aide}</small>
        </label>
      ))}
      <button type="submit">Enregistrer</button>
    </form>
  );
}

function SectionInformations({ parametres, enregistrer }) {
  const [form, setForm] = useState({
    nom_bibliotheque: parametres.nom_bibliotheque,
    horaires: parametres.horaires,
    adresse: parametres.adresse,
    contact_email: parametres.contact_email,
    contact_telephone: parametres.contact_telephone,
    message_accueil: parametres.message_accueil,
  });
  const [fichierLogo, setFichierLogo] = useState(null);

  const changer = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const soumettre = (e) => {
    e.preventDefault();
    if (fichierLogo) {
      const donnees = new FormData();
      Object.entries(form).forEach(([cle, valeur]) => donnees.append(cle, valeur));
      donnees.append("logo", fichierLogo);
      enregistrer(donnees).then(() => setFichierLogo(null));
    } else {
      enregistrer(form);
    }
  };

  return (
    <form onSubmit={soumettre} className="formulaire-reglages">
      <div className="champ-reglage">
        <span>Logo</span>
        <div className="ligne-logo">
          <ChampImage key={parametres.logo || "aucun"} onFichierChange={setFichierLogo} apercuInitial={parametres.logo} />
          {parametres.logo && (
            <button type="button" className="btn-supprimer" onClick={() => enregistrer({ logo: null })}>
              Retirer le logo
            </button>
          )}
        </div>
      </div>

      <label className="champ-reglage">
        <span>Nom de la bibliothèque</span>
        <input name="nom_bibliotheque" value={form.nom_bibliotheque} onChange={changer} required />
        <small>Affiché sur la page de connexion, dans les menus et dans l'onglet du navigateur.</small>
      </label>

      <label className="champ-reglage">
        <span>Message d'accueil (espace étudiant)</span>
        <input name="message_accueil" value={form.message_accueil} onChange={changer} maxLength={255} />
      </label>

      <label className="champ-reglage">
        <span>Horaires d'ouverture</span>
        <textarea name="horaires" rows={4} value={form.horaires} onChange={changer} placeholder={"Lundi - Vendredi : 8h - 17h\nSamedi : 8h - 12h"} />
      </label>

      <label className="champ-reglage">
        <span>Adresse</span>
        <input name="adresse" value={form.adresse} onChange={changer} />
      </label>

      <label className="champ-reglage">
        <span>Email de contact</span>
       <input type="email" name="contact_email" value={form.contact_email} onChange={changer} />
      </label>

      <label className="champ-reglage">
        <span>Téléphone de contact</span>
        <input name="contact_telephone" value={form.contact_telephone} onChange={changer}
             pattern="\+?\d{7,15}" title="Entre 7 et 15 chiffres, + optionnel au début" />
      </label>

      <button type="submit">Enregistrer</button>
    </form>
  );
}

function SectionNotifications({ parametres, enregistrer }) {
  const champs = ["envoyer_emails"];
  TYPES_NOTIFICATION.forEach((n) => champs.push(`notif_${n.cle}_active`, `modele_${n.cle}`));

  const [form, setForm] = useState(Object.fromEntries(champs.map((c) => [c, parametres[c]])));

  const changerTexte = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const basculer = (nom) => setForm({ ...form, [nom]: !form[nom] });

  const soumettre = (e) => {
    e.preventDefault();
    enregistrer(form);
  };

  return (
    <form onSubmit={soumettre} className="formulaire-reglages">
      {TYPES_NOTIFICATION.map((n) => (
        <div className="bloc-reglage" key={n.cle}>
          <label className="interrupteur">
            <input type="checkbox" checked={form[`notif_${n.cle}_active`]} onChange={() => basculer(`notif_${n.cle}_active`)} />
            {n.titre}
          </label>
          <input
            name={`modele_${n.cle}`} value={form[`modele_${n.cle}`]} onChange={changerTexte}
            maxLength={255} disabled={!form[`notif_${n.cle}_active`]}
          />
          <small className="texte-discret">Variables disponibles : {n.variables}</small>
        </div>
      ))}

      <div className="bloc-reglage">
        <label className="interrupteur">
          <input type="checkbox" checked={form.envoyer_emails} onChange={() => basculer("envoyer_emails")} />
          Envoyer aussi un email à l'étudiant
        </label>
        <small className="texte-discret">
          Nécessite que l'étudiant ait renseigné un email. En développement, les emails s'affichent dans le terminal Django ; pour un envoi réel, configure le serveur SMTP dans settings.py.
        </small>
      </div>

      <button type="submit">Enregistrer</button>
    </form>
  );
}

function SectionSecurite() {
  return (
    <div className="reglages-colonne">
      <FormulaireMotDePasse />
      <ReglageInactivite />
      <HistoriqueConnexions />
    </div>
  );
}

function Parametres() {
  const [parametres, setParametres] = useState(null);
  const [onglet, setOnglet] = useState("regles");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("parametres/").then((r) => setParametres(r.data));
  }, []);

  const enregistrer = (donnees) => {
    setMessage("");
    setErreur("");
    return api
      .patch("parametres/", donnees)
      .then((r) => {
        setParametres(r.data);
        setMessage("Paramètres enregistrés.");
        window.dispatchEvent(new Event("infos-bibliotheque-maj"));
      })
      .catch((error) => {
        const detail = error.response?.data;
        setErreur(detail ? Object.values(detail).flat().join(" ") : "Erreur lors de l'enregistrement.");
      });
  };

  if (!parametres) return <Squelette lignes={5} />;

  const ONGLETS = [
    ["regles", t("onglet_regles")],
    ["informations", t("onglet_informations")],
    ["notifications", t("notifications")],
    ["apparence", t("onglet_apparence")],
    ["securite", t("onglet_securite")],
  ];

  const changerOnglet = (cle) => {
    setOnglet(cle);
    setMessage("");
    setErreur("");
  };

  return (
    <div>
      <h1>{t("parametres")}</h1>

      <div className="onglets">
        {ONGLETS.map(([cle, libelle]) => (
          <button type="button" key={cle} className={`onglet ${onglet === cle ? "actif" : ""}`} onClick={() => changerOnglet(cle)}>
            {libelle}
          </button>
        ))}
      </div>

      {message && <p className="carte-message carte-message-verte">{message}</p>}
      {erreur && <p className="message-erreur">{erreur}</p>}

      {onglet === "regles" && <SectionRegles parametres={parametres} enregistrer={enregistrer} />}
      {onglet === "informations" && <SectionInformations parametres={parametres} enregistrer={enregistrer} />}
      {onglet === "notifications" && <SectionNotifications parametres={parametres} enregistrer={enregistrer} />}
      {onglet === "apparence" && <ReglagesApparence />}
      {onglet === "securite" && <SectionSecurite />}
    </div>
  );
}

export default Parametres;