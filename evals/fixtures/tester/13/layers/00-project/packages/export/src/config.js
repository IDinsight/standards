export const DEFAULT_DATABASE_URL = 'postgres://records@127.0.0.1:5432/records_test';

export function databaseUrl(env = process.env) {
  return env.DATABASE_URL || DEFAULT_DATABASE_URL;
}
