from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator, MinValueValidator, MaxValueValidator
from .validators import valider_taille_image, valider_telephone, valider_nom

EXTENSIONS_IMAGE = FileExtensionValidator(["jpg", "jpeg", "png", "webp"])


class Categorie(models.Model):
    nom = models.CharField(max_length=100, unique=True, validators=[valider_nom])
    image = models.ImageField(
        upload_to="categories/", null=True, blank=True,
        validators=[EXTENSIONS_IMAGE, valider_taille_image],
    )
    duree_emprunt_jours = models.PositiveIntegerField(default=14)

    def __str__(self):
        return self.nom

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"


class Livre(models.Model):
    titre = models.CharField(max_length=200)
    auteur = models.CharField(max_length=150)
    categorie = models.ForeignKey(
        Categorie, on_delete=models.SET_NULL, null=True, blank=True, related_name="livres"
    )
    image = models.ImageField(
        upload_to="livres/", null=True, blank=True,
        validators=[EXTENSIONS_IMAGE, valider_taille_image],
    )
    nombre_exemplaires = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    rangee = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return self.titre

    @property
    def exemplaires_disponibles(self):
        emprunts_valides = self.emprunt_set.filter(
            statut="valide", date_retour_effective__isnull=True
        ).count()
        return self.nombre_exemplaires - emprunts_valides

    class Meta:
        verbose_name = "Livre"
        verbose_name_plural = "Livres"


class Etudiant(models.Model):
    utilisateur = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    nom_complet = models.CharField(max_length=200, validators=[valider_nom])
    email = models.EmailField(blank=True)
    telephone = models.CharField(max_length=20, blank=True, validators=[valider_telephone])
    photo = models.ImageField(
        upload_to="etudiants/", null=True, blank=True,
        validators=[EXTENSIONS_IMAGE, valider_taille_image],
    )

    notif_validation = models.BooleanField(default=True)
    notif_refus = models.BooleanField(default=True)
    notif_expiration = models.BooleanField(default=True)
    notif_reservation = models.BooleanField(default=True)

    def __str__(self):
        return self.nom_complet


class Emprunt(models.Model):
    STATUT_CHOICES = [
        ("en_attente", "En attente de validation"),
        ("valide", "Validé"),
        ("refuse", "Refusé"),
        ("expire", "Expiré"),
    ]

    livre = models.ForeignKey(Livre, on_delete=models.CASCADE)
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    statut = models.CharField(max_length=15, choices=STATUT_CHOICES, default="en_attente")
    date_emprunt = models.DateTimeField(auto_now_add=True)
    date_echeance = models.DateField(null=True, blank=True)
    date_retour_effective = models.DateField(null=True, blank=True)
    motif_refus = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.livre} → {self.etudiant} ({self.statut})"

    @property
    def en_retard(self):
        if self.statut != "valide" or not self.date_echeance:
            return False
        from datetime import date
        if self.date_retour_effective:
            return self.date_retour_effective > self.date_echeance
        return date.today() > self.date_echeance

    class Meta:
        ordering = ["-date_emprunt"]


class Reservation(models.Model):
    livre = models.ForeignKey(Livre, on_delete=models.CASCADE, related_name="reservations")
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    date_reservation = models.DateTimeField(auto_now_add=True)
    disponible = models.BooleanField(default=False)
    satisfaite = models.BooleanField(default=False)

    class Meta:
        ordering = ["date_reservation"]

    def __str__(self):
        return f"{self.etudiant} attend « {self.livre} »"


class Notification(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name="notifications")
    message = models.CharField(max_length=255)
    date_creation = models.DateTimeField(auto_now_add=True)
    lue = models.BooleanField(default=False)

    class Meta:
        ordering = ["-date_creation"]


class Parametres(models.Model):
    duree_emprunt_jours = models.PositiveIntegerField(
        default=14, validators=[MinValueValidator(1), MaxValueValidator(90)]
    )
    seuil_retards_blocage = models.PositiveIntegerField(
        default=2, validators=[MinValueValidator(1), MaxValueValidator(20)]
    )
    delai_expiration_heures = models.PositiveIntegerField(
        default=5, validators=[MinValueValidator(1), MaxValueValidator(168)]
    )
    max_emprunts_simultanes = models.PositiveIntegerField(
        default=5, validators=[MaxValueValidator(20)]
    )

    nom_bibliotheque = models.CharField(max_length=100, default="G. Bibliothèque")
    logo = models.ImageField(
        upload_to="parametres/", null=True, blank=True,
        validators=[EXTENSIONS_IMAGE, valider_taille_image],
    )
    horaires = models.TextField(blank=True)
    adresse = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_telephone = models.CharField(max_length=30, blank=True, validators=[valider_telephone])
    message_accueil = models.CharField(max_length=255, blank=True)

    notif_validation_active = models.BooleanField(default=True)
    notif_refus_active = models.BooleanField(default=True)
    notif_expiration_active = models.BooleanField(default=True)
    notif_reservation_active = models.BooleanField(default=True)
    modele_validation = models.CharField(
        max_length=255,
        default="Votre emprunt pour « {livre} » a été validé. À retourner avant le {date_echeance}.",
    )
    modele_refus = models.CharField(
        max_length=255, default="Votre demande pour « {livre} » a été refusée.{motif}"
    )
    modele_expiration = models.CharField(
        max_length=255,
        default="Votre demande d'emprunt pour « {livre} » a expiré faute de validation sous {delai}h.",
    )
    modele_reservation = models.CharField(
        max_length=255, default="Le livre « {livre} » que vous avez réservé est maintenant disponible."
    )
    envoyer_emails = models.BooleanField(default=False)

    @classmethod
    def charger(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return "Paramètres de la bibliothèque"

    class Meta:
        verbose_name = "Paramètres"
        verbose_name_plural = "Paramètres"


class HistoriqueConnexion(models.Model):
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, related_name="connexions")
    date = models.DateTimeField(auto_now_add=True)
    adresse_ip = models.GenericIPAddressField(null=True, blank=True)
    navigateur = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.utilisateur} — {self.date:%d/%m/%Y %H:%M}"