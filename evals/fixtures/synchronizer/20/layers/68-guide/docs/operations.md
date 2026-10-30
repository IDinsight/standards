# Running the partner export

The partner export writes the weekly CSV file of active customer accounts
that is sent to reseller partners. Operations runs it every Monday morning.

## Source

The export reads the accounts feed at `data/feed/accounts.jsonl`, published
by the accounts service. Production mounts the accounts service's drop folder
at `data/feed/`; the repository copy is sample data for local runs. The
billing system's TSV dump is no longer read.

The feed has one JSON object per line. The export uses these fields:

| Field        | Use                                                                |
| ------------ | ------------------------------------------------------------------ |
| `id`         | the `account_id` column (an integer)                               |
| `name`       | the `name` column, with surrounding spaces removed                 |
| `country`    | the `country` column, upper-cased                                  |
| `status`     | only `active` accounts are exported (compared case-insensitively)  |
| `updated_at` | ISO 8601 timestamp with a UTC offset; its UTC day is `updated_on`  |

Other fields are ignored, and blank lines are skipped.

## Running

    mkdir -p out
    python3 -m partner_export out/partners.csv

The command prints `wrote out/partners.csv` when it finishes.

## Output

- Header row `account_id,name,country,updated_on`.
- Only accounts whose status is `active`, ordered by `account_id`.
- `updated_on` is written as YYYY-MM-DD.
- Fields containing a comma or double quote are quoted; rows end with CRLF.

## When the export fails

The export reads the whole feed before it creates the output file. If the
feed cannot be read, it prints an error to standard error, exits with status
1, and writes no output file:

- A line that is not valid JSON, is not an object, lacks one of the fields
  above, or has an invalid `id` or `updated_at` (including a timestamp without
  a UTC offset): `error: <feed path>:<line>: <reason>`, where `<line>` counts
  from 1. For example:
  `error: /srv/partner-export/data/feed/accounts.jsonl:2: invalid JSON (Expecting value)`.
- A missing or unreadable feed file: `error:` followed by the system message,
  which names the file.

Fix or replace the feed and run the export again; there is no partial file to
clean up.
