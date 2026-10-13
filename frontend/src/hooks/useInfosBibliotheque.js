import { useEffect, useState } from "react";
import api from "../services/api";

let cache = null;

export default function useInfosBibliotheque() {
  const [infos, setInfos] = useState(cache);

  useEffect(() => {
    const charger = () => {
      api
        .get("infos-bibliotheque/")
        .then((r) => {
          cache = r.data;
          setInfos(r.data);
        })
        .catch(() => {});
    };

    if (!cache) charger();
    window.addEventListener("infos-bibliotheque-maj", charger);
    return () => window.removeEventListener("infos-bibliotheque-maj", charger);
  }, []);

  useEffect(() => {
    if (infos && infos.nom_bibliotheque) document.title = infos.nom_bibliotheque;
  }, [infos]);

  return infos;
}