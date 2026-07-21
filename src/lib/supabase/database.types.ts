// Hand-written to mirror supabase/migrations/20260701083219_initial_schema.sql,
// 20260701085511_termini_price_optional.sql,
// 20260713100000_termini_capacity_modul.sql,
// 20260713110000_termini_location_time_partial_prijave.sql,
// 20260713120000_narocniki.sql,
// 20260713140000_zacetna_location_time_optional.sql,
// 20260716090000_prijava_dogodki.sql,
// 20260720120000_admin_sessions.sql,
// 20260720140000_prijave_source.sql,
// 20260721110000_licence_category_d_delno.sql,
// 20260721120000_prijave_form_completed.sql, and
// 20260721130000_termin_reminder.sql. Keep in sync with any new migration.

export type ProgramKey = "redna-koda-95" | "zacetna-koda-95";
export type ResidenceType = "permanent" | "temporary";
export type LicenceCategory = "C" | "D" | "D-delno";
export type PayerType = "self" | "company";
export type PaymentStatus = "pending" | "paid";

export type TerminiRow = {
  id: string;
  program: ProgramKey;
  date: string;
  address: string | null;
  start_time: string | null;
  end_time: string | null;
  modul: number | null;
  capacity: number | null;
  price_eur: number | null;
  created_at: string;
  updated_at: string;
};

export type VozniciRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  country_of_birth: string | null;
  emso: string | null;
  citizenship: string | null;
  residence_type: ResidenceType | null;
  postal_code: string | null;
  city: string | null;
  street_address: string | null;
  created_at: string;
  updated_at: string;
};

export type PrijaveRow = {
  id: string;
  registration_code: string;
  termin_id: string;
  voznik_id: string;
  licence_categories: LicenceCategory[] | null;
  payer_type: PayerType;
  company_name: string | null;
  company_tax_number: string | null;
  company_email: string | null;
  consent_marketing: boolean;
  consent_terms: boolean | null;
  payment_status: PaymentStatus;
  form_completed: boolean;
  source: string | null;
  locale: string;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ObvescanjeRow = {
  id: string;
  registration_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  program: ProgramKey;
  termin_date: string;
  payer_type: PayerType;
  company_name: string | null;
  payment_status: PaymentStatus;
  consent_marketing: boolean;
  created_at: string;
};

export type PrijavaDogodkiRow = {
  id: string;
  prijava_id: string;
  message: string;
  created_at: string;
};

export type AdminSessionRow = {
  token: string;
  expires_at: string;
};

export type NarocnikiRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  source: string | null;
  voznik_id: string | null;
  last_notified_at: string | null;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      termini: {
        Row: TerminiRow;
        Insert: Partial<Omit<TerminiRow, "id" | "created_at" | "updated_at">> &
          Pick<TerminiRow, "program" | "date">;
        Update: Partial<Omit<TerminiRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      vozniki: {
        Row: VozniciRow;
        Insert: Partial<Omit<VozniciRow, "id" | "created_at" | "updated_at">> &
          Pick<VozniciRow, "full_name">;
        Update: Partial<Omit<VozniciRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      prijave: {
        Row: PrijaveRow;
        Insert: Partial<
          Omit<PrijaveRow, "id" | "registration_code" | "created_at" | "updated_at">
        > &
          Pick<PrijaveRow, "termin_id" | "voznik_id">;
        Update: Partial<
          Omit<PrijaveRow, "id" | "registration_code" | "created_at" | "updated_at">
        >;
        Relationships: [];
      };
      narocniki: {
        Row: NarocnikiRow;
        Insert: Partial<Omit<NarocnikiRow, "id" | "created_at">> & Pick<NarocnikiRow, "email">;
        Update: Partial<Omit<NarocnikiRow, "id" | "created_at">>;
        Relationships: [];
      };
      prijava_dogodki: {
        Row: PrijavaDogodkiRow;
        Insert: Partial<Omit<PrijavaDogodkiRow, "id" | "created_at">> &
          Pick<PrijavaDogodkiRow, "prijava_id" | "message">;
        Update: Partial<Omit<PrijavaDogodkiRow, "id" | "created_at">>;
        Relationships: [];
      };
      admin_sessions: {
        Row: AdminSessionRow;
        Insert: AdminSessionRow;
        Update: Partial<AdminSessionRow>;
        Relationships: [];
      };
    };
    Views: {
      obvescanje: {
        Row: ObvescanjeRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
}
