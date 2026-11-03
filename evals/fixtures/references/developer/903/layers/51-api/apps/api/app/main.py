from fastapi import FastAPI, HTTPException
from shared import normalize_code

from app.schemas import Survey, SurveyCreate
from app.store import SurveyStore

app = FastAPI(title="Fieldwork survey API")
store = SurveyStore()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/surveys", response_model=list[Survey])
def list_surveys() -> list[Survey]:
    return store.all_surveys()


@app.post("/surveys", response_model=Survey, status_code=201)
def create_survey(body: SurveyCreate) -> Survey:
    survey = store.create(normalize_code(body.code), body.title)
    if survey is None:
        raise HTTPException(status_code=409, detail="Survey code already exists")
    return survey


@app.get("/surveys/{code}", response_model=Survey)
def get_survey(code: str) -> Survey:
    survey = store.get(normalize_code(code))
    if survey is None:
        raise HTTPException(status_code=404, detail="Survey not found")
    return survey
