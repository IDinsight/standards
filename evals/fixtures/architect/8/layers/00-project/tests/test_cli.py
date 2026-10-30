import io
import json

from ledgerctl.cli import NOT_AUTHENTICATED, main


class FakeClient:
    instances = []

    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        FakeClient.instances.append(self)

    def whoami(self):
        return {"email": "ada@example.com"}

    def balances(self):
        return [{"account": "operating", "amount": "1200.00"}]


def run(argv):
    out = io.StringIO()
    code = main(argv, client_factory=FakeClient, out=out)
    return code, out.getvalue()


def test_whoami_uses_flag_token():
    code, output = run(["--token", "tok-flag", "whoami"])
    assert code == 0
    assert output == "ada@example.com\n"
    assert FakeClient.instances[-1].token == "tok-flag"


def test_env_token_used_without_flag(monkeypatch):
    monkeypatch.setenv("LEDGERCTL_TOKEN", "tok-env")
    assert run(["whoami"])[0] == 0
    assert FakeClient.instances[-1].token == "tok-env"


def test_flag_wins_over_env(monkeypatch):
    monkeypatch.setenv("LEDGERCTL_TOKEN", "tok-env")
    run(["--token", "tok-flag", "whoami"])
    assert FakeClient.instances[-1].token == "tok-flag"


def test_missing_token_exits_2(capsys):
    code, output = run(["whoami"])
    assert code == 2
    assert output == ""
    assert NOT_AUTHENTICATED in capsys.readouterr().err


def test_balances_json():
    code, output = run(["--token", "t", "balances", "--format", "json"])
    assert code == 0
    assert json.loads(output) == [{"account": "operating", "amount": "1200.00"}]


def test_config_set_then_get():
    assert run(["config", "default_format", "json"])[0] == 0
    assert run(["config", "default_format"]) == (0, "json\n")
