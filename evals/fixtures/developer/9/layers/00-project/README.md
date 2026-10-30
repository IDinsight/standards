# bookmarks-service

Small JSON API for saving bookmarks.

- `GET /bookmarks` lists bookmarks.
- `POST /bookmarks` adds a bookmark (`url`, `title`, optional `tags`).

Data lives in the JSON file named by `BOOKMARKS_FILE` (default
`data/bookmarks.json`).

Run `npm start` to serve on `PORT` (default 3000) and `npm test` to run the
tests.
