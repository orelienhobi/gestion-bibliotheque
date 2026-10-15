import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function Carrousel({ children }) {
  const piste = useRef(null);

  const defiler = (direction) => {
  if (piste.current) {
    const largeur = piste.current.clientWidth * 0.8;
    piste.current.scrollBy({ left: direction * largeur, behavior: "smooth" });
  }
};

  return (
    <div className="carrousel-conteneur">
      <button type="button" className="carrousel-fleche carrousel-gauche" onClick={() => defiler(-1)}>
        <FaChevronLeft />
      </button>
      <div className="carrousel-piste" ref={piste}>
        {children}
      </div>
      <button type="button" className="carrousel-fleche carrousel-droite" onClick={() => defiler(1)}>
        <FaChevronRight />
      </button>
    </div>
  );
}

export default Carrousel;