from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

TAILLE_MAX_IMAGE = 5 * 1024 * 1024  # 5 Mo


def valider_taille_image(fichier):
    if fichier.size > TAILLE_MAX_IMAGE:
        raise ValidationError("L'image ne doit pas dépasser 5 Mo.")


valider_telephone = RegexValidator(
    regex=r'^\+?\d{7,15}$',
    message="Le numéro de téléphone doit contenir entre 7 et 15 chiffres, avec un + optionnel au début.",
)

valider_nom = RegexValidator(
    regex=r"^[A-Za-zÀ-ÿ\s'\-]+$",
    message="Le nom ne doit contenir que des lettres, espaces, tirets ou apostrophes.",
)