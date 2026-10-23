import re

from django.apps import apps
from django.db import models as django_models
from django.core.management.base import BaseCommand

MOTIF_NOUVEAU_FORMAT = re.compile(r"_[0-9a-f]{8}\.[A-Za-z0-9]+$")


class Command(BaseCommand):
    help = (
        "Corrige en base les noms de fichiers image enregistrés par l'ancienne version de "
        "CloudinaryStorage (qui causait un doublon d'extension côté Cloudinary). "
        "Sans --apply : simulation uniquement, aucune écriture en base."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply", action="store_true",
            help="Applique réellement les modifications (par défaut : simulation seule).",
        )

    def handle(self, *args, **options):
        appliquer = options["apply"]
        total_corriges = 0
        total_ignores = 0

        for modele in apps.get_app_config("gestion_livres").get_models():
            champs_image = [
                f for f in modele._meta.get_fields()
                if isinstance(f, (django_models.ImageField, django_models.FileField))
            ]
            if not champs_image:
                continue

            for champ in champs_image:
                queryset = modele.objects.exclude(**{champ.name: ""}).exclude(**{f"{champ.name}__isnull": True})
                for instance in queryset:
                    fichier = getattr(instance, champ.name)
                    nom = fichier.name
                    if not nom or "." not in nom:
                        total_ignores += 1
                        continue

                    if MOTIF_NOUVEAU_FORMAT.search(nom):
                        total_ignores += 1
                        continue  # déjà uploadée avec le code corrigé (suffixe _xxxxxxxx)

                    racine, extension = nom.rsplit(".", 1)
                    if racine.lower().endswith("." + extension.lower()):
                        total_ignores += 1
                        continue  # extension déjà doublée (commande déjà passée sur ce fichier)

                    nouveau_nom = f"{nom}.{extension}"
                    self.stdout.write(
                        f"{'[APPLIQUÉ]' if appliquer else '[SIMULATION]'} "
                        f"{modele.__name__}#{instance.pk}.{champ.name} : {nom} -> {nouveau_nom}"
                    )
                    if appliquer:
                        fichier.name = nouveau_nom
                        instance.save(update_fields=[champ.name])
                    total_corriges += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nTerminé : {total_corriges} fichier(s) {'corrigé(s)' if appliquer else 'à corriger'}, "
            f"{total_ignores} déjà correct(s)/ignoré(s)."
        ))
        if not appliquer:
            self.stdout.write(self.style.WARNING("Mode simulation : relance avec --apply pour écrire en base."))