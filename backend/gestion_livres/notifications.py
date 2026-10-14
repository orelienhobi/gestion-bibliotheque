from django.core.mail import send_mail
from .models import Notification, Parametres


class _Securise(dict):
    """Laisse intacte une variable inconnue du modèle au lieu de provoquer une erreur."""

    def __missing__(self, cle):
        return "{" + cle + "}"


# type de notification -> (réglage global actif, modèle de message, préférence de l'étudiant)
TYPES = {
    "validation": ("notif_validation_active", "modele_validation", "notif_validation"),
    "refus": ("notif_refus_active", "modele_refus", "notif_refus"),
    "expiration": ("notif_expiration_active", "modele_expiration", "notif_expiration"),
    "reservation": ("notif_reservation_active", "modele_reservation", "notif_reservation"),
}


def envoyer_notification(etudiant, type_notif, **contexte):
    """Crée la notification interne (et un email si activé), en respectant les réglages."""
    params = Parametres.charger()
    champ_actif, champ_modele, champ_preference = TYPES[type_notif]

    if not getattr(params, champ_actif):
        return None
    if not getattr(etudiant, champ_preference):
        return None

    modele = getattr(params, champ_modele)
    try:
        message = modele.format_map(_Securise(contexte))
    except (ValueError, IndexError):
        message = modele  # accolades mal formées dans le modèle : on garde le texte brut
    message = message[:255]

    notification = Notification.objects.create(etudiant=etudiant, message=message)

    if params.envoyer_emails and etudiant.email:
        send_mail(
            subject=params.nom_bibliotheque,
            message=message,
            from_email=None,  # utilise DEFAULT_FROM_EMAIL
            recipient_list=[etudiant.email],
            fail_silently=True,
        )
    return notification