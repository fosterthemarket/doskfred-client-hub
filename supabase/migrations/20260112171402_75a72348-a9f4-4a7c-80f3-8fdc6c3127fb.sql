-- Drop existing restrictive policies on client_registrations
DROP POLICY IF EXISTS "Admins can delete registrations" ON public.client_registrations;
DROP POLICY IF EXISTS "Admins can update registrations" ON public.client_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.client_registrations;
DROP POLICY IF EXISTS "Anyone can submit registration" ON public.client_registrations;

-- Create proper PERMISSIVE policies (default behavior)
-- Public can INSERT (for registration form)
CREATE POLICY "Public can submit registration"
ON public.client_registrations
FOR INSERT
TO public
WITH CHECK (true);

-- Only admins can SELECT
CREATE POLICY "Only admins can view registrations"
ON public.client_registrations
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Only admins can UPDATE
CREATE POLICY "Only admins can update registrations"
ON public.client_registrations
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only admins can DELETE
CREATE POLICY "Only admins can delete registrations"
ON public.client_registrations
FOR DELETE
TO authenticated
USING (public.is_admin());