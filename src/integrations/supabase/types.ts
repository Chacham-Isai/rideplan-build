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
      bid_responses: {
        Row: {
          bid_id: string
          contractor_name: string
          created_at: string
          fleet_details: string | null
          id: string
          proposed_rate: number
          safety_record: string | null
          status: Database["public"]["Enums"]["bid_response_status"]
          total_score: number | null
        }
        Insert: {
          bid_id: string
          contractor_name: string
          created_at?: string
          fleet_details?: string | null
          id?: string
          proposed_rate?: number
          safety_record?: string | null
          status?: Database["public"]["Enums"]["bid_response_status"]
          total_score?: number | null
        }
        Update: {
          bid_id?: string
          contractor_name?: string
          created_at?: string
          fleet_details?: string | null
          id?: string
          proposed_rate?: number
          safety_record?: string | null
          status?: Database["public"]["Enums"]["bid_response_status"]
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_responses_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          close_date: string | null
          created_at: string
          description: string | null
          id: string
          open_date: string | null
          routes_spec: string | null
          status: Database["public"]["Enums"]["bid_status"]
          title: string
        }
        Insert: {
          close_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          open_date?: string | null
          routes_spec?: string | null
          status?: Database["public"]["Enums"]["bid_status"]
          title: string
        }
        Update: {
          close_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          open_date?: string | null
          routes_spec?: string | null
          status?: Database["public"]["Enums"]["bid_status"]
          title?: string
        }
        Relationships: []
      }
      breach_incidents: {
        Row: {
          contractor_id: string | null
          created_at: string
          data_types_affected: string | null
          description: string
          discovered_date: string
          id: string
          incident_date: string
          notification_date: string | null
          notification_sent: boolean | null
          remediation_steps: string | null
          severity: string
          status: string
          students_affected: number | null
        }
        Insert: {
          contractor_id?: string | null
          created_at?: string
          data_types_affected?: string | null
          description: string
          discovered_date: string
          id?: string
          incident_date: string
          notification_date?: string | null
          notification_sent?: boolean | null
          remediation_steps?: string | null
          severity?: string
          status?: string
          students_affected?: number | null
        }
        Update: {
          contractor_id?: string | null
          created_at?: string
          data_types_affected?: string | null
          description?: string
          discovered_date?: string
          id?: string
          incident_date?: string
          notification_date?: string | null
          notification_sent?: boolean | null
          remediation_steps?: string | null
          severity?: string
          status?: string
          students_affected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "breach_incidents_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "ed_law_2d_contractors"
            referencedColumns: ["id"]
          },
        ]
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
      compliance_reports: {
        Row: {
          created_at: string
          created_by: string | null
          district_id: string
          document_url: string | null
          filed_date: string | null
          filing_deadline: string | null
          id: string
          notes: string | null
          report_type: string
          route_count: number | null
          school_year: string
          state_aid_claimed: number | null
          status: string
          student_count: number | null
          title: string
          total_expenditure: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          district_id: string
          document_url?: string | null
          filed_date?: string | null
          filing_deadline?: string | null
          id?: string
          notes?: string | null
          report_type: string
          route_count?: number | null
          school_year: string
          state_aid_claimed?: number | null
          status?: string
          student_count?: number | null
          title: string
          total_expenditure?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          district_id?: string
          document_url?: string | null
          filed_date?: string | null
          filing_deadline?: string | null
          id?: string
          notes?: string | null
          report_type?: string
          route_count?: number | null
          school_year?: string
          state_aid_claimed?: number | null
          status?: string
          student_count?: number | null
          title?: string
          total_expenditure?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_reports_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_training: {
        Row: {
          completed_count: number | null
          created_at: string
          district_id: string
          due_date: string | null
          id: string
          notes: string | null
          required_for: string
          status: string
          title: string
          total_required: number | null
          training_type: string
        }
        Insert: {
          completed_count?: number | null
          created_at?: string
          district_id: string
          due_date?: string | null
          id?: string
          notes?: string | null
          required_for?: string
          status?: string
          title: string
          total_required?: number | null
          training_type: string
        }
        Update: {
          completed_count?: number | null
          created_at?: string
          district_id?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          required_for?: string
          status?: string
          title?: string
          total_required?: number | null
          training_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_training_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_invoices: {
        Row: {
          contract_id: string
          created_at: string
          discrepancy_amount: number | null
          discrepancy_notes: string | null
          district_id: string
          gps_verified: boolean | null
          id: string
          invoice_date: string
          invoice_number: string
          invoiced_amount: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          verified_amount: number | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          discrepancy_amount?: number | null
          discrepancy_notes?: string | null
          district_id: string
          gps_verified?: boolean | null
          id?: string
          invoice_date: string
          invoice_number: string
          invoiced_amount?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          verified_amount?: number | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          discrepancy_amount?: number | null
          discrepancy_notes?: string | null
          district_id?: string
          gps_verified?: boolean | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoiced_amount?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          verified_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_invoices_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_insurance: {
        Row: {
          additional_insured: boolean | null
          contract_id: string
          coverage_amount: number
          created_at: string
          district_id: string
          document_url: string | null
          expiration_date: string
          id: string
          policy_number: string
          provider: string
          status: Database["public"]["Enums"]["insurance_status"]
        }
        Insert: {
          additional_insured?: boolean | null
          contract_id: string
          coverage_amount?: number
          created_at?: string
          district_id: string
          document_url?: string | null
          expiration_date: string
          id?: string
          policy_number: string
          provider: string
          status?: Database["public"]["Enums"]["insurance_status"]
        }
        Update: {
          additional_insured?: boolean | null
          contract_id?: string
          coverage_amount?: number
          created_at?: string
          district_id?: string
          document_url?: string | null
          expiration_date?: string
          id?: string
          policy_number?: string
          provider?: string
          status?: Database["public"]["Enums"]["insurance_status"]
        }
        Relationships: [
          {
            foreignKeyName: "contractor_insurance_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_insurance_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_performance: {
        Row: {
          complaints_count: number | null
          contract_id: string
          created_at: string
          district_id: string
          id: string
          on_time_pct: number | null
          period_month: string
          routes_completed: number | null
          routes_missed: number | null
          safety_incidents: number | null
        }
        Insert: {
          complaints_count?: number | null
          contract_id: string
          created_at?: string
          district_id: string
          id?: string
          on_time_pct?: number | null
          period_month: string
          routes_completed?: number | null
          routes_missed?: number | null
          safety_incidents?: number | null
        }
        Update: {
          complaints_count?: number | null
          contract_id?: string
          created_at?: string
          district_id?: string
          id?: string
          on_time_pct?: number | null
          period_month?: string
          routes_completed?: number | null
          routes_missed?: number | null
          safety_incidents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_performance_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_performance_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          annual_value: number
          contact_email: string | null
          contact_phone: string | null
          contract_end: string
          contract_start: string
          contractor_name: string
          created_at: string
          district_id: string
          id: string
          notes: string | null
          rate_per_mile: number | null
          rate_per_route: number | null
          renewal_terms: string | null
          routes_count: number
          status: Database["public"]["Enums"]["contract_status"]
        }
        Insert: {
          annual_value?: number
          contact_email?: string | null
          contact_phone?: string | null
          contract_end: string
          contract_start: string
          contractor_name: string
          created_at?: string
          district_id: string
          id?: string
          notes?: string | null
          rate_per_mile?: number | null
          rate_per_route?: number | null
          renewal_terms?: string | null
          routes_count?: number
          status?: Database["public"]["Enums"]["contract_status"]
        }
        Update: {
          annual_value?: number
          contact_email?: string | null
          contact_phone?: string | null
          contract_end?: string
          contract_start?: string
          contractor_name?: string
          created_at?: string
          district_id?: string
          id?: string
          notes?: string | null
          rate_per_mile?: number | null
          rate_per_route?: number | null
          renewal_terms?: string | null
          routes_count?: number
          status?: Database["public"]["Enums"]["contract_status"]
        }
        Relationships: [
          {
            foreignKeyName: "contracts_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_user_roles: {
        Row: {
          created_at: string | null
          district_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          district_id: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          district_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_user_roles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          address: string | null
          beds_code: string | null
          city: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          state: string
          student_count: number | null
          subscription_status: string | null
          subscription_tier: string | null
          superintendent_email: string | null
          superintendent_name: string | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          beds_code?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string
          student_count?: number | null
          subscription_status?: string | null
          subscription_tier?: string | null
          superintendent_email?: string | null
          superintendent_name?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          beds_code?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string
          student_count?: number | null
          subscription_status?: string | null
          subscription_tier?: string | null
          superintendent_email?: string | null
          superintendent_name?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: []
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
      ed_law_2d_contractors: {
        Row: {
          agreement_date: string | null
          agreement_signed: boolean | null
          annual_review_date: string | null
          breach_plan_filed: boolean | null
          contract_id: string | null
          contractor_name: string
          created_at: string
          data_access_level: string
          district_id: string
          encryption_verified: boolean | null
          id: string
          notes: string | null
          parents_notified: boolean | null
          status: string
        }
        Insert: {
          agreement_date?: string | null
          agreement_signed?: boolean | null
          annual_review_date?: string | null
          breach_plan_filed?: boolean | null
          contract_id?: string | null
          contractor_name: string
          created_at?: string
          data_access_level?: string
          district_id: string
          encryption_verified?: boolean | null
          id?: string
          notes?: string | null
          parents_notified?: boolean | null
          status?: string
        }
        Update: {
          agreement_date?: string | null
          agreement_signed?: boolean | null
          annual_review_date?: string | null
          breach_plan_filed?: boolean | null
          contract_id?: string | null
          contractor_name?: string
          created_at?: string
          data_access_level?: string
          district_id?: string
          encryption_verified?: boolean | null
          id?: string
          notes?: string | null
          parents_notified?: boolean | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ed_law_2d_contractors_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ed_law_2d_contractors_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      mckinney_vento_students: {
        Row: {
          created_at: string
          current_address: string | null
          district_id: string
          enrollment_date: string | null
          grade: string
          id: string
          liaison_contact: string | null
          living_situation: string
          notes: string | null
          route_id: string | null
          school: string
          school_of_origin: string | null
          status: string
          student_name: string
          transportation_provided: boolean | null
        }
        Insert: {
          created_at?: string
          current_address?: string | null
          district_id: string
          enrollment_date?: string | null
          grade: string
          id?: string
          liaison_contact?: string | null
          living_situation?: string
          notes?: string | null
          route_id?: string | null
          school: string
          school_of_origin?: string | null
          status?: string
          student_name: string
          transportation_provided?: boolean | null
        }
        Update: {
          created_at?: string
          current_address?: string | null
          district_id?: string
          enrollment_date?: string | null
          grade?: string
          id?: string
          liaison_contact?: string | null
          living_situation?: string
          notes?: string | null
          route_id?: string | null
          school?: string
          school_of_origin?: string | null
          status?: string
          student_name?: string
          transportation_provided?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "mckinney_vento_students_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mckinney_vento_students_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          district_id: string
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          phone: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district_id: string
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district_id?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
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
      residency_audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          admin_user_id: string
          created_at: string
          id: string
          notes: string | null
          registration_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          admin_user_id: string
          created_at?: string
          id?: string
          notes?: string | null
          registration_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          admin_user_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "residency_audit_log_registration_id_fkey"
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
      route_scenarios: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          district_id: string
          estimated_savings: number | null
          id: string
          name: string
          parameters: Json | null
          results: Json | null
          routes_affected: number | null
          scenario_type: string
          status: string
          students_affected: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          district_id: string
          estimated_savings?: number | null
          id?: string
          name: string
          parameters?: Json | null
          results?: Json | null
          routes_affected?: number | null
          scenario_type?: string
          status?: string
          students_affected?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          district_id?: string
          estimated_savings?: number | null
          id?: string
          name?: string
          parameters?: Json | null
          results?: Json | null
          routes_affected?: number | null
          scenario_type?: string
          status?: string
          students_affected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_scenarios_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          address: string | null
          avg_actual_time: string | null
          created_at: string
          district_id: string
          dwell_seconds: number | null
          id: string
          lat: number | null
          lng: number | null
          route_id: string
          scheduled_time: string | null
          stop_name: string
          stop_order: number
          students_alighting: number | null
          students_boarding: number | null
        }
        Insert: {
          address?: string | null
          avg_actual_time?: string | null
          created_at?: string
          district_id: string
          dwell_seconds?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          route_id: string
          scheduled_time?: string | null
          stop_name: string
          stop_order?: number
          students_alighting?: number | null
          students_boarding?: number | null
        }
        Update: {
          address?: string | null
          avg_actual_time?: string | null
          created_at?: string
          district_id?: string
          dwell_seconds?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          route_id?: string
          scheduled_time?: string | null
          stop_name?: string
          stop_order?: number
          students_alighting?: number | null
          students_boarding?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          am_end: string | null
          am_start: string | null
          avg_ride_time_min: number | null
          bus_number: string | null
          capacity: number | null
          contractor_id: string | null
          cost_per_student: number | null
          created_at: string
          district_id: string
          driver_name: string | null
          id: string
          notes: string | null
          on_time_pct: number | null
          pm_end: string | null
          pm_start: string | null
          route_number: string
          school: string
          status: string
          tier: number
          total_miles: number | null
          total_students: number | null
        }
        Insert: {
          am_end?: string | null
          am_start?: string | null
          avg_ride_time_min?: number | null
          bus_number?: string | null
          capacity?: number | null
          contractor_id?: string | null
          cost_per_student?: number | null
          created_at?: string
          district_id: string
          driver_name?: string | null
          id?: string
          notes?: string | null
          on_time_pct?: number | null
          pm_end?: string | null
          pm_start?: string | null
          route_number: string
          school: string
          status?: string
          tier?: number
          total_miles?: number | null
          total_students?: number | null
        }
        Update: {
          am_end?: string | null
          am_start?: string | null
          avg_ride_time_min?: number | null
          bus_number?: string | null
          capacity?: number | null
          contractor_id?: string | null
          cost_per_student?: number | null
          created_at?: string
          district_id?: string
          driver_name?: string | null
          id?: string
          notes?: string | null
          on_time_pct?: number | null
          pm_end?: string | null
          pm_start?: string | null
          route_number?: string
          school?: string
          status?: string
          tier?: number
          total_miles?: number | null
          total_students?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
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
          district_id: string
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
          district_id: string
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
          district_id?: string
          id?: string
          incident_date?: string
          report_type?: Database["public"]["Enums"]["safety_report_type"]
          reporter_email?: string
          reporter_name?: string
          reporter_phone?: string | null
          school_name?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "safety_reports_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      student_registrations: {
        Row: {
          address_line: string
          city: string
          created_at: string
          distance_to_school: number | null
          district_boundary_check: boolean | null
          district_id: string
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
          district_id: string
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
          district_id?: string
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
        Relationships: [
          {
            foreignKeyName: "student_registrations_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_district_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      has_app_role: { Args: { required_role: string }; Returns: boolean }
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
      audit_action:
        | "approved"
        | "denied"
        | "flagged"
        | "requested_info"
        | "unflagged"
      bid_response_status: "submitted" | "shortlisted" | "awarded" | "rejected"
      bid_status: "draft" | "open" | "closed" | "awarded"
      childcare_transport_type: "am" | "pm" | "both"
      contract_status: "active" | "expired" | "pending"
      driver_report_type: "incident" | "maintenance" | "schedule" | "other"
      insurance_status: "active" | "expiring" | "expired"
      invoice_status: "pending" | "approved" | "disputed"
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
      audit_action: [
        "approved",
        "denied",
        "flagged",
        "requested_info",
        "unflagged",
      ],
      bid_response_status: ["submitted", "shortlisted", "awarded", "rejected"],
      bid_status: ["draft", "open", "closed", "awarded"],
      childcare_transport_type: ["am", "pm", "both"],
      contract_status: ["active", "expired", "pending"],
      driver_report_type: ["incident", "maintenance", "schedule", "other"],
      insurance_status: ["active", "expiring", "expired"],
      invoice_status: ["pending", "approved", "disputed"],
      registration_status: ["pending", "approved", "denied", "under_review"],
      report_status: ["new", "reviewing", "resolved"],
      safety_report_type: ["bullying", "driver_safety", "other"],
    },
  },
} as const
