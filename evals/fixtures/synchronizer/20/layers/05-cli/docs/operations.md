# Running the partner export

The partner export writes the weekly CSV file of active customer accounts
that is sent to reseller partners. Operations runs it every Monday morning,
after the billing system's Sunday-night dump has arrived.

## Source

The export reads the billing system's nightly dump at
`data/legacy/accounts.tsv`. Production mounts the billing drop folder at that
path; the repository copy is sample data for local runs.

The dump is tab-separated with a header row: `account_id`, `name`, `country`,
`status`, and `updated` (the day the account last changed, as DD/MM/YYYY).

## Running

    mkdir -p out
    python3 -m partner_export out/partners.csv

The command prints `wrote out/partners.csv` when it finishes.

## Output

- Header row `account_id,name,country,updated_on`.
- Only accounts whose status is `active`, ordered by `account_id`.
- `updated_on` is written as YYYY-MM-DD.
- Fields containing a comma or double quote are quoted; rows end with CRLF.
