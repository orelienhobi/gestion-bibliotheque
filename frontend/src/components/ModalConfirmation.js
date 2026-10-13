function ModalConfirmation({ ouverte, titre, message, onConfirmer, onAnnuler }) {
  if (!ouverte) return null;
  return (
    <div className="modale-fond" onClick={onAnnuler}>
      <div className="modale-boite" onClick={(e) => e.stopPropagation()}>
        <h3>{titre}</h3>
        <p>{message}</p>
        <div className="modale-actions">
          <button type="button" onClick={onAnnuler}>Annuler</button>
          <button type="button" className="btn-supprimer" onClick={onConfirmer}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmation;