FROM python:3.12-slim

WORKDIR /srv/api
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY migrations ./migrations

RUN useradd --create-home appuser && mkdir -p var && chown appuser var
USER appuser

EXPOSE 8000
CMD ["sh", "-c", "python -m app.persistence.migrate && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
