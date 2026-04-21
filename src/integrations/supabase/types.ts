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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_conversations: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          pinned: boolean
          title: string
          track_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
          track_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
          track_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_conversations_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          category: string
          created_at: string
          id: string
          model: string
          name: string
          role: string
          system_prompt: string
          tagline: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          model?: string
          name: string
          role: string
          system_prompt: string
          tagline: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          model?: string
          name?: string
          role?: string
          system_prompt?: string
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string
          description: string
          id: string
          kind: string
          sort_order: number
          success_metric: string | null
          title: string
          track_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          kind?: string
          sort_order?: number
          success_metric?: string | null
          title: string
          track_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          kind?: string
          sort_order?: number
          success_metric?: string | null
          title?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          creator: string | null
          duration_minutes: number | null
          id: string
          sort_order: number
          title: string
          track_id: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          creator?: string | null
          duration_minutes?: number | null
          id?: string
          sort_order?: number
          title: string
          track_id: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          creator?: string | null
          duration_minutes?: number | null
          id?: string
          sort_order?: number
          title?: string
          track_id?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          first_win: string | null
          id: string
          onboarding_complete: boolean
          primary_track: string | null
          streak_days: number
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_win?: string | null
          id?: string
          onboarding_complete?: boolean
          primary_track?: string | null
          streak_days?: number
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_win?: string | null
          id?: string
          onboarding_complete?: boolean
          primary_track?: string | null
          streak_days?: number
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      prompts: {
        Row: {
          agent_id: string | null
          body: string
          created_at: string
          difficulty: string
          id: string
          sort_order: number
          title: string
          track_id: string
          updated_at: string
          use_case: string
        }
        Insert: {
          agent_id?: string | null
          body: string
          created_at?: string
          difficulty?: string
          id?: string
          sort_order?: number
          title: string
          track_id: string
          updated_at?: string
          use_case: string
        }
        Update: {
          agent_id?: string | null
          body?: string
          created_at?: string
          difficulty?: string
          id?: string
          sort_order?: number
          title?: string
          track_id?: string
          updated_at?: string
          use_case?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompts_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          note: string | null
          track_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          note?: string | null
          track_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          note?: string | null
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_items_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          body: string
          created_at: string
          id: string
          problem_solved: string | null
          sort_order: number
          title: string
          track_id: string
          updated_at: string
          use_case: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          problem_solved?: string | null
          sort_order?: number
          title: string
          track_id: string
          updated_at?: string
          use_case: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          problem_solved?: string | null
          sort_order?: number
          title?: string
          track_id?: string
          updated_at?: string
          use_case?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          created_at: string
          description: string
          html_content: string | null
          id: string
          name: string
          sort_order: number
          track_id: string
          updated_at: string
          url: string | null
          use_case: string | null
        }
        Insert: {
          created_at?: string
          description: string
          html_content?: string | null
          id?: string
          name: string
          sort_order?: number
          track_id: string
          updated_at?: string
          url?: string | null
          use_case?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          html_content?: string | null
          id?: string
          name?: string
          sort_order?: number
          track_id?: string
          updated_at?: string
          url?: string | null
          use_case?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_agents: {
        Row: {
          agent_id: string
          is_primary: boolean
          track_id: string
        }
        Insert: {
          agent_id: string
          is_primary?: boolean
          track_id: string
        }
        Update: {
          agent_id?: string
          is_primary?: boolean
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_agents_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          agent_name: string
          agent_role: string
          created_at: string
          description: string
          hue: string
          id: string
          number: string
          slug: string
          sort_order: number
          tagline: string
          tier: Database["public"]["Enums"]["membership_tier"]
          title: string
          updated_at: string
        }
        Insert: {
          agent_name: string
          agent_role: string
          created_at?: string
          description: string
          hue: string
          id?: string
          number: string
          slug: string
          sort_order?: number
          tagline: string
          tier?: Database["public"]["Enums"]["membership_tier"]
          title: string
          updated_at?: string
        }
        Update: {
          agent_name?: string
          agent_role?: string
          created_at?: string
          description?: string
          hue?: string
          id?: string
          number?: string
          slug?: string
          sort_order?: number
          tagline?: string
          tier?: Database["public"]["Enums"]["membership_tier"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_track_progress: {
        Row: {
          created_at: string
          id: string
          last_active_at: string
          percent_complete: number
          track_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_active_at?: string
          percent_complete?: number
          track_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_active_at?: string
          percent_complete?: number
          track_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          presentation_url: string | null
          published: boolean
          questions_answered: string[]
          sort_order: number
          tags: string[]
          title: string
          track_id: string
          updated_at: string
          youtube_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          presentation_url?: string | null
          published?: boolean
          questions_answered?: string[]
          sort_order?: number
          tags?: string[]
          title: string
          track_id: string
          updated_at?: string
          youtube_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          presentation_url?: string | null
          published?: boolean
          questions_answered?: string[]
          sort_order?: number
          tags?: string[]
          title?: string
          track_id?: string
          updated_at?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
      membership_tier: "free" | "try" | "growth" | "power"
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
      app_role: ["admin", "member"],
      membership_tier: ["free", "try", "growth", "power"],
    },
  },
} as const
