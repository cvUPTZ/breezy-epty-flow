export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
        Relationships: [
          {
            foreignKeyName: "event_types_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
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
          match_id: string
          player_id: number | null
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
          match_id: string
          player_id?: number | null
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
          match_id?: string
          player_id?: number | null
          team?: string | null
          timestamp?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
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
          {
            foreignKeyName: "match_tracker_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      match_tracker_assignments: {
        Row: {
          assigned_event_types: string[] | null
          assigned_player_id: number | null
          created_at: string
          id: string
          match_id: string
          player_id: number | null
          player_team_id: string
          tracker_id: string | null
          tracker_user_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_event_types?: string[] | null
          assigned_player_id?: number | null
          created_at?: string
          id?: string
          match_id: string
          player_id?: number | null
          player_team_id: string
          tracker_id?: string | null
          tracker_user_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_event_types?: string[] | null
          assigned_player_id?: number | null
          created_at?: string
          id?: string
          match_id?: string
          player_id?: number | null
          player_team_id?: string
          tracker_id?: string | null
          tracker_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tracker_user_id"
            columns: ["tracker_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tracker_user_id"
            columns: ["tracker_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_permissions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_tracker_user_id"
            columns: ["tracker_user_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_tracker_assignments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_tracker_assignments_tracker_user_id_fkey"
            columns: ["tracker_user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
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
            foreignKeyName: "match_video_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
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
        Relationships: [
          {
            foreignKeyName: "matches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "opposition_analysis_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
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
            foreignKeyName: "playlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
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
            referencedRelation: "profiles_with_permissions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_receiver"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
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
            referencedRelation: "profiles_with_permissions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
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
          league: string | null
          market_value: number | null
          mental_qualities: Json | null
          name: string
          nationality: string | null
          physical_attributes: Json | null
          position: string | null
          tactical_awareness: Json | null
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
          league?: string | null
          market_value?: number | null
          mental_qualities?: Json | null
          name: string
          nationality?: string | null
          physical_attributes?: Json | null
          position?: string | null
          tactical_awareness?: Json | null
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
          league?: string | null
          market_value?: number | null
          mental_qualities?: Json | null
          name?: string
          nationality?: string | null
          physical_attributes?: Json | null
          position?: string | null
          tactical_awareness?: Json | null
          technical_skills?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scouted_players_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
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
        Relationships: [
          {
            foreignKeyName: "scouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "timeline_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "tracker_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tracker_assignments_tracker_id_fkey"
            columns: ["tracker_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "tracker_device_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
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
            referencedRelation: "profiles_with_permissions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_event_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "video_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
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
            foreignKeyName: "video_tracker_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_tracker_assignments_match_video_id_fkey"
            columns: ["match_video_id"]
            isOneToOne: false
            referencedRelation: "match_video_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_tracker_assignments_tracker_id_fkey"
            columns: ["tracker_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
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
            referencedRelation: "profiles_with_permissions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "voice_room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
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
            foreignKeyName: "fk_tracker_user_id"
            columns: ["tracker_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tracker_user_id"
            columns: ["tracker_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_permissions"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_tracker_user_id"
            columns: ["tracker_user_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_tracker_assignments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_tracker_assignments_tracker_user_id_fkey"
            columns: ["tracker_user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles_with_permissions: {
        Row: {
          created_at: string | null
          custom_permissions: Json | null
          effective_permissions: Json | null
          has_custom_permissions: boolean | null
          updated_at: string | null
          user_email: string | null
          user_full_name: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string | null
          custom_permissions?: Json | null
          effective_permissions?: never
          has_custom_permissions?: never
          updated_at?: string | null
          user_email?: string | null
          user_full_name?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string | null
          custom_permissions?: Json | null
          effective_permissions?: never
          has_custom_permissions?: never
          updated_at?: string | null
          user_email?: string | null
          user_full_name?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles_view: {
        Row: {
          email: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          role_assigned_at: string | null
          user_created_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_role: {
        Args: {
          target_user_id: string
          new_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      assign_tracker_to_player: {
        Args: {
          _match_id: string
          _tracker_user_id: string
          _player_id: number
          _player_team_id: string
        }
        Returns: string
      }
      assign_user_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
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
      check_tracker_activity: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_ml_job: {
        Args: {
          p_video_url: string
          p_user_id: string
          p_priority?: string
          p_config?: Json
        }
        Returns: string
      }
      find_replacement_tracker: {
        Args: { p_match_id: string; p_absent_tracker_id: string }
        Returns: string
      }
      get_all_users_with_metadata: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          raw_user_meta_data: Json
          created_at: string
        }[]
      }
      get_ml_job: {
        Args: { p_job_id: string }
        Returns: {
          id: string
          video_url: string
          user_id: string
          status: string
          priority: string
          config: Json
          progress: number
          error_message: string
          results: Json
          created_at: string
          started_at: string
          completed_at: string
          estimated_completion: string
        }[]
      }
      get_room_participant_count: {
        Args: { room_id_param: string }
        Returns: number
      }
      get_tracker_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          full_name: string
          email: string
        }[]
      }
      get_tracker_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          full_name: string
          email: string
        }[]
      }
      get_trackers_with_email: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          full_name: string
          email: string
          created_at: string
          updated_at: string
        }[]
      }
      get_user_effective_permissions: {
        Args: { user_id: string }
        Returns: Json
      }
      get_user_ml_jobs: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: {
          id: string
          video_url: string
          user_id: string
          status: string
          priority: string
          config: Json
          progress: number
          error_message: string
          results: Json
          created_at: string
          started_at: string
          completed_at: string
          estimated_completion: string
        }[]
      }
      get_user_permissions: {
        Args: { user_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_id_param: string }
        Returns: string
      }
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
      has_elevated_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      insert_notification: {
        Args: {
          p_user_id: string
          p_match_id: string
          p_type: string
          p_title: string
          p_message: string
          p_data?: Json
        }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { p_user_id: string }
        Returns: boolean
      }
      is_tracker: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      notify_assigned_trackers: {
        Args: { p_match_id: string; p_tracker_assignments: Json }
        Returns: undefined
      }
      remove_user_role: {
        Args: {
          target_user_id: string
          old_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      reset_user_permissions_to_defaults: {
        Args: { user_id: string }
        Returns: boolean
      }
      schedule_match_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_metadata: {
        Args: { user_id: string; metadata_updates: Json }
        Returns: undefined
      }
      user_has_role: {
        Args:
          | { role_name: Database["public"]["Enums"]["user_role"] }
          | {
              target_user_id: string
              check_role: Database["public"]["Enums"]["user_role"]
            }
        Returns: boolean
      }
    }
    Enums: {
      job_status: "pending" | "processing" | "completed" | "failed"
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
      job_status: ["pending", "processing", "completed", "failed"],
      user_role: ["admin", "teacher", "user", "tracker", "manager", "special"],
    },
  },
} as const
