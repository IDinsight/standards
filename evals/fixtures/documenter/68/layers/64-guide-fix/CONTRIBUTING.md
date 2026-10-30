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
- Return an `AppResponse` (`src/http/messages.ts`). Use `json(status, data)`
  for JSON bodies; a handler that returns another format builds the response
  itself, with its own `content-type` header and a string body. The router
  passes the handler's response through unchanged.
- Keep handlers synchronous; the router does not await them.
