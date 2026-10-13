import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import api from "../services/api";

function RechercheGlobale({ ouverte, onFermer }) {
  const [terme, setTerme] = useState("");
  const [livres, setLivres] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const champRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (ouverte) setTimeout(() => champRef.current?.focus(), 50);
  }, [ouverte]);

  useEffect(() => {
    if (terme.trim().length < 2) {
      setLivres([]); setEtudiants([]);
      return;
    }
    const identifiant = setTimeout(() => {
      api.get("livres/", { params: { search: terme } }).then((r) => setLivres(r.data.slice(0, 5)));
      api.get("etudiants/", { params: { search: terme } }).then((r) => setEtudiants(r.data.slice(0, 5)));
    }, 300);
    return () => clearTimeout(identifiant);
  }, [terme]);

  if (!ouverte) return null;

  return (
    <div className="recherche-fond" onClick={onFermer}>
      <div className="recherche-boite" onClick={(e) => e.stopPropagation()}>
        <div className="recherche-entete">
          <FaSearch />
          <input
            ref={champRef} type="text" placeholder="Rechercher un livre, un étudiant..."
            value={terme} onChange={(e) => setTerme(e.target.value)}
          />
          <button type="button" onClick={onFermer}><FaTimes /></button>
        </div>
        {(livres.length > 0 || etudiants.length > 0) && (
          <div className="recherche-resultats">
            {livres.length > 0 && (
              <div>
                <p className="recherche-categorie">Livres</p>
                {livres.map((l) => (
                  <div key={`l-${l.id}`} className="recherche-item" onClick={() => { onFermer(); if (l.categorie) navigate(`/categories/${l.categorie}`); }}>
                    {l.titre} — {l.auteur}
                  </div>
                ))}
              </div>
            )}
            {etudiants.length > 0 && (
              <div>
                <p className="recherche-categorie">Étudiants</p>
                {etudiants.map((e) => (
                  <div key={`e-${e.id}`} className="recherche-item" onClick={() => { onFermer(); navigate(`/etudiants/${e.id}`); }}>
                    {e.nom_complet}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RechercheGlobale;