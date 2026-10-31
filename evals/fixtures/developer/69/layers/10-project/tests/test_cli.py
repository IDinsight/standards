from tally.cli import main


def test_main_prints_top_words(tmp_path, capsys):
    path = tmp_path / "sample.txt"
    path.write_text("one two two three three three\n", encoding="utf-8")
    assert main([str(path), "-n", "2"]) == 0
    out = capsys.readouterr().out.splitlines()
    assert out == ["     3 three", "     2 two"]
