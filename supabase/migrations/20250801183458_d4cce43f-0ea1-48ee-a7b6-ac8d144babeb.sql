-- Fix remaining SECURITY DEFINER functions missing search_path
-- This addresses the remaining WARN-level linter issues

-- Update all remaining functions that need search_path protection
ALTER FUNCTION public.set_current_timestamp_updated_at() SET search_path = '';
ALTER FUNCTION public.insert_notification(uuid, uuid, text, text, text, jsonb) SET search_path = '';
ALTER FUNCTION public.schedule_match_reminders() SET search_path = '';
ALTER FUNCTION public.trigger_set_timestamp() SET search_path = '';
ALTER FUNCTION public.can_access_match_assignments(uuid) SET search_path = '';
ALTER FUNCTION public.assign_tracker_to_player(uuid, uuid, bigint, text) SET search_path = '';
ALTER FUNCTION public.handle_tracker_absence(uuid, uuid, uuid) SET search_path = '';
ALTER FUNCTION public.create_ml_job(text, uuid, text, jsonb) SET search_path = '';
ALTER FUNCTION public.get_ml_job(uuid) SET search_path = '';
ALTER FUNCTION public.update_match_tracker_activity_last_active_at() SET search_path = '';
ALTER FUNCTION public.get_user_ml_jobs(uuid, integer) SET search_path = '';
ALTER FUNCTION public.cancel_ml_job(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.get_current_user_role() SET search_path = '';
ALTER FUNCTION public.find_replacement_tracker(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.check_tracker_activity() SET search_path = '';
ALTER FUNCTION public.update_participant_activity() SET search_path = '';
ALTER FUNCTION public.is_admin(uuid) SET search_path = '';
ALTER FUNCTION public.get_all_users_with_metadata() SET search_path = '';
ALTER FUNCTION public.get_room_participant_count(uuid) SET search_path = '';
ALTER FUNCTION public.get_trackers_with_email() SET search_path = '';
ALTER FUNCTION public.sync_profile_email() SET search_path = '';
ALTER FUNCTION public.sync_profile_email_on_insert() SET search_path = '';
ALTER FUNCTION public.assign_default_role() SET search_path = '';
ALTER FUNCTION public.update_profile_app_metadata_role() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.update_user_role_metadata() SET search_path = '';
ALTER FUNCTION public.user_has_role(user_role) SET search_path = '';
ALTER FUNCTION public.is_user() SET search_path = '';
ALTER FUNCTION public.has_elevated_access() SET search_path = '';
ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.is_tracker() SET search_path = '';
ALTER FUNCTION public.update_auth_user_metadata() SET search_path = '';
ALTER FUNCTION public.get_user_role_from_auth(uuid) SET search_path = '';
ALTER FUNCTION public.notify_assigned_trackers(uuid, jsonb) SET search_path = '';
ALTER FUNCTION public.update_user_app_metadata_role() SET search_path = '';

-- Fix the RLS policy that references user metadata
DROP POLICY IF EXISTS "Users can view assignments for matches they have access to" ON public.match_tracker_assignments;

-- Create a secure policy that doesn't reference user metadata
CREATE POLICY "Users can view assignments for matches they have access to" 
ON public.match_tracker_assignments
FOR SELECT 
USING (
  -- Admins can see all assignments
  public.is_admin() 
  OR
  -- Trackers can see their own assignments
  (public.is_tracker() AND auth.uid() = tracker_user_id)
  OR  
  -- Users with viewer role can see assignments
  (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('viewer', 'manager')
  ))
);