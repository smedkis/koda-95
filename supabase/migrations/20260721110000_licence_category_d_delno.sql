-- Adds a third licence category alongside C and D: "D - delno" (partial D),
-- selectable everywhere categoryC/categoryD already are (public /obrazec
-- form, admin driver edit).
alter type licence_category add value 'D-delno';
