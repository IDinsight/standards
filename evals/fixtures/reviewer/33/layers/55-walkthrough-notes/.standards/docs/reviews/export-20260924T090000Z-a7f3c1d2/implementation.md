# CSV export: implementation walkthrough

Notes for the Thursday walkthrough with the records-admin team (Dana, Li,
Marco) before the export goes to the ops channel.

## Agenda

1. Demo `POST /records/export` as an admin with `owner=dana`, then open the
   file in Excel and LibreOffice. Record 1 has a comma in its title and
   record 3 has double quotes; both should land in a single cell.
2. Show where files go (`exports/`, ignored by git) and how the admin tool
   will hand them out.
3. Show what an editor and a viewer get when they try it.

## Questions from ops

- Who cleans up old files in `exports/`? Not part of this change; Marco to
  raise retention separately.
- Two exports in the same second overwrite each other. Fine for now?
- Do we want the export linked from the usage guide straight away?

## Follow-ups

- Li: check how the admin tool sets the download file name.
- Dana: confirm with ops that CRLF line endings are what they expect.
