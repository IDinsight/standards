CREATE TABLE surveys (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    is_open INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE responses (
    id INTEGER PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id),
    respondent_ref TEXT NOT NULL,
    answers TEXT NOT NULL,
    submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX responses_survey_id ON responses(survey_id);
