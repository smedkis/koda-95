-- Tracks how a registration came in (public quick-form, admin manual add,
-- or a bulk "Pošlji obvestilo" email link) so it can be reported on — the
-- driver's own history log already noted "Vir: Obveščanje" as free text,
-- but that's not something Statistika can group/filter by. Nullable since
-- registrations created before this column existed have no known source.
alter table prijave add column source text;
