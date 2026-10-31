import json
import sqlite3
from dataclasses import dataclass


@dataclass(frozen=True)
class Survey:
    id: int
    slug: str
    title: str
    is_open: bool


@dataclass(frozen=True)
class StoredResponse:
    id: int
    survey_id: int
    respondent_ref: str
    answers: dict[str, str]
    submitted_at: str


@dataclass(frozen=True)
class ApiKey:
    id: int
    name: str
    revoked: bool


def _last_id(cursor: sqlite3.Cursor) -> int:
    if cursor.lastrowid is None:
        raise RuntimeError("insert did not return a row id")
    return cursor.lastrowid


def _to_response(row: sqlite3.Row) -> StoredResponse:
    return StoredResponse(
        id=row["id"],
        survey_id=row["survey_id"],
        respondent_ref=row["respondent_ref"],
        answers=json.loads(row["answers"]),
        submitted_at=row["submitted_at"],
    )


class Repository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn

    def survey_by_slug(self, slug: str) -> Survey | None:
        row = self.conn.execute(
            "SELECT id, slug, title, is_open FROM surveys WHERE slug = ?", (slug,)
        ).fetchone()
        if row is None:
            return None
        return Survey(row["id"], row["slug"], row["title"], bool(row["is_open"]))

    def add_survey(self, slug: str, title: str, is_open: bool = True) -> Survey:
        cursor = self.conn.execute(
            "INSERT INTO surveys (slug, title, is_open) VALUES (?, ?, ?)",
            (slug, title, int(is_open)),
        )
        self.conn.commit()
        return Survey(_last_id(cursor), slug, title, is_open)

    def add_response(
        self, survey_id: int, respondent_ref: str, answers: dict[str, str]
    ) -> StoredResponse:
        cursor = self.conn.execute(
            "INSERT INTO responses (survey_id, respondent_ref, answers) VALUES (?, ?, ?)",
            (survey_id, respondent_ref, json.dumps(answers, sort_keys=True)),
        )
        self.conn.commit()
        row = self.conn.execute(
            "SELECT id, survey_id, respondent_ref, answers, submitted_at FROM responses WHERE id = ?",
            (_last_id(cursor),),
        ).fetchone()
        return _to_response(row)

    def responses_for(self, survey_id: int) -> list[StoredResponse]:
        rows = self.conn.execute(
            "SELECT id, survey_id, respondent_ref, answers, submitted_at FROM responses "
            "WHERE survey_id = ? ORDER BY id",
            (survey_id,),
        ).fetchall()
        return [_to_response(row) for row in rows]

    def api_key_by_hash(self, key_hash: str) -> ApiKey | None:
        row = self.conn.execute(
            "SELECT id, name, revoked_at FROM api_keys WHERE key_hash = ?", (key_hash,)
        ).fetchone()
        if row is None:
            return None
        return ApiKey(row["id"], row["name"], row["revoked_at"] is not None)

    def add_api_key(self, name: str, key_hash: str) -> int:
        cursor = self.conn.execute(
            "INSERT INTO api_keys (name, key_hash) VALUES (?, ?)", (name, key_hash)
        )
        self.conn.commit()
        return _last_id(cursor)

    def revoke_api_key(self, key_id: int) -> None:
        self.conn.execute(
            "UPDATE api_keys SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?", (key_id,)
        )
        self.conn.commit()
