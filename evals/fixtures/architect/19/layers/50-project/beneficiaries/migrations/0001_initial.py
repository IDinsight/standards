import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Village",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=16, unique=True)),
                ("name", models.CharField(max_length=120)),
                ("district", models.CharField(max_length=120)),
            ],
            options={"ordering": ["code"]},
        ),
        migrations.CreateModel(
            name="Beneficiary",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("national_id", models.CharField(max_length=32, unique=True)),
                ("full_name", models.CharField(max_length=200)),
                ("sex", models.CharField(choices=[("F", "Female"), ("M", "Male"), ("X", "Other")], max_length=1)),
                ("date_of_birth", models.DateField()),
                ("phone", models.CharField(blank=True, max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "village",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="beneficiaries",
                        to="beneficiaries.village",
                    ),
                ),
            ],
            options={"verbose_name_plural": "beneficiaries"},
        ),
    ]
