import cloudinary.uploader
import cloudinary.utils
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class CloudinaryStorage(Storage):
    """Stockage des fichiers médias directement via le SDK Cloudinary,
    sans dépendre du paquet django-cloudinary-storage (incompatible avec
    le système STORAGES de Django 6.1)."""

    def _save(self, name, content):
        resultat = cloudinary.uploader.upload(
            content,
            public_id=name,
            resource_type="auto",
            overwrite=True,
            unique_filename=False,
        )
        return resultat["public_id"]

    def _open(self, name, mode="rb"):
        raise NotImplementedError("Lecture directe non nécessaire : les fichiers sont servis via leur URL Cloudinary.")

    def url(self, name):
        url, _ = cloudinary.utils.cloudinary_url(name)
        return url

    def exists(self, name):
        # Toujours False : laisse Cloudinary gérer l'écrasement (overwrite=True ci-dessus)
        # plutôt que Django ne cherche à renommer le fichier.
        return False

    def size(self, name):
        return 0

    def delete(self, name):
        cloudinary.uploader.destroy(name)

    def get_available_name(self, name, max_length=None):
        return name