-- Add SEPA fields to client_registrations table
ALTER TABLE public.client_registrations 
ADD COLUMN sepa_mandate_reference text DEFAULT NULL,
ADD COLUMN sepa_payment_type text DEFAULT NULL,
ADD COLUMN sepa_signature text DEFAULT NULL,
ADD COLUMN sepa_signature_date text DEFAULT NULL;