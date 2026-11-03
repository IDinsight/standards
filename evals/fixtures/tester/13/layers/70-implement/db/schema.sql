CREATE TABLE IF NOT EXISTS records (
  id integer PRIMARY KEY,
  title text NOT NULL,
  owner text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'archived')),
  created_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS export_jobs (
  id serial PRIMARY KEY,
  filter jsonb NOT NULL,
  file_name text NOT NULL,
  row_count integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);
