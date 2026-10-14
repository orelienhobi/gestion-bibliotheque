from rest_framework import serializers
from .models import (
    Livre, Etudiant, Emprunt, Categorie, Reservation, Notification,
    Parametres, HistoriqueConnexion,
)


class CategorieSerializer(serializers.ModelSerializer):
    nombre_livres = serializers.SerializerMethodField()

    class Meta:
        model = Categorie
        fields = "__all__"

    def get_nombre_livres(self, obj):
        return obj.livres.count()


class LivreSerializer(serializers.ModelSerializer):
    exemplaires_disponibles = serializers.ReadOnlyField()
    categorie_nom = serializers.CharField(source="categorie.nom", read_only=True)

    class Meta:
        model = Livre
        fields = "__all__"
        extra_kwargs = {"nombre_exemplaires": {"min_value": 1}}


class EtudiantSerializer(serializers.ModelSerializer):
    nombre_emprunts = serializers.SerializerMethodField()

    class Meta:
        model = Etudiant
        fields = "__all__"
        read_only_fields = ["utilisateur"]

    def get_nombre_emprunts(self, obj):
        return obj.emprunt_set.count()

    def validate_email(self, valeur):
        if valeur:
            qs = Etudiant.objects.filter(email__iexact=valeur)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("Cet email est déjà utilisé par un autre étudiant.")
        return valeur


class EmpruntSerializer(serializers.ModelSerializer):
    en_retard = serializers.ReadOnlyField()
    livre_titre = serializers.CharField(source="livre.titre", read_only=True)
    livre_image = serializers.ImageField(source="livre.image", read_only=True)
    etudiant_nom = serializers.CharField(source="etudiant.nom_complet", read_only=True)

    class Meta:
        model = Emprunt
        fields = "__all__"


class ReservationSerializer(serializers.ModelSerializer):
    livre_titre = serializers.CharField(source="livre.titre", read_only=True)
    etudiant_nom = serializers.CharField(source="etudiant.nom_complet", read_only=True)

    class Meta:
        model = Reservation
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class ParametresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parametres
        fields = "__all__"
        extra_kwargs = {
            "duree_emprunt_jours": {"min_value": 1, "max_value": 90},
            "seuil_retards_blocage": {"min_value": 1, "max_value": 20},
            "delai_expiration_heures": {"min_value": 1, "max_value": 168},
            "max_emprunts_simultanes": {"min_value": 0, "max_value": 20},
        }


class InfosBibliothequeSerializer(serializers.ModelSerializer):
    """Sous-ensemble public des paramètres (affiché même sur la page de connexion)."""

    class Meta:
        model = Parametres
        fields = [
            "nom_bibliotheque", "logo", "horaires", "adresse",
            "contact_email", "contact_telephone", "message_accueil",
        ]


class HistoriqueConnexionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueConnexion
        fields = ["id", "date", "adresse_ip", "navigateur"]