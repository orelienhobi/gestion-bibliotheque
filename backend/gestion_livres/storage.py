import os
import re
import secrets
import unicodedata

import cloudinary.uploader
import cloudinary.utils
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


def _nettoyer_nom(base):
    """Retire les accents, espaces et caractères spéciaux d'un nom de fichier."""
    base = unicodedata.normalize("NFKD", base).encode("ascii", "ignore").decode("ascii")
    base = re.sub(r"[^A-Za-z0-9_\-]", "_", base)
    return base or "fichier"


@deconstructible
class CloudinaryStorage(Storage):
    """Stockage des fichiers médias via le SDK Cloudinary (sans dépendre du
    paquet django-cloudinary-storage, incompatible avec STORAGES sous Django 6.1).

    Convention centrale de cette classe, à ne jamais casser : le `name` enregistré
    en base est TOUJOURS exactement le chemin de livraison Cloudinary complet
    (public_id + "." + format), jamais un public_id nu. `url()` ne le modifie donc
    jamais ; seul `delete()` doit retirer UNE extension pour retrouver le vrai
    public_id (celui réellement passé à `upload()`).
    """

    def _save(self, name, content):
        dossier, nom_fichier = os.path.split(name)
        base, _ext_origine = os.path.splitext(nom_fichier)
        base_propre = _nettoyer_nom(base)
        suffixe = secrets.token_hex(4)  # 8 caractères hexadécimaux, évite toute collision
        public_id = f"{dossier}/{base_propre}_{suffixe}" if dossier else f"{base_propre}_{suffixe}"

        resultat = cloudinary.uploader.upload(
            content,
            public_id=public_id,          # jamais d'extension ici : Cloudinary la détecte seul
            resource_type="image",
            overwrite=False,
            unique_filename=False,
        )
        return f"{resultat['public_id']}.{resultat['format']}"

    def _open(self, name, mode="rb"):
        raise NotImplementedError(
            "Lecture directe non nécessaire : les fichiers sont servis via leur URL Cloudinary."
        )

    def url(self, name):
        # `name` EST déjà le chemin de livraison exact (voir docstring ci-dessus) :
        # on ne le modifie surtout pas, ni ajout ni retrait d'extension.
        url, _options = cloudinary.utils.cloudinary_url(name, secure=True, resource_type="image")
        return url

    def exists(self, name):
        return False

    def size(self, name):
        return 0

    def delete(self, name):
        # Ici seulement, on retire UNE extension pour retrouver le vrai public_id Cloudinary
        # (qu'il s'agisse d'une image au nouveau format ou d'une ancienne image corrigée).
        public_id, _ext = os.path.splitext(name)
        try:
            cloudinary.uploader.destroy(public_id, resource_type="image")
        except Exception:
            pass

    def get_available_name(self, name, max_length=None):
        return name