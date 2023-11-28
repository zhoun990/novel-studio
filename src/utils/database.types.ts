export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      episodes: {
        Row: {
          character_count: number
          created_at: string
          id: string
          novel_id: string
          tags: string[]
          text: string
          title: string | null
          updated_at: string
        }
        Insert: {
          character_count?: number
          created_at?: string
          id?: string
          novel_id: string
          tags?: string[]
          text?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          character_count?: number
          created_at?: string
          id?: string
          novel_id?: string
          tags?: string[]
          text?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_novel_id_fkey"
            columns: ["novel_id"]
            isOneToOne: false
            referencedRelation: "novels"
            referencedColumns: ["id"]
          }
        ]
      }
      novels: {
        Row: {
          created_at: string
          description: string | null
          episodes_list: string[]
          id: string
          note: string | null
          target_character_count: number | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          episodes_list: string[]
          id?: string
          note?: string | null
          target_character_count?: number | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          episodes_list?: string[]
          id?: string
          note?: string | null
          target_character_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "novels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          displayname: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          displayname?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          displayname?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
