-- Most recent orders for the orders page.
select
  o.id,
  o.placed_at,
  o.status,
  o.total_cents
from orders o
order by o.placed_at desc
limit $1
