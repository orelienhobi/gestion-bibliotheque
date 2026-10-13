from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    LivreViewSet, EtudiantViewSet, EmpruntViewSet, CategorieViewSet,
    ReservationViewSet, NotificationViewSet, StatistiquesView, TopLivresView,
    MonCompteView, ConnexionView, inscription_etudiant, MonProfilView,
    ChangerMotDePasseView, ParametresView, InfosBibliothequeView,
    HistoriqueConnexionsView, SupprimerMonCompteView,
)

router = DefaultRouter()
router.register("categories", CategorieViewSet, basename="categorie")
router.register("livres", LivreViewSet, basename="livre")
router.register("etudiants", EtudiantViewSet, basename="etudiant")
router.register("emprunts", EmpruntViewSet, basename="emprunt")
router.register("reservations", ReservationViewSet, basename="reservation")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = router.urls + [
    path("statistiques/", StatistiquesView.as_view()),
    path("top-livres/", TopLivresView.as_view()),
    path("mon-compte/", MonCompteView.as_view()),
    path("connexion/", ConnexionView.as_view()),
    path("inscription/", inscription_etudiant),
    path("mon-profil/", MonProfilView.as_view()),
    path("changer-mot-de-passe/", ChangerMotDePasseView.as_view()),
    path("parametres/", ParametresView.as_view()),
    path("infos-bibliotheque/", InfosBibliothequeView.as_view()),
    path("historique-connexions/", HistoriqueConnexionsView.as_view()),
    path("supprimer-mon-compte/", SupprimerMonCompteView.as_view()),
]