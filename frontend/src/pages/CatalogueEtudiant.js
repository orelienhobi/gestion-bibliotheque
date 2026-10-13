import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Carrousel from "../components/Carrousel";

function CatalogueEtudiant() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("categories/").then((r) => setCategories(r.data));
  }, []);

  return (
    <div>
      <h1>Catalogue</h1>
      <Carrousel>
        {categories.map((cat) => (
          <Link to={`/espace-etudiant/catalogue/${cat.id}`} key={cat.id} className="carte-slide">
            <div className="carte-slide-image">
              {cat.image ? <img src={cat.image} alt={cat.nom} /> : <div className="carte-slide-placeholder">📚</div>}
            </div>
            <div className="carte-slide-corps">
              <h3>{cat.nom}</h3>
              <p>{cat.nombre_livres} livre(s)</p>
            </div>
          </Link>
        ))}
      </Carrousel>
      {categories.length === 0 && <p>Aucune catégorie disponible.</p>}
    </div>
  );
}

export default CatalogueEtudiant;