import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaBook, FaLayerGroup, FaExchangeAlt, FaUsers, FaChartBar,
  FaHistory, FaSignOutAlt, FaSearch, FaCog, FaBars, FaTimes,
} from "react-icons/fa";
import { deconnecter } from "../services/auth";
import api from "../services/api";
import RechercheGlobale from "./RechercheGlobale";
import useInfosBibliotheque from "../hooks/useInfosBibliotheque";
import { t } from "../i18n";

function BarreLaterale() {
  const navigate = useNavigate();
  const location = useLocation();
  const infos = useInfosBibliotheque();
  const [demandesEnAttente, setDemandesEnAttente] = useState(0);
  const [rechercheOuverte, setRechercheOuverte] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    api.get("statistiques/").then((r) => setDemandesEnAttente(r.data.demandes_en_attente));
  }, []);

  useEffect(() => {
    const gererTouche = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setRechercheOuverte(true);
      }
    };
    window.addEventListener("keydown", gererTouche);
    return () => window.removeEventListener("keydown", gererTouche);
  }, []);

  // Referme le tiroir automatiquement à chaque changement de page (mobile/tablette)
  useEffect(() => {
    setMenuOuvert(false);
  }, [location.pathname]);

  const gererDeconnexion = () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      deconnecter();
      navigate("/connexion");
    }
  };

  return (
    <>
      <button type="button" className="bouton-menu-mobile" onClick={() => setMenuOuvert(true)}>
        <FaBars />
      </button>

      {menuOuvert && <div className="voile-mobile" onClick={() => setMenuOuvert(false)} />}

      <aside className={`barre-laterale ${menuOuvert ? "ouverte" : ""}`}>
        <button type="button" className="bouton-fermer-mobile" onClick={() => setMenuOuvert(false)}>
          <FaTimes />
        </button>

        <div className="barre-laterale-titre">
          {infos?.logo ? <img src={infos.logo} alt="" className="logo-sidebar" /> : <FaBook />}
          {infos?.nom_bibliotheque || "Bibliothèque"}
        </div>
        <button type="button" className="bouton-recherche" onClick={() => setRechercheOuverte(true)}>
          <FaSearch /> {t("rechercher")} <span className="raccourci-clavier">Ctrl K</span>
        </button>
        <nav className="barre-laterale-liens">
          <NavLink to="/" end><FaChartBar /> {t("tableau_de_bord")}</NavLink>
          <NavLink to="/categories"><FaLayerGroup /> {t("categorie")}</NavLink>
          <NavLink to="/emprunts" onClick={() => setDemandesEnAttente(0)}>
            <FaExchangeAlt /> {t("emprunt")}
            {demandesEnAttente > 0 && <span className="badge-notification">{demandesEnAttente}</span>}
          </NavLink>
          <NavLink to="/etudiants"><FaUsers /> {t("etudiant")}</NavLink>
          <NavLink to="/historique"><FaHistory /> {t("historique")}</NavLink>
          <NavLink to="/parametres"><FaCog /> {t("parametres")}</NavLink>
        </nav>
        <div className="barre-laterale-bas">
          <button onClick={gererDeconnexion}><FaSignOutAlt /> {t("deconnexion")}</button>
        </div>

        <RechercheGlobale ouverte={rechercheOuverte} onFermer={() => setRechercheOuverte(false)} />
      </aside>
    </>
  );
}

export default BarreLaterale;