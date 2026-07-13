-- Registration codes were sequential (TC-1000, TC-1001, ...) and are the
-- sole key used to view/complete a registration via URL, with no other
-- auth — sequential codes make every other registration trivially
-- enumerable. Switched to 5 random alphanumeric characters instead
-- (31^5 ≈ 28.6M combinations), drawn from a charset with ambiguous
-- characters removed (0/O, 1/I/L) since these get read/typed by hand.
-- Loops until it finds an unused code — collisions are rare at this
-- charset size but the unique constraint on registration_code means a
-- silent duplicate is not an option.

create or replace function generate_registration_code()
returns text
language plpgsql
as $$
declare
  chars text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  candidate text;
  already_used boolean;
begin
  loop
    candidate := 'TC-';
    for i in 1..5 loop
      candidate := candidate || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    select exists(select 1 from prijave where registration_code = candidate) into already_used;
    exit when not already_used;
  end loop;
  return candidate;
end;
$$;

drop sequence if exists registration_code_seq;
