import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBook, FaBookReader, FaBell, FaUserCircle, FaHistory, FaSignOutAlt, FaCog,
} from "react-icons/fa";
import { deconnecter, nomUtilisateur } from "../services/auth";
import api from "../services/api";
import useInfosBibliotheque from "../hooks/useInfosBibliotheque";
import { t } from "../i18n";

function BarreLateraleEtudiant() {
  const navigate = useNavigate();
  const infos = useInfosBibliotheque();
  const [nonLues, setNonLues] = useState(0);

  useEffect(() => {
    api.get("notifications/").then((r) => setNonLues(r.data.filter((n) => !n.lue).length));
  }, []);

  const gererDeconnexion = () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      deconnecter();
      navigate("/connexion");
    }
  };

  return (
    <aside className="barre-laterale">
      <div className="barre-laterale-titre">
        {infos?.logo ? <img src={infos.logo} alt="" className="logo-sidebar" /> : <FaBook />}
        {infos?.nom_bibliotheque || "Bibliothèque"}
      </div>
      <p className="barre-laterale-sous-titre">{nomUtilisateur()}</p>
      <nav className="barre-laterale-liens">
        <NavLink to="/espace-etudiant" end><FaBook /> {t("tableau_de_bord")}</NavLink>
        <NavLink to="/espace-etudiant/catalogue"><FaBookReader /> {t("catalogue")}</NavLink>
        <NavLink to="/espace-etudiant/mes-emprunts"><FaHistory /> {t("mes_emprunts")}</NavLink>
        <NavLink to="/espace-etudiant/notifications" onClick={() => setNonLues(0)}>
          <FaBell /> {t("notifications")}
          {nonLues > 0 && <span className="badge-notification">{nonLues}</span>}
        </NavLink>
        <NavLink to="/espace-etudiant/profil"><FaUserCircle /> {t("mon_profil")}</NavLink>
        <NavLink to="/espace-etudiant/parametres"><FaCog /> {t("parametres")}</NavLink>
      </nav>
      <div className="barre-laterale-bas">
        <button onClick={gererDeconnexion}><FaSignOutAlt /> {t("deconnexion")}</button>
      </div>
    </aside>
  );
}

export default BarreLateraleEtudiant;