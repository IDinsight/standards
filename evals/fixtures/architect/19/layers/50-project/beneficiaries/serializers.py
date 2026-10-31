import re
from datetime import date

from rest_framework import serializers

from .models import Beneficiary, Village

PHONE_RE = re.compile(r"^\+?[0-9]{7,15}$")


class VillageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Village
        fields = ["code", "name", "district"]


class BeneficiarySerializer(serializers.ModelSerializer):
    village = serializers.SlugRelatedField(slug_field="code", queryset=Village.objects.all())

    class Meta:
        model = Beneficiary
        fields = [
            "id",
            "national_id",
            "full_name",
            "sex",
            "date_of_birth",
            "phone",
            "village",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_date_of_birth(self, value):
        if value > date.today():
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        return value

    def validate_phone(self, value):
        value = value.replace(" ", "")
        if value and not PHONE_RE.match(value):
            raise serializers.ValidationError("Enter a phone number of 7 to 15 digits.")
        return value
