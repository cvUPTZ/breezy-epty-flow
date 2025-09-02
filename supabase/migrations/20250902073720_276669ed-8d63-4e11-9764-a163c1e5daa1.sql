-- Fix remaining function search path mutable issues

-- Update all functions with mutable search paths to use fixed search_path

CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record RECORD;
  default_permissions JSONB;
BEGIN
  -- Get user role and custom permissions
  SELECT role, custom_permissions INTO user_record
  FROM public.profiles WHERE id = user_id;
  
  -- If no user found, return null
  IF user_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- If custom permissions exist, return them
  IF user_record.custom_permissions IS NOT NULL THEN
    RETURN user_record.custom_permissions;
  END IF;
  
  -- Otherwise return role defaults
  CASE user_record.role
    WHEN 'admin' THEN
      default_permissions := '{
        "pitchView": true,
        "pianoInput": true,
        "statistics": true,
        "timeline": true,
        "analytics": true,
        "ballTracking": true,
        "liveEvents": true
      }'::jsonb;
    WHEN 'tracker' THEN
      default_permissions := '{
        "pitchView": false,
        "pianoInput": true,
        "statistics": false,
        "timeline": false,
        "analytics": false,
        "ballTracking": false,
        "liveEvents": false
      }'::jsonb;
    WHEN 'teacher' THEN
      default_permissions := '{
        "pitchView": true,
        "pianoInput": false,
        "statistics": true,
        "timeline": true,
        "analytics": true,
        "ballTracking": false,
        "liveEvents": false
      }'::jsonb;
    ELSE -- 'user' role or any other role
      default_permissions := '{
        "pitchView": true,
        "pianoInput": false,
        "statistics": true,
        "timeline": true,
        "analytics": false,
        "ballTracking": false,
        "liveEvents": false
      }'::jsonb;
  END CASE;
  
  RETURN default_permissions;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_user_permissions_to_defaults(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET custom_permissions = NULL
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_notification(p_user_id uuid, p_match_id uuid, p_type text, p_title text, p_message text, p_data jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.notifications (
        user_id,
        match_id,
        type,
        title,
        message,
        notification_data
    ) VALUES (
        p_user_id,
        p_match_id,
        p_type,
        p_title,
        p_message,
        p_data
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.schedule_match_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    upcoming_match RECORD;
    assigned_tracker RECORD;
    reminder_window_start INTERVAL := '30 minutes';
    reminder_window_end INTERVAL := '35 minutes';
    notification_title TEXT;
    notification_message TEXT;
    notification_data JSONB;
    match_start_time_text TEXT;
BEGIN
    RAISE LOG 'schedule_match_reminders: Function started at %', NOW();

    FOR upcoming_match IN
        SELECT id, name, match_date, status
        FROM public.matches
        WHERE
            status = 'published'
            AND match_date >= (NOW() + reminder_window_start)
            AND match_date < (NOW() + reminder_window_end)
    LOOP
        match_start_time_text := TO_CHAR(upcoming_match.match_date, 'YYYY-MM-DD HH24:MI TZ');

        FOR assigned_tracker IN
            SELECT tracker_id
            FROM public.match_tracker_assignments
            WHERE match_id = upcoming_match.id
        LOOP
            IF NOT EXISTS (
                SELECT 1
                FROM public.notifications n
                WHERE n.user_id = assigned_tracker.tracker_id
                  AND n.match_id = upcoming_match.id
                  AND n.type = 'match_reminder'
            ) THEN
                notification_title := 'Match Reminder';
                notification_message := 'Match "' || COALESCE(upcoming_match.name, 'Unnamed Match') || '" is starting soon at ' || match_start_time_text || '.';
                notification_data := jsonb_build_object(
                    'match_id', upcoming_match.id,
                    'match_name', upcoming_match.name,
                    'start_time', upcoming_match.match_date
                );

                PERFORM public.insert_notification(
                    p_user_id := assigned_tracker.tracker_id,
                    p_match_id := upcoming_match.id,
                    p_type := 'match_reminder',
                    p_title := notification_title,
                    p_message := notification_message,
                    p_data := notification_data
                );
            END IF;
        END LOOP;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_tracker_absence(p_absent_tracker_user_id uuid, p_match_id uuid, p_replacement_tracker_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    notification_title TEXT;
    notification_message TEXT;
    notification_data JSONB;
BEGIN
    IF p_absent_tracker_user_id IS NULL OR p_match_id IS NULL OR p_replacement_tracker_user_id IS NULL THEN
        RAISE WARNING 'handle_tracker_absence: All parameters must be provided. Skipping execution.';
        RETURN;
    END IF;

    notification_title := 'Replacement Assignment';
    notification_message := 'You have been assigned as a replacement for match ' || p_match_id ||
                            ' because tracker ' || p_absent_tracker_user_id || ' is unavailable.';

    notification_data := jsonb_build_object(
        'match_id', p_match_id,
        'absent_tracker_id', p_absent_tracker_user_id,
        'replacement_tracker_id', p_replacement_tracker_user_id,
        'reason', 'Tracker absence reported.'
    );

    PERFORM public.insert_notification(
        p_user_id := p_replacement_tracker_user_id,
        p_match_id := p_match_id,
        p_type := 'tracker_absence',
        p_title := notification_title,
        p_message := notification_message,
        p_data := notification_data
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.find_replacement_tracker(p_match_id uuid, p_absent_tracker_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    replacement_user_id UUID;
BEGIN
    SELECT u.id
    INTO replacement_user_id
    FROM auth.users u
    LEFT JOIN public.match_tracker_assignments mta ON u.id = mta.tracker_id AND mta.match_id = p_match_id
    WHERE
        u.id != p_absent_tracker_id
        AND mta.tracker_id IS NULL
        AND public.get_user_role(u.id) = 'tracker'
    ORDER BY random()
    LIMIT 1;

    RETURN replacement_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_tracker_activity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    inactivity_threshold INTERVAL := '3 minutes';
    active_match RECORD;
    assigned_tracker_record RECORD;
    tracker_activity_record RECORD;
    replacement_id UUID;
BEGIN
    FOR active_match IN
        SELECT id AS match_id
        FROM public.matches
        WHERE status = 'live'
    LOOP
        FOR assigned_tracker_record IN
            SELECT tracker_id AS user_id
            FROM public.match_tracker_assignments
            WHERE match_id = active_match.match_id
        LOOP
            SELECT last_active_at
            INTO tracker_activity_record
            FROM public.match_tracker_activity
            WHERE match_id = active_match.match_id AND user_id = assigned_tracker_record.user_id;

            IF tracker_activity_record IS NULL OR tracker_activity_record.last_active_at < (NOW() - inactivity_threshold) THEN
                replacement_id := public.find_replacement_tracker(active_match.match_id, assigned_tracker_record.user_id);

                IF replacement_id IS NOT NULL THEN
                    PERFORM public.handle_tracker_absence(
                        p_absent_tracker_user_id := assigned_tracker_record.user_id,
                        p_match_id := active_match.match_id,
                        p_replacement_tracker_user_id := replacement_id
                    );
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END;
$$;