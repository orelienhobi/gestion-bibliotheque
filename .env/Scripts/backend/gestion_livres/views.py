from django.db.models import Q, Count
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import date, timedelta
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    Livre, Etudiant, Emprunt, Categorie, Reservation, Notification,
    Parametres, HistoriqueConnexion,
)
from .serializers import (
    LivreSerializer, EtudiantSerializer, EmpruntSerializer,
    CategorieSerializer, ReservationSerializer, NotificationSerializer,
    ParametresSerializer, InfosBibliothequeSerializer, HistoriqueConnexionSerializer,
)
from .permissions import EstResponsable
from .notifications import envoyer_notification
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


def expirer_demandes_anciennes():
    """Expire les demandes en attente au-delà du délai réglé dans les Paramètres."""
    params = Parametres.charger()
    limite = timezone.now() - timedelta(hours=params.delai_expiration_heures)
    demandes = Emprunt.objects.filter(
        statut="en_attente", date_emprunt__lt=limite
    ).select_related("livre", "etudiant")
    for emprunt in demandes:
        emprunt.statut = "expire"
        emprunt.save()
        envoyer_notification(
            emprunt.etudiant, "expiration",
            livre=emprunt.livre.titre, delai=params.delai_expiration_heures,
        )


# ---------- Inscription étudiant ----------

@api_view(["POST"])
@permission_classes([AllowAny])
def inscription_etudiant(request):
    donnees = request.data
    nom_utilisateur = donnees.get("username")
    mot_de_passe = donnees.get("password")
    email = donnees.get("email", "")
    nom_complet = donnees.get("nom_complet", "")

    if not nom_utilisateur or not mot_de_passe:
        return Response({"erreur": "Nom d'utilisateur et mot de passe requis."}, status=400)
    if User.objects.filter(username=nom_utilisateur).exists():
        return Response({"erreur": "Ce nom d'utilisateur existe déjà."}, status=400)

    utilisateur = User.objects.create_user(username=nom_utilisateur, password=mot_de_passe, email=email)

    # Cherche une fiche déjà ajoutée par le responsable (même email, sans compte lié)
    etudiant = None
    if email:
        etudiant = Etudiant.objects.filter(email=email, utilisateur__isnull=True).first()
    if not etudiant and nom_complet:
        etudiant = Etudiant.objects.filter(nom_complet=nom_complet, utilisateur__isnull=True).first()

    if etudiant:
        etudiant.utilisateur = utilisateur
        if not etudiant.email:
            etudiant.email = email
        etudiant.save()
    else:
        etudiant = Etudiant.objects.create(
            utilisateur=utilisateur, nom_complet=nom_complet, email=email,
            telephone=donnees.get("telephone", ""),
        )

    return Response(EtudiantSerializer(etudiant).data, status=201)


# ---------- Connexion / compte ----------

class ConnexionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "")
        password = request.data.get("password", "")

        if not User.objects.filter(username=username).exists():
            return Response({"erreur": "Nom d'utilisateur incorrect.", "champ": "username"}, status=401)

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"erreur": "Mot de passe incorrect.", "champ": "password"}, status=401)

        HistoriqueConnexion.objects.create(
            utilisateur=user,
            adresse_ip=request.META.get("REMOTE_ADDR"),
            navigateur=request.META.get("HTTP_USER_AGENT", "")[:255],
        )

        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh)})


class MonCompteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {"username": user.username, "est_responsable": user.is_staff}
        if not user.is_staff:
            try:
                etudiant = user.etudiant
                data["etudiant_id"] = etudiant.id
                data["nom_complet"] = etudiant.nom_complet
            except Etudiant.DoesNotExist:
                pass
        return Response(data)


class MonProfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        etudiant = get_object_or_404(Etudiant, utilisateur=request.user)
        return Response(EtudiantSerializer(etudiant, context={"request": request}).data)

    def patch(self, request):
        etudiant = get_object_or_404(Etudiant, utilisateur=request.user)
        serializer = EtudiantSerializer(
            etudiant, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangerMotDePasseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ancien = request.data.get("ancien_mot_de_passe", "")
        nouveau = request.data.get("nouveau_mot_de_passe", "")
        confirmation = request.data.get("confirmation_mot_de_passe", "")
        user = request.user

        if not user.check_password(ancien):
            return Response({"erreur": "Mot de passe actuel incorrect."}, status=400)
        if nouveau != confirmation:
            return Response({"erreur": "Les deux mots de passe ne correspondent pas."}, status=400)
        try:
            validate_password(nouveau, user=user)
        except DjangoValidationError as erreurs:
            return Response({"erreur": " ".join(erreurs.messages)}, status=400)

        user.set_password(nouveau)
        user.save()
        return Response({"message": "Mot de passe modifié avec succès."})


class HistoriqueConnexionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        connexions = HistoriqueConnexion.objects.filter(utilisateur=request.user)[:10]
        return Response(HistoriqueConnexionSerializer(connexions, many=True).data)


class SupprimerMonCompteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_staff:
            return Response(
                {"erreur": "Le compte responsable ne peut pas être supprimé depuis l'application."},
                status=400,
            )
        if not user.check_password(request.data.get("mot_de_passe", "")):
            return Response({"erreur": "Mot de passe incorrect."}, status=400)

        etudiant = getattr(user, "etudiant", None)
        if etudiant and Emprunt.objects.filter(
            etudiant=etudiant, statut="valide", date_retour_effective__isnull=True
        ).exists():
            return Response(
                {"erreur": "Vous avez des livres non retournés. Rapportez-les avant de supprimer votre compte."},
                status=400,
            )

        user.delete()  # supprime aussi la fiche étudiant et son historique (suppression en cascade)
        return Response(status=204)


# ---------- Paramètres ----------

class ParametresView(APIView):
    permission_classes = [EstResponsable]

    def get(self, request):
        return Response(ParametresSerializer(Parametres.charger(), context={"request": request}).data)

    def patch(self, request):
        serializer = ParametresSerializer(
            Parametres.charger(), data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class InfosBibliothequeView(APIView):
    """Informations publiques : accessibles sans connexion (page de connexion comprise)."""

    permission_classes = [AllowAny]
    authentication_classes = []  # un ancien token expiré ne doit pas bloquer cette requête

    def get(self, request):
        return Response(
            InfosBibliothequeSerializer(Parametres.charger(), context={"request": request}).data
        )


# ---------- Catégories ----------

class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [EstResponsable()]
        return [IsAuthenticated()]

    @action(detail=True, methods=["get"])
    def livres(self, request, pk=None):
        categorie = self.get_object()
        livres = Livre.objects.filter(categorie=categorie)
        return Response(LivreSerializer(livres, many=True, context={"request": request}).data)


# ---------- Livres ----------

class LivreViewSet(viewsets.ModelViewSet):
    serializer_class = LivreSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [EstResponsable()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Livre.objects.all()
        recherche = self.request.query_params.get("search")
        categorie_id = self.request.query_params.get("categorie")
        disponible = self.request.query_params.get("disponible")

        if recherche:
            queryset = queryset.filter(Q(titre__icontains=recherche) | Q(auteur__icontains=recherche))
        if categorie_id:
            queryset = queryset.filter(categorie_id=categorie_id)
        if disponible == "true":
            ids = [l.id for l in queryset if l.exemplaires_disponibles > 0]
            queryset = queryset.filter(id__in=ids)
        return queryset


# ---------- Étudiants (gestion réservée au responsable) ----------

class EtudiantViewSet(viewsets.ModelViewSet):
    serializer_class = EtudiantSerializer
    permission_classes = [EstResponsable]

    def get_queryset(self):
        queryset = Etudiant.objects.all()
        recherche = self.request.query_params.get("search")
        if recherche:
            queryset = queryset.filter(
                Q(nom_complet__icontains=recherche) | Q(email__icontains=recherche)
            )
        return queryset

    @action(detail=True, methods=["get"])
    def emprunts(self, request, pk=None):
        etudiant = self.get_object()
        emprunts = Emprunt.objects.filter(etudiant=etudiant)
        return Response(EmpruntSerializer(emprunts, many=True, context={"request": request}).data)


# ---------- Emprunts (demandes) ----------

class EmpruntViewSet(viewsets.ModelViewSet):
    serializer_class = EmpruntSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        expirer_demandes_anciennes()
        user = self.request.user
        if user.is_staff:
            return Emprunt.objects.all()
        return Emprunt.objects.filter(etudiant__utilisateur=user)

    def create(self, request, *args, **kwargs):
        user = request.user
        if user.is_staff:
            return Response(
                {"erreur": "Le responsable ne crée pas de demande — il valide celles des étudiants."},
                status=400,
            )
        try:
            etudiant = user.etudiant
        except Etudiant.DoesNotExist:
            return Response({"erreur": "Profil étudiant introuvable."}, status=400)

        params = Parametres.charger()
        livre = Livre.objects.get(id=request.data["livre"])

        if livre.exemplaires_disponibles <= 0:
            return Response(
                {"erreur": "Aucun exemplaire disponible pour ce livre.", "peut_reserver": True},
                status=400,
            )

        nb_retards = Emprunt.objects.filter(
            etudiant=etudiant, statut="valide",
            date_retour_effective__isnull=True, date_echeance__lt=date.today(),
        ).count()
        if nb_retards >= params.seuil_retards_blocage:
            return Response(
                {"erreur": f"Vous avez {nb_retards} emprunt(s) en retard à régulariser avant une nouvelle demande."},
                status=400,
            )

        nb_actifs = Emprunt.objects.filter(
            etudiant=etudiant, statut__in=["en_attente", "valide"],
            date_retour_effective__isnull=True,
        ).count()
        if params.max_emprunts_simultanes and nb_actifs >= params.max_emprunts_simultanes:
            return Response(
                {"erreur": f"Vous avez atteint la limite de {params.max_emprunts_simultanes} emprunt(s) simultané(s)."},
                status=400,
            )

        emprunt = Emprunt.objects.create(livre=livre, etudiant=etudiant, statut="en_attente")
        return Response(self.get_serializer(emprunt).data, status=201)

    @action(detail=True, methods=["post"], permission_classes=[EstResponsable])
    def valider(self, request, pk=None):
        emprunt = self.get_object()
        if emprunt.statut != "en_attente":
            return Response({"erreur": "Cette demande n'est plus en attente."}, status=400)
        if emprunt.livre.exemplaires_disponibles <= 0:
            return Response({"erreur": "Plus d'exemplaire disponible pour valider cette demande."}, status=400)

        params = Parametres.charger()
        emprunt.statut = "valide"
        emprunt.date_echeance = date.today() + timedelta(days=params.duree_emprunt_jours)
        emprunt.save()

        envoyer_notification(
            emprunt.etudiant, "validation",
            livre=emprunt.livre.titre, date_echeance=emprunt.date_echeance,
        )
        return Response(self.get_serializer(emprunt).data)

    @action(detail=True, methods=["post"], permission_classes=[EstResponsable])
    def refuser(self, request, pk=None):
        emprunt = self.get_object()
        motif = request.data.get("motif", "").strip()

        emprunt.statut = "refuse"
        emprunt.motif_refus = motif
        emprunt.save()

        envoyer_notification(
            emprunt.etudiant, "refus",
            livre=emprunt.livre.titre, motif=f" Motif : {motif}" if motif else "",
        )
        return Response(self.get_serializer(emprunt).data)

    @action(detail=True, methods=["post"], permission_classes=[EstResponsable])
    def retourner(self, request, pk=None):
        emprunt = self.get_object()
        emprunt.date_retour_effective = date.today()
        emprunt.save()

        prochaine = Reservation.objects.filter(
            livre=emprunt.livre, satisfaite=False, disponible=False
        ).order_by("date_reservation").first()
        if prochaine:
            prochaine.disponible = True
            prochaine.save()
            envoyer_notification(prochaine.etudiant, "reservation", livre=emprunt.livre.titre)

        return Response(self.get_serializer(emprunt).data)


# ---------- Réservations ----------

class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Reservation.objects.filter(satisfaite=False)
        return Reservation.objects.filter(etudiant__utilisateur=user, satisfaite=False)

    def create(self, request, *args, **kwargs):
        user = request.user
        etudiant = Etudiant.objects.get(id=request.data["etudiant"]) if user.is_staff else user.etudiant
        livre = Livre.objects.get(id=request.data["livre"])

        if livre.exemplaires_disponibles > 0:
            return Response({"erreur": "Ce livre est disponible, inutile de le réserver."}, status=400)
        if Reservation.objects.filter(livre=livre, etudiant=etudiant, satisfaite=False).exists():
            return Response({"erreur": "Vous avez déjà réservé ce livre."}, status=400)

        reservation = Reservation.objects.create(livre=livre, etudiant=etudiant)
        return Response(self.get_serializer(reservation).data, status=201)

    @action(detail=True, methods=["post"], permission_classes=[EstResponsable])
    def convertir(self, request, pk=None):
        reservation = self.get_object()
        livre = reservation.livre
        if livre.exemplaires_disponibles <= 0:
            return Response({"erreur": "Aucun exemplaire disponible pour le moment."}, status=400)

        params = Parametres.charger()
        emprunt = Emprunt.objects.create(
            livre=livre, etudiant=reservation.etudiant, statut="valide",
            date_echeance=date.today() + timedelta(days=params.duree_emprunt_jours),
        )
        reservation.satisfaite = True
        reservation.save()
        return Response(EmpruntSerializer(emprunt, context={"request": request}).data, status=201)


# ---------- Notifications (étudiant) ----------

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(etudiant__utilisateur=self.request.user)

    @action(detail=True, methods=["post"])
    def marquer_lue(self, request, pk=None):
        notification = self.get_object()
        notification.lue = True
        notification.save()
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=["post"])
    def marquer_toutes_lues(self, request):
        Notification.objects.filter(etudiant__utilisateur=request.user, lue=False).update(lue=True)
        return Response({"message": "Toutes les notifications ont été marquées comme lues."})


# ---------- Top livres et statistiques ----------

class TopLivresView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        top = Livre.objects.annotate(nb_emprunts=Count("emprunt")).order_by("-nb_emprunts")[:6]
        return Response(LivreSerializer(top, many=True, context={"request": request}).data)


class StatistiquesView(APIView):
    permission_classes = [EstResponsable]

    def get(self, request):
        aujourdhui = date.today()
        debut_mois = aujourdhui.replace(day=1)

        emprunts_valides = Emprunt.objects.filter(statut="valide", date_retour_effective__isnull=True)
        emprunts_en_retard = emprunts_valides.filter(date_echeance__lt=aujourdhui)
        emprunts_ce_mois = Emprunt.objects.filter(date_emprunt__gte=debut_mois)
        livres_rendus = Emprunt.objects.filter(date_retour_effective__isnull=False)

        data = {
            "nombre_membres": Etudiant.objects.count(),
            "emprunts_en_cours": emprunts_valides.count(),
            "livres_rendus": livres_rendus.count(),
            "emprunts_ce_mois": emprunts_ce_mois.count(),
            "emprunts_en_retard": emprunts_en_retard.count(),
            "nombre_livres": Livre.objects.count(),
            "nombre_categories": Categorie.objects.count(),
            "demandes_en_attente": Emprunt.objects.filter(statut="en_attente").count(),
        }
        return Response(data)