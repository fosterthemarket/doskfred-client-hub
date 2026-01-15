export type PaymentMethod = "transferencia" | "pagare" | "efectivo" | "domiciliacion" | "";

export interface RegistrationFormData {
  company_name: string;
  commercial_name: string;
  cif: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
  country: string;
  phone: string;
  mobile: string;
  email: string;
  website: string;
  contact_person: string;
  contact_position: string;
  contact_email: string;
  contact_phone: string;
  delivery_same_as_main: boolean;
  delivery_address: string;
  delivery_postal_code: string;
  delivery_city: string;
  delivery_province: string;
  delivery_country: string;
  delivery_contact_person: string;
  delivery_phone: string;
  // Payment method
  payment_method: PaymentMethod;
  // Banking fields (only for domiciliacion)
  bank_name: string;
  iban: string;
  swift_bic: string;
  account_holder: string;
  // SEPA fields (only for domiciliacion)
  sepa_mandate_reference: string;
  sepa_payment_type: "periodic" | "single" | "";
  sepa_signature: string; // Base64 encoded signature image
  sepa_signature_date: string;
  gdpr_consent: boolean;
  notes: string;
}
