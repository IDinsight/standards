from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import include, path
from rest_framework.authtoken.views import obtain_auth_token


def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:
        return JsonResponse({"status": "unavailable"}, status=503)
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("beneficiaries.urls")),
    path("api/token/", obtain_auth_token),
    path("health/", health),
]
