from rest_framework.routers import DefaultRouter

from .views import BeneficiaryViewSet, VillageViewSet

router = DefaultRouter()
router.register("beneficiaries", BeneficiaryViewSet)
router.register("villages", VillageViewSet)

urlpatterns = router.urls
