function Squelette({ lignes = 3 }) {
  return (
    <div className="squelette-conteneur">
      {Array.from({ length: lignes }).map((_, i) => (
        <div key={i} className="squelette-ligne" />
      ))}
    </div>
  );
}

export default Squelette;