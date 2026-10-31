import csv

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from beneficiaries.models import Village

REQUIRED_COLUMNS = {"code", "name", "district"}


class Command(BaseCommand):
    help = "Load or update villages from a CSV file with columns code, name, district."

    def add_arguments(self, parser):
        parser.add_argument("path")

    def handle(self, *args, path, **options):
        with open(path, newline="", encoding="utf-8-sig") as handle:
            reader = csv.DictReader(handle)
            missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
            if missing:
                raise CommandError(f"Missing columns: {', '.join(sorted(missing))}")
            rows = list(reader)
        with transaction.atomic():
            for row in rows:
                Village.objects.update_or_create(
                    code=row["code"].strip(),
                    defaults={"name": row["name"].strip(), "district": row["district"].strip()},
                )
        self.stdout.write(self.style.SUCCESS(f"Loaded {len(rows)} villages."))
