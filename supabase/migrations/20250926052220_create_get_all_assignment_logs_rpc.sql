CREATE OR REPLACE FUNCTION get_all_assignment_logs(p_match_id uuid DEFAULT NULL)
RETURNS TABLE (
    id uuid,
    match_id uuid,
    tracker_user_id uuid,
    assignment_action text,
    created_at timestamptz,
    tracker_name text,
    match_name text,
    assignment_type text,
    tracker_assignment jsonb
)
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM (
        WITH player_details AS (
            SELECT
                m.id as match_id,
                p.value->>'name' as player_name,
                (p.value->>'id')::int as player_id,
                (p.value->>'number')::int as jersey_number,
                p.team_name
            FROM
                matches m
                CROSS JOIN LATERAL (
                    SELECT value, m.home_team_name as team_name FROM jsonb_array_elements(COALESCE(m.home_team_players, '[]'::jsonb))
                    UNION ALL
                    SELECT value, m.away_team_name as team_name FROM jsonb_array_elements(COALESCE(m.away_team_players, '[]'::jsonb))
                ) p
        )
        -- Individual Assignments
        SELECT
            a.id,
            a.match_id,
            a.tracker_user_id,
            CASE WHEN a.updated_at > a.created_at THEN 'updated' ELSE 'created' END as assignment_action,
            a.created_at,
            p.full_name as tracker_name,
            m.name as match_name,
            'individual' as assignment_type,
            jsonb_build_object(
                'player_ids', a.player_ids,
                'assigned_player_ids', a.assigned_player_ids,
                'player_team_id', a.player_team_id,
                'assigned_event_types', a.assigned_event_types,
                'player_names', (
                    SELECT COALESCE(jsonb_agg(pd.player_name), '[]'::jsonb)
                    FROM player_details pd
                    WHERE pd.match_id = a.match_id AND (pd.player_id = ANY(a.assigned_player_ids) OR pd.jersey_number = ANY(a.assigned_player_ids))
                ),
                'team_name', (
                    SELECT pd.team_name
                    FROM player_details pd
                    WHERE pd.match_id = a.match_id AND (pd.player_id = ANY(a.assigned_player_ids) OR pd.jersey_number = ANY(a.assigned_player_ids))
                    LIMIT 1
                )
            ) as tracker_assignment
        FROM
            match_tracker_assignments a
            LEFT JOIN profiles p ON a.tracker_user_id = p.id
            LEFT JOIN matches m ON a.match_id = m.id
        WHERE
            p_match_id IS NULL OR a.match_id = p_match_id

        UNION ALL

        -- Line Assignments
        SELECT
            la.id,
            la.match_id,
            la.tracker_user_id,
            CASE WHEN la.updated_at > la.created_at THEN 'updated' ELSE 'created' END as assignment_action,
            la.created_at,
            p.full_name as tracker_name,
            m.name as match_name,
            'line' as assignment_type,
            jsonb_build_object(
                'assigned_event_types', la.assigned_event_types,
                'player_names', (
                    SELECT COALESCE(jsonb_agg(lp->>'player_name'), '[]'::jsonb)
                    FROM jsonb_array_elements(la.line_players) as lp
                ),
                'team_name', (
                    SELECT CASE WHEN (lp->>'team') = 'home' THEN m.home_team_name ELSE m.away_team_name END
                    FROM jsonb_array_elements(la.line_players) as lp
                    LIMIT 1
                ),
                'tracker_type', la.tracker_type,
                'line_players_count', jsonb_array_length(la.line_players)
            ) as tracker_assignment
        FROM
            tracker_line_assignments la
            LEFT JOIN profiles p ON la.tracker_user_id = p.id
            LEFT JOIN matches m ON la.match_id = m.id
        WHERE
            p_match_id IS NULL OR la.match_id = p_match_id

        UNION ALL

        -- Video Assignments
        SELECT
            va.id,
            mvs.match_id,
            va.tracker_id as tracker_user_id,
            'created' as assignment_action,
            va.created_at,
            p.full_name as tracker_name,
            COALESCE(m.name, mvs.video_title) as match_name,
            'video' as assignment_type,
            jsonb_build_object(
                'assigned_event_types', va.assigned_event_types,
                'video_url', mvs.video_url,
                'video_title', mvs.video_title,
                'status', va.status,
                'player_names', '[]'::jsonb
            ) as tracker_assignment
        FROM
            video_tracker_assignments va
            LEFT JOIN profiles p ON va.tracker_id = p.id
            LEFT JOIN match_video_settings mvs ON va.match_video_id = mvs.id
            LEFT JOIN matches m ON mvs.match_id = m.id
        WHERE
            p_match_id IS NULL OR mvs.match_id = p_match_id
    ) as all_logs
    ORDER BY all_logs.created_at DESC;
END;
$$ LANGUAGE plpgsql;