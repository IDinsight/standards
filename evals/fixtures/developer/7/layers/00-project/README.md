# order-desk

Internal order administration for the shop's support staff.

## Running

    npm start     # listens on PORT (default 3000) with sample orders
    npm test

## Access

Every route under `/admin` requires a signed-in staff session (`sid` cookie,
see `src/sessions.js` and `src/auth.js`). Requests without one are redirected
to `/login`. Order pages show the customer's name, email, phone, and delivery
address, so order and customer data is only ever served under `/admin`.

Sign-in itself is handled by the company SSO gateway, which serves `/login`
and calls `createSession` for staff accounts.

## Layout

- `src/app.js` — request routing
- `src/auth.js`, `src/sessions.js` — staff session lookup
- `src/store.js` — in-memory order store
- `src/views.js` — HTML rendering
- `test/` — `node:test` suites
