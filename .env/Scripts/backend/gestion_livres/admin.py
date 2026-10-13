from django.contrib import admin
from .models import (
    Livre, Etudiant, Emprunt, Categorie, Reservation, Notification,
    Parametres, HistoriqueConnexion,
)

for modele in [Categorie, Livre, Etudiant, Emprunt, Reservation, Notification, Parametres, HistoriqueConnexion]:
    admin.site.register(modele)