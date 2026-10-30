"""Print the effective settings, one per line."""

from shelf.config import load


def main():
    settings = load()
    for key in sorted(settings):
        print(f"{key} = {settings[key]}")


if __name__ == "__main__":
    main()
