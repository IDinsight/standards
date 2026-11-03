FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential default-libmysqlclient-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN DJANGO_SECRET_KEY=build python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "registry.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60"]
