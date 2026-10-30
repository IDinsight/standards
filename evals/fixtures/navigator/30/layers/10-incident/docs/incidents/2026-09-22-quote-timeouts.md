# Quote timeouts on 2026-09-22

Support reported that some customers saw "quote unavailable, try again later"
on the quote page during the afternoon of 2026-09-22 (UTC), on and off rather
than in one continuous outage.

- Service: quote-service, one instance, running the code on `main` for the
  whole window. There was no deploy or configuration change that day, so the
  defaults in `src/config.js` were in effect.
- Window: 14:00-16:45 UTC.
- Log export: `service-2026-09-22.log` in this folder is the service log for
  the window, copied from `var/log/quotes.log` on the instance. It contains six
  failed quotes, all 504.
- Cause: not yet identified.
