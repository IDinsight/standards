# shortlinks

A tiny short-link redirector. Links are defined in `links.json`; a visit to
`/<code>` redirects to the link's URL, answers 410 once the link has expired,
or 404 for an unknown code.

- Start: `npm start` (listens on `PORT`, default 8080)
- Test: `npm test`
