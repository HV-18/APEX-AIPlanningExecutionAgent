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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_modes: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          mode: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          mode: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          mode?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
          points_required: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          name: string
          points_required: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
          points_required?: number
        }
        Relationships: []
      }
      budget_entries: {
        Row: {
          amount: number
          carbon_impact: number | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_sustainable: boolean | null
          user_id: string
        }
        Insert: {
          amount: number
          carbon_impact?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_sustainable?: boolean | null
          user_id: string
        }
        Update: {
          amount?: number
          carbon_impact?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_sustainable?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      collaborative_editing_sessions: {
        Row: {
          active_users: Json | null
          current_content: string | null
          id: string
          last_updated: string | null
          note_id: string
          version: number | null
          workspace_id: string
        }
        Insert: {
          active_users?: Json | null
          current_content?: string | null
          id?: string
          last_updated?: string | null
          note_id: string
          version?: number | null
          workspace_id: string
        }
        Update: {
          active_users?: Json | null
          current_content?: string | null
          id?: string
          last_updated?: string | null
          note_id?: string
          version?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborative_editing_sessions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          tag_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          tag_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "workspace_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_quizzes: {
        Row: {
          created_at: string | null
          difficulty: string
          id: string
          questions: Json
          subject: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty: string
          id?: string
          questions: Json
          subject: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string
          id?: string
          questions?: Json
          subject?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_quizzes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      editing_operations: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          operation_type: string
          position: number
          session_id: string
          timestamp: number
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          operation_type: string
          position: number
          session_id: string
          timestamp: number
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          operation_type?: string
          position?: number
          session_id?: string
          timestamp?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "editing_operations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaborative_editing_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          note_id: string | null
          prompt: string
          saved_to_notes: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          note_id?: string | null
          prompt: string
          saved_to_notes?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          note_id?: string | null
          prompt?: string
          saved_to_notes?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      hand_raises: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          id: string
          raised_at: string | null
          room_id: string
          status: string
          user_id: string
          user_name: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          id?: string
          raised_at?: string | null
          room_id: string
          status?: string
          user_id: string
          user_name: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          id?: string
          raised_at?: string | null
          room_id?: string
          status?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "hand_raises_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      health_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          goal_type: string
          id: string
          last_updated: string | null
          streak_days: number | null
          target_value: number
          unit: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          goal_type: string
          id?: string
          last_updated?: string | null
          streak_days?: number | null
          target_value: number
          unit: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          goal_type?: string
          id?: string
          last_updated?: string | null
          streak_days?: number | null
          target_value?: number
          unit?: string
          user_id?: string
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          completed: boolean | null
          created_at: string | null
          feedback: string | null
          id: string
          questions_asked: number | null
          score: number | null
          subject: string | null
          type: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          questions_asked?: number | null
          score?: number | null
          subject?: string | null
          type: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          questions_asked?: number | null
          score?: number | null
          subject?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          category: string
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          points: number
          user_id: string
          user_name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          points: number
          user_id: string
          user_name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          points?: number
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      learning_projects: {
        Row: {
          category: string
          collaborators: string[] | null
          completed: boolean | null
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          impact_goal: string | null
          progress: number | null
          real_world_problem: string | null
          resources: string[] | null
          skills_learned: string[] | null
          title: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          category: string
          collaborators?: string[] | null
          completed?: boolean | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          impact_goal?: string | null
          progress?: number | null
          real_world_problem?: string | null
          resources?: string[] | null
          skills_learned?: string[] | null
          title: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          category?: string
          collaborators?: string[] | null
          completed?: boolean | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          impact_goal?: string | null
          progress?: number | null
          real_world_problem?: string | null
          resources?: string[] | null
          skills_learned?: string[] | null
          title?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_templates: {
        Row: {
          author_id: string
          author_name: string | null
          category: string
          color: string | null
          created_at: string | null
          description: string | null
          downloads_count: number | null
          icon: string | null
          id: string
          is_published: boolean | null
          name: string
          rating: number | null
          template_data: Json
          updated_at: string | null
        }
        Insert: {
          author_id: string
          author_name?: string | null
          category: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          downloads_count?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          rating?: number | null
          template_data: Json
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          author_name?: string | null
          category?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          downloads_count?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          rating?: number | null
          template_data?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          calories: number | null
          cost: number | null
          created_at: string | null
          day_of_week: number
          id: string
          ingredients: string[] | null
          is_sustainable: boolean | null
          meal_name: string
          meal_type: string
          recipe_notes: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          calories?: number | null
          cost?: number | null
          created_at?: string | null
          day_of_week: number
          id?: string
          ingredients?: string[] | null
          is_sustainable?: boolean | null
          meal_name: string
          meal_type: string
          recipe_notes?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          calories?: number | null
          cost?: number | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          ingredients?: string[] | null
          is_sustainable?: boolean | null
          meal_name?: string
          meal_type?: string
          recipe_notes?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number | null
          cost: number | null
          created_at: string | null
          id: string
          is_sustainable: boolean | null
          meal_name: string
          meal_type: string | null
          notes: string | null
          nutrition_score: string | null
          photo_url: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          cost?: number | null
          created_at?: string | null
          id?: string
          is_sustainable?: boolean | null
          meal_name: string
          meal_type?: string | null
          notes?: string | null
          nutrition_score?: string | null
          photo_url?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          cost?: number | null
          created_at?: string | null
          id?: string
          is_sustainable?: boolean | null
          meal_name?: string
          meal_type?: string | null
          notes?: string | null
          nutrition_score?: string | null
          photo_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          created_at: string | null
          id: string
          mood_score: number
          notes: string | null
          sentiment: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mood_score: number
          notes?: string | null
          sentiment?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mood_score?: number
          notes?: string | null
          sentiment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pomodoro_sessions: {
        Row: {
          break_minutes: number
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number
          focus_topic: string | null
          id: string
          user_id: string
        }
        Insert: {
          break_minutes?: number
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number
          focus_topic?: string | null
          id?: string
          user_id: string
        }
        Update: {
          break_minutes?: number
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number
          focus_topic?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          preferred_subjects: string[] | null
          study_goals: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          preferred_subjects?: string[] | null
          study_goals?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          preferred_subjects?: string[] | null
          study_goals?: string[] | null
        }
        Relationships: []
      }
      room_files: {
        Row: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string | null
          id: string
          room_id: string
          uploaded_at: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size: number
          file_type?: string | null
          id?: string
          room_id: string
          uploaded_at?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string | null
          id?: string
          room_id?: string
          uploaded_at?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_files_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          room_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          room_id: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          room_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          created_by_name: string
          id: string
          room_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          created_by_name: string
          id?: string
          room_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          created_by_name?: string
          id?: string
          room_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_notes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_participants: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string | null
          room_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          room_id: string
          user_id: string
          user_name: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          room_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_tasks: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          room_id: string
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          room_id: string
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          room_id?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      session_recordings: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          file_size: number | null
          id: string
          recorded_by: string
          recorded_by_name: string
          recording_path: string
          room_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          id?: string
          recorded_by: string
          recorded_by_name: string
          recording_path: string
          room_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          id?: string
          recorded_by?: string
          recorded_by_name?: string
          recording_path?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_recordings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      study_notes: {
        Row: {
          ai_generated: boolean | null
          content: string
          created_at: string | null
          id: string
          subject: string
          topic: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          subject: string
          topic: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          subject?: string
          topic?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_notes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      study_patterns: {
        Row: {
          avg_focus_duration: number | null
          best_study_hour: number | null
          created_at: string | null
          id: string
          last_study_date: string | null
          preferred_subjects: string[] | null
          streak_days: number | null
          updated_at: string | null
          user_id: string
          weak_areas: string[] | null
        }
        Insert: {
          avg_focus_duration?: number | null
          best_study_hour?: number | null
          created_at?: string | null
          id?: string
          last_study_date?: string | null
          preferred_subjects?: string[] | null
          streak_days?: number | null
          updated_at?: string | null
          user_id: string
          weak_areas?: string[] | null
        }
        Update: {
          avg_focus_duration?: number | null
          best_study_hour?: number | null
          created_at?: string | null
          id?: string
          last_study_date?: string | null
          preferred_subjects?: string[] | null
          streak_days?: number | null
          updated_at?: string | null
          user_id?: string
          weak_areas?: string[] | null
        }
        Relationships: []
      }
      study_rooms: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          max_participants: number | null
          name: string
          topic: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name: string
          topic?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name?: string
          topic?: string | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          completed: boolean | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          subject: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          subject: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          subject?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      study_tips: {
        Row: {
          generated_at: string | null
          id: string
          is_read: boolean | null
          tip_text: string
          tip_type: string
          user_id: string
        }
        Insert: {
          generated_at?: string | null
          id?: string
          is_read?: boolean | null
          tip_text: string
          tip_type: string
          user_id: string
        }
        Update: {
          generated_at?: string | null
          id?: string
          is_read?: boolean | null
          tip_text?: string
          tip_type?: string
          user_id?: string
        }
        Relationships: []
      }
      team_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          current_value: number | null
          id: string
          team_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          current_value?: number | null
          id?: string
          team_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          current_value?: number | null
          id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "team_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_challenge_progress_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_challenges: {
        Row: {
          bonus_points: number
          challenge_type: string
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          start_date: string
          target_value: number
          title: string
        }
        Insert: {
          bonus_points: number
          challenge_type: string
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          start_date: string
          target_value: number
          title: string
        }
        Update: {
          bonus_points?: number
          challenge_type?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string
          team_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string
          team_id: string
          user_id: string
          user_name: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string
          team_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          team_points: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          team_points?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          team_points?: number | null
        }
        Relationships: []
      }
      template_ratings: {
        Row: {
          created_at: string | null
          id: string
          rating: number | null
          review: string | null
          template_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating?: number | null
          review?: string | null
          template_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: number | null
          review?: string | null
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_ratings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "marketplace_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_events: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          start_time: string
          title: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          start_time: string
          title: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          start_time?: string
          title?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_logs: {
        Row: {
          co2_saved: number | null
          cost: number | null
          created_at: string | null
          destination: string | null
          distance_km: number
          duration_minutes: number | null
          id: string
          mode: string
          user_id: string
        }
        Insert: {
          co2_saved?: number | null
          cost?: number | null
          created_at?: string | null
          destination?: string | null
          distance_km: number
          duration_minutes?: number | null
          id?: string
          mode: string
          user_id: string
        }
        Update: {
          co2_saved?: number | null
          cost?: number | null
          created_at?: string | null
          destination?: string | null
          distance_km?: number
          duration_minutes?: number | null
          id?: string
          mode?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          created_at: string | null
          id: string
          level: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_workspace_settings: {
        Row: {
          active_workspace_id: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_workspace_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_workspace_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workspace_settings_active_workspace_id_fkey"
            columns: ["active_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_signals: {
        Row: {
          created_at: string | null
          from_user_id: string
          id: string
          room_id: string
          signal_data: Json
          signal_type: string
          to_user_id: string
        }
        Insert: {
          created_at?: string | null
          from_user_id: string
          id?: string
          room_id: string
          signal_data: Json
          signal_type: string
          to_user_id: string
        }
        Update: {
          created_at?: string | null
          from_user_id?: string
          id?: string
          room_id?: string
          signal_data?: Json
          signal_type?: string
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_signals_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_interventions: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          effectiveness_rating: number | null
          id: string
          intervention_type: string
          scheduled_for: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          effectiveness_rating?: number | null
          id?: string
          intervention_type: string
          scheduled_for?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          effectiveness_rating?: number | null
          id?: string
          intervention_type?: string
          scheduled_for?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      wellness_reports: {
        Row: {
          avg_mood_score: number | null
          avg_nutrition_score: string | null
          created_at: string | null
          id: string
          insights: Json | null
          meals_logged: number | null
          pomodoro_count: number | null
          recommendations: string[] | null
          report_date: string
          report_type: string
          study_minutes: number | null
          sustainability_score: number | null
          user_id: string
        }
        Insert: {
          avg_mood_score?: number | null
          avg_nutrition_score?: string | null
          created_at?: string | null
          id?: string
          insights?: Json | null
          meals_logged?: number | null
          pomodoro_count?: number | null
          recommendations?: string[] | null
          report_date: string
          report_type: string
          study_minutes?: number | null
          sustainability_score?: number | null
          user_id: string
        }
        Update: {
          avg_mood_score?: number | null
          avg_nutrition_score?: string | null
          created_at?: string | null
          id?: string
          insights?: Json | null
          meals_logged?: number | null
          pomodoro_count?: number | null
          recommendations?: string[] | null
          report_date?: string
          report_type?: string
          study_minutes?: number | null
          sustainability_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      whiteboard_strokes: {
        Row: {
          created_at: string | null
          id: string
          room_id: string
          stroke_data: Json
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          room_id: string
          stroke_data: Json
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          room_id?: string
          stroke_data?: Json
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "whiteboard_strokes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_activities: {
        Row: {
          activity_description: string
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string
          user_name: string | null
          workspace_id: string
        }
        Insert: {
          activity_description: string
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
          user_name?: string | null
          workspace_id: string
        }
        Update: {
          activity_description?: string
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
          user_name?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_activities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_automation_rules: {
        Row: {
          action_config: Json | null
          action_type: string
          created_at: string | null
          created_by: string
          id: string
          is_enabled: boolean | null
          last_triggered: string | null
          rule_name: string
          trigger_config: Json | null
          trigger_type: string
          workspace_id: string
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          created_at?: string | null
          created_by: string
          id?: string
          is_enabled?: boolean | null
          last_triggered?: string | null
          rule_name: string
          trigger_config?: Json | null
          trigger_type: string
          workspace_id: string
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_enabled?: boolean | null
          last_triggered?: string | null
          rule_name?: string
          trigger_config?: Json | null
          trigger_type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_automation_rules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_dashboard_widgets: {
        Row: {
          created_at: string | null
          id: string
          is_visible: boolean | null
          position: number | null
          user_id: string
          widget_config: Json | null
          widget_type: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number | null
          user_id: string
          widget_config?: Json | null
          widget_type: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number | null
          user_id?: string
          widget_config?: Json | null
          widget_type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_dashboard_widgets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_files: {
        Row: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string | null
          id: string
          uploaded_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size: number
          file_type?: string | null
          id?: string
          uploaded_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string | null
          id?: string
          uploaded_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_files_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_integrations: {
        Row: {
          created_at: string | null
          id: string
          integration_type: string
          is_enabled: boolean | null
          last_sync: string | null
          settings: Json | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          integration_type: string
          is_enabled?: boolean | null
          last_sync?: string | null
          settings?: Json | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          integration_type?: string
          is_enabled?: boolean | null
          last_sync?: string | null
          settings?: Json | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_integrations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role: string
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_tags: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_tags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_templates: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          created_by: string
          description: string | null
          icon: string | null
          id: string
          is_public: boolean | null
          name: string
          template_data: Json | null
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_data?: Json | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_data?: Json | null
        }
        Relationships: []
      }
      workspace_versions: {
        Row: {
          change_description: string | null
          changed_by: string
          content_id: string
          content_snapshot: Json
          content_type: string
          created_at: string | null
          id: string
          version_number: number
          workspace_id: string
        }
        Insert: {
          change_description?: string | null
          changed_by: string
          content_id: string
          content_snapshot: Json
          content_type: string
          created_at?: string | null
          id?: string
          version_number: number
          workspace_id: string
        }
        Update: {
          change_description?: string | null
          changed_by?: string
          content_id?: string
          content_snapshot?: Json
          content_type?: string
          created_at?: string | null
          id?: string
          version_number?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_versions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_workspace_role: {
        Args: { user_uuid: string; workspace_uuid: string }
        Returns: string
      }
      is_workspace_member: {
        Args: { user_uuid: string; workspace_uuid: string }
        Returns: boolean
      }
      log_workspace_activity: {
        Args: {
          p_activity_description: string
          p_activity_type: string
          p_metadata?: Json
          p_user_id: string
          p_workspace_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
