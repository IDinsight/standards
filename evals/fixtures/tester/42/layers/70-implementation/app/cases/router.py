import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session

from app.auth.deps import CurrentUser
from app.cases.model import Case, Summary
from app.llm.client import Completion, LLMClient, LLMError, RateLimitedError, get_llm_client
from app.utils.database import SessionDep

router = APIRouter(prefix="/cases", tags=["cases"])

SUMMARY_TOOL_NAME = "record_summary"
SUMMARY_TOOL = {
    "type": "function",
    "function": {
        "name": SUMMARY_TOOL_NAME,
        "description": "Record the summary of the case notes.",
        "parameters": {
            "type": "object",
            "properties": {"summary": {"type": "string", "description": "At most three sentences."}},
            "required": ["summary"],
            "additionalProperties": False,
        },
    },
}
SUMMARY_INSTRUCTIONS = (
    "You summarize case notes for caseworkers. Call record_summary with a plain, "
    "factual summary of at most three sentences. Do not add facts that are not in the notes."
)


class CaseRead(BaseModel):
    id: int
    title: str
    notes: str


class SummaryRead(BaseModel):
    id: int
    case_id: int
    summary: str
    created_at: datetime


def _owned_case(session: Session, case_id: int, user) -> Case:
    case = session.get(Case, case_id)
    if case is None or case.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


def _parse_summary(completion: Completion) -> str | None:
    for call in completion.tool_calls:
        if call.name != SUMMARY_TOOL_NAME:
            continue
        try:
            arguments = json.loads(call.arguments)
        except json.JSONDecodeError:
            return None
        summary = arguments.get("summary") if isinstance(arguments, dict) else None
        if isinstance(summary, str) and summary.strip():
            return summary.strip()
        return None
    return None


@router.get("/{case_id}", response_model=CaseRead)
def get_case(case_id: int, session: SessionDep, user: CurrentUser):
    case = _owned_case(session, case_id, user)
    return CaseRead(id=case.id, title=case.title, notes=case.notes)


@router.post("/{case_id}/summary", status_code=status.HTTP_201_CREATED, response_model=SummaryRead)
async def create_summary(
    case_id: int,
    session: SessionDep,
    user: CurrentUser,
    llm: LLMClient = Depends(get_llm_client),
):
    case = _owned_case(session, case_id, user)
    try:
        completion = await llm.complete(
            messages=[
                {"role": "system", "content": SUMMARY_INSTRUCTIONS},
                {"role": "user", "content": f"Title: {case.title}\n\nNotes:\n{case.notes}"},
            ],
            tools=[SUMMARY_TOOL],
            tool_choice={"type": "function", "function": {"name": SUMMARY_TOOL_NAME}},
        )
    except RateLimitedError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Summary service is busy; try again later.",
            headers={"Retry-After": str(exc.retry_after)},
        ) from exc
    except LLMError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Summary service is unavailable.",
        ) from exc

    text = _parse_summary(completion)
    if text is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Summary service returned an invalid summary.",
        )

    summary = Summary(case_id=case.id, text=text)
    session.add(summary)
    session.commit()
    session.refresh(summary)
    return SummaryRead(id=summary.id, case_id=summary.case_id, summary=summary.text, created_at=summary.created_at)
