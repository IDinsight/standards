SAMPLE = [
    {"id": 3, "title": "Q2 accounts review", "owner": "dana", "status": "archived", "createdAt": "2026-04-01T08:05:00Z"},
    {"id": 1, "title": "Lease agreement, Building B", "owner": "dana", "status": "active", "createdAt": "2026-03-02T10:15:00Z"},
    {"id": 2, "title": "Vendor onboarding checklist", "owner": "li", "status": "active", "createdAt": "2026-03-09T14:40:00Z"},
]


def test_writes_selected_records_to_file(run_cli, records_file, tmp_path):
    records_file(SAMPLE)
    result = run_cli("--status", "active", "--output", "out.csv")
    assert result.returncode == 0
    assert (tmp_path / "out.csv").read_text(encoding="utf-8").splitlines() == [
        "id,title,owner,status,createdAt",
        '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z',
        "2,Vendor onboarding checklist,li,active,2026-03-09T14:40:00Z",
    ]


def test_reads_dump_named_by_environment(run_cli, records_file, tmp_path):
    dump = records_file(SAMPLE, name="dump.json")
    result = run_cli("--owner", "dana", "--output", "out.csv", env={"RECORDS_FILE": str(dump)})
    assert result.returncode == 0
    lines = (tmp_path / "out.csv").read_text(encoding="utf-8").splitlines()
    assert [line.split(",")[0] for line in lines[1:]] == ["1", "3"]
