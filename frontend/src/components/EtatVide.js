function EtatVide({ icone, texte, couleur = "violette" }) {
  return (
    <div className={`carte-message carte-message-${couleur} etat-vide`}>
      <span className="etat-vide-icone">{icone}</span>
      <span>{texte}</span>
    </div>
  );
}

export default EtatVide;