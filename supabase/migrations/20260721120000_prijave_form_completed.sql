-- "Form completed" was previously derived from licence_categories being a
-- non-empty array, which broke the moment Redno usposabljanje stopped
-- collecting a licence category at all (it's Začetna-only now) — every
-- completed Redno registration was showing as "Manjka" in admin. A
-- dedicated flag, set once by completeRegistration regardless of program,
-- is the reliable signal.
alter table prijave add column form_completed boolean not null default false;
