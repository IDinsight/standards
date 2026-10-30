from shelf.config import load


def test_defaults():
    assert load(environ={}) == {"host": "127.0.0.1", "port": 8080, "debug": False}


def test_env_overrides_default():
    settings = load(environ={"SHELF_PORT": "9000", "SHELF_DEBUG": "true"})
    assert settings["port"] == 9000
    assert settings["debug"] is True


def test_unrelated_variables_ignored():
    assert load(environ={"PORT": "1"})["port"] == 8080
