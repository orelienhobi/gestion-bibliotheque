const LARGEUR = 210;
const HAUT_ENTETE = 30;
const HAUT_LIGNE = 24;

const TABLES = [
  {
    nom: "historiqueconnexion", x: 20, y: 20,
    champs: [["id", "PK"], ["utilisateur_id", "FK"], ["date"], ["adresse_ip"]],
  },
  {
    nom: "notification", x: 300, y: 20,
    champs: [["id", "PK"], ["etudiant_id", "FK"], ["message"], ["lue"]],
  },
  {
    nom: "auth_user", x: 20, y: 200,
    champs: [["id", "PK"], ["username"], ["password"], ["email"], ["is_staff"]],
  },
  {
    nom: "etudiant", x: 300, y: 200,
    champs: [["id", "PK"], ["utilisateur_id", "FK"], ["nom_complet"], ["email"], ["telephone"]],
  },
  {
    nom: "emprunt", x: 580, y: 200,
    champs: [["id", "PK"], ["livre_id", "FK"], ["etudiant_id", "FK"], ["statut"], ["date_emprunt"], ["date_echeance"]],
  },
  {
    nom: "livre", x: 860, y: 200,
    champs: [["id", "PK"], ["categorie_id", "FK"], ["titre"], ["auteur"], ["nombre_exemplaires"]],
  },
  {
    nom: "categorie", x: 1140, y: 200,
    champs: [["id", "PK"], ["nom"], ["image"], ["duree_emprunt_jours"]],
  },
  {
    nom: "reservation", x: 580, y: 450,
    champs: [["id", "PK"], ["livre_id", "FK"], ["etudiant_id", "FK"], ["date_reservation"], ["disponible"]],
  },
  {
    nom: "parametres", x: 1140, y: 450,
    champs: [["id", "PK"], ["nom_bibliotheque"], ["duree_emprunt_jours"], ["delai_expiration_heures"]],
  },
];

// Traits (points successifs) et cardinalités Merise (texte + position)
const RELATIONS = [
  // historiqueconnexion — auth_user
  {
    points: [[125, 146], [125, 200]],
    cards: [["1,1", 131, 162], ["0,n", 131, 194]],
  },
  // notification — etudiant
  {
    points: [[405, 146], [405, 200]],
    cards: [["1,1", 411, 162], ["0,n", 411, 194]],
  },
  // auth_user — etudiant
  {
    points: [[230, 215], [300, 215]],
    cards: [["0,1", 234, 209], ["0,1", 272, 209]],
  },
  // etudiant — emprunt
  {
    points: [[510, 215], [580, 215]],
    cards: [["0,n", 514, 209], ["1,1", 552, 209]],
  },
  // emprunt — livre
  {
    points: [[790, 215], [860, 215]],
    cards: [["1,1", 794, 209], ["0,n", 832, 209]],
  },
  // livre — categorie
  {
    points: [[1070, 215], [1140, 215]],
    cards: [["0,1", 1074, 209], ["0,n", 1112, 209]],
  },
  // etudiant — reservation
  {
    points: [[405, 350], [405, 465], [580, 465]],
    cards: [["0,n", 411, 368], ["1,1", 546, 459]],
  },
  // livre — reservation
  {
    points: [[790, 465], [965, 465], [965, 350]],
    cards: [["1,1", 796, 459], ["0,n", 971, 368]],
  },
];

const hauteur = (table) => HAUT_ENTETE + table.champs.length * HAUT_LIGNE;

function CarteTable({ table }) {
  const h = hauteur(table);
  return (
    <g transform={`translate(${table.x}, ${table.y})`}>
      <rect className="mpd-carte" width={LARGEUR} height={h} rx="10" />
      <rect className="mpd-entete" width={LARGEUR} height={HAUT_ENTETE} rx="10" />
      <rect className="mpd-entete" y={HAUT_ENTETE - 10} width={LARGEUR} height="10" />
      <text className="mpd-titre" x="12" y="20">{table.nom}</text>

      {table.champs.map(([nom, cle], i) => {
        const y = HAUT_ENTETE + i * HAUT_LIGNE;
        return (
          <g key={nom}>
            {i > 0 && <line className="mpd-separateur" x1="0" x2={LARGEUR} y1={y} y2={y} />}
            <text className={`mpd-champ ${cle === "PK" ? "mpd-champ-pk" : ""}`} x="12" y={y + 16}>
              {cle === "FK" ? `#${nom}` : nom}
            </text>
            {cle && (
              <g>
                <rect
                  className={cle === "PK" ? "mpd-badge-pk" : "mpd-badge-fk"}
                  x={LARGEUR - 38} y={y + 5} width="28" height="14" rx="7"
                />
                <text className="mpd-badge-texte" x={LARGEUR - 24} y={y + 15} textAnchor="middle">
                  {cle}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

function SchemaMPD() {
  const parametres = TABLES.find((t) => t.nom === "parametres");
  return (
    <div className="mpd-conteneur">
      <div className="mpd-scroll">
        <svg
          className="mpd-svg"
          width="1370" height="640" viewBox="0 0 1370 640"
          role="img" aria-label="Modèle physique de données de la bibliothèque"
        >
          {RELATIONS.map((r, i) => (
            <path key={i} className="mpd-trait" d={"M " + r.points.map((p) => p.join(" ")).join(" L ")} />
          ))}
          {RELATIONS.map((r, i) =>
            r.cards.map(([texte, x, y]) => (
              <text key={`${i}-${x}-${y}`} className="mpd-cardinalite" x={x} y={y}>{texte}</text>
            ))
          )}
          {TABLES.map((table) => <CarteTable key={table.nom} table={table} />)}
          <text className="mpd-note" x={parametres.x} y={parametres.y + hauteur(parametres) + 20}>
            Aucune relation : table à ligne unique
          </text>
        </svg>
      </div>

      <p className="texte-discret">
        Légende : <strong>PK</strong> clé primaire, <strong>FK</strong> clé étrangère (préfixée par #).
        Cardinalités Merise : 0,1 · 1,1 · 0,n · 1,n. Faites défiler horizontalement pour voir tout le schéma.
      </p>
    </div>
  );
}

export default SchemaMPD;