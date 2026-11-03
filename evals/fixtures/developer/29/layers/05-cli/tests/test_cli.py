from parcels.cli import main


def test_main_prints_summary(tmp_path, capsys):
    path = tmp_path / "parcels.csv"
    path.write_text("parcel_id,destination,weight_grams\np1,NL,1200\np2,DE,500\n")
    assert main([str(path)]) == 0
    out = capsys.readouterr().out.splitlines()
    assert out[0].split()[:4] == ["destination", "zone", "parcels", "weight_kg"]
    assert out[1].split()[:4] == ["DE", "A", "1", "0.500"]


def test_main_usage(capsys):
    assert main([]) == 2
    assert "usage" in capsys.readouterr().err
