# Operations guide

Day-to-day tasks for the support team and the administrators who run the
records admin tool. Request and response formats are described in
[usage.md](usage.md).

## Accounts and roles

Support staff sign in with `viewer` accounts, team leads who correct records
use `editor` accounts, and a small group of administrators hold `admin`
accounts. Roles are assigned in the identity system, not in this service;
the service reads the signed-in user's role on every request.

## Looking up records

When someone asks about a record, search the titles with `q` and narrow the
list by owner or status:

    GET /records?q=lease&status=active

Every signed-in role can list and search records. An unknown `status`
returns `400`; the only values are `active` and `archived`.

## Exporting records

The export writes the filtered records list to a CSV file that opens in any
spreadsheet program, and returns the same CSV in the response. Titles that
contain commas, double quotes, or line breaks are quoted, so each one stays
in a single cell.

The export takes the same filters as the records list:

    POST /records/export?status=active&owner=marco

Files are written to the service's `exports/` folder as
`records-<YYYYMMDDTHHMMSSZ>.csv` (UTC time of the request). Two exports in
the same second share a file name, and the later one replaces the earlier
file. Old export files are not removed automatically.

Any signed-in user can export the records list.

For a spreadsheet request, support staff run the admin export command from
their `viewer` account: `POST /records/export` with the requester's filters.
Send the requester the file it writes.

## When a request fails

| Status | Meaning                         | What to do                      |
| ------ | ------------------------------- | ------------------------------- |
| 400    | Invalid filter value            | Check the `status` spelling     |
| 401    | No signed-in user               | Sign in again                   |
| 403    | Role not allowed for this route | Ask an administrator            |
| 404    | Unknown path                    | Check the path against usage.md |
