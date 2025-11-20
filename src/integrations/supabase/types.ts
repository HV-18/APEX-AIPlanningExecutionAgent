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
          created_at: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
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
      study_notes: {
        Row: {
          ai_generated: boolean | null
          content: string
          created_at: string | null
          id: string
          subject: string
          topic: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          subject: string
          topic: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          subject?: string
          topic?: string
          user_id?: string
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
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          subject: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: []
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
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
