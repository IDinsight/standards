from shelf.config import load


def test_defaults(tmp_path):
    settings = load(path=str(tmp_path / "missing.ini"), environ={})
    assert settings == {"host": "127.0.0.1", "port": 8080, "debug": False}


def test_env_overrides_default(tmp_path):
    settings = load(path=str(tmp_path / "missing.ini"), environ={"SHELF_PORT": "9000", "SHELF_DEBUG": "true"})
    assert settings["port"] == 9000
    assert settings["debug"] is True


def test_unrelated_variables_ignored(tmp_path):
    assert load(path=str(tmp_path / "missing.ini"), environ={"PORT": "1"})["port"] == 8080


def test_file_values(tmp_path):
    ini = tmp_path / "shelf.ini"
    ini.write_text("[server]\nhost = 0.0.0.0\nport = 5050\n")
    settings = load(path=str(ini), environ={})
    assert settings["host"] == "0.0.0.0"
    assert settings["port"] == 5050
    assert settings["debug"] is False
