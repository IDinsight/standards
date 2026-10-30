from export_cli.csvout import to_csv

RECORD = {"id": 4, "title": "Insurance renewal 2026", "owner": "marco", "status": "active", "createdAt": "2026-04-18T16:20:00Z"}


def test_header_then_one_crlf_terminated_row_per_record():
    assert to_csv([RECORD]) == (
        "id,title,owner,status,createdAt\r\n"
        "4,Insurance renewal 2026,marco,active,2026-04-18T16:20:00Z\r\n"
    )


def test_fields_with_commas_quotes_or_line_breaks_are_quoted():
    record = dict(RECORD, title='Budget, "draft"\nsecond line')
    assert '"Budget, ""draft""\nsecond line"' in to_csv([record])
