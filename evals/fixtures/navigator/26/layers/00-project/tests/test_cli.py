from durfmt.cli import main


def test_parse_to_seconds(capsys):
    assert main(["1h30m"]) == 0
    assert capsys.readouterr().out == "5400\n"


def test_seconds_to_duration(capsys):
    assert main(["90000", "--largest", "h"]) == 0
    assert capsys.readouterr().out == "25h\n"


def test_invalid_duration(capsys):
    assert main(["1x"]) == 2
    assert "durfmt:" in capsys.readouterr().err
