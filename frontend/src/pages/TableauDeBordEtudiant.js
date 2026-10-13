import { useEffect, useState } from "react";
import { FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import api from "../services/api";
import Carrousel from "../components/Carrousel";
import useInfosBibliotheque from "../hooks/useInfosBibliotheque";

function TableauDeBordEtudiant() {
  const [topLivres, setTopLivres] = useState([]);
  const [emprunts, setEmprunts] = useState([]);
  const infos = useInfosBibliotheque();

  useEffect(() => {
    api.get("top-livres/").then((r) => setTopLivres(r.data));
    api.get("emprunts/").then((r) => setEmprunts(r.data));
  }, []);

  const enCours = emprunts.filter((e) => e.statut === "valide" && !e.date_retour_effective);
  const enAttente = emprunts.filter((e) => e.statut === "en_attente");

  const aDesInfos = infos && (infos.horaires || infos.adresse || infos.contact_email || infos.contact_telephone);

  return (
    <div>
      <div className="bandeau-violet">
        <div>
          <h1>Les livres les plus empruntés</h1>
          <p>{infos?.message_accueil || "Découvrez les lectures les plus populaires du moment"}</p>
        </div>
      </div>

      <Carrousel>
        {topLivres.map((livre) => (
          <div key={livre.id} className="carte-slide">
            <div className="carte-slide-image">
              {livre.image ? <img src={livre.image} alt={livre.titre} /> : <div className="carte-slide-placeholder">📖</div>}
            </div>
            <div className="carte-slide-corps">
              <h3>{livre.titre}</h3>
              <p>{livre.auteur}</p>
            </div>
          </div>
        ))}
      </Carrousel>

      <h2>Mes emprunts en cours</h2>
      {enCours.length === 0 && enAttente.length === 0 ? (
        <p className="carte-message carte-message-verte">Aucun emprunt en cours ni en attente.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Livre</th><th>Statut</th><th>Échéance</th></tr>
          </thead>
          <tbody>
            {[...enAttente, ...enCours].map((e) => (
              <tr key={e.id} className={e.en_retard ? "ligne-retard" : ""}>
                <td>{e.livre_titre}</td>
                <td>{e.statut === "en_attente" ? "En attente de validation" : e.en_retard ? "En retard" : "À jour"}</td>
                <td>{e.date_echeance || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {aDesInfos && (
        <>
          <h2>Informations pratiques</h2>
          <div className="carte-infos">
            {infos.horaires && (
              <div className="ligne-info"><FaClock /><span className="texte-multiligne">{infos.horaires}</span></div>
            )}
            {infos.adresse && (
              <div className="ligne-info"><FaMapMarkerAlt /><span>{infos.adresse}</span></div>
            )}
            {infos.contact_telephone && (
              <div className="ligne-info"><FaPhone /><span>{infos.contact_telephone}</span></div>
            )}
            {infos.contact_email && (
              <div className="ligne-info"><FaEnvelope /><span>{infos.contact_email}</span></div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default TableauDeBordEtudiant;