from django.conf import settings
from django.db import models


class Village(models.Model):
    code = models.CharField(max_length=16, unique=True)
    name = models.CharField(max_length=120)
    district = models.CharField(max_length=120)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} {self.name}"


class Beneficiary(models.Model):
    class Sex(models.TextChoices):
        FEMALE = "F", "Female"
        MALE = "M", "Male"
        OTHER = "X", "Other"

    national_id = models.CharField(max_length=32, unique=True)
    full_name = models.CharField(max_length=200)
    sex = models.CharField(max_length=1, choices=Sex.choices)
    date_of_birth = models.DateField()
    phone = models.CharField(max_length=20, blank=True)
    village = models.ForeignKey(Village, on_delete=models.PROTECT, related_name="beneficiaries")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "beneficiaries"

    def __str__(self):
        return f"{self.national_id} {self.full_name}"
