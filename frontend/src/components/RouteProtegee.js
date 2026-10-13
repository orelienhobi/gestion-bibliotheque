import { Navigate } from "react-router-dom";
import { estConnecte, estResponsable } from "../services/auth";

function RouteProtegee({ children, role }) {
  if (!estConnecte()) return <Navigate to="/connexion" replace />;
  if (role === "responsable" && !estResponsable()) return <Navigate to="/espace-etudiant" replace />;
  if (role === "etudiant" && estResponsable()) return <Navigate to="/" replace />;
  return children;
}

export default RouteProtegee;