import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import BarreLaterale from "./components/BarreLaterale";
import BarreLateraleEtudiant from "./components/BarreLateraleEtudiant";
import RouteProtegee from "./components/RouteProtegee";
import useInactivite from "./hooks/useInactivite";
import { appliquerPreferences } from "./services/preferences";

import Categories from "./pages/Categories";
import CategorieDetail from "./pages/CategorieDetail";
import Emprunts from "./pages/Emprunts";
import Historique from "./pages/Historique";
import TableauDeBord from "./pages/TableauDeBord";
import Etudiants from "./pages/Etudiants";
import EtudiantDetail from "./pages/EtudiantDetail";
import Parametres from "./pages/Parametres";

import TableauDeBordEtudiant from "./pages/TableauDeBordEtudiant";
import CatalogueEtudiant from "./pages/CatalogueEtudiant";
import CategorieDetailEtudiant from "./pages/CategorieDetailEtudiant";
import NotificationsEtudiant from "./pages/NotificationsEtudiant";
import ProfilEtudiant from "./pages/ProfilEtudiant";
import MesEmpruntsEtudiant from "./pages/MesEmpruntsEtudiant";
import ParametresEtudiant from "./pages/ParametresEtudiant";

import Connexion from "./pages/Connexion";
import InscriptionEtudiant from "./pages/InscriptionEtudiant";
import "./App.css";

// Applique le thème, la couleur, la police et la langue enregistrés dès le chargement
appliquerPreferences();

function MiseEnPageResponsable({ children }) {
  const location = useLocation();
  useInactivite();
  return (
    <RouteProtegee role="responsable">
      <div className="mise-en-page">
        <BarreLaterale />
        <main className="conteneur-principal" key={location.pathname}>{children}</main>
      </div>
    </RouteProtegee>
  );
}

function MiseEnPageEtudiant({ children }) {
  const location = useLocation();
  useInactivite();
  return (
    <RouteProtegee role="etudiant">
      <div className="mise-en-page">
        <BarreLateraleEtudiant />
        <main className="conteneur-principal" key={location.pathname}>{children}</main>
      </div>
    </RouteProtegee>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<InscriptionEtudiant />} />

        <Route path="/" element={<MiseEnPageResponsable><TableauDeBord /></MiseEnPageResponsable>} />
        <Route path="/categories" element={<MiseEnPageResponsable><Categories /></MiseEnPageResponsable>} />
        <Route path="/categories/:id" element={<MiseEnPageResponsable><CategorieDetail /></MiseEnPageResponsable>} />
        <Route path="/emprunts" element={<MiseEnPageResponsable><Emprunts /></MiseEnPageResponsable>} />
        <Route path="/historique" element={<MiseEnPageResponsable><Historique /></MiseEnPageResponsable>} />
        <Route path="/etudiants" element={<MiseEnPageResponsable><Etudiants /></MiseEnPageResponsable>} />
        <Route path="/etudiants/:id" element={<MiseEnPageResponsable><EtudiantDetail /></MiseEnPageResponsable>} />
        <Route path="/parametres" element={<MiseEnPageResponsable><Parametres /></MiseEnPageResponsable>} />

        <Route path="/espace-etudiant" element={<MiseEnPageEtudiant><TableauDeBordEtudiant /></MiseEnPageEtudiant>} />
        <Route path="/espace-etudiant/catalogue" element={<MiseEnPageEtudiant><CatalogueEtudiant /></MiseEnPageEtudiant>} />
        <Route path="/espace-etudiant/catalogue/:id" element={<MiseEnPageEtudiant><CategorieDetailEtudiant /></MiseEnPageEtudiant>} />
        <Route path="/espace-etudiant/mes-emprunts" element={<MiseEnPageEtudiant><MesEmpruntsEtudiant /></MiseEnPageEtudiant>} />
        <Route path="/espace-etudiant/notifications" element={<MiseEnPageEtudiant><NotificationsEtudiant /></MiseEnPageEtudiant>} />
        <Route path="/espace-etudiant/profil" element={<MiseEnPageEtudiant><ProfilEtudiant /></MiseEnPageEtudiant>} />
        <Route path="/espace-etudiant/parametres" element={<MiseEnPageEtudiant><ParametresEtudiant /></MiseEnPageEtudiant>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;