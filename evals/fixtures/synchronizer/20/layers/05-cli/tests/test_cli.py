from partner_export import __main__ as cli


def test_usage_without_output_path(capsys):
    assert cli.main([]) == 2
    assert "usage" in capsys.readouterr().err
