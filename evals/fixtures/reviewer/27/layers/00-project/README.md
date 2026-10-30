# helpdesk

Ticket service for the support desk.

- Staff create and update tickets and see the internal view.
- Customers can only read a ticket and see the public view (id, title,
  priority, status).

Tickets are kept in memory by `TicketService` (`src/service.js`); the route
functions in `src/api.js` return `{ status, body }`.

Run the tests with `npm test`.
