"""Issue and revoke API keys.

    python -m app.keys create <name>
    python -m app.keys revoke <id>
"""

import secrets
import sys

from app.auth import hash_key
from app.config import load_settings
from app.persistence.db import connect
from app.persistence.repository import Repository


def main(argv: list[str]) -> int:
    repo = Repository(connect(load_settings().database_path))
    if len(argv) == 2 and argv[0] == "create":
        raw = secrets.token_urlsafe(32)
        key_id = repo.add_api_key(argv[1], hash_key(raw))
        print(f"key {key_id} for {argv[1]}: {raw}")
        print("Store it now; only its hash is kept.")
        return 0
    if len(argv) == 2 and argv[0] == "revoke":
        repo.revoke_api_key(int(argv[1]))
        print(f"key {argv[1]} revoked")
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
