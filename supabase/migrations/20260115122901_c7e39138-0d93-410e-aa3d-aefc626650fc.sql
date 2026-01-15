-- Add payment_method column to client_registrations table
ALTER TABLE public.client_registrations 
ADD COLUMN payment_method text DEFAULT NULL;