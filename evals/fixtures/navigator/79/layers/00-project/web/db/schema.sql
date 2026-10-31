CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'volunteer' CHECK (role IN ('admin', 'coordinator', 'volunteer')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text NOT NULL,
  starts_at timestamptz NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0)
);

CREATE TABLE registrations (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  registration_open boolean NOT NULL DEFAULT true,
  support_email text NOT NULL
);

CREATE TABLE admin_log (
  id bigserial PRIMARY KEY,
  actor_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL,
  target_id text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
