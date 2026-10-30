-- Customers whose name or email contains the search text.
select
  c.id,
  c.name,
  c.email,
  count(o.id) as order_count
from customers c
left join orders o on o.customer_id = c.id
where c.name ilike '%' || $1 || '%'
  or c.email ilike '%' || $1 || '%'
group by c.id, c.name, c.email
order by c.name
limit 25
