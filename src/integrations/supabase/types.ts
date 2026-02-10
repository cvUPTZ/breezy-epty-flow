export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      assignment_logs: {
        Row: {
          assigned_event_types: string[] | null
          assigned_player_id: number | null
          assignee_id: string | null
          assigner_id: string
          assignment_action: string
          assignment_details: Json
          assignment_type: string
          created_at: string
          id: string
          ip_address: unknown
          match_id: string | null
          player_id: number | null
          player_team_id: string | null
          previous_assignment_details: Json | null
          tracker_assignment_id: string | null
          user_agent: string | null
        }
        Insert: {
          assigned_event_types?: string[] | null
          assigned_player_id?: number | null
          assignee_id?: string | null
          assigner_id: string
          assignment_action: string
          assignment_details?: Json
          assignment_type: string
          created_at?: string
          id?: string
          ip_address?: unknown
          match_id?: string | null
          player_id?: number | null
          player_team_id?: string | null
          previous_assignment_details?: Json | null
          tracker_assignment_id?: string | null
          user_agent?: string | null
        }
        Update: {
          assigned_event_types?: string[] | null
          assigned_player_id?: number | null
          assignee_id?: string | null
          assigner_id?: string
          assignment_action?: string
          assignment_details?: Json
          assignment_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          match_id?: string | null
          player_id?: number | null
          player_team_id?: string | null
          previous_assignment_details?: Json | null
          tracker_assignment_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_logs_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_logs_tracker_assignment_id_fkey"
            columns: ["tracker_assignment_id"]
            isOneToOne: false
            referencedRelation: "match_tracker_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_logs_tracker_assignment_id_fkey"
            columns: ["tracker_assignment_id"]
            isOneToOne: false
            referencedRelation: "match_tracker_assignments_view"
            referencedColumns: ["id"]
          },
        ]
      }
      business_documents: {
        Row: {
          completed_at: string | null
          content: Json
          created_at: string
          document_type: string
          id: string
          is_supporting_document: boolean | null
          metadata: Json | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content?: Json
          created_at?: string
          document_type: string
          id?: string
          is_supporting_document?: boolean | null
          metadata?: Json | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content?: Json
          created_at?: string
          document_type?: string
          id?: string
          is_supporting_document?: boolean | null
          metadata?: Json | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      code_analysis_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          payload: Json
          result: Json | null
          status: Database["public"]["Enums"]["code_analysis_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          payload: Json
          result?: Json | null
          status?: Database["public"]["Enums"]["code_analysis_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json
          result?: Json | null
          status?: Database["public"]["Enums"]["code_analysis_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      data_reconciliation_issues: {
        Row: {
          created_at: string
          description: string | null
          document_id: string | null
          document_location: string | null
          expected_value: string | null
          found_value: string | null
          id: string
          issue_type: string
          key_name: string
          reference_id: string | null
          resolution_notes: string | null
          resolution_status: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_id?: string | null
          document_location?: string | null
          expected_value?: string | null
          found_value?: string | null
          id?: string
          issue_type: string
          key_name: string
          reference_id?: string | null
          resolution_notes?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_id?: string | null
          document_location?: string | null
          expected_value?: string | null
          found_value?: string | null
          id?: string
          issue_type?: string
          key_name?: string
          reference_id?: string | null
          resolution_notes?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_reconciliation_issues_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "business_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_reconciliation_issues_reference_id_fkey"
            columns: ["reference_id"]
            isOneToOne: false
            referencedRelation: "master_reference_data"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          component_name: string | null
          created_at: string
          error_category: string
          error_code: string | null
          error_message: string
          error_type: string
          first_occurrence: string
          function_name: string | null
          id: string
          last_occurrence: string
          metadata: Json | null
          occurrences: number | null
          request_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          session_id: string | null
          severity: string
          stack_trace: string | null
          status: string
          updated_at: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component_name?: string | null
          created_at?: string
          error_category: string
          error_code?: string | null
          error_message: string
          error_type: string
          first_occurrence?: string
          function_name?: string | null
          id?: string
          last_occurrence?: string
          metadata?: Json | null
          occurrences?: number | null
          request_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          severity?: string
          stack_trace?: string | null
          status?: string
          updated_at?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component_name?: string | null
          created_at?: string
          error_category?: string
          error_code?: string | null
          error_message?: string
          error_type?: string
          first_occurrence?: string
          function_name?: string | null
          id?: string
          last_occurrence?: string
          metadata?: Json | null
          occurrences?: number | null
          request_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          severity?: string
          stack_trace?: string | null
          status?: string
          updated_at?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_types: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expansion_plans: {
        Row: {
          created_at: string
          dependencies: string[] | null
          id: string
          key_objectives: Json | null
          notes: string | null
          phase: number
          phase_name: string
          region: string
          required_resources: Json | null
          risks: Json | null
          start_date: string | null
          status: string | null
          success_metrics: Json | null
          target_end_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dependencies?: string[] | null
          id?: string
          key_objectives?: Json | null
          notes?: string | null
          phase?: number
          phase_name: string
          region: string
          required_resources?: Json | null
          risks?: Json | null
          start_date?: string | null
          status?: string | null
          success_metrics?: Json | null
          target_end_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dependencies?: string[] | null
          id?: string
          key_objectives?: Json | null
          notes?: string | null
          phase?: number
          phase_name?: string
          region?: string
          required_resources?: Json | null
          risks?: Json | null
          start_date?: string | null
          status?: string | null
          success_metrics?: Json | null
          target_end_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gpu_nodes: {
        Row: {
          capabilities: Json | null
          created_at: string | null
          endpoint: string | null
          gpu_info: Json | null
          id: string
          last_heartbeat: string | null
          location: string | null
          name: string | null
          owner_id: string | null
          performance: Json | null
          priority: number | null
          status: string | null
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string | null
          endpoint?: string | null
          gpu_info?: Json | null
          id?: string
          last_heartbeat?: string | null
          location?: string | null
          name?: string | null
          owner_id?: string | null
          performance?: Json | null
          priority?: number | null
          status?: string | null
        }
        Update: {
          capabilities?: Json | null
          created_at?: string | null
          endpoint?: string | null
          gpu_info?: Json | null
          id?: string
          last_heartbeat?: string | null
          location?: string | null
          name?: string | null
          owner_id?: string | null
          performance?: Json | null
          priority?: number | null
          status?: string | null
        }
        Relationships: []
      }
      master_reference_data: {
        Row: {
          calculation_method: string | null
          category: string
          created_at: string
          data_source: string | null
          id: string
          is_active: boolean | null
          justification: string | null
          key_name: string
          unit: string | null
          updated_at: string
          user_id: string
          valid_from: string | null
          valid_to: string | null
          value: number | null
          value_text: string | null
        }
        Insert: {
          calculation_method?: string | null
          category: string
          created_at?: string
          data_source?: string | null
          id?: string
          is_active?: boolean | null
          justification?: string | null
          key_name: string
          unit?: string | null
          updated_at?: string
          user_id: string
          valid_from?: string | null
          valid_to?: string | null
          value?: number | null
          value_text?: string | null
        }
        Update: {
          calculation_method?: string | null
          category?: string
          created_at?: string
          data_source?: string | null
          id?: string
          is_active?: boolean | null
          justification?: string | null
          key_name?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
          valid_from?: string | null
          valid_to?: string | null
          value?: number | null
          value_text?: string | null
        }
        Relationships: []
      }
      match_events: {
        Row: {
          coordinates: Json | null
          created_at: string
          created_by: string
          details: Json
          event_data: Json | null
          event_type: string
          id: string
          match_id: string | null
          player_id: number | null
          quality_control: Json | null
          source: string | null
          team: string | null
          timestamp: number | null
          updated_at: string | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string
          created_by: string
          details?: Json
          event_data?: Json | null
          event_type: string
          id?: string
          match_id?: string | null
          player_id?: number | null
          quality_control?: Json | null
          source?: string | null
          team?: string | null
          timestamp?: number | null
          updated_at?: string | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string
          created_by?: string
          details?: Json
          event_data?: Json | null
          event_type?: string
          id?: string
          match_id?: string | null
          player_id?: number | null
          quality_control?: Json | null
          source?: string | null
          team?: string | null
          timestamp?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      match_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          match_id: string
          message: string
          tracker_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          match_id: string
          message: string
          tracker_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          match_id?: string
          message?: string
          tracker_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_notifications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_tracker_activity: {
        Row: {
          last_active_at: string
          match_id: string
          user_id: string
        }
        Insert: {
          last_active_at?: string
          match_id: string
          user_id: string
        }
        Update: {
          last_active_at?: string
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_tracker_activity_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_tracker_assignments: {
        Row: {
          assigned_event_types: string[] | null
          assigned_player_id: number | null
          assigned_player_ids: number[] | null
          created_at: string
          id: string
          match_id: string
          player_id: number | null
          player_ids: number[] | null
          player_team_id: string
          tracker_id: string | null
          tracker_type: string
          tracker_user_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_event_types?: string[] | null
          assigned_player_id?: number | null
          assigned_player_ids?: number[] | null
          created_at?: string
          id?: string
          match_id: string
          player_id?: number | null
          player_ids?: number[] | null
          player_team_id: string
          tracker_id?: string | null
          tracker_type?: string
          tracker_user_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_event_types?: string[] | null
          assigned_player_id?: number | null
          assigned_player_ids?: number[] | null
          created_at?: string
          id?: string
          match_id?: string
          player_id?: number | null
          player_ids?: number[] | null
          player_team_id?: string
          tracker_id?: string | null
          tracker_type?: string
          tracker_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_tracker_assignments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_video_settings: {
        Row: {
          created_at: string
          created_by: string | null
          duration_seconds: number | null
          id: string
          match_id: string | null
          updated_at: string
          video_description: string | null
          video_title: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          id?: string
          match_id?: string | null
          updated_at?: string
          video_description?: string | null
          video_title?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          id?: string
          match_id?: string | null
          updated_at?: string
          video_description?: string | null
          video_title?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_video_settings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_team_flag_url: string | null
          away_team_formation: string | null
          away_team_name: string
          away_team_players: Json | null
          away_team_score: number | null
          ball_tracking_data: Json | null
          competition: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          home_team_flag_url: string | null
          home_team_formation: string | null
          home_team_name: string
          home_team_players: Json | null
          home_team_score: number | null
          id: string
          location: string | null
          match_date: string | null
          match_statistics: Json | null
          match_type: string | null
          name: string | null
          notes: string | null
          status: string
          timer_current_value: number | null
          timer_last_started_at: string | null
          timer_status: string | null
          updated_at: string | null
        }
        Insert: {
          away_team_flag_url?: string | null
          away_team_formation?: string | null
          away_team_name: string
          away_team_players?: Json | null
          away_team_score?: number | null
          ball_tracking_data?: Json | null
          competition?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          home_team_flag_url?: string | null
          home_team_formation?: string | null
          home_team_name: string
          home_team_players?: Json | null
          home_team_score?: number | null
          id?: string
          location?: string | null
          match_date?: string | null
          match_statistics?: Json | null
          match_type?: string | null
          name?: string | null
          notes?: string | null
          status?: string
          timer_current_value?: number | null
          timer_last_started_at?: string | null
          timer_status?: string | null
          updated_at?: string | null
        }
        Update: {
          away_team_flag_url?: string | null
          away_team_formation?: string | null
          away_team_name?: string
          away_team_players?: Json | null
          away_team_score?: number | null
          ball_tracking_data?: Json | null
          competition?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          home_team_flag_url?: string | null
          home_team_formation?: string | null
          home_team_name?: string
          home_team_players?: Json | null
          home_team_score?: number | null
          id?: string
          location?: string | null
          match_date?: string | null
          match_statistics?: Json | null
          match_type?: string | null
          name?: string | null
          notes?: string | null
          status?: string
          timer_current_value?: number | null
          timer_last_started_at?: string | null
          timer_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          match_id: string | null
          message: string
          notification_data: Json | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          match_id?: string | null
          message: string
          notification_data?: Json | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          match_id?: string | null
          message?: string
          notification_data?: Json | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      opposition_analysis: {
        Row: {
          created_at: string | null
          created_by: string | null
          formation: string | null
          id: string
          key_players: Json | null
          match_date: string | null
          opponent_team: string
          playing_style: string | null
          set_piece_analysis: Json | null
          strengths: string[] | null
          tactical_recommendations: string | null
          updated_at: string | null
          weaknesses: string[] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          formation?: string | null
          id?: string
          key_players?: Json | null
          match_date?: string | null
          opponent_team: string
          playing_style?: string | null
          set_piece_analysis?: Json | null
          strengths?: string[] | null
          tactical_recommendations?: string | null
          updated_at?: string | null
          weaknesses?: string[] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          formation?: string | null
          id?: string
          key_players?: Json | null
          match_date?: string | null
          opponent_team?: string
          playing_style?: string | null
          set_piece_analysis?: Json | null
          strengths?: string[] | null
          tactical_recommendations?: string | null
          updated_at?: string | null
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      playlist_items: {
        Row: {
          created_at: string
          id: string
          item_order: number
          playlist_id: string
          tagged_event_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_order: number
          playlist_id: string
          tagged_event_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_order?: number
          playlist_id?: string
          tagged_event_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_tagged_event_id_fkey"
            columns: ["tagged_event_id"]
            isOneToOne: false
            referencedRelation: "tagged_events"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
          video_job_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          video_job_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          video_job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_video_job_id_fkey"
            columns: ["video_job_id"]
            isOneToOne: false
            referencedRelation: "video_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          custom_permissions: Json | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          custom_permissions?: Json | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          custom_permissions?: Json | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      realtime_transient_messages: {
        Row: {
          created_at: string
          id: number
          message_type: string
          payload: Json | null
          room_id: string
          sender_id: string
          to_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          message_type: string
          payload?: Json | null
          room_id: string
          sender_id: string
          to_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          message_type?: string
          payload?: Json | null
          room_id?: string
          sender_id?: string
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_receiver"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_receiver"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_receiver"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "voice_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_data_history: {
        Row: {
          change_reason: string
          change_type: string
          created_at: string
          id: string
          new_value: number | null
          new_value_text: string | null
          previous_value: number | null
          previous_value_text: string | null
          reference_id: string
          supporting_document_id: string | null
          user_id: string
        }
        Insert: {
          change_reason: string
          change_type: string
          created_at?: string
          id?: string
          new_value?: number | null
          new_value_text?: string | null
          previous_value?: number | null
          previous_value_text?: string | null
          reference_id: string
          supporting_document_id?: string | null
          user_id: string
        }
        Update: {
          change_reason?: string
          change_type?: string
          created_at?: string
          id?: string
          new_value?: number | null
          new_value_text?: string | null
          previous_value?: number | null
          previous_value_text?: string | null
          reference_id?: string
          supporting_document_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reference_data_history_reference_id_fkey"
            columns: ["reference_id"]
            isOneToOne: false
            referencedRelation: "master_reference_data"
            referencedColumns: ["id"]
          },
        ]
      }
      references: {
        Row: {
          citation_style: string | null
          citation_text: string
          created_at: string
          id: string
          thesis_id: string
        }
        Insert: {
          citation_style?: string | null
          citation_text: string
          created_at?: string
          id?: string
          thesis_id: string
        }
        Update: {
          citation_style?: string | null
          citation_text?: string
          created_at?: string
          id?: string
          thesis_id?: string
        }
        Relationships: []
      }
      scout_reports: {
        Row: {
          created_at: string | null
          detailed_notes: string | null
          id: string
          match_context: string | null
          performance_rating: number | null
          player_id: string | null
          recommendation: string | null
          report_date: string | null
          scout_id: string | null
          strengths: string[] | null
          updated_at: string | null
          video_links: string[] | null
          weaknesses: string[] | null
        }
        Insert: {
          created_at?: string | null
          detailed_notes?: string | null
          id?: string
          match_context?: string | null
          performance_rating?: number | null
          player_id?: string | null
          recommendation?: string | null
          report_date?: string | null
          scout_id?: string | null
          strengths?: string[] | null
          updated_at?: string | null
          video_links?: string[] | null
          weaknesses?: string[] | null
        }
        Update: {
          created_at?: string | null
          detailed_notes?: string | null
          id?: string
          match_context?: string | null
          performance_rating?: number | null
          player_id?: string | null
          recommendation?: string | null
          report_date?: string | null
          scout_id?: string | null
          strengths?: string[] | null
          updated_at?: string | null
          video_links?: string[] | null
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "scout_reports_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "scouted_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scout_reports_scout_id_fkey"
            columns: ["scout_id"]
            isOneToOne: false
            referencedRelation: "scouts"
            referencedColumns: ["id"]
          },
        ]
      }
      scouted_players: {
        Row: {
          age: number | null
          contract_expires: string | null
          created_at: string | null
          created_by: string | null
          current_club: string | null
          id: string
          jersey_number: number | null
          league: string | null
          lfp_id: number | null
          market_value: number | null
          mental_qualities: Json | null
          name: string
          nationality: string | null
          photo_url: string | null
          physical_attributes: Json | null
          position: string | null
          tactical_awareness: Json | null
          team_id: number | null
          technical_skills: Json | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          contract_expires?: string | null
          created_at?: string | null
          created_by?: string | null
          current_club?: string | null
          id?: string
          jersey_number?: number | null
          league?: string | null
          lfp_id?: number | null
          market_value?: number | null
          mental_qualities?: Json | null
          name: string
          nationality?: string | null
          photo_url?: string | null
          physical_attributes?: Json | null
          position?: string | null
          tactical_awareness?: Json | null
          team_id?: number | null
          technical_skills?: Json | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          contract_expires?: string | null
          created_at?: string | null
          created_by?: string | null
          current_club?: string | null
          id?: string
          jersey_number?: number | null
          league?: string | null
          lfp_id?: number | null
          market_value?: number | null
          mental_qualities?: Json | null
          name?: string
          nationality?: string | null
          photo_url?: string | null
          physical_attributes?: Json | null
          position?: string | null
          tactical_awareness?: Json | null
          team_id?: number | null
          technical_skills?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scouted_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      scouts: {
        Row: {
          contact_info: Json | null
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          region: string | null
          specialization: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          region?: string | null
          specialization?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_info?: Json | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          region?: string | null
          specialization?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      strategic_hypotheses: {
        Row: {
          assumption_basis: string | null
          category: string
          confidence_level: string | null
          created_at: string
          hypothesis_description: string
          hypothesis_name: string
          id: string
          impact_if_wrong: string | null
          is_active: boolean | null
          related_documents: string[] | null
          updated_at: string
          user_id: string
          validation_status: string | null
        }
        Insert: {
          assumption_basis?: string | null
          category: string
          confidence_level?: string | null
          created_at?: string
          hypothesis_description: string
          hypothesis_name: string
          id?: string
          impact_if_wrong?: string | null
          is_active?: boolean | null
          related_documents?: string[] | null
          updated_at?: string
          user_id: string
          validation_status?: string | null
        }
        Update: {
          assumption_basis?: string | null
          category?: string
          confidence_level?: string | null
          created_at?: string
          hypothesis_description?: string
          hypothesis_name?: string
          id?: string
          impact_if_wrong?: string | null
          is_active?: boolean | null
          related_documents?: string[] | null
          updated_at?: string
          user_id?: string
          validation_status?: string | null
        }
        Relationships: []
      }
      tagged_events: {
        Row: {
          annotations: Json | null
          created_at: string
          event_type_id: string
          id: string
          notes: string | null
          timestamp: number
          updated_at: string
          video_job_id: string
        }
        Insert: {
          annotations?: Json | null
          created_at?: string
          event_type_id: string
          id?: string
          notes?: string | null
          timestamp: number
          updated_at?: string
          video_job_id: string
        }
        Update: {
          annotations?: Json | null
          created_at?: string
          event_type_id?: string
          id?: string
          notes?: string | null
          timestamp?: number
          updated_at?: string
          video_job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tagged_events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tagged_events_video_job_id_fkey"
            columns: ["video_job_id"]
            isOneToOne: false
            referencedRelation: "video_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          country: string | null
          id: number
          logo_url: string | null
          name: string
        }
        Insert: {
          country?: string | null
          id?: never
          logo_url?: string | null
          name: string
        }
        Update: {
          country?: string | null
          id?: never
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          image_url: string | null
          location: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          location: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tracker_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          event_category: string
          id: string
          tracker_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_category: string
          id?: string
          tracker_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_category?: string
          id?: string
          tracker_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracker_device_status: {
        Row: {
          battery_level: number | null
          id: string
          last_updated_at: string | null
          user_id: string
        }
        Insert: {
          battery_level?: number | null
          id?: string
          last_updated_at?: string | null
          user_id: string
        }
        Update: {
          battery_level?: number | null
          id?: string
          last_updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tracker_line_assignments: {
        Row: {
          assigned_event_types: string[]
          created_at: string
          id: string
          line_players: Json
          match_id: string
          tracker_type: Database["public"]["Enums"]["tracker_type"]
          tracker_user_id: string
          updated_at: string
        }
        Insert: {
          assigned_event_types?: string[]
          created_at?: string
          id?: string
          line_players?: Json
          match_id: string
          tracker_type: Database["public"]["Enums"]["tracker_type"]
          tracker_user_id: string
          updated_at?: string
        }
        Update: {
          assigned_event_types?: string[]
          created_at?: string
          id?: string
          line_players?: Json
          match_id?: string
          tracker_type?: Database["public"]["Enums"]["tracker_type"]
          tracker_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracker_line_assignments_tracker_user_id_fkey"
            columns: ["tracker_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracker_line_assignments_tracker_user_id_fkey"
            columns: ["tracker_user_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracker_line_assignments_tracker_user_id_fkey"
            columns: ["tracker_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      user_event_assignments: {
        Row: {
          created_at: string | null
          event_type: string
          id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_event_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_event_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_event_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_jobs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          input_video_path: string
          job_config: Json | null
          progress: number | null
          result_data: Json | null
          status: Database["public"]["Enums"]["job_status"] | null
          updated_at: string | null
          user_id: string | null
          video_duration: number | null
          video_title: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_video_path: string
          job_config?: Json | null
          progress?: number | null
          result_data?: Json | null
          status?: Database["public"]["Enums"]["job_status"] | null
          updated_at?: string | null
          user_id?: string | null
          video_duration?: number | null
          video_title?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_video_path?: string
          job_config?: Json | null
          progress?: number | null
          result_data?: Json | null
          status?: Database["public"]["Enums"]["job_status"] | null
          updated_at?: string | null
          user_id?: string | null
          video_duration?: number | null
          video_title?: string | null
        }
        Relationships: []
      }
      video_tracker_assignments: {
        Row: {
          assigned_by: string | null
          assigned_event_types: Json | null
          created_at: string
          id: string
          match_video_id: string
          status: string | null
          tracker_id: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_event_types?: Json | null
          created_at?: string
          id?: string
          match_video_id: string
          status?: string | null
          tracker_id: string
        }
        Update: {
          assigned_by?: string | null
          assigned_event_types?: Json | null
          created_at?: string
          id?: string
          match_video_id?: string
          status?: string | null
          tracker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_tracker_assignments_match_video_id_fkey"
            columns: ["match_video_id"]
            isOneToOne: false
            referencedRelation: "match_video_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_room_participants: {
        Row: {
          connection_quality: string | null
          id: string
          is_muted: boolean | null
          is_speaking: boolean | null
          joined_at: string | null
          last_activity: string | null
          room_id: string | null
          user_id: string | null
          user_role: string
        }
        Insert: {
          connection_quality?: string | null
          id?: string
          is_muted?: boolean | null
          is_speaking?: boolean | null
          joined_at?: string | null
          last_activity?: string | null
          room_id?: string | null
          user_id?: string | null
          user_role: string
        }
        Update: {
          connection_quality?: string | null
          id?: string
          is_muted?: boolean | null
          is_speaking?: boolean | null
          joined_at?: string | null
          last_activity?: string | null
          room_id?: string | null
          user_id?: string | null
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "voice_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_rooms: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_private: boolean | null
          match_id: string | null
          max_participants: number | null
          name: string
          permissions: string[] | null
          priority: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_private?: boolean | null
          match_id?: string | null
          max_participants?: number | null
          name: string
          permissions?: string[] | null
          priority?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_private?: boolean | null
          match_id?: string | null
          max_participants?: number | null
          name?: string
          permissions?: string[] | null
          priority?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_rooms_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      youth_prospects: {
        Row: {
          academy_club: string | null
          birth_date: string | null
          character_assessment: string | null
          created_at: string | null
          development_stage: string | null
          id: string
          name: string
          physical_development: Json | null
          position: string | null
          potential_rating: number | null
          recommended_pathway: string | null
          scout_id: string | null
          technical_progress: Json | null
          updated_at: string | null
        }
        Insert: {
          academy_club?: string | null
          birth_date?: string | null
          character_assessment?: string | null
          created_at?: string | null
          development_stage?: string | null
          id?: string
          name: string
          physical_development?: Json | null
          position?: string | null
          potential_rating?: number | null
          recommended_pathway?: string | null
          scout_id?: string | null
          technical_progress?: Json | null
          updated_at?: string | null
        }
        Update: {
          academy_club?: string | null
          birth_date?: string | null
          character_assessment?: string | null
          created_at?: string | null
          development_stage?: string | null
          id?: string
          name?: string
          physical_development?: Json | null
          position?: string | null
          potential_rating?: number | null
          recommended_pathway?: string | null
          scout_id?: string | null
          technical_progress?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youth_prospects_scout_id_fkey"
            columns: ["scout_id"]
            isOneToOne: false
            referencedRelation: "scouts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      match_tracker_assignments_view: {
        Row: {
          assigned_event_types: string[] | null
          assigned_player_id: number | null
          created_at: string | null
          id: string | null
          match_id: string | null
          player_id: number | null
          player_team_id: string | null
          tracker_email: string | null
          tracker_id: string | null
          tracker_user_id: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_tracker_assignments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions_view: {
        Row: {
          custom_permissions: Json | null
          effective_permissions: Json | null
          email: string | null
          full_name: string | null
          has_custom_permissions: boolean | null
          id: string | null
          role: string | null
        }
        Insert: {
          custom_permissions?: Json | null
          effective_permissions?: never
          email?: string | null
          full_name?: string | null
          has_custom_permissions?: never
          id?: string | null
          role?: string | null
        }
        Update: {
          custom_permissions?: Json | null
          effective_permissions?: never
          email?: string | null
          full_name?: string | null
          has_custom_permissions?: never
          id?: string | null
          role?: string | null
        }
        Relationships: []
      }
      user_profiles_with_role: {
        Row: {
          created_at: string | null
          custom_permissions: Json | null
          email: string | null
          full_name: string | null
          id: string | null
          role: string | null
          updated_at: string | null
          user_created_at: string | null
          user_updated_at: string | null
        }
        Relationships: []
      }
      user_roles_view: {
        Row: {
          email: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          role_assigned_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      assign_tracker_to_player: {
        Args: {
          _match_id: string
          _player_id: number
          _player_team_id: string
          _tracker_user_id: string
        }
        Returns: string
      }
      assign_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: undefined
      }
      can_access_match_assignments: {
        Args: { match_uuid: string }
        Returns: boolean
      }
      cancel_ml_job: {
        Args: { p_job_id: string; p_user_id: string }
        Returns: boolean
      }
      check_tracker_activity: { Args: never; Returns: undefined }
      create_ml_job: {
        Args: {
          p_config?: Json
          p_priority?: string
          p_user_id: string
          p_video_url: string
        }
        Returns: string
      }
      find_replacement_tracker: {
        Args: { p_absent_tracker_id: string; p_match_id: string }
        Returns: string
      }
      get_all_assignment_logs: {
        Args: { p_match_id?: string }
        Returns: {
          assignment_action: string
          assignment_type: string
          created_at: string
          id: string
          match_id: string
          match_name: string
          tracker_assignment: Json
          tracker_name: string
          tracker_user_id: string
        }[]
      }
      get_all_users_with_metadata: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          raw_user_meta_data: Json
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_ml_job: {
        Args: { p_job_id: string }
        Returns: {
          completed_at: string
          config: Json
          created_at: string
          error_message: string
          estimated_completion: string
          id: string
          priority: string
          progress: number
          results: Json
          started_at: string
          status: string
          user_id: string
          video_url: string
        }[]
      }
      get_room_participant_count: {
        Args: { room_id_param: string }
        Returns: number
      }
      get_tracker_profiles: {
        Args: never
        Returns: {
          email: string
          full_name: string
          id: string
        }[]
      }
      get_tracker_users: {
        Args: never
        Returns: {
          email: string
          full_name: string
          id: string
        }[]
      }
      get_trackers_with_email: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }[]
      }
      get_user_effective_permissions: {
        Args: { user_id: string }
        Returns: Json
      }
      get_user_ml_jobs: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          completed_at: string
          config: Json
          created_at: string
          error_message: string
          estimated_completion: string
          id: string
          priority: string
          progress: number
          results: Json
          started_at: string
          status: string
          user_id: string
          video_url: string
        }[]
      }
      get_user_permissions: { Args: { user_id: string }; Returns: Json }
      get_user_role: { Args: { user_id_param: string }; Returns: string }
      get_user_role_from_auth: {
        Args: { user_id_param: string }
        Returns: string
      }
      get_user_roles: {
        Args: { target_user_id: string }
        Returns: Database["public"]["Enums"]["user_role"][]
      }
      handle_tracker_absence: {
        Args: {
          p_absent_tracker_user_id: string
          p_match_id: string
          p_replacement_tracker_user_id: string
        }
        Returns: undefined
      }
      has_elevated_access: { Args: never; Returns: boolean }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      insert_notification: {
        Args: {
          p_data?: Json
          p_match_id: string
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { p_user_id: string }; Returns: boolean }
      is_room_participant: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
      is_tracker: { Args: never; Returns: boolean }
      is_user: { Args: never; Returns: boolean }
      log_assignment: {
        Args: {
          p_assignee_id: string
          p_assigner_id: string
          p_assignment_action: string
          p_assignment_details?: Json
          p_assignment_type: string
          p_match_id: string
          p_previous_assignment_details?: Json
        }
        Returns: string
      }
      log_error: {
        Args: {
          p_component_name?: string
          p_error_category: string
          p_error_code?: string
          p_error_message?: string
          p_error_type: string
          p_function_name?: string
          p_metadata?: Json
          p_request_id?: string
          p_session_id?: string
          p_severity?: string
          p_stack_trace?: string
          p_url?: string
          p_user_agent?: string
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type?: string
        }
        Returns: undefined
      }
      notify_assigned_trackers: {
        Args: { p_match_id: string; p_tracker_assignments: Json }
        Returns: undefined
      }
      remove_user_role: {
        Args: {
          old_role: Database["public"]["Enums"]["user_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      reset_user_permissions_to_defaults: {
        Args: { user_id: string }
        Returns: boolean
      }
      schedule_match_reminders: { Args: never; Returns: undefined }
      update_user_metadata: {
        Args: { metadata_updates: Json; user_id: string }
        Returns: undefined
      }
      user_has_role:
        | {
            Args: { role_name: Database["public"]["Enums"]["user_role"] }
            Returns: boolean
          }
        | {
            Args: {
              check_role: Database["public"]["Enums"]["user_role"]
              target_user_id: string
            }
            Returns: boolean
          }
    }
    Enums: {
      code_analysis_status: "pending" | "processing" | "completed" | "failed"
      job_status: "pending" | "processing" | "completed" | "failed"
      tracker_type: "specialized" | "defence" | "midfield" | "attack"
      user_role:
        | "admin"
        | "teacher"
        | "user"
        | "tracker"
        | "manager"
        | "special"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      code_analysis_status: ["pending", "processing", "completed", "failed"],
      job_status: ["pending", "processing", "completed", "failed"],
      tracker_type: ["specialized", "defence", "midfield", "attack"],
      user_role: ["admin", "teacher", "user", "tracker", "manager", "special"],
    },
  },
} as const
