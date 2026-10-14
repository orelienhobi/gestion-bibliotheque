from rest_framework.permissions import BasePermission


class EstResponsable(BasePermission):
    """Autorise uniquement les utilisateurs staff (le responsable)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)