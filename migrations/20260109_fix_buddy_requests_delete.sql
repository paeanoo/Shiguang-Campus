-- Fix DELETE permissions for buddy_requests table
-- This migration ensures that users can delete their own buddy requests

-- Grant DELETE permission to authenticated users
GRANT DELETE ON public.buddy_requests TO authenticated;

-- Add RLS policy for DELETE operations (only allow creators to delete their own requests)
DROP POLICY IF EXISTS buddy_requests_delete_creator ON public.buddy_requests;
CREATE POLICY buddy_requests_delete_creator ON public.buddy_requests
    FOR DELETE USING (auth.uid() = creator_id);

-- Also ensure UPDATE permission for creators (to modify their requests)
GRANT UPDATE ON public.buddy_requests TO authenticated;
DROP POLICY IF EXISTS buddy_requests_update_creator ON public.buddy_requests;
CREATE POLICY buddy_requests_update_creator ON public.buddy_requests
    FOR UPDATE USING (auth.uid() = creator_id);