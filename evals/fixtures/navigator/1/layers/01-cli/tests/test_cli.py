from cli import main, parse_args


def test_defaults():
    args = parse_args(["a.csv"])
    assert (args.files, args.db, args.batch_size, args.dry_run) == (["a.csv"], "ledger.db", 500, False)


def test_exit_code_reflects_rejections(tmp_path, capsys):
    source = tmp_path / "a.csv"
    source.write_text("id,date,account,amount\nt1,2026-01-02,cash,oops\n", encoding="utf-8")
    assert main(["--dry-run", str(source)]) == 1
    assert "rejected 1" in capsys.readouterr().out
