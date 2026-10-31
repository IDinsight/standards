# pacer

A small work/break timer. Durations in settings are written in a readable
form such as `25m` or `1h 30m`.

- `pacer/readable.py`: the readable parser; turns `1h 30m` into seconds.
- `pacer/config.py`: builds timer settings from a mapping or an ini file.

Run tests with `python3 -m pytest`.
