import { useEffect, useState } from "react";
import api from "../services/api";

function NotificationsEtudiant() {
  const [notifications, setNotifications] = useState([]);

  const charger = () => {
    api.get("notifications/").then((r) => setNotifications(r.data));
  };

  useEffect(() => {
    api.post("notifications/marquer_toutes_lues/").then(charger);
  }, []);

  return (
    <div>
      <h1>Notifications</h1>
      {notifications.length === 0 ? (
        <p className="carte-message carte-message-violette">Aucune notification.</p>
      ) : (
        <ul className="liste-notifications">
          {notifications.map((n) => (
            <li key={n.id} className={n.lue ? "notification-lue" : "notification-non-lue"}>
              <p>{n.message}</p>
              <span className="texte-discret">{new Date(n.date_creation).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationsEtudiant;