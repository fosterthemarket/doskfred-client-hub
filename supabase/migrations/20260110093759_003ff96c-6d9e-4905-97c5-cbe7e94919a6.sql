-- Ensure UPDATE and DELETE policies exist (they may already exist based on schema)
-- Drop and recreate to ensure they're restrictive

-- First check if policies exist and drop them
DROP POLICY IF EXISTS "Admins can update registrations" ON public.client_registrations;
DROP POLICY IF EXISTS "Admins can delete registrations" ON public.client_registrations;

-- Recreate with PERMISSIVE = YES for proper protection
CREATE POLICY "Admins can update registrations" 
ON public.client_registrations 
FOR UPDATE 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete registrations" 
ON public.client_registrations 
FOR DELETE 
TO authenticated
USING (is_admin());

-- Add policies for admin_users table to prevent unauthorized modifications
DROP POLICY IF EXISTS "Admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can delete admin users" ON public.admin_users;

CREATE POLICY "Admins can insert admin users"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admins can update admin users"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete admin users"
ON public.admin_users
FOR DELETE
TO authenticated
USING (is_admin());