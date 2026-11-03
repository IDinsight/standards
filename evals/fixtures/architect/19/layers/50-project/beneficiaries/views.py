from django.db import transaction
from rest_framework import viewsets

from .models import Beneficiary, Village
from .serializers import BeneficiarySerializer, VillageSerializer
from .tasks import send_registration_sms


class BeneficiaryViewSet(viewsets.ModelViewSet):
    queryset = Beneficiary.objects.select_related("village").order_by("id")
    serializer_class = BeneficiarySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        code = self.request.query_params.get("village")
        if code:
            queryset = queryset.filter(village__code=code)
        return queryset

    def perform_create(self, serializer):
        beneficiary = serializer.save(created_by=self.request.user)
        transaction.on_commit(lambda: send_registration_sms.delay(beneficiary.pk))


class VillageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Village.objects.all()
    serializer_class = VillageSerializer
