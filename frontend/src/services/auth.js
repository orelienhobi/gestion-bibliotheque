import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/";

export function connecter(username, password) {
  return axios.post(`${BASE_URL}connexion/`, { username, password }).then((response) => {
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    return axios
      .get(`${BASE_URL}mon-compte/`, {
        headers: { Authorization: `Bearer ${response.data.access}` },
      })
      .then((res) => {
        localStorage.setItem("est_responsable", res.data.est_responsable ? "1" : "0");
        localStorage.setItem("nom_utilisateur", res.data.nom_complet || res.data.username);
      });
  });
}

export function deconnecter() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("est_responsable");
  localStorage.removeItem("nom_utilisateur");
}

export function estConnecte() {
  return !!localStorage.getItem("access_token");
}

export function estResponsable() {
  return localStorage.getItem("est_responsable") === "1";
}

export function nomUtilisateur() {
  return localStorage.getItem("nom_utilisateur") || "";
}