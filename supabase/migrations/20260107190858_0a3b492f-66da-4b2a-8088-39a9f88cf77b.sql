-- Add RLS policies for UPDATE and DELETE on client_registrations
-- Only admins can update registrations
CREATE POLICY "Admins can update registrations"
ON public.client_registrations
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete registrations
CREATE POLICY "Admins can delete registrations"
ON public.client_registrations
FOR DELETE
USING (is_admin());