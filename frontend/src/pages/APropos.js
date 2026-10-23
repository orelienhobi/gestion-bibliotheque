import { FaUser, FaDatabase, FaKey, FaProjectDiagram } from "react-icons/fa";
import SchemaMPD from "../components/SchemaMPD";

const INFOS = [
  { label: "Nom", valeur: "Orelien" },
  { label: "Matricule", valeur: "3356/24" },
  { label: "Classe", valeur: "IGFI_B" },
];

const TABLES = [
  {
    nom: "auth_user",
    role: "Comptes de connexion Django (responsable is_staff, étudiants).",
    champs: [
      ["id", "BigAutoField", "Clé primaire"],
      ["username", "varchar(150)", "Unique, obligatoire"],
      ["password", "varchar(128)", "Mot de passe haché"],
      ["email", "varchar(254)", "Facultatif"],
      ["is_staff", "boolean", "Vrai pour le responsable"],
    ],
  },
  {
    nom: "categorie",
    role: "Regroupe les livres par catégorie.",
    champs: [
      ["id", "BigAutoField", "Clé primaire"],
      ["nom", "varchar(100)", "Unique, obligatoire"],
      ["image", "varchar(100)", "Facultatif (JPG, PNG, WEBP)"],
      ["duree_emprunt_jours", "integer", "Positif, défaut : 14"],
    ],
  },
  {
    nom: "livre",
    role: "Catalogue des ouvrages et de leurs exemplaires.",
    champs: [
      ["id", "BigAutoField", "Clé primaire"],
      ["titre", "varchar(200)", "Obligatoire"],
      ["auteur", "varchar(150)", "Obligatoire"],
      ["categorie_id", "BigInteger", "Clé étrangère vers categorie.id (facultatif)"],
      ["image", "varchar(100)", "Couverture, facultatif"],
      ["nombre_exemplaires", "integer", "Minimum 1, défaut : 1"],
      ["rangee", "varchar(10)", "Facultatif"],
    ],
  },
  {
    nom: "etudiant",
    role: "Fiche créée par le responsable, rattachée au compte à l'inscription.",
    champs: [
      ["id", "BigAutoField", "Clé primaire"],
      ["utilisateur_id", "BigInteger", "Clé étrangère unique vers auth_user.id (facultatif)"],
      ["nom_complet", "varchar(200)", "Obligatoire"],
      ["email", "varchar(254)", "Facultatif"],
      ["telephone", "varchar(20)", "Facultatif"],
      ["photo", "varchar(100)", "Facultatif"],
      ["notif_validation / refus / expiration / reservation", "boolean", "Préférences, défaut : vrai"],
    ],
  },
  {
    nom: "emprunt",
    role: "Demande puis suivi d'un emprunt de livre.",
    champs: [
      ["id", "BigAutoField", "Clé primaire"],
      ["livre_id", "BigInteger", "Clé étrangère vers livre.id"],
      ["etudiant_id", "BigInteger", "Clé étrangère vers etudiant.id"],
      ["statut", "varchar(15)", "en_attente, valide, refuse ou expire"],
      ["date_emprunt", "datetime", "Date de la demande (automatique)"],
      ["date_echeance", "date", "Facultatif"],
      ["date_retour_effective", "date", "Facultatif"],
      ["motif_refus", "varchar(255)", "Facultatif"],
    ],
  },
  {
    nom: "reservation",
    role: "File d'attente quand un livre est en rupture de stock.",
    champs: [
      ["id", "BigAutoField", "Clé primaire"],
      ["livre_id", "BigInteger", "Clé étrangère vers livre.id"],
      ["etudiant_id", "BigInteger", "Clé étrangère vers etudiant.id"],
      ["date_reservation", "datetime", "Automatique"],
      ["disponible", "boolean", "Défaut : faux"],
      ["satisfaite", "boolean", "Défaut : faux"],
    ],
  },
  {
    nom: "notification",
    role: "Messages envoyés aux étudiants.",
    champs: [
      ["id", "BigAutoField", "Clé primaire"],
      ["etudiant_id", "BigInteger", "Clé étrangère vers etudiant.id"],
      ["message", "varchar(255)", "Obligatoire"],
      ["date_creation", "datetime", "Automatique"],
      ["lue", "boolean", "Défaut : faux"],
    ],
  },
  {
    nom: "historiqueconnexion",
    role: "Journal des connexions (sécurité).",
    champs: [
      ["id", "BigAutoField", "Clé primaire"],
      ["utilisateur_id", "BigInteger", "Clé étrangère vers auth_user.id"],
      ["date", "datetime", "Automatique"],
      ["adresse_ip", "GenericIPAddress", "Facultatif"],
      ["navigateur", "varchar(255)", "Facultatif"],
    ],
  },
  {
    nom: "parametres",
    role: "Réglages globaux de la bibliothèque (une seule ligne, pk = 1).",
    champs: [
      ["duree_emprunt_jours", "integer", "1 à 90, défaut : 14"],
      ["seuil_retards_blocage", "integer", "1 à 20, défaut : 2"],
      ["delai_expiration_heures", "integer", "1 à 168, défaut : 5"],
      ["max_emprunts_simultanes", "integer", "0 à 20, défaut : 5"],
      ["nom_bibliotheque, logo, horaires, adresse, contact_email, contact_telephone, message_accueil", "texte / image", "Informations publiques"],
      ["notif_*_active, modele_*, envoyer_emails", "boolean / varchar(255)", "Modèles de notifications"],
    ],
  },
];

const RELATIONS = [
  ["categorie → livre", "1 à N", "Une catégorie regroupe plusieurs livres. À la suppression de la catégorie, le champ du livre est mis à NULL (le livre est conservé)."],
  ["livre → emprunt", "1 à N", "Un livre peut être emprunté plusieurs fois. La suppression du livre supprime ses emprunts."],
  ["etudiant → emprunt", "1 à N", "Un étudiant peut avoir plusieurs emprunts. La suppression de l'étudiant supprime ses emprunts."],
  ["livre → reservation", "1 à N", "Un livre peut avoir une file de réservations (suppression en cascade)."],
  ["etudiant → reservation", "1 à N", "Un étudiant peut réserver plusieurs livres (suppression en cascade)."],
  ["etudiant → notification", "1 à N", "Un étudiant reçoit plusieurs notifications (suppression en cascade)."],
  ["auth_user → etudiant", "1 à 1", "Un compte correspond à une seule fiche étudiant, rattachée par l'email. La suppression du compte supprime la fiche."],
  ["auth_user → historiqueconnexion", "1 à N", "Un utilisateur a plusieurs connexions enregistrées (suppression en cascade)."],
];

function APropos() {
  return (
    <div className="page-a-propos">
      <h1>À propos</h1>
      <p className="texte-discret">
        Présentation du projet et étude du schéma de base de données relationnelle.
      </p>

      <section className="a-propos-carte">
        <h2 className="a-propos-titre"><FaUser /> Informations</h2>
        <div className="a-propos-infos">
          {INFOS.map((i) => (
            <div key={i.label}>
              <span className="a-propos-label">{i.label}</span>
              <strong>{i.valeur}</strong>
            </div>
          ))}
        </div>
      </section>
                <h2 className="a-propos-titre"><FaProjectDiagram /> Schéma des tables (MPD)</h2>
      <section className="a-propos-carte">
        <SchemaMPD />
      </section>
      <h2 className="a-propos-titre"><FaDatabase /> Tables</h2>
      <div className="a-propos-grille">
        {TABLES.map((table) => (
          <section className="a-propos-carte" key={table.nom}>
            <h3 className="a-propos-nom-table">{table.nom}</h3>
            <p className="texte-discret">{table.role}</p>
            <div className="tableau-scroll">
              <table className="a-propos-tableau">
                <thead>
                  <tr><th>Champ</th><th>Type</th><th>Contraintes / rôle</th></tr>
                </thead>
                <tbody>
                  {table.champs.map(([champ, type, contrainte]) => (
                    <tr key={champ}>
                      <td><code>{champ}</code></td>
                      <td>{type}</td>
                      <td>{contrainte}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <section className="a-propos-carte">
        <h2 className="a-propos-titre"><FaKey /> Relations entre les tables</h2>
        <ul className="a-propos-relations">
          {RELATIONS.map(([lien, cardinalite, texte]) => (
            <li key={lien}>
              <code>{lien}</code>
              <span className="a-propos-cardinalite">{cardinalite}</span>
              <span>{texte}</span>
            </li>
          ))}
        </ul>
        <p className="texte-discret">
          Les clés étrangères assurent l'intégrité référentielle. La table parametres n'a aucune relation :
          elle ne contient qu'une seule ligne.
        </p>
      </section>
    </div>
  );
}

export default APropos;