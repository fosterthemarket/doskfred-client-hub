-- Admin users table first
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create admin role check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  )
$$;

-- Create table for client registrations
CREATE TABLE public.client_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Company Data
  company_name TEXT NOT NULL,
  cif TEXT NOT NULL,
  commercial_name TEXT,
  
  -- Contact Address
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'España',
  
  -- Contact Details
  phone TEXT NOT NULL,
  mobile TEXT,
  email TEXT NOT NULL,
  website TEXT,
  
  -- Contact Person
  contact_person TEXT NOT NULL,
  contact_position TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  -- Delivery Address
  delivery_same_as_main BOOLEAN DEFAULT true,
  delivery_address TEXT,
  delivery_postal_code TEXT,
  delivery_city TEXT,
  delivery_province TEXT,
  delivery_country TEXT,
  delivery_contact_person TEXT,
  delivery_phone TEXT,
  
  -- Banking Info
  bank_name TEXT,
  iban TEXT,
  swift_bic TEXT,
  account_holder TEXT,
  
  -- GDPR Consent
  gdpr_consent BOOLEAN NOT NULL DEFAULT false,
  gdpr_consent_date TIMESTAMP WITH TIME ZONE,
  
  notes TEXT
);

ALTER TABLE public.client_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit registration" 
ON public.client_registrations 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view registrations
CREATE POLICY "Admins can view all registrations" 
ON public.client_registrations 
FOR SELECT 
USING (public.is_admin());

-- Admin users policies
CREATE POLICY "Admin users can view admin list"
ON public.admin_users
FOR SELECT
USING (public.is_admin());