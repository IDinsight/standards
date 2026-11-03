import configparser

from pacer.readable import parse_readable

DEFAULT_WORK = 25 * 60
DEFAULT_BREAK = 5 * 60


def load_settings(raw):
    """Build settings from a mapping of strings, e.g. the [pacer] ini section."""
    return {
        "work": parse_readable(raw.get("work", ""), default=DEFAULT_WORK),
        "break": parse_readable(raw.get("break", ""), default=DEFAULT_BREAK),
    }


def load_file(path):
    parser = configparser.ConfigParser()
    parser.read(path)
    raw = dict(parser["pacer"]) if parser.has_section("pacer") else {}
    return load_settings(raw)
