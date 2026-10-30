# Contributing

Notes for anyone, including coding agents, changing the records service.
Setup and the test command are in [README.md](README.md).

## Route handlers

- Put each area's handlers in `src/routes/<area>.ts` and register them from
  `createApp` in `src/app.ts`.
- Check roles on the server as the handler's first statement, with
  `authorize(request.user, roles)` or `requireAdmin(request.user)` from
  `src/auth/authorize.ts`.
- Throw `HttpError` for client errors; the router turns it into a JSON error
  response with that status.
- Return responses with `json()` from `src/http/messages.ts`. The router only
  sends JSON bodies.
- Keep handlers synchronous; the router does not await them.
