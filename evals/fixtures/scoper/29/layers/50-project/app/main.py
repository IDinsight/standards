from fastapi import FastAPI

from app.routers import assignments, enumerators

app = FastAPI(title="fieldops-api")
app.include_router(enumerators.router)
app.include_router(assignments.router)


@app.get("/health")
def health():
    return {"status": "ok"}
