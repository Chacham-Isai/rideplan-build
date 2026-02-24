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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_requests: {
        Row: {
          created_at: string
          district: string
          email: string
          id: string
          name: string
          students: string
        }
        Insert: {
          created_at?: string
          district: string
          email: string
          id?: string
          name: string
          students: string
        }
        Update: {
          created_at?: string
          district?: string
          email?: string
          id?: string
          name?: string
          students?: string
        }
        Relationships: []
      }
      childcare_requests: {
        Row: {
          created_at: string
          days_needed: string[]
          id: string
          provider_address: string
          provider_name: string
          registration_id: string
          school_year: string
          status: Database["public"]["Enums"]["registration_status"]
          transport_type: Database["public"]["Enums"]["childcare_transport_type"]
          within_district: boolean | null
        }
        Insert: {
          created_at?: string
          days_needed?: string[]
          id?: string
          provider_address: string
          provider_name: string
          registration_id: string
          school_year: string
          status?: Database["public"]["Enums"]["registration_status"]
          transport_type?: Database["public"]["Enums"]["childcare_transport_type"]
          within_district?: boolean | null
        }
        Update: {
          created_at?: string
          days_needed?: string[]
          id?: string
          provider_address?: string
          provider_name?: string
          registration_id?: string
          school_year?: string
          status?: Database["public"]["Enums"]["registration_status"]
          transport_type?: Database["public"]["Enums"]["childcare_transport_type"]
          within_district?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "childcare_requests_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "student_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_reports: {
        Row: {
          bus_number: string
          contact_info: string | null
          created_at: string
          description: string
          driver_name: string
          id: string
          report_type: Database["public"]["Enums"]["driver_report_type"]
          route_info: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          bus_number: string
          contact_info?: string | null
          created_at?: string
          description: string
          driver_name: string
          id?: string
          report_type: Database["public"]["Enums"]["driver_report_type"]
          route_info?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          bus_number?: string
          contact_info?: string | null
          created_at?: string
          description?: string
          driver_name?: string
          id?: string
          report_type?: Database["public"]["Enums"]["driver_report_type"]
          route_info?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: []
      }
      driver_tips: {
        Row: {
          bus_number: string | null
          created_at: string
          driver_name: string | null
          id: string
          message: string | null
          tip_amount: number
          tipper_email: string
          tipper_name: string
        }
        Insert: {
          bus_number?: string | null
          created_at?: string
          driver_name?: string | null
          id?: string
          message?: string | null
          tip_amount: number
          tipper_email: string
          tipper_name: string
        }
        Update: {
          bus_number?: string | null
          created_at?: string
          driver_name?: string | null
          id?: string
          message?: string | null
          tip_amount?: number
          tipper_email?: string
          tipper_name?: string
        }
        Relationships: []
      }
      report_alerts: {
        Row: {
          acknowledged: boolean
          alert_type: string
          bus_number: string
          created_at: string
          details: string | null
          id: string
          report_count: number
        }
        Insert: {
          acknowledged?: boolean
          alert_type: string
          bus_number: string
          created_at?: string
          details?: string | null
          id?: string
          report_count?: number
        }
        Update: {
          acknowledged?: boolean
          alert_type?: string
          bus_number?: string
          created_at?: string
          details?: string | null
          id?: string
          report_count?: number
        }
        Relationships: []
      }
      residency_attestations: {
        Row: {
          attestation_text: string
          id: string
          ip_address: string | null
          parent_user_id: string
          registration_id: string
          signature_text: string
          signed_at: string
        }
        Insert: {
          attestation_text: string
          id?: string
          ip_address?: string | null
          parent_user_id: string
          registration_id: string
          signature_text: string
          signed_at?: string
        }
        Update: {
          attestation_text?: string
          id?: string
          ip_address?: string | null
          parent_user_id?: string
          registration_id?: string
          signature_text?: string
          signed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "residency_attestations_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "student_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      residency_documents: {
        Row: {
          document_type: string
          file_url: string
          id: string
          registration_id: string
          uploaded_at: string
        }
        Insert: {
          document_type: string
          file_url: string
          id?: string
          registration_id: string
          uploaded_at?: string
        }
        Update: {
          document_type?: string
          file_url?: string
          id?: string
          registration_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "residency_documents_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "student_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_reports: {
        Row: {
          ai_priority: Database["public"]["Enums"]["ai_priority"]
          bus_number: string
          created_at: string
          description: string
          id: string
          incident_date: string
          report_type: Database["public"]["Enums"]["safety_report_type"]
          reporter_email: string
          reporter_name: string
          reporter_phone: string | null
          school_name: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          ai_priority?: Database["public"]["Enums"]["ai_priority"]
          bus_number: string
          created_at?: string
          description: string
          id?: string
          incident_date: string
          report_type: Database["public"]["Enums"]["safety_report_type"]
          reporter_email: string
          reporter_name: string
          reporter_phone?: string | null
          school_name: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          ai_priority?: Database["public"]["Enums"]["ai_priority"]
          bus_number?: string
          created_at?: string
          description?: string
          id?: string
          incident_date?: string
          report_type?: Database["public"]["Enums"]["safety_report_type"]
          reporter_email?: string
          reporter_name?: string
          reporter_phone?: string | null
          school_name?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: []
      }
      student_registrations: {
        Row: {
          address_line: string
          city: string
          created_at: string
          distance_to_school: number | null
          district_boundary_check: boolean | null
          dob: string
          foster_care_flag: boolean | null
          geocoded_lat: number | null
          geocoded_lng: number | null
          grade: string
          id: string
          iep_flag: boolean | null
          mckinney_vento_flag: boolean | null
          parent_user_id: string
          school: string
          school_year: string
          section_504_flag: boolean | null
          state: string
          status: Database["public"]["Enums"]["registration_status"]
          student_name: string
          updated_at: string
          zip: string
        }
        Insert: {
          address_line: string
          city: string
          created_at?: string
          distance_to_school?: number | null
          district_boundary_check?: boolean | null
          dob: string
          foster_care_flag?: boolean | null
          geocoded_lat?: number | null
          geocoded_lng?: number | null
          grade: string
          id?: string
          iep_flag?: boolean | null
          mckinney_vento_flag?: boolean | null
          parent_user_id: string
          school: string
          school_year: string
          section_504_flag?: boolean | null
          state?: string
          status?: Database["public"]["Enums"]["registration_status"]
          student_name: string
          updated_at?: string
          zip: string
        }
        Update: {
          address_line?: string
          city?: string
          created_at?: string
          distance_to_school?: number | null
          district_boundary_check?: boolean | null
          dob?: string
          foster_care_flag?: boolean | null
          geocoded_lat?: number | null
          geocoded_lng?: number | null
          grade?: string
          id?: string
          iep_flag?: boolean | null
          mckinney_vento_flag?: boolean | null
          parent_user_id?: string
          school?: string
          school_year?: string
          section_504_flag?: boolean | null
          state?: string
          status?: Database["public"]["Enums"]["registration_status"]
          student_name?: string
          updated_at?: string
          zip?: string
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
      ai_priority: "low" | "medium" | "high" | "critical"
      app_role: "admin" | "user"
      childcare_transport_type: "am" | "pm" | "both"
      driver_report_type: "incident" | "maintenance" | "schedule" | "other"
      registration_status: "pending" | "approved" | "denied" | "under_review"
      report_status: "new" | "reviewing" | "resolved"
      safety_report_type: "bullying" | "driver_safety" | "other"
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
      ai_priority: ["low", "medium", "high", "critical"],
      app_role: ["admin", "user"],
      childcare_transport_type: ["am", "pm", "both"],
      driver_report_type: ["incident", "maintenance", "schedule", "other"],
      registration_status: ["pending", "approved", "denied", "under_review"],
      report_status: ["new", "reviewing", "resolved"],
      safety_report_type: ["bullying", "driver_safety", "other"],
    },
  },
} as const
