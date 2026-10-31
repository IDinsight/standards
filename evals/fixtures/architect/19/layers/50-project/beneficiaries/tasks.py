import json
import logging
import urllib.request

from celery import shared_task
from django.conf import settings

from .models import Beneficiary

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_registration_sms(self, beneficiary_id):
    beneficiary = Beneficiary.objects.select_related("village").get(pk=beneficiary_id)
    if not beneficiary.phone:
        return
    payload = json.dumps(
        {
            "to": beneficiary.phone,
            "template": "registration",
            "params": {"name": beneficiary.full_name, "village": beneficiary.village.name},
        }
    ).encode()
    request = urllib.request.Request(
        settings.SMS_GATEWAY_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.SMS_GATEWAY_TOKEN}",
        },
    )
    try:
        urllib.request.urlopen(request, timeout=10)
    except OSError as exc:
        logger.warning("Registration SMS for beneficiary %s failed: %s", beneficiary_id, exc)
        raise self.retry(exc=exc)
