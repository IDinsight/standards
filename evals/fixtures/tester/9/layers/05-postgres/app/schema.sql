CREATE TABLE IF NOT EXISTS records (
    id bigserial PRIMARY KEY,
    title text NOT NULL,
    owner text NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'archived')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS records_owner_idx ON records (owner);
