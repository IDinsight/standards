"""Run an import from uploaded bytes to a stored record."""

import io
from pathlib import Path

from app.imports.parser import ParseError, parse_csv


class ImportService:
    def __init__(self, store, upload_dir):
        self.store = store
        self.upload_dir = Path(upload_dir)

    def create(self, filename, content):
        try:
            text = content.decode("utf-8-sig")
        except UnicodeDecodeError:
            raise ParseError("file must be UTF-8 encoded") from None
        rows = parse_csv(io.StringIO(text, newline=""))
        record = self.store.create(filename, status="completed", row_count=len(rows))
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        (self.upload_dir / f"{record['id']}.csv").write_bytes(content)
        return record

    def get(self, import_id):
        return self.store.get(import_id)
