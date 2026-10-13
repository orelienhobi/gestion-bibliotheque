import { useState } from "react";
import { FaImage } from "react-icons/fa";

const TYPES_AUTORISES = ["image/jpeg", "image/png", "image/webp"];
const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo

function ChampImage({ onFichierChange, apercuInitial }) {
  const [apercu, setApercu] = useState(apercuInitial || null);
  const [erreur, setErreur] = useState("");

  const gererSelection = (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;

    if (!TYPES_AUTORISES.includes(fichier.type)) {
      setErreur("Formats acceptés : JPG, PNG, WEBP.");
      e.target.value = "";
      return;
    }
    if (fichier.size > TAILLE_MAX) {
      setErreur("L'image ne doit pas dépasser 5 Mo.");
      e.target.value = "";
      return;
    }

    setErreur("");
    onFichierChange(fichier);
    setApercu(URL.createObjectURL(fichier));
  };

  return (
    <div>
      <label className="champ-image">
        {apercu ? (
          <img src={apercu} alt="Aperçu" className="champ-image-apercu" />
        ) : (
          <div className="champ-image-vide">
            <FaImage />
            <span>Choisir une image</span>
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={gererSelection} hidden />
      </label>
      {erreur && <p className="message-erreur">{erreur}</p>}
    </div>
  );
}

export default ChampImage;