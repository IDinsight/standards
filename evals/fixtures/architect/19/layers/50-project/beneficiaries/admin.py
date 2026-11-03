from django.contrib import admin

from .models import Beneficiary, Village


@admin.register(Village)
class VillageAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "district")
    search_fields = ("code", "name")


@admin.register(Beneficiary)
class BeneficiaryAdmin(admin.ModelAdmin):
    list_display = ("national_id", "full_name", "village", "created_at")
    search_fields = ("national_id", "full_name")
    list_filter = ("village__district",)
