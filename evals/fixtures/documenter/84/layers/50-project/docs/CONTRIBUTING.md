# Writing reportkit documentation

Guides live in `docs/` and are written for operators who use the library.

- Take defaults and accepted values from `reportkit/config.py`, not from
  earlier guides.
- Keep Python examples runnable. `python3 -m doctest docs/<guide>.md` must
  pass. Leave a blank line before a closing code fence so doctest stops reading
  the expected output there.
- Link to other documents with relative paths.
  `python3 scripts/check_links.py docs/<guide>.md` must pass.

## Corrections after review

When a review of a guide revision finds statements that are wrong, fix them in
the guide and record them in `docs/ERRATA.md`, so operators who read the
earlier revision can see what changed.

- Add one entry per review, once that review is finished, listing every
  statement the review led you to correct: the section, what the guide said,
  and what it says now.
- Do not add or extend an entry while the review is still in progress. Later
  sections often turn up more corrections, and a partial entry tends to be left
  incomplete.
