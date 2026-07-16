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
      admissions: {
        Row: {
          actual_discharge_date: string | null
          admission_date: string
          admission_type: string
          admitting_diagnosis: string | null
          admitting_doctor_id: string
          bed_number: string | null
          created_at: string | null
          created_by: string | null
          discharge_diagnosis: string | null
          discharge_summary: string | null
          discharge_type: string | null
          expected_discharge_date: string | null
          id: string
          patient_id: string
          referring_appointment_id: string | null
          status: string
          tenant_id: string
          updated_at: string | null
          ward_id: string
        }
        Insert: {
          actual_discharge_date?: string | null
          admission_date?: string
          admission_type?: string
          admitting_diagnosis?: string | null
          admitting_doctor_id: string
          bed_number?: string | null
          created_at?: string | null
          created_by?: string | null
          discharge_diagnosis?: string | null
          discharge_summary?: string | null
          discharge_type?: string | null
          expected_discharge_date?: string | null
          id?: string
          patient_id: string
          referring_appointment_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
          ward_id: string
        }
        Update: {
          actual_discharge_date?: string | null
          admission_date?: string
          admission_type?: string
          admitting_diagnosis?: string | null
          admitting_doctor_id?: string
          bed_number?: string | null
          created_at?: string | null
          created_by?: string | null
          discharge_diagnosis?: string | null
          discharge_summary?: string | null
          discharge_type?: string | null
          expected_discharge_date?: string | null
          id?: string
          patient_id?: string
          referring_appointment_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admissions_admitting_doctor_id_fkey"
            columns: ["admitting_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_referring_appointment_id_fkey"
            columns: ["referring_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "admissions_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_notes: {
        Row: {
          appointment_id: string
          clinical_notes: string | null
          created_at: string | null
          diagnosis: string | null
          doctor_id: string
          follow_up_date: string | null
          follow_up_doctor_id: string | null
          id: string
          medications: Json | null
          tenant_id: string
          treatment_plan: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          clinical_notes?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id: string
          follow_up_date?: string | null
          follow_up_doctor_id?: string | null
          id?: string
          medications?: Json | null
          tenant_id: string
          treatment_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          clinical_notes?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          follow_up_doctor_id?: string | null
          id?: string
          medications?: Json | null
          tenant_id?: string
          treatment_plan?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_notes_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_notes_follow_up_doctor_id_fkey"
            columns: ["follow_up_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          attended_at: string | null
          consultation_fee: number | null
          created_at: string | null
          doctor_id: string
          end_time: string | null
          id: string
          notes: string | null
          patient_email: string | null
          patient_id: string | null
          patient_id_number: string | null
          patient_name: string
          patient_phone: string
          reason_for_visit: string | null
          reminded_at: string | null
          reminder_sent: boolean | null
          specialty: string
          status: string | null
          tenant_id: string
          triage_priority: number | null
          updated_at: string | null
          visit_type: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          attended_at?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          doctor_id: string
          end_time?: string | null
          id?: string
          notes?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_id_number?: string | null
          patient_name: string
          patient_phone: string
          reason_for_visit?: string | null
          reminded_at?: string | null
          reminder_sent?: boolean | null
          specialty: string
          status?: string | null
          tenant_id: string
          triage_priority?: number | null
          updated_at?: string | null
          visit_type?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          attended_at?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          doctor_id?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_id_number?: string | null
          patient_name?: string
          patient_phone?: string
          reason_for_visit?: string | null
          reminded_at?: string | null
          reminder_sent?: boolean | null
          specialty?: string
          status?: string | null
          tenant_id?: string
          triage_priority?: number | null
          updated_at?: string | null
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          record_id: string | null
          table_name: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string | null
          table_name: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string | null
          table_name?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bird_weights: {
        Row: {
          age_days: number
          average_weight_kg: number
          branch_id: string
          created_at: string
          cumulative_feed_kg: number | null
          feed_conversion_ratio: number | null
          flock_id: string
          house_id: string
          id: string
          max_weight_kg: number | null
          min_weight_kg: number | null
          notes: string | null
          sample_size: number
          std_deviation: number | null
          target_weight_kg: number | null
          tenant_id: string
          uniformity_pct: number | null
          variance_pct: number | null
          weigh_date: string
          weighed_by: string | null
        }
        Insert: {
          age_days: number
          average_weight_kg: number
          branch_id: string
          created_at?: string
          cumulative_feed_kg?: number | null
          feed_conversion_ratio?: number | null
          flock_id: string
          house_id: string
          id?: string
          max_weight_kg?: number | null
          min_weight_kg?: number | null
          notes?: string | null
          sample_size?: number
          std_deviation?: number | null
          target_weight_kg?: number | null
          tenant_id: string
          uniformity_pct?: number | null
          variance_pct?: number | null
          weigh_date: string
          weighed_by?: string | null
        }
        Update: {
          age_days?: number
          average_weight_kg?: number
          branch_id?: string
          created_at?: string
          cumulative_feed_kg?: number | null
          feed_conversion_ratio?: number | null
          flock_id?: string
          house_id?: string
          id?: string
          max_weight_kg?: number | null
          min_weight_kg?: number | null
          notes?: string | null
          sample_size?: number
          std_deviation?: number | null
          target_weight_kg?: number | null
          tenant_id?: string
          uniformity_pct?: number | null
          variance_pct?: number | null
          weigh_date?: string
          weighed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bird_weights_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bird_weights_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "bird_weights_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bird_weights_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bird_weights_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bird_weights_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bird_weights_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "bird_weights_weighed_by_fkey"
            columns: ["weighed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          category: string
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          tenant_id: string
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category?: string
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug: string
          tenant_id: string
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          branch_type: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_main: boolean | null
          name: string
          phone: string | null
          tenant_id: string | null
        }
        Insert: {
          address?: string | null
          branch_type?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          name: string
          phone?: string | null
          tenant_id?: string | null
        }
        Update: {
          address?: string | null
          branch_type?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          name?: string
          phone?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      breeding_records: {
        Row: {
          actual_fertility_pct: number | null
          branch_id: string
          breeding_purpose: string
          created_at: string
          created_by: string | null
          expected_fertility_pct: number | null
          female_count: number
          female_flock_id: string
          id: string
          male_count: number
          male_flock_id: string
          mating_end_date: string | null
          mating_ratio: string | null
          mating_start_date: string
          notes: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          actual_fertility_pct?: number | null
          branch_id: string
          breeding_purpose?: string
          created_at?: string
          created_by?: string | null
          expected_fertility_pct?: number | null
          female_count?: number
          female_flock_id: string
          id?: string
          male_count?: number
          male_flock_id: string
          mating_end_date?: string | null
          mating_ratio?: string | null
          mating_start_date: string
          notes?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          actual_fertility_pct?: number | null
          branch_id?: string
          breeding_purpose?: string
          created_at?: string
          created_by?: string | null
          expected_fertility_pct?: number | null
          female_count?: number
          female_flock_id?: string
          id?: string
          male_count?: number
          male_flock_id?: string
          mating_end_date?: string | null
          mating_ratio?: string | null
          mating_start_date?: string
          notes?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "breeding_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breeding_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "breeding_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breeding_records_female_flock_id_fkey"
            columns: ["female_flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breeding_records_female_flock_id_fkey"
            columns: ["female_flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breeding_records_male_flock_id_fkey"
            columns: ["male_flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breeding_records_male_flock_id_fkey"
            columns: ["male_flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breeding_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breeding_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          tenant_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      clinic_settings: {
        Row: {
          about_clinic: string | null
          accent_color: string | null
          accreditations: string[] | null
          advance_booking_days: number | null
          appointment_buffer_minutes: number | null
          appointment_slot_duration_minutes: number | null
          certified_by: string | null
          city: string | null
          clinic_banner_url: string | null
          clinic_description: string | null
          clinic_logo_url: string | null
          clinic_name: string | null
          country: string | null
          created_at: string | null
          doctor_count: number | null
          email: string | null
          emergency_phone: string | null
          enable_appointment_booking: boolean | null
          enable_blog: boolean | null
          enable_doctor_directory: boolean | null
          enable_emergency_banner: boolean | null
          facility_overview: string | null
          google_maps_embed_url: string | null
          hms_config: Json | null
          id: string
          latitude: number | null
          longitude: number | null
          lunch_break_end: string | null
          lunch_break_start: string | null
          max_appointments_per_slot: number | null
          mission_statement: string | null
          phone_number: string | null
          postal_code: string | null
          primary_color: string | null
          secondary_color: string | null
          street_address: string | null
          tenant_id: string
          updated_at: string | null
          vision_statement: string | null
          weekend_working: boolean | null
          whatsapp_number: string | null
          working_hours_end: string | null
          working_hours_start: string | null
          years_established: number | null
        }
        Insert: {
          about_clinic?: string | null
          accent_color?: string | null
          accreditations?: string[] | null
          advance_booking_days?: number | null
          appointment_buffer_minutes?: number | null
          appointment_slot_duration_minutes?: number | null
          certified_by?: string | null
          city?: string | null
          clinic_banner_url?: string | null
          clinic_description?: string | null
          clinic_logo_url?: string | null
          clinic_name?: string | null
          country?: string | null
          created_at?: string | null
          doctor_count?: number | null
          email?: string | null
          emergency_phone?: string | null
          enable_appointment_booking?: boolean | null
          enable_blog?: boolean | null
          enable_doctor_directory?: boolean | null
          enable_emergency_banner?: boolean | null
          facility_overview?: string | null
          google_maps_embed_url?: string | null
          hms_config?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          lunch_break_end?: string | null
          lunch_break_start?: string | null
          max_appointments_per_slot?: number | null
          mission_statement?: string | null
          phone_number?: string | null
          postal_code?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          street_address?: string | null
          tenant_id: string
          updated_at?: string | null
          vision_statement?: string | null
          weekend_working?: boolean | null
          whatsapp_number?: string | null
          working_hours_end?: string | null
          working_hours_start?: string | null
          years_established?: number | null
        }
        Update: {
          about_clinic?: string | null
          accent_color?: string | null
          accreditations?: string[] | null
          advance_booking_days?: number | null
          appointment_buffer_minutes?: number | null
          appointment_slot_duration_minutes?: number | null
          certified_by?: string | null
          city?: string | null
          clinic_banner_url?: string | null
          clinic_description?: string | null
          clinic_logo_url?: string | null
          clinic_name?: string | null
          country?: string | null
          created_at?: string | null
          doctor_count?: number | null
          email?: string | null
          emergency_phone?: string | null
          enable_appointment_booking?: boolean | null
          enable_blog?: boolean | null
          enable_doctor_directory?: boolean | null
          enable_emergency_banner?: boolean | null
          facility_overview?: string | null
          google_maps_embed_url?: string | null
          hms_config?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          lunch_break_end?: string | null
          lunch_break_start?: string | null
          max_appointments_per_slot?: number | null
          mission_statement?: string | null
          phone_number?: string | null
          postal_code?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          street_address?: string | null
          tenant_id?: string
          updated_at?: string | null
          vision_statement?: string | null
          weekend_working?: boolean | null
          whatsapp_number?: string | null
          working_hours_end?: string | null
          working_hours_start?: string | null
          years_established?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      clinical_billing: {
        Row: {
          admission_id: string | null
          amount_paid: number
          billing_date: string
          billing_notes: string | null
          cash_amount: number | null
          consultation_id: string | null
          created_at: string | null
          created_by: string | null
          discount: number
          id: string
          insurance_amount: number | null
          invoice_number: string
          nhif_amount: number | null
          patient_id: string
          payment_method: string | null
          payment_status: string
          sale_id: string | null
          subtotal: number
          tax: number
          tenant_id: string
          total: number
          updated_at: string | null
        }
        Insert: {
          admission_id?: string | null
          amount_paid?: number
          billing_date?: string
          billing_notes?: string | null
          cash_amount?: number | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount?: number
          id?: string
          insurance_amount?: number | null
          invoice_number: string
          nhif_amount?: number | null
          patient_id: string
          payment_method?: string | null
          payment_status?: string
          sale_id?: string | null
          subtotal?: number
          tax?: number
          tenant_id: string
          total?: number
          updated_at?: string | null
        }
        Update: {
          admission_id?: string | null
          amount_paid?: number
          billing_date?: string
          billing_notes?: string | null
          cash_amount?: number | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount?: number
          id?: string
          insurance_amount?: number | null
          invoice_number?: string
          nhif_amount?: number | null
          patient_id?: string
          payment_method?: string | null
          payment_status?: string
          sale_id?: string | null
          subtotal?: number
          tax?: number
          tenant_id?: string
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_billing_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_billing_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_billing_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_billing_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_billing_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_billing_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_billing_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      consultations: {
        Row: {
          admission_id: string | null
          appointment_id: string | null
          assessment: string | null
          bp_diastolic: number | null
          bp_systolic: number | null
          chief_complaint: string | null
          consultation_date: string
          consultation_fee: number | null
          created_at: string | null
          created_by: string | null
          diagnosis: string | null
          differential_diagnosis: string | null
          doctor_id: string
          examination_findings: string | null
          follow_up_date: string | null
          follow_up_instructions: string | null
          height_cm: number | null
          history_of_present_illness: string | null
          icd_code: string | null
          id: string
          investigations_ordered: string | null
          is_complete: boolean | null
          lab_tests_ordered: string | null
          medications_prescribed: string | null
          o2_saturation: number | null
          past_medical_history: string | null
          patient_id: string
          physical_examination: string | null
          plan: string | null
          pulse_rate: number | null
          respiratory_rate: number | null
          review_of_systems: string | null
          temperature: number | null
          tenant_id: string
          treatment_plan: string | null
          updated_at: string | null
          visit_type: string
          weight_kg: number | null
        }
        Insert: {
          admission_id?: string | null
          appointment_id?: string | null
          assessment?: string | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          chief_complaint?: string | null
          consultation_date?: string
          consultation_fee?: number | null
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          differential_diagnosis?: string | null
          doctor_id: string
          examination_findings?: string | null
          follow_up_date?: string | null
          follow_up_instructions?: string | null
          height_cm?: number | null
          history_of_present_illness?: string | null
          icd_code?: string | null
          id?: string
          investigations_ordered?: string | null
          is_complete?: boolean | null
          lab_tests_ordered?: string | null
          medications_prescribed?: string | null
          o2_saturation?: number | null
          past_medical_history?: string | null
          patient_id: string
          physical_examination?: string | null
          plan?: string | null
          pulse_rate?: number | null
          respiratory_rate?: number | null
          review_of_systems?: string | null
          temperature?: number | null
          tenant_id: string
          treatment_plan?: string | null
          updated_at?: string | null
          visit_type?: string
          weight_kg?: number | null
        }
        Update: {
          admission_id?: string | null
          appointment_id?: string | null
          assessment?: string | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          chief_complaint?: string | null
          consultation_date?: string
          consultation_fee?: number | null
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          differential_diagnosis?: string | null
          doctor_id?: string
          examination_findings?: string | null
          follow_up_date?: string | null
          follow_up_instructions?: string | null
          height_cm?: number | null
          history_of_present_illness?: string | null
          icd_code?: string | null
          id?: string
          investigations_ordered?: string | null
          is_complete?: boolean | null
          lab_tests_ordered?: string | null
          medications_prescribed?: string | null
          o2_saturation?: number | null
          past_medical_history?: string | null
          patient_id?: string
          physical_examination?: string | null
          plan?: string | null
          pulse_rate?: number | null
          respiratory_rate?: number | null
          review_of_systems?: string | null
          temperature?: number | null
          tenant_id?: string
          treatment_plan?: string | null
          updated_at?: string | null
          visit_type?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      crane_assignments: {
        Row: {
          crane_id: string
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          is_current: boolean
          operator_id: string
          site_id: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          crane_id: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          operator_id: string
          site_id?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          crane_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          operator_id?: string
          site_id?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crane_assignments_crane_id_fkey"
            columns: ["crane_id"]
            isOneToOne: false
            referencedRelation: "crane_cranes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_assignments_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "crane_operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_assignments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "crane_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crane_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_breakdowns: {
        Row: {
          component_failed: string | null
          crane_id: string
          created_at: string
          created_by: string | null
          date_reported: string
          deleted_at: string | null
          description: string
          documents: string[] | null
          downtime_end: string | null
          downtime_hours: number | null
          downtime_start: string | null
          id: string
          operator_id: string | null
          parts_replaced: string[] | null
          photos: string[] | null
          repair_cost: number | null
          resolution_notes: string | null
          root_cause: string | null
          severity: Database["public"]["Enums"]["breakdown_severity"]
          site_id: string | null
          status: Database["public"]["Enums"]["breakdown_status"]
          technician_id: string | null
          ticket_number: string
          updated_at: string
        }
        Insert: {
          component_failed?: string | null
          crane_id: string
          created_at?: string
          created_by?: string | null
          date_reported?: string
          deleted_at?: string | null
          description: string
          documents?: string[] | null
          downtime_end?: string | null
          downtime_hours?: number | null
          downtime_start?: string | null
          id?: string
          operator_id?: string | null
          parts_replaced?: string[] | null
          photos?: string[] | null
          repair_cost?: number | null
          resolution_notes?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["breakdown_severity"]
          site_id?: string | null
          status?: Database["public"]["Enums"]["breakdown_status"]
          technician_id?: string | null
          ticket_number?: string
          updated_at?: string
        }
        Update: {
          component_failed?: string | null
          crane_id?: string
          created_at?: string
          created_by?: string | null
          date_reported?: string
          deleted_at?: string | null
          description?: string
          documents?: string[] | null
          downtime_end?: string | null
          downtime_hours?: number | null
          downtime_start?: string | null
          id?: string
          operator_id?: string | null
          parts_replaced?: string[] | null
          photos?: string[] | null
          repair_cost?: number | null
          resolution_notes?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["breakdown_severity"]
          site_id?: string | null
          status?: Database["public"]["Enums"]["breakdown_status"]
          technician_id?: string | null
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crane_breakdowns_crane_id_fkey"
            columns: ["crane_id"]
            isOneToOne: false
            referencedRelation: "crane_cranes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_breakdowns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_breakdowns_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "crane_operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_breakdowns_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "crane_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_breakdowns_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_components: {
        Row: {
          component_name: string
          component_type: string
          crane_id: string
          created_at: string
          current_condition: number
          cycles_count: number
          deleted_at: string | null
          expected_lifespan_hours: number | null
          expected_lifespan_months: number | null
          hours_used: number
          id: string
          installation_date: string
          last_service_date: string | null
          manufacturer: string | null
          model: string | null
          next_service_date: string | null
          notes: string | null
          serial_number: string | null
          service_frequency_days: number | null
          service_frequency_hours: number | null
          status: Database["public"]["Enums"]["component_status"]
          updated_at: string
        }
        Insert: {
          component_name: string
          component_type: string
          crane_id: string
          created_at?: string
          current_condition?: number
          cycles_count?: number
          deleted_at?: string | null
          expected_lifespan_hours?: number | null
          expected_lifespan_months?: number | null
          hours_used?: number
          id?: string
          installation_date: string
          last_service_date?: string | null
          manufacturer?: string | null
          model?: string | null
          next_service_date?: string | null
          notes?: string | null
          serial_number?: string | null
          service_frequency_days?: number | null
          service_frequency_hours?: number | null
          status?: Database["public"]["Enums"]["component_status"]
          updated_at?: string
        }
        Update: {
          component_name?: string
          component_type?: string
          crane_id?: string
          created_at?: string
          current_condition?: number
          cycles_count?: number
          deleted_at?: string | null
          expected_lifespan_hours?: number | null
          expected_lifespan_months?: number | null
          hours_used?: number
          id?: string
          installation_date?: string
          last_service_date?: string | null
          manufacturer?: string | null
          model?: string | null
          next_service_date?: string | null
          notes?: string | null
          serial_number?: string | null
          service_frequency_days?: number | null
          service_frequency_hours?: number | null
          status?: Database["public"]["Enums"]["component_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crane_components_crane_id_fkey"
            columns: ["crane_id"]
            isOneToOne: false
            referencedRelation: "crane_cranes"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_cranes: {
        Row: {
          capacity_tonnes: number
          crane_id: string
          created_at: string
          current_location_id: string | null
          current_operator_id: string | null
          current_site_id: string | null
          deleted_at: string | null
          health_score: number
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          manufacturer: string
          model: string
          notes: string | null
          serial_number: string
          status: Database["public"]["Enums"]["crane_status"]
          total_expenses: number
          total_hours: number
          total_revenue: number
          updated_at: string
          year_manufactured: number | null
        }
        Insert: {
          capacity_tonnes: number
          crane_id: string
          created_at?: string
          current_location_id?: string | null
          current_operator_id?: string | null
          current_site_id?: string | null
          deleted_at?: string | null
          health_score?: number
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          manufacturer: string
          model: string
          notes?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["crane_status"]
          total_expenses?: number
          total_hours?: number
          total_revenue?: number
          updated_at?: string
          year_manufactured?: number | null
        }
        Update: {
          capacity_tonnes?: number
          crane_id?: string
          created_at?: string
          current_location_id?: string | null
          current_operator_id?: string | null
          current_site_id?: string | null
          deleted_at?: string | null
          health_score?: number
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          manufacturer?: string
          model?: string
          notes?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["crane_status"]
          total_expenses?: number
          total_hours?: number
          total_revenue?: number
          updated_at?: string
          year_manufactured?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crane_cranes_current_location_id_fkey"
            columns: ["current_location_id"]
            isOneToOne: false
            referencedRelation: "crane_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_cranes_current_site_id_fkey"
            columns: ["current_site_id"]
            isOneToOne: false
            referencedRelation: "crane_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_cranes_operator_fk"
            columns: ["current_operator_id"]
            isOneToOne: false
            referencedRelation: "crane_operators"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_daily_operations: {
        Row: {
          crane_id: string
          created_at: string
          created_by: string | null
          date: string
          deleted_at: string | null
          floors_served: number
          hours_worked: number
          id: string
          is_overload: boolean
          load_carried_tonnes: number
          maximum_load_tonnes: number
          operator_id: string
          remarks: string | null
          revenue: number
          shift_end: string | null
          shift_start: string | null
          site_id: string | null
          trips: number
          updated_at: string
        }
        Insert: {
          crane_id: string
          created_at?: string
          created_by?: string | null
          date: string
          deleted_at?: string | null
          floors_served?: number
          hours_worked?: number
          id?: string
          is_overload?: boolean
          load_carried_tonnes?: number
          maximum_load_tonnes?: number
          operator_id: string
          remarks?: string | null
          revenue?: number
          shift_end?: string | null
          shift_start?: string | null
          site_id?: string | null
          trips?: number
          updated_at?: string
        }
        Update: {
          crane_id?: string
          created_at?: string
          created_by?: string | null
          date?: string
          deleted_at?: string | null
          floors_served?: number
          hours_worked?: number
          id?: string
          is_overload?: boolean
          load_carried_tonnes?: number
          maximum_load_tonnes?: number
          operator_id?: string
          remarks?: string | null
          revenue?: number
          shift_end?: string | null
          shift_start?: string | null
          site_id?: string | null
          trips?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crane_daily_operations_crane_id_fkey"
            columns: ["crane_id"]
            isOneToOne: false
            referencedRelation: "crane_cranes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_daily_operations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_daily_operations_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "crane_operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_daily_operations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "crane_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_downtime_logs: {
        Row: {
          breakdown_id: string | null
          crane_id: string
          created_at: string
          duration_hours: number | null
          end_time: string | null
          id: string
          reason: string | null
          start_time: string
        }
        Insert: {
          breakdown_id?: string | null
          crane_id: string
          created_at?: string
          duration_hours?: number | null
          end_time?: string | null
          id?: string
          reason?: string | null
          start_time: string
        }
        Update: {
          breakdown_id?: string | null
          crane_id?: string
          created_at?: string
          duration_hours?: number | null
          end_time?: string | null
          id?: string
          reason?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "crane_downtime_logs_breakdown_id_fkey"
            columns: ["breakdown_id"]
            isOneToOne: false
            referencedRelation: "crane_breakdowns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_downtime_logs_crane_id_fkey"
            columns: ["crane_id"]
            isOneToOne: false
            referencedRelation: "crane_cranes"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          crane_id: string
          created_at: string
          created_by: string | null
          date: string
          deleted_at: string | null
          description: string
          id: string
          invoice_number: string | null
          receipt_url: string | null
          site_id: string | null
          supplier: string | null
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          crane_id: string
          created_at?: string
          created_by?: string | null
          date: string
          deleted_at?: string | null
          description: string
          id?: string
          invoice_number?: string | null
          receipt_url?: string | null
          site_id?: string | null
          supplier?: string | null
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          crane_id?: string
          created_at?: string
          created_by?: string | null
          date?: string
          deleted_at?: string | null
          description?: string
          id?: string
          invoice_number?: string | null
          receipt_url?: string | null
          site_id?: string | null
          supplier?: string | null
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crane_expenses_crane_id_fkey"
            columns: ["crane_id"]
            isOneToOne: false
            referencedRelation: "crane_cranes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_expenses_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "crane_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_expenses_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_locations: {
        Row: {
          address: string | null
          county: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          county?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          county?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      crane_maintenance_services: {
        Row: {
          attachments: string[] | null
          cost: number
          crane_id: string
          created_at: string
          created_by: string | null
          date_performed: string
          deleted_at: string | null
          hours_at_service: number
          id: string
          next_service_date: string | null
          next_service_hours: number | null
          notes: string | null
          parts_used: string[] | null
          service_type: string
          technician_id: string | null
          technician_name: string | null
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          cost?: number
          crane_id: string
          created_at?: string
          created_by?: string | null
          date_performed: string
          deleted_at?: string | null
          hours_at_service?: number
          id?: string
          next_service_date?: string | null
          next_service_hours?: number | null
          notes?: string | null
          parts_used?: string[] | null
          service_type: string
          technician_id?: string | null
          technician_name?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          cost?: number
          crane_id?: string
          created_at?: string
          created_by?: string | null
          date_performed?: string
          deleted_at?: string | null
          hours_at_service?: number
          id?: string
          next_service_date?: string | null
          next_service_hours?: number | null
          notes?: string | null
          parts_used?: string[] | null
          service_type?: string
          technician_id?: string | null
          technician_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crane_maintenance_services_crane_id_fkey"
            columns: ["crane_id"]
            isOneToOne: false
            referencedRelation: "crane_cranes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_maintenance_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_maintenance_services_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_notifications: {
        Row: {
          crane_id: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          crane_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          crane_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crane_notifications_crane_id_fkey"
            columns: ["crane_id"]
            isOneToOne: false
            referencedRelation: "crane_cranes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_operators: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          current_crane_id: string | null
          current_site_id: string | null
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employment_date: string
          full_name: string
          hire_date: string | null
          id: string
          id_number: string | null
          is_active: boolean
          license_class: string | null
          license_expiry: string | null
          license_number: string
          notes: string | null
          performance_score: number
          phone: string
          total_hours_worked: number
          total_trips: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          current_crane_id?: string | null
          current_site_id?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employment_date: string
          full_name: string
          hire_date?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean
          license_class?: string | null
          license_expiry?: string | null
          license_number: string
          notes?: string | null
          performance_score?: number
          phone: string
          total_hours_worked?: number
          total_trips?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          current_crane_id?: string | null
          current_site_id?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employment_date?: string
          full_name?: string
          hire_date?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean
          license_class?: string | null
          license_expiry?: string | null
          license_number?: string
          notes?: string | null
          performance_score?: number
          phone?: string
          total_hours_worked?: number
          total_trips?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crane_operators_current_crane_id_fkey"
            columns: ["current_crane_id"]
            isOneToOne: false
            referencedRelation: "crane_cranes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_operators_current_site_id_fkey"
            columns: ["current_site_id"]
            isOneToOne: false
            referencedRelation: "crane_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_operators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_projects: {
        Row: {
          client_name: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          site_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          total_floors: number | null
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          site_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          total_floors?: number | null
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          site_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          total_floors?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crane_projects_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "crane_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_service_alerts: {
        Row: {
          alert_type: string
          component_id: string | null
          crane_id: string
          created_at: string
          current_hours: number | null
          due_date: string | null
          due_hours: number | null
          id: string
          is_resolved: boolean
          message: string
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          updated_at: string
        }
        Insert: {
          alert_type: string
          component_id?: string | null
          crane_id: string
          created_at?: string
          current_hours?: number | null
          due_date?: string | null
          due_hours?: number | null
          id?: string
          is_resolved?: boolean
          message: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          updated_at?: string
        }
        Update: {
          alert_type?: string
          component_id?: string | null
          crane_id?: string
          created_at?: string
          current_hours?: number | null
          due_date?: string | null
          due_hours?: number | null
          id?: string
          is_resolved?: boolean
          message?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crane_service_alerts_crane_id_fkey"
            columns: ["crane_id"]
            isOneToOne: false
            referencedRelation: "crane_cranes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_service_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crane_spare_parts: {
        Row: {
          category: string
          compatible_cranes: string[] | null
          created_at: string
          current_stock: number
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          manufacturer: string | null
          minimum_stock: number
          name: string
          part_number: string
          reorder_point: number
          supplier: string | null
          unit_cost: number
          updated_at: string
        }
        Insert: {
          category: string
          compatible_cranes?: string[] | null
          created_at?: string
          current_stock?: number
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          manufacturer?: string | null
          minimum_stock?: number
          name: string
          part_number: string
          reorder_point?: number
          supplier?: string | null
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          category?: string
          compatible_cranes?: string[] | null
          created_at?: string
          current_stock?: number
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          manufacturer?: string | null
          minimum_stock?: number
          name?: string
          part_number?: string
          reorder_point?: number
          supplier?: string | null
          unit_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      crane_users: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      crane_work_orders: {
        Row: {
          actual_cost: number | null
          breakdown_id: string | null
          completed_at: string | null
          crane_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string
          downtime_hours: number | null
          estimated_cost: number | null
          id: string
          parts_used: Json | null
          photos: string[] | null
          priority: Database["public"]["Enums"]["breakdown_severity"]
          resolution_notes: string | null
          root_cause: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["work_order_status"]
          technician_id: string | null
          ticket_number: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          breakdown_id?: string | null
          completed_at?: string | null
          crane_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description: string
          downtime_hours?: number | null
          estimated_cost?: number | null
          id?: string
          parts_used?: Json | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["breakdown_severity"]
          resolution_notes?: string | null
          root_cause?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["work_order_status"]
          technician_id?: string | null
          ticket_number?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          breakdown_id?: string | null
          completed_at?: string | null
          crane_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          downtime_hours?: number | null
          estimated_cost?: number | null
          id?: string
          parts_used?: Json | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["breakdown_severity"]
          resolution_notes?: string | null
          root_cause?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["work_order_status"]
          technician_id?: string | null
          ticket_number?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crane_work_orders_breakdown_id_fkey"
            columns: ["breakdown_id"]
            isOneToOne: false
            referencedRelation: "crane_breakdowns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_work_orders_crane_id_fkey"
            columns: ["crane_id"]
            isOneToOne: false
            referencedRelation: "crane_cranes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_work_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crane_work_orders_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "crane_users"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domain_mappings: {
        Row: {
          created_at: string | null
          domain_name: string
          domain_type: string
          id: string
          is_verified: boolean | null
          tenant_id: string
          updated_at: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain_name: string
          domain_type?: string
          id?: string
          is_verified?: boolean | null
          tenant_id: string
          updated_at?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain_name?: string
          domain_type?: string
          id?: string
          is_verified?: boolean | null
          tenant_id?: string
          updated_at?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_domain_mappings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_domain_mappings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          credit_limit: number | null
          email: string | null
          id: string
          id_number: string | null
          is_active: boolean | null
          loyalty_points: number | null
          name: string
          notes: string | null
          outstanding_balance: number | null
          phone: string | null
          tenant_id: string | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean | null
          loyalty_points?: number | null
          name: string
          notes?: string | null
          outstanding_balance?: number | null
          phone?: string | null
          tenant_id?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean | null
          loyalty_points?: number | null
          name?: string
          notes?: string | null
          outstanding_balance?: number | null
          phone?: string | null
          tenant_id?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      diagnoses: {
        Row: {
          consultation_id: string
          created_at: string | null
          description: string
          diagnosis_type: string
          icd10_code: string | null
          icd10_description: string | null
          id: string
          tenant_id: string
        }
        Insert: {
          consultation_id: string
          created_at?: string | null
          description: string
          diagnosis_type?: string
          icd10_code?: string | null
          icd10_description?: string | null
          id?: string
          tenant_id: string
        }
        Update: {
          consultation_id?: string
          created_at?: string | null
          description?: string
          diagnosis_type?: string
          icd10_code?: string | null
          icd10_description?: string | null
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      doctor_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          is_active: boolean | null
          slot_duration_minutes: number | null
          start_time: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          is_active?: boolean | null
          slot_duration_minutes?: number | null
          start_time: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          is_active?: boolean | null
          slot_duration_minutes?: number | null
          start_time?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_availability_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_availability_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_availability_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      doctors: {
        Row: {
          availability_status: string | null
          bio: string | null
          consultation_fee: number | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          email: string | null
          experience_years: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          license_expiry: string | null
          license_number: string | null
          name: string
          phone: string | null
          qualifications: string[] | null
          specialty: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          availability_status?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          name: string
          phone?: string | null
          qualifications?: string[] | null
          specialty: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          availability_status?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          name?: string
          phone?: string | null
          qualifications?: string[] | null
          specialty?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      edoshms_admissions: {
        Row: {
          admission_diagnosis: string | null
          admission_number: string
          admission_type: string | null
          admitted_at: string | null
          admitting_doctor_id: string | null
          attending_doctor_id: string | null
          bed_id: string | null
          branch_id: string
          condition_at_discharge: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          discharge_diagnosis: string | null
          discharge_instructions: string | null
          discharge_summary: string | null
          discharged_at: string | null
          expected_discharge_date: string | null
          follow_up_date: string | null
          id: string
          insurance_scheme_id: string | null
          patient_id: string
          sha_pre_auth_number: string | null
          status: Database["public"]["Enums"]["admission_status"] | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          visit_id: string | null
          ward_id: string | null
        }
        Insert: {
          admission_diagnosis?: string | null
          admission_number: string
          admission_type?: string | null
          admitted_at?: string | null
          admitting_doctor_id?: string | null
          attending_doctor_id?: string | null
          bed_id?: string | null
          branch_id: string
          condition_at_discharge?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          discharge_diagnosis?: string | null
          discharge_instructions?: string | null
          discharge_summary?: string | null
          discharged_at?: string | null
          expected_discharge_date?: string | null
          follow_up_date?: string | null
          id?: string
          insurance_scheme_id?: string | null
          patient_id: string
          sha_pre_auth_number?: string | null
          status?: Database["public"]["Enums"]["admission_status"] | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          visit_id?: string | null
          ward_id?: string | null
        }
        Update: {
          admission_diagnosis?: string | null
          admission_number?: string
          admission_type?: string | null
          admitted_at?: string | null
          admitting_doctor_id?: string | null
          attending_doctor_id?: string | null
          bed_id?: string | null
          branch_id?: string
          condition_at_discharge?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          discharge_diagnosis?: string | null
          discharge_instructions?: string | null
          discharge_summary?: string | null
          discharged_at?: string | null
          expected_discharge_date?: string | null
          follow_up_date?: string | null
          id?: string
          insurance_scheme_id?: string | null
          patient_id?: string
          sha_pre_auth_number?: string | null
          status?: Database["public"]["Enums"]["admission_status"] | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          visit_id?: string | null
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_admissions_admitting_doctor_id_fkey"
            columns: ["admitting_doctor_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_admissions_attending_doctor_id_fkey"
            columns: ["attending_doctor_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_admissions_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "edoshms_beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_admissions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_admissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_admissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_admissions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_admissions_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "edoshms_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_appointments: {
        Row: {
          appointment_date: string
          appointment_number: string
          appointment_time: string
          arrived_at: string | null
          branch_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          doctor_id: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          rescheduled_from: string | null
          source: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          visit_type: Database["public"]["Enums"]["visit_type"] | null
        }
        Insert: {
          appointment_date: string
          appointment_number: string
          appointment_time: string
          arrived_at?: string | null
          branch_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          rescheduled_from?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          visit_type?: Database["public"]["Enums"]["visit_type"] | null
        }
        Update: {
          appointment_date?: string
          appointment_number?: string
          appointment_time?: string
          arrived_at?: string | null
          branch_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          rescheduled_from?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          visit_type?: Database["public"]["Enums"]["visit_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_appointments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoshms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_appointments_rescheduled_from_fkey"
            columns: ["rescheduled_from"]
            isOneToOne: false
            referencedRelation: "edoshms_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_audit_logs: {
        Row: {
          action: string
          branch_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          branch_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          branch_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_audit_logs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_bed_transfers: {
        Row: {
          admission_id: string
          branch_id: string
          created_at: string | null
          from_bed_id: string | null
          from_ward_id: string | null
          id: string
          patient_id: string
          tenant_id: string
          to_bed_id: string
          to_ward_id: string
          transfer_reason: string | null
          transferred_at: string | null
          transferred_by: string | null
        }
        Insert: {
          admission_id: string
          branch_id: string
          created_at?: string | null
          from_bed_id?: string | null
          from_ward_id?: string | null
          id?: string
          patient_id: string
          tenant_id: string
          to_bed_id: string
          to_ward_id: string
          transfer_reason?: string | null
          transferred_at?: string | null
          transferred_by?: string | null
        }
        Update: {
          admission_id?: string
          branch_id?: string
          created_at?: string | null
          from_bed_id?: string | null
          from_ward_id?: string | null
          id?: string
          patient_id?: string
          tenant_id?: string
          to_bed_id?: string
          to_ward_id?: string
          transfer_reason?: string | null
          transferred_at?: string | null
          transferred_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_bed_transfers_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "edoshms_admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_bed_transfers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_bed_transfers_from_bed_id_fkey"
            columns: ["from_bed_id"]
            isOneToOne: false
            referencedRelation: "edoshms_beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_bed_transfers_from_ward_id_fkey"
            columns: ["from_ward_id"]
            isOneToOne: false
            referencedRelation: "edoshms_wards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_bed_transfers_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_bed_transfers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_bed_transfers_to_bed_id_fkey"
            columns: ["to_bed_id"]
            isOneToOne: false
            referencedRelation: "edoshms_beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_bed_transfers_to_ward_id_fkey"
            columns: ["to_ward_id"]
            isOneToOne: false
            referencedRelation: "edoshms_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_beds: {
        Row: {
          bed_number: string
          bed_type: string | null
          branch_id: string
          created_at: string | null
          daily_rate: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          status: Database["public"]["Enums"]["bed_status"] | null
          tenant_id: string
          updated_at: string | null
          ward_id: string
        }
        Insert: {
          bed_number: string
          bed_type?: string | null
          branch_id: string
          created_at?: string | null
          daily_rate?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          status?: Database["public"]["Enums"]["bed_status"] | null
          tenant_id: string
          updated_at?: string | null
          ward_id: string
        }
        Update: {
          bed_number?: string
          bed_type?: string | null
          branch_id?: string
          created_at?: string | null
          daily_rate?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          status?: Database["public"]["Enums"]["bed_status"] | null
          tenant_id?: string
          updated_at?: string | null
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_beds_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_beds_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_beds_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "edoshms_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_branches: {
        Row: {
          address: string | null
          code: string
          county: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          email: string | null
          facility_type: Database["public"]["Enums"]["facility_type"] | null
          id: string
          is_active: boolean | null
          is_main: boolean | null
          latitude: number | null
          longitude: number | null
          mfl_code: string | null
          name: string
          phone: string | null
          settings: Json | null
          sub_county: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          ward: string | null
        }
        Insert: {
          address?: string | null
          code: string
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"] | null
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          latitude?: number | null
          longitude?: number | null
          mfl_code?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          sub_county?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          ward?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"] | null
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          latitude?: number | null
          longitude?: number | null
          mfl_code?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          sub_county?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_cashier_shifts: {
        Row: {
          branch_id: string
          card_collected: number | null
          cash_collected: number | null
          cashier_id: string
          closed_at: string | null
          closing_cash: number | null
          created_at: string | null
          id: string
          insurance_collected: number | null
          mpesa_collected: number | null
          notes: string | null
          opened_at: string | null
          opening_float: number | null
          other_collected: number | null
          shift_date: string
          status: string | null
          tenant_id: string
          total_collected: number | null
          updated_at: string | null
          variance: number | null
        }
        Insert: {
          branch_id: string
          card_collected?: number | null
          cash_collected?: number | null
          cashier_id: string
          closed_at?: string | null
          closing_cash?: number | null
          created_at?: string | null
          id?: string
          insurance_collected?: number | null
          mpesa_collected?: number | null
          notes?: string | null
          opened_at?: string | null
          opening_float?: number | null
          other_collected?: number | null
          shift_date?: string
          status?: string | null
          tenant_id: string
          total_collected?: number | null
          updated_at?: string | null
          variance?: number | null
        }
        Update: {
          branch_id?: string
          card_collected?: number | null
          cash_collected?: number | null
          cashier_id?: string
          closed_at?: string | null
          closing_cash?: number | null
          created_at?: string | null
          id?: string
          insurance_collected?: number | null
          mpesa_collected?: number | null
          notes?: string | null
          opened_at?: string | null
          opening_float?: number | null
          other_collected?: number | null
          shift_date?: string
          status?: string | null
          tenant_id?: string
          total_collected?: number | null
          updated_at?: string | null
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_cashier_shifts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_cashier_shifts_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_cashier_shifts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          is_header: boolean | null
          normal_balance: string | null
          notes: string | null
          parent_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          is_header?: boolean | null
          normal_balance?: string | null
          notes?: string | null
          parent_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          is_header?: boolean | null
          normal_balance?: string | null
          notes?: string | null
          parent_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "edoshms_chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_chart_of_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_clinical_orders: {
        Row: {
          admission_id: string | null
          billed: boolean | null
          branch_id: string
          clinical_notes: string | null
          consultation_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          order_number: string
          order_type: string
          ordered_at: string | null
          ordered_by: string
          patient_id: string
          priority: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
          visit_id: string
        }
        Insert: {
          admission_id?: string | null
          billed?: boolean | null
          branch_id: string
          clinical_notes?: string | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          order_number: string
          order_type: string
          ordered_at?: string | null
          ordered_by: string
          patient_id: string
          priority?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          visit_id: string
        }
        Update: {
          admission_id?: string | null
          billed?: boolean | null
          branch_id?: string
          clinical_notes?: string | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          order_number?: string
          order_type?: string
          ordered_at?: string | null
          ordered_by?: string
          patient_id?: string
          priority?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_clinical_orders_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "edoshms_admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_clinical_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_clinical_orders_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "edoshms_consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_clinical_orders_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_clinical_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_clinical_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_clinical_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_consultations: {
        Row: {
          admission_notes: string | null
          admission_recommended: boolean | null
          branch_id: string
          clinical_impression: string | null
          complaint: string | null
          consultation_date: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          diagnoses: Json | null
          doctor_id: string
          family_history: string | null
          follow_up_date: string | null
          follow_up_notes: string | null
          general_examination: string | null
          history_of_presenting_illness: string | null
          id: string
          is_template: boolean | null
          past_medical_history: string | null
          patient_id: string
          plan: string | null
          primary_diagnosis_code: string | null
          primary_diagnosis_name: string | null
          referral_notes: string | null
          referral_to: string | null
          review_of_systems: Json | null
          sick_off_days: number | null
          social_history: string | null
          systemic_examination: Json | null
          template_name: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          visit_id: string
        }
        Insert: {
          admission_notes?: string | null
          admission_recommended?: boolean | null
          branch_id: string
          clinical_impression?: string | null
          complaint?: string | null
          consultation_date?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          diagnoses?: Json | null
          doctor_id: string
          family_history?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          general_examination?: string | null
          history_of_presenting_illness?: string | null
          id?: string
          is_template?: boolean | null
          past_medical_history?: string | null
          patient_id: string
          plan?: string | null
          primary_diagnosis_code?: string | null
          primary_diagnosis_name?: string | null
          referral_notes?: string | null
          referral_to?: string | null
          review_of_systems?: Json | null
          sick_off_days?: number | null
          social_history?: string | null
          systemic_examination?: Json | null
          template_name?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          visit_id: string
        }
        Update: {
          admission_notes?: string | null
          admission_recommended?: boolean | null
          branch_id?: string
          clinical_impression?: string | null
          complaint?: string | null
          consultation_date?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          diagnoses?: Json | null
          doctor_id?: string
          family_history?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          general_examination?: string | null
          history_of_presenting_illness?: string | null
          id?: string
          is_template?: boolean | null
          past_medical_history?: string | null
          patient_id?: string
          plan?: string | null
          primary_diagnosis_code?: string | null
          primary_diagnosis_name?: string | null
          referral_notes?: string | null
          referral_to?: string | null
          review_of_systems?: Json | null
          sick_off_days?: number | null
          social_history?: string | null
          systemic_examination?: Json | null
          template_name?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_consultations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_consultations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoshms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_consultations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_consultations_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_cost_centres: {
        Row: {
          branch_id: string | null
          code: string
          created_at: string | null
          department_id: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          tenant_id: string
        }
        Insert: {
          branch_id?: string | null
          code: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          tenant_id: string
        }
        Update: {
          branch_id?: string | null
          code?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_cost_centres_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_cost_centres_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoshms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_cost_centres_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "edoshms_cost_centres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_cost_centres_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_departments: {
        Row: {
          branch_id: string
          code: string
          cost_centre_code: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_type: string | null
          extension: string | null
          floor: string | null
          head_of_department: string | null
          id: string
          is_active: boolean | null
          is_billable: boolean | null
          name: string
          phone: string | null
          queue_enabled: boolean | null
          queue_prefix: string | null
          room: string | null
          settings: Json | null
          short_name: string | null
          sort_order: number | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          branch_id: string
          code: string
          cost_centre_code?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_type?: string | null
          extension?: string | null
          floor?: string | null
          head_of_department?: string | null
          id?: string
          is_active?: boolean | null
          is_billable?: boolean | null
          name: string
          phone?: string | null
          queue_enabled?: boolean | null
          queue_prefix?: string | null
          room?: string | null
          settings?: Json | null
          short_name?: string | null
          sort_order?: number | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          branch_id?: string
          code?: string
          cost_centre_code?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_type?: string | null
          extension?: string | null
          floor?: string | null
          head_of_department?: string | null
          id?: string
          is_active?: boolean | null
          is_billable?: boolean | null
          name?: string
          phone?: string | null
          queue_enabled?: boolean | null
          queue_prefix?: string | null
          room?: string | null
          settings?: Json | null
          short_name?: string | null
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_departments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_diagnoses: {
        Row: {
          branch_id: string
          consultation_id: string
          created_at: string | null
          created_by: string | null
          diagnosis_name: string
          diagnosis_type: string | null
          icd_code: string | null
          id: string
          notes: string | null
          patient_id: string
          status: string | null
          tenant_id: string
          visit_id: string
        }
        Insert: {
          branch_id: string
          consultation_id: string
          created_at?: string | null
          created_by?: string | null
          diagnosis_name: string
          diagnosis_type?: string | null
          icd_code?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: string | null
          tenant_id: string
          visit_id: string
        }
        Update: {
          branch_id?: string
          consultation_id?: string
          created_at?: string | null
          created_by?: string | null
          diagnosis_name?: string
          diagnosis_type?: string | null
          icd_code?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string | null
          tenant_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_diagnoses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_diagnoses_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "edoshms_consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_diagnoses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_diagnoses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_diagnoses_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_drug_catalog: {
        Row: {
          ahf_code: string | null
          brand_name: string | null
          code: string
          controlled_substance: boolean | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          drug_class: string | null
          drug_form: string | null
          generic_name: string
          id: string
          insurance_price: number | null
          is_active: boolean | null
          narcotic: boolean | null
          nhif_code: string | null
          normal_price: number | null
          pack_size: number | null
          patient_education: string | null
          reorder_level: number | null
          reorder_quantity: number | null
          sha_code: string | null
          sha_price: number | null
          storage_conditions: string | null
          strength: string | null
          tenant_id: string
          unit_of_issue: string | null
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          ahf_code?: string | null
          brand_name?: string | null
          code: string
          controlled_substance?: boolean | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          drug_class?: string | null
          drug_form?: string | null
          generic_name: string
          id?: string
          insurance_price?: number | null
          is_active?: boolean | null
          narcotic?: boolean | null
          nhif_code?: string | null
          normal_price?: number | null
          pack_size?: number | null
          patient_education?: string | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          sha_code?: string | null
          sha_price?: number | null
          storage_conditions?: string | null
          strength?: string | null
          tenant_id: string
          unit_of_issue?: string | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          ahf_code?: string | null
          brand_name?: string | null
          code?: string
          controlled_substance?: boolean | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          drug_class?: string | null
          drug_form?: string | null
          generic_name?: string
          id?: string
          insurance_price?: number | null
          is_active?: boolean | null
          narcotic?: boolean | null
          nhif_code?: string | null
          normal_price?: number | null
          pack_size?: number | null
          patient_education?: string | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          sha_code?: string | null
          sha_price?: number | null
          storage_conditions?: string | null
          strength?: string | null
          tenant_id?: string
          unit_of_issue?: string | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_drug_catalog_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_insurance_schemes: {
        Row: {
          address: string | null
          annual_limit: number | null
          benefit_packages: Json | null
          code: string
          contact_person: string | null
          copay_fixed: number | null
          copay_percent: number | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          deductible_amount: number | null
          email: string | null
          excluded_services: Json | null
          id: string
          insurance_type: Database["public"]["Enums"]["insurance_type"]
          insurer_name: string | null
          is_active: boolean | null
          name: string
          payment_terms: number | null
          phone: string | null
          pre_auth_required: boolean | null
          scheme_type: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          annual_limit?: number | null
          benefit_packages?: Json | null
          code: string
          contact_person?: string | null
          copay_fixed?: number | null
          copay_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          deductible_amount?: number | null
          email?: string | null
          excluded_services?: Json | null
          id?: string
          insurance_type: Database["public"]["Enums"]["insurance_type"]
          insurer_name?: string | null
          is_active?: boolean | null
          name: string
          payment_terms?: number | null
          phone?: string | null
          pre_auth_required?: boolean | null
          scheme_type?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          annual_limit?: number | null
          benefit_packages?: Json | null
          code?: string
          contact_person?: string | null
          copay_fixed?: number | null
          copay_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          deductible_amount?: number | null
          email?: string | null
          excluded_services?: Json | null
          id?: string
          insurance_type?: Database["public"]["Enums"]["insurance_type"]
          insurer_name?: string | null
          is_active?: boolean | null
          name?: string
          payment_terms?: number | null
          phone?: string | null
          pre_auth_required?: boolean | null
          scheme_type?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_insurance_schemes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_inventory_items: {
        Row: {
          barcode: string | null
          category_id: string | null
          code: string
          created_at: string | null
          created_by: string | null
          drug_id: string | null
          id: string
          is_active: boolean | null
          is_drug: boolean | null
          item_type: string | null
          name: string
          pack_size: number | null
          reorder_level: number | null
          reorder_quantity: number | null
          storage_location: string | null
          tenant_id: string
          unit_of_issue: string | null
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          drug_id?: string | null
          id?: string
          is_active?: boolean | null
          is_drug?: boolean | null
          item_type?: string | null
          name: string
          pack_size?: number | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          storage_location?: string | null
          tenant_id: string
          unit_of_issue?: string | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          drug_id?: string | null
          id?: string
          is_active?: boolean | null
          is_drug?: boolean | null
          item_type?: string | null
          name?: string
          pack_size?: number | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          storage_location?: string | null
          tenant_id?: string
          unit_of_issue?: string | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "edoshms_item_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_inventory_items_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "edoshms_drug_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_invoice_items: {
        Row: {
          branch_id: string
          created_at: string | null
          description: string
          discount_amount: number | null
          id: string
          insurance_covered: number | null
          invoice_id: string
          item_type: string | null
          patient_payable: number
          quantity: number | null
          reference_id: string | null
          service_id: string | null
          sha_covered: number | null
          sha_service_code: string | null
          tax_amount: number | null
          tenant_id: string
          total_amount: number
          unit_price: number
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          description: string
          discount_amount?: number | null
          id?: string
          insurance_covered?: number | null
          invoice_id: string
          item_type?: string | null
          patient_payable: number
          quantity?: number | null
          reference_id?: string | null
          service_id?: string | null
          sha_covered?: number | null
          sha_service_code?: string | null
          tax_amount?: number | null
          tenant_id: string
          total_amount: number
          unit_price: number
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          description?: string
          discount_amount?: number | null
          id?: string
          insurance_covered?: number | null
          invoice_id?: string
          item_type?: string | null
          patient_payable?: number
          quantity?: number | null
          reference_id?: string | null
          service_id?: string | null
          sha_covered?: number | null
          sha_service_code?: string | null
          tax_amount?: number | null
          tenant_id?: string
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "maldives_invoice_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "edoshms_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_invoice_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "edoshms_service_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_invoice_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_invoices: {
        Row: {
          admission_id: string | null
          balance_amount: number | null
          branch_id: string
          copay_amount: number | null
          corporate_client_id: string | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          due_date: string | null
          id: string
          insurance_covered_amount: number | null
          insurance_scheme_id: string | null
          invoice_date: string
          invoice_number: string
          notes: string | null
          paid_amount: number | null
          patient_id: string
          payer_type: string | null
          sha_covered_amount: number | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number | null
          tax_amount: number | null
          tenant_id: string
          total_amount: number | null
          updated_at: string | null
          updated_by: string | null
          visit_id: string | null
        }
        Insert: {
          admission_id?: string | null
          balance_amount?: number | null
          branch_id: string
          copay_amount?: number | null
          corporate_client_id?: string | null
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date?: string | null
          id?: string
          insurance_covered_amount?: number | null
          insurance_scheme_id?: string | null
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number | null
          patient_id: string
          payer_type?: string | null
          sha_covered_amount?: number | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id: string
          total_amount?: number | null
          updated_at?: string | null
          updated_by?: string | null
          visit_id?: string | null
        }
        Update: {
          admission_id?: string | null
          balance_amount?: number | null
          branch_id?: string
          copay_amount?: number | null
          corporate_client_id?: string | null
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date?: string | null
          id?: string
          insurance_covered_amount?: number | null
          insurance_scheme_id?: string | null
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number | null
          patient_id?: string
          payer_type?: string | null
          sha_covered_amount?: number | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string
          total_amount?: number | null
          updated_at?: string | null
          updated_by?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_invoices_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "edoshms_admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_invoices_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_item_categories: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          tenant_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          tenant_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_item_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "edoshms_item_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_item_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_journal_entries: {
        Row: {
          branch_id: string
          created_at: string | null
          created_by: string
          description: string
          entry_date: string
          entry_number: string
          id: string
          posted_at: string | null
          posted_by: string | null
          reference_id: string | null
          reference_type: string | null
          reversal_of: string | null
          reversed_at: string | null
          reversed_by: string | null
          status: Database["public"]["Enums"]["journal_entry_status"] | null
          tenant_id: string
          total_credit: number | null
          total_debit: number | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          created_by: string
          description: string
          entry_date: string
          entry_number: string
          id?: string
          posted_at?: string | null
          posted_by?: string | null
          reference_id?: string | null
          reference_type?: string | null
          reversal_of?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          status?: Database["public"]["Enums"]["journal_entry_status"] | null
          tenant_id: string
          total_credit?: number | null
          total_debit?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          created_by?: string
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          posted_at?: string | null
          posted_by?: string | null
          reference_id?: string | null
          reference_type?: string | null
          reversal_of?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          status?: Database["public"]["Enums"]["journal_entry_status"] | null
          tenant_id?: string
          total_credit?: number | null
          total_debit?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_journal_entries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_journal_entries_reversal_of_fkey"
            columns: ["reversal_of"]
            isOneToOne: false
            referencedRelation: "edoshms_journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_journal_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_journal_lines: {
        Row: {
          account_id: string
          cost_centre_id: string | null
          created_at: string | null
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          id: string
          journal_entry_id: string
          tenant_id: string
        }
        Insert: {
          account_id: string
          cost_centre_id?: string | null
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          journal_entry_id: string
          tenant_id: string
        }
        Update: {
          account_id?: string
          cost_centre_id?: string | null
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          journal_entry_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "edoshms_chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_journal_lines_cost_centre_id_fkey"
            columns: ["cost_centre_id"]
            isOneToOne: false
            referencedRelation: "edoshms_cost_centres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_journal_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "edoshms_journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_journal_lines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_lab_orders: {
        Row: {
          analysis_completed_at: string | null
          analysis_started_at: string | null
          branch_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          clinical_indication: string | null
          clinical_order_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          lab_order_number: string
          ordered_by: string
          patient_id: string
          priority: string | null
          released_at: string | null
          sample_collected_at: string | null
          sample_collected_by: string | null
          sample_condition: string | null
          sample_id: string | null
          status: Database["public"]["Enums"]["lab_order_status"] | null
          tenant_id: string
          test_id: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
          visit_id: string
        }
        Insert: {
          analysis_completed_at?: string | null
          analysis_started_at?: string | null
          branch_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          clinical_indication?: string | null
          clinical_order_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lab_order_number: string
          ordered_by: string
          patient_id: string
          priority?: string | null
          released_at?: string | null
          sample_collected_at?: string | null
          sample_collected_by?: string | null
          sample_condition?: string | null
          sample_id?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"] | null
          tenant_id: string
          test_id: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          visit_id: string
        }
        Update: {
          analysis_completed_at?: string | null
          analysis_started_at?: string | null
          branch_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          clinical_indication?: string | null
          clinical_order_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lab_order_number?: string
          ordered_by?: string
          patient_id?: string
          priority?: string | null
          released_at?: string | null
          sample_collected_at?: string | null
          sample_collected_by?: string | null
          sample_condition?: string | null
          sample_id?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"] | null
          tenant_id?: string
          test_id?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_lab_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_orders_clinical_order_id_fkey"
            columns: ["clinical_order_id"]
            isOneToOne: false
            referencedRelation: "edoshms_clinical_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_orders_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_orders_sample_collected_by_fkey"
            columns: ["sample_collected_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_orders_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "edoshms_lab_test_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_orders_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_lab_results: {
        Row: {
          branch_id: string
          created_at: string | null
          created_by: string | null
          critical_acknowledged_at: string | null
          critical_acknowledged_by: string | null
          id: string
          interpretation: string | null
          is_critical: boolean | null
          lab_order_id: string
          notes: string | null
          parameter_name: string
          patient_id: string
          reference_range_high: number | null
          reference_range_low: number | null
          reference_range_text: string | null
          result_numeric: number | null
          result_value: string | null
          tenant_id: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          critical_acknowledged_at?: string | null
          critical_acknowledged_by?: string | null
          id?: string
          interpretation?: string | null
          is_critical?: boolean | null
          lab_order_id: string
          notes?: string | null
          parameter_name: string
          patient_id: string
          reference_range_high?: number | null
          reference_range_low?: number | null
          reference_range_text?: string | null
          result_numeric?: number | null
          result_value?: string | null
          tenant_id: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          critical_acknowledged_at?: string | null
          critical_acknowledged_by?: string | null
          id?: string
          interpretation?: string | null
          is_critical?: boolean | null
          lab_order_id?: string
          notes?: string | null
          parameter_name?: string
          patient_id?: string
          reference_range_high?: number | null
          reference_range_low?: number | null
          reference_range_text?: string | null
          result_numeric?: number | null
          result_value?: string | null
          tenant_id?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_lab_results_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_results_critical_acknowledged_by_fkey"
            columns: ["critical_acknowledged_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_results_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "edoshms_lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_lab_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_lab_test_catalog: {
        Row: {
          category: string | null
          code: string
          container_color: string | null
          container_type: string | null
          created_at: string | null
          created_by: string | null
          critical_high: number | null
          critical_low: number | null
          deleted_at: string | null
          id: string
          insurance_price: number | null
          is_active: boolean | null
          is_panel: boolean | null
          loinc_code: string | null
          method: string | null
          name: string
          normal_price: number | null
          panel_tests: Json | null
          preparation_instructions: string | null
          reference_ranges: Json | null
          sample_type: string | null
          sample_volume: string | null
          sha_price: number | null
          sha_service_code: string | null
          short_name: string | null
          sort_order: number | null
          sub_category: string | null
          tenant_id: string
          turn_around_time_hours: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          container_color?: string | null
          container_type?: string | null
          created_at?: string | null
          created_by?: string | null
          critical_high?: number | null
          critical_low?: number | null
          deleted_at?: string | null
          id?: string
          insurance_price?: number | null
          is_active?: boolean | null
          is_panel?: boolean | null
          loinc_code?: string | null
          method?: string | null
          name: string
          normal_price?: number | null
          panel_tests?: Json | null
          preparation_instructions?: string | null
          reference_ranges?: Json | null
          sample_type?: string | null
          sample_volume?: string | null
          sha_price?: number | null
          sha_service_code?: string | null
          short_name?: string | null
          sort_order?: number | null
          sub_category?: string | null
          tenant_id: string
          turn_around_time_hours?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          container_color?: string | null
          container_type?: string | null
          created_at?: string | null
          created_by?: string | null
          critical_high?: number | null
          critical_low?: number | null
          deleted_at?: string | null
          id?: string
          insurance_price?: number | null
          is_active?: boolean | null
          is_panel?: boolean | null
          loinc_code?: string | null
          method?: string | null
          name?: string
          normal_price?: number | null
          panel_tests?: Json | null
          preparation_instructions?: string | null
          reference_ranges?: Json | null
          sample_type?: string | null
          sample_volume?: string | null
          sha_price?: number | null
          sha_service_code?: string | null
          short_name?: string | null
          sort_order?: number | null
          sub_category?: string | null
          tenant_id?: string
          turn_around_time_hours?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_lab_test_catalog_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_notifications: {
        Row: {
          branch_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          patient_id: string | null
          read_at: string | null
          sent_via: Json | null
          tenant_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          patient_id?: string | null
          read_at?: string | null
          sent_via?: Json | null
          tenant_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          patient_id?: string | null
          read_at?: string | null
          sent_via?: Json | null
          tenant_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_notifications_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_patient_alerts: {
        Row: {
          alert_type: string
          branch_id: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          message: string
          patient_id: string
          severity: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          patient_id: string
          severity?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          patient_id?: string
          severity?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_patient_alerts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_patient_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_patient_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_patients: {
        Row: {
          address: string | null
          age_days: number | null
          age_months: number | null
          age_years: number | null
          alien_registration_number: string | null
          allergies: Json | null
          birth_certificate_number: string | null
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          branch_id: string
          chronic_conditions: Json | null
          county: string | null
          created_at: string | null
          created_by: string | null
          current_medications: Json | null
          date_of_birth: string | null
          deleted_at: string | null
          education_level: string | null
          email: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          insurance_info: Json | null
          is_vip: boolean | null
          last_name: string
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          middle_name: string | null
          national_id: string | null
          nationality: string | null
          next_of_kin_address: string | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          nhif_number: string | null
          notes: string | null
          occupation: string | null
          other_names: string | null
          passport_number: string | null
          patient_number: string
          phone_primary: string | null
          phone_secondary: string | null
          photo_url: string | null
          referring_doctor: string | null
          referring_facility: string | null
          registered_by: string | null
          registration_source: string | null
          religion: string | null
          sha_benefit_package: string | null
          sha_member_number: string | null
          sha_status: string | null
          sha_verified_at: string | null
          status: Database["public"]["Enums"]["patient_status"] | null
          sub_county: string | null
          tenant_id: string
          tribe: string | null
          updated_at: string | null
          updated_by: string | null
          village: string | null
          vip_notes: string | null
          ward: string | null
        }
        Insert: {
          address?: string | null
          age_days?: number | null
          age_months?: number | null
          age_years?: number | null
          alien_registration_number?: string | null
          allergies?: Json | null
          birth_certificate_number?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          branch_id: string
          chronic_conditions?: Json | null
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          current_medications?: Json | null
          date_of_birth?: string | null
          deleted_at?: string | null
          education_level?: string | null
          email?: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          insurance_info?: Json | null
          is_vip?: boolean | null
          last_name: string
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          middle_name?: string | null
          national_id?: string | null
          nationality?: string | null
          next_of_kin_address?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          nhif_number?: string | null
          notes?: string | null
          occupation?: string | null
          other_names?: string | null
          passport_number?: string | null
          patient_number: string
          phone_primary?: string | null
          phone_secondary?: string | null
          photo_url?: string | null
          referring_doctor?: string | null
          referring_facility?: string | null
          registered_by?: string | null
          registration_source?: string | null
          religion?: string | null
          sha_benefit_package?: string | null
          sha_member_number?: string | null
          sha_status?: string | null
          sha_verified_at?: string | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          sub_county?: string | null
          tenant_id: string
          tribe?: string | null
          updated_at?: string | null
          updated_by?: string | null
          village?: string | null
          vip_notes?: string | null
          ward?: string | null
        }
        Update: {
          address?: string | null
          age_days?: number | null
          age_months?: number | null
          age_years?: number | null
          alien_registration_number?: string | null
          allergies?: Json | null
          birth_certificate_number?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          branch_id?: string
          chronic_conditions?: Json | null
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          current_medications?: Json | null
          date_of_birth?: string | null
          deleted_at?: string | null
          education_level?: string | null
          email?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          insurance_info?: Json | null
          is_vip?: boolean | null
          last_name?: string
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          middle_name?: string | null
          national_id?: string | null
          nationality?: string | null
          next_of_kin_address?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          nhif_number?: string | null
          notes?: string | null
          occupation?: string | null
          other_names?: string | null
          passport_number?: string | null
          patient_number?: string
          phone_primary?: string | null
          phone_secondary?: string | null
          photo_url?: string | null
          referring_doctor?: string | null
          referring_facility?: string | null
          registered_by?: string | null
          registration_source?: string | null
          religion?: string | null
          sha_benefit_package?: string | null
          sha_member_number?: string | null
          sha_status?: string | null
          sha_verified_at?: string | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          sub_county?: string | null
          tenant_id?: string
          tribe?: string | null
          updated_at?: string | null
          updated_by?: string | null
          village?: string | null
          vip_notes?: string | null
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_patients_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_patients_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_payments: {
        Row: {
          amount: number
          bank_name: string | null
          branch_id: string
          cashier_id: string
          cheque_number: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          created_by: string
          id: string
          invoice_id: string | null
          is_confirmed: boolean | null
          is_reversed: boolean | null
          mpesa_phone: string | null
          mpesa_receipt: string | null
          mpesa_transaction_id: string | null
          notes: string | null
          patient_id: string
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_number: string
          reference_number: string | null
          reversal_reason: string | null
          reversed_at: string | null
          reversed_by: string | null
          shift_id: string | null
          tenant_id: string
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          amount: number
          bank_name?: string | null
          branch_id: string
          cashier_id: string
          cheque_number?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          invoice_id?: string | null
          is_confirmed?: boolean | null
          is_reversed?: boolean | null
          mpesa_phone?: string | null
          mpesa_receipt?: string | null
          mpesa_transaction_id?: string | null
          notes?: string | null
          patient_id: string
          payment_date?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_number: string
          reference_number?: string | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          shift_id?: string | null
          tenant_id: string
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          amount?: number
          bank_name?: string | null
          branch_id?: string
          cashier_id?: string
          cheque_number?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          invoice_id?: string | null
          is_confirmed?: boolean | null
          is_reversed?: boolean | null
          mpesa_phone?: string | null
          mpesa_receipt?: string | null
          mpesa_transaction_id?: string | null
          notes?: string | null
          patient_id?: string
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          receipt_number?: string
          reference_number?: string | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          shift_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_payments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_payments_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "edoshms_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_payments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_prescription_items: {
        Row: {
          batch_number: string | null
          branch_id: string
          created_at: string | null
          dispensed_at: string | null
          dose: string | null
          drug_id: string
          drug_name: string
          duration: string | null
          expiry_date: string | null
          frequency: string | null
          id: string
          instructions: string | null
          prescription_id: string
          quantity_dispensed: number | null
          quantity_prescribed: number
          route: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          batch_number?: string | null
          branch_id: string
          created_at?: string | null
          dispensed_at?: string | null
          dose?: string | null
          drug_id: string
          drug_name: string
          duration?: string | null
          expiry_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          prescription_id: string
          quantity_dispensed?: number | null
          quantity_prescribed: number
          route?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          batch_number?: string | null
          branch_id?: string
          created_at?: string | null
          dispensed_at?: string | null
          dose?: string | null
          drug_id?: string
          drug_name?: string
          duration?: string | null
          expiry_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          prescription_id?: string
          quantity_dispensed?: number | null
          quantity_prescribed?: number
          route?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_prescription_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_prescription_items_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "edoshms_drug_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "edoshms_prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_prescription_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_prescriptions: {
        Row: {
          admission_id: string | null
          branch_id: string
          consultation_id: string | null
          created_at: string | null
          created_by: string | null
          dispensed_at: string | null
          dispensed_by: string | null
          id: string
          notes: string | null
          patient_id: string
          prescribed_at: string | null
          prescribed_by: string
          prescription_number: string
          status: Database["public"]["Enums"]["prescription_status"] | null
          tenant_id: string
          updated_at: string | null
          visit_id: string
        }
        Insert: {
          admission_id?: string | null
          branch_id: string
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          prescribed_at?: string | null
          prescribed_by: string
          prescription_number: string
          status?: Database["public"]["Enums"]["prescription_status"] | null
          tenant_id: string
          updated_at?: string | null
          visit_id: string
        }
        Update: {
          admission_id?: string | null
          branch_id?: string
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          prescribed_at?: string | null
          prescribed_by?: string
          prescription_number?: string
          status?: Database["public"]["Enums"]["prescription_status"] | null
          tenant_id?: string
          updated_at?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_prescriptions_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "edoshms_admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_prescriptions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "edoshms_consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_prescriptions_dispensed_by_fkey"
            columns: ["dispensed_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_prescriptions_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_prescriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_purchase_order_items: {
        Row: {
          created_at: string | null
          discount_percent: number | null
          id: string
          item_id: string
          po_id: string
          quantity_ordered: number
          quantity_received: number | null
          tax_percent: number | null
          tenant_id: string
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          item_id: string
          po_id: string
          quantity_ordered: number
          quantity_received?: number | null
          tax_percent?: number | null
          tenant_id: string
          total_cost: number
          unit_cost: number
        }
        Update: {
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          item_id?: string
          po_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          tax_percent?: number | null
          tenant_id?: string
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "maldives_purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edoshms_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "edoshms_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_purchase_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string | null
          created_by: string
          deleted_at: string | null
          delivery_location_id: string | null
          discount_amount: number | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          status: Database["public"]["Enums"]["procurement_status"] | null
          subtotal: number | null
          supplier_id: string
          tax_amount: number | null
          tenant_id: string
          total_amount: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          delivery_location_id?: string | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          status?: Database["public"]["Enums"]["procurement_status"] | null
          subtotal?: number | null
          supplier_id: string
          tax_amount?: number | null
          tenant_id: string
          total_amount?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          delivery_location_id?: string | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: Database["public"]["Enums"]["procurement_status"] | null
          subtotal?: number | null
          supplier_id?: string
          tax_amount?: number | null
          tenant_id?: string
          total_amount?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_purchase_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_purchase_orders_delivery_location_id_fkey"
            columns: ["delivery_location_id"]
            isOneToOne: false
            referencedRelation: "edoshms_stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "edoshms_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_queue_counters: {
        Row: {
          branch_id: string
          created_at: string | null
          date: string
          department_id: string
          id: string
          last_number: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          date?: string
          department_id: string
          id?: string
          last_number?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          date?: string
          department_id?: string
          id?: string
          last_number?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_queue_counters_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_queue_counters_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoshms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_queue_counters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_queue_displays: {
        Row: {
          branch_id: string
          created_at: string | null
          department_id: string | null
          display_key: string
          display_name: string
          display_type: string | null
          id: string
          is_active: boolean | null
          last_ping: string | null
          settings: Json | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          department_id?: string | null
          display_key: string
          display_name: string
          display_type?: string | null
          id?: string
          is_active?: boolean | null
          last_ping?: string | null
          settings?: Json | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          department_id?: string | null
          display_key?: string
          display_name?: string
          display_type?: string | null
          id?: string
          is_active?: boolean | null
          last_ping?: string | null
          settings?: Json | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_queue_displays_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_queue_displays_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoshms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_queue_displays_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_queue_entries: {
        Row: {
          branch_id: string
          called_at: string | null
          counter_number: string | null
          created_at: string | null
          created_by: string | null
          date: string
          department_id: string
          display_number: number
          id: string
          notes: string | null
          patient_id: string
          priority: number | null
          queue_number: string
          served_at: string | null
          service_minutes: number | null
          serving_staff_id: string | null
          serving_started_at: string | null
          sms_sent: boolean | null
          status: Database["public"]["Enums"]["queue_status"] | null
          tenant_id: string
          token_type: string | null
          updated_at: string | null
          visit_id: string | null
          waiting_minutes: number | null
        }
        Insert: {
          branch_id: string
          called_at?: string | null
          counter_number?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          department_id: string
          display_number: number
          id?: string
          notes?: string | null
          patient_id: string
          priority?: number | null
          queue_number: string
          served_at?: string | null
          service_minutes?: number | null
          serving_staff_id?: string | null
          serving_started_at?: string | null
          sms_sent?: boolean | null
          status?: Database["public"]["Enums"]["queue_status"] | null
          tenant_id: string
          token_type?: string | null
          updated_at?: string | null
          visit_id?: string | null
          waiting_minutes?: number | null
        }
        Update: {
          branch_id?: string
          called_at?: string | null
          counter_number?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          department_id?: string
          display_number?: number
          id?: string
          notes?: string | null
          patient_id?: string
          priority?: number | null
          queue_number?: string
          served_at?: string | null
          service_minutes?: number | null
          serving_staff_id?: string | null
          serving_started_at?: string | null
          sms_sent?: boolean | null
          status?: Database["public"]["Enums"]["queue_status"] | null
          tenant_id?: string
          token_type?: string | null
          updated_at?: string | null
          visit_id?: string | null
          waiting_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_queue_entries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_queue_entries_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoshms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_queue_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_queue_entries_serving_staff_id_fkey"
            columns: ["serving_staff_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_queue_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_queue_entries_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_radiology_catalog: {
        Row: {
          body_part: string | null
          code: string
          cpt_code: string | null
          created_at: string | null
          id: string
          insurance_price: number | null
          is_active: boolean | null
          is_contrast: boolean | null
          laterality: string | null
          modality: string | null
          name: string
          normal_price: number | null
          preparation_instructions: string | null
          radiation_dose_mgy: number | null
          sha_price: number | null
          sha_service_code: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          body_part?: string | null
          code: string
          cpt_code?: string | null
          created_at?: string | null
          id?: string
          insurance_price?: number | null
          is_active?: boolean | null
          is_contrast?: boolean | null
          laterality?: string | null
          modality?: string | null
          name: string
          normal_price?: number | null
          preparation_instructions?: string | null
          radiation_dose_mgy?: number | null
          sha_price?: number | null
          sha_service_code?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          body_part?: string | null
          code?: string
          cpt_code?: string | null
          created_at?: string | null
          id?: string
          insurance_price?: number | null
          is_active?: boolean | null
          is_contrast?: boolean | null
          laterality?: string | null
          modality?: string | null
          name?: string
          normal_price?: number | null
          preparation_instructions?: string | null
          radiation_dose_mgy?: number | null
          sha_price?: number | null
          sha_service_code?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_radiology_catalog_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_radiology_orders: {
        Row: {
          branch_id: string
          clinical_indication: string | null
          clinical_order_id: string | null
          completed_at: string | null
          contrast_details: string | null
          contrast_used: boolean | null
          created_at: string | null
          created_by: string | null
          exam_id: string
          id: string
          images_url: Json | null
          ordered_by: string
          patient_id: string
          pregnancy_status: string | null
          priority: string | null
          radiologist_id: string | null
          radiology_order_number: string
          report_impression: string | null
          report_text: string | null
          reported_at: string | null
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["radiology_status"] | null
          tenant_id: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
          visit_id: string
        }
        Insert: {
          branch_id: string
          clinical_indication?: string | null
          clinical_order_id?: string | null
          completed_at?: string | null
          contrast_details?: string | null
          contrast_used?: boolean | null
          created_at?: string | null
          created_by?: string | null
          exam_id: string
          id?: string
          images_url?: Json | null
          ordered_by: string
          patient_id: string
          pregnancy_status?: string | null
          priority?: string | null
          radiologist_id?: string | null
          radiology_order_number: string
          report_impression?: string | null
          report_text?: string | null
          reported_at?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["radiology_status"] | null
          tenant_id: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          visit_id: string
        }
        Update: {
          branch_id?: string
          clinical_indication?: string | null
          clinical_order_id?: string | null
          completed_at?: string | null
          contrast_details?: string | null
          contrast_used?: boolean | null
          created_at?: string | null
          created_by?: string | null
          exam_id?: string
          id?: string
          images_url?: Json | null
          ordered_by?: string
          patient_id?: string
          pregnancy_status?: string | null
          priority?: string | null
          radiologist_id?: string | null
          radiology_order_number?: string
          report_impression?: string | null
          report_text?: string | null
          reported_at?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["radiology_status"] | null
          tenant_id?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_radiology_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_radiology_orders_clinical_order_id_fkey"
            columns: ["clinical_order_id"]
            isOneToOne: false
            referencedRelation: "edoshms_clinical_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_radiology_orders_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "edoshms_radiology_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_radiology_orders_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_radiology_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_radiology_orders_radiologist_id_fkey"
            columns: ["radiologist_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_radiology_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_radiology_orders_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_radiology_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_roles: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          permissions: Json | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          permissions?: Json | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          permissions?: Json | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_service_catalog: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          id: string
          insurance_price: number | null
          is_active: boolean | null
          is_taxable: boolean | null
          name: string
          nhif_code: string | null
          nhif_price: number | null
          normal_price: number | null
          revenue_account: string | null
          service_type: string | null
          sha_price: number | null
          sha_service_code: string | null
          sort_order: number | null
          tax_percent: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          id?: string
          insurance_price?: number | null
          is_active?: boolean | null
          is_taxable?: boolean | null
          name: string
          nhif_code?: string | null
          nhif_price?: number | null
          normal_price?: number | null
          revenue_account?: string | null
          service_type?: string | null
          sha_price?: number | null
          sha_service_code?: string | null
          sort_order?: number | null
          tax_percent?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          id?: string
          insurance_price?: number | null
          is_active?: boolean | null
          is_taxable?: boolean | null
          name?: string
          nhif_code?: string | null
          nhif_price?: number | null
          normal_price?: number | null
          revenue_account?: string | null
          service_type?: string | null
          sha_price?: number | null
          sha_service_code?: string | null
          sort_order?: number | null
          tax_percent?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_service_catalog_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoshms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_service_catalog_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_sha_claim_items: {
        Row: {
          approved_amount: number | null
          claim_id: string
          created_at: string | null
          id: string
          quantity: number | null
          rejection_reason: string | null
          service_date: string
          service_description: string
          sha_service_code: string
          tenant_id: string
          total_cost: number
          unit_cost: number
        }
        Insert: {
          approved_amount?: number | null
          claim_id: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          rejection_reason?: string | null
          service_date: string
          service_description: string
          sha_service_code: string
          tenant_id: string
          total_cost: number
          unit_cost: number
        }
        Update: {
          approved_amount?: number | null
          claim_id?: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          rejection_reason?: string | null
          service_date?: string
          service_description?: string
          sha_service_code?: string
          tenant_id?: string
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "maldives_sha_claim_items_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "edoshms_sha_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_sha_claim_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_sha_claims: {
        Row: {
          acknowledged_at: string | null
          admission_id: string | null
          appeal_reason: string | null
          appeal_submitted_at: string | null
          approved_amount: number | null
          approved_at: string | null
          branch_id: string
          claim_amount: number | null
          claim_date: string
          claim_number: string
          created_at: string | null
          created_by: string
          id: string
          notes: string | null
          paid_amount: number | null
          paid_at: string | null
          patient_id: string
          primary_diagnosis_code: string | null
          primary_diagnosis_name: string | null
          rejection_code: string | null
          rejection_reason: string | null
          remittance_number: string | null
          service_date: string
          sha_member_number: string | null
          sha_pre_auth_number: string | null
          sha_visit_id: string | null
          status: Database["public"]["Enums"]["claim_status"] | null
          submitted_at: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          visit_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          admission_id?: string | null
          appeal_reason?: string | null
          appeal_submitted_at?: string | null
          approved_amount?: number | null
          approved_at?: string | null
          branch_id: string
          claim_amount?: number | null
          claim_date?: string
          claim_number: string
          created_at?: string | null
          created_by: string
          id?: string
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          patient_id: string
          primary_diagnosis_code?: string | null
          primary_diagnosis_name?: string | null
          rejection_code?: string | null
          rejection_reason?: string | null
          remittance_number?: string | null
          service_date: string
          sha_member_number?: string | null
          sha_pre_auth_number?: string | null
          sha_visit_id?: string | null
          status?: Database["public"]["Enums"]["claim_status"] | null
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          visit_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          admission_id?: string | null
          appeal_reason?: string | null
          appeal_submitted_at?: string | null
          approved_amount?: number | null
          approved_at?: string | null
          branch_id?: string
          claim_amount?: number | null
          claim_date?: string
          claim_number?: string
          created_at?: string | null
          created_by?: string
          id?: string
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          patient_id?: string
          primary_diagnosis_code?: string | null
          primary_diagnosis_name?: string | null
          rejection_code?: string | null
          rejection_reason?: string | null
          remittance_number?: string | null
          service_date?: string
          sha_member_number?: string | null
          sha_pre_auth_number?: string | null
          sha_visit_id?: string | null
          status?: Database["public"]["Enums"]["claim_status"] | null
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_sha_claims_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "edoshms_admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_sha_claims_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_sha_claims_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_sha_claims_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_sha_claims_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_stock_batches: {
        Row: {
          batch_number: string
          branch_id: string
          created_at: string | null
          created_by: string | null
          expiry_date: string | null
          grn_id: string | null
          id: string
          item_id: string
          location_id: string
          manufacture_date: string | null
          quantity_available: number
          quantity_received: number
          quantity_reserved: number | null
          supplier_id: string | null
          tenant_id: string
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          batch_number: string
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          grn_id?: string | null
          id?: string
          item_id: string
          location_id: string
          manufacture_date?: string | null
          quantity_available: number
          quantity_received: number
          quantity_reserved?: number | null
          supplier_id?: string | null
          tenant_id: string
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_number?: string
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          grn_id?: string | null
          id?: string
          item_id?: string
          location_id?: string
          manufacture_date?: string | null
          quantity_available?: number
          quantity_received?: number
          quantity_reserved?: number | null
          supplier_id?: string | null
          tenant_id?: string
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_stock_batches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_stock_batches_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edoshms_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_stock_batches_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "edoshms_stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_stock_batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_stock_locations: {
        Row: {
          branch_id: string
          code: string
          created_at: string | null
          department_id: string | null
          id: string
          is_active: boolean | null
          location_type: string | null
          name: string
          tenant_id: string
        }
        Insert: {
          branch_id: string
          code: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          location_type?: string | null
          name: string
          tenant_id: string
        }
        Update: {
          branch_id?: string
          code?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          location_type?: string | null
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_stock_locations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_stock_locations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoshms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_stock_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_stock_transactions: {
        Row: {
          batch_id: string | null
          branch_id: string
          created_at: string | null
          created_by: string
          from_location_id: string | null
          id: string
          item_id: string
          notes: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          tenant_id: string
          to_location_id: string | null
          total_cost: number | null
          transaction_date: string | null
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["stock_transaction_type"]
          unit_cost: number | null
        }
        Insert: {
          batch_id?: string | null
          branch_id: string
          created_at?: string | null
          created_by: string
          from_location_id?: string | null
          id?: string
          item_id: string
          notes?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          tenant_id: string
          to_location_id?: string | null
          total_cost?: number | null
          transaction_date?: string | null
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["stock_transaction_type"]
          unit_cost?: number | null
        }
        Update: {
          batch_id?: string | null
          branch_id?: string
          created_at?: string | null
          created_by?: string
          from_location_id?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          tenant_id?: string
          to_location_id?: string | null
          total_cost?: number | null
          transaction_date?: string | null
          transaction_number?: string
          transaction_type?: Database["public"]["Enums"]["stock_transaction_type"]
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_stock_transactions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_stock_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_stock_transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_stock_transactions_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "edoshms_stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_stock_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edoshms_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_stock_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_stock_transactions_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "edoshms_stock_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_suppliers: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_branch: string | null
          bank_name: string | null
          code: string
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          email: string | null
          id: string
          is_active: boolean | null
          kra_pin: string | null
          name: string
          payment_terms: number | null
          phone: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          code: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          kra_pin?: string | null
          name: string
          payment_terms?: number | null
          phone?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          code?: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          kra_pin?: string | null
          name?: string
          payment_terms?: number | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_tenants: {
        Row: {
          address: string | null
          billing_email: string | null
          code: string
          county: string | null
          created_at: string | null
          currency: string | null
          date_format: string | null
          deleted_at: string | null
          email: string | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          favicon_url: string | null
          features: Json | null
          id: string
          kra_pin: string | null
          legal_name: string | null
          license_expiry: string | null
          license_number: string | null
          logo_url: string | null
          max_branches: number | null
          max_users: number | null
          mfl_code: string | null
          name: string
          nhif_code: string | null
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          sha_facility_code: string | null
          status: Database["public"]["Enums"]["tenant_status"]
          sub_county: string | null
          subscription_expires_at: string | null
          subscription_plan: string | null
          timezone: string | null
          updated_at: string | null
          ward: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          billing_email?: string | null
          code: string
          county?: string | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          deleted_at?: string | null
          email?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          favicon_url?: string | null
          features?: Json | null
          id?: string
          kra_pin?: string | null
          legal_name?: string | null
          license_expiry?: string | null
          license_number?: string | null
          logo_url?: string | null
          max_branches?: number | null
          max_users?: number | null
          mfl_code?: string | null
          name: string
          nhif_code?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          sha_facility_code?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          sub_county?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          timezone?: string | null
          updated_at?: string | null
          ward?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          billing_email?: string | null
          code?: string
          county?: string | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          deleted_at?: string | null
          email?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          favicon_url?: string | null
          features?: Json | null
          id?: string
          kra_pin?: string | null
          legal_name?: string | null
          license_expiry?: string | null
          license_number?: string | null
          logo_url?: string | null
          max_branches?: number | null
          max_users?: number | null
          mfl_code?: string | null
          name?: string
          nhif_code?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          sha_facility_code?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          sub_county?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          timezone?: string | null
          updated_at?: string | null
          ward?: string | null
          website?: string | null
        }
        Relationships: []
      }
      edoshms_triage_records: {
        Row: {
          allergy_status: string | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          bmi: number | null
          branch_id: string
          chief_complaint: string | null
          created_at: string | null
          created_by: string | null
          glasgow_coma_scale: number | null
          head_circumference_cm: number | null
          height_cm: number | null
          history_of_presenting_illness: string | null
          id: string
          muac_cm: number | null
          notes: string | null
          oxygen_saturation: number | null
          pain_score: number | null
          patient_id: string
          pulse_rate: number | null
          random_blood_sugar: number | null
          respiratory_rate: number | null
          temperature_celsius: number | null
          tenant_id: string
          triage_category: string | null
          triaged_at: string | null
          triaged_by: string | null
          updated_at: string | null
          visit_id: string
          weight_kg: number | null
        }
        Insert: {
          allergy_status?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          branch_id: string
          chief_complaint?: string | null
          created_at?: string | null
          created_by?: string | null
          glasgow_coma_scale?: number | null
          head_circumference_cm?: number | null
          height_cm?: number | null
          history_of_presenting_illness?: string | null
          id?: string
          muac_cm?: number | null
          notes?: string | null
          oxygen_saturation?: number | null
          pain_score?: number | null
          patient_id: string
          pulse_rate?: number | null
          random_blood_sugar?: number | null
          respiratory_rate?: number | null
          temperature_celsius?: number | null
          tenant_id: string
          triage_category?: string | null
          triaged_at?: string | null
          triaged_by?: string | null
          updated_at?: string | null
          visit_id: string
          weight_kg?: number | null
        }
        Update: {
          allergy_status?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          branch_id?: string
          chief_complaint?: string | null
          created_at?: string | null
          created_by?: string | null
          glasgow_coma_scale?: number | null
          head_circumference_cm?: number | null
          height_cm?: number | null
          history_of_presenting_illness?: string | null
          id?: string
          muac_cm?: number | null
          notes?: string | null
          oxygen_saturation?: number | null
          pain_score?: number | null
          patient_id?: string
          pulse_rate?: number | null
          random_blood_sugar?: number | null
          respiratory_rate?: number | null
          temperature_celsius?: number | null
          tenant_id?: string
          triage_category?: string | null
          triaged_at?: string | null
          triaged_by?: string | null
          updated_at?: string | null
          visit_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_triage_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_triage_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_triage_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_triage_records_triaged_by_fkey"
            columns: ["triaged_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_triage_records_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "edoshms_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_user_profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          deleted_at: string | null
          display_name: string | null
          employee_number: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          is_active: boolean | null
          is_platform_admin: boolean | null
          is_tenant_admin: boolean | null
          last_login_at: string | null
          last_name: string
          license_expiry: string | null
          license_number: string | null
          middle_name: string | null
          phone: string | null
          preferences: Json | null
          qualification: string | null
          specialization: string | null
          staff_category: Database["public"]["Enums"]["staff_category"] | null
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          display_name?: string | null
          employee_number?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id: string
          is_active?: boolean | null
          is_platform_admin?: boolean | null
          is_tenant_admin?: boolean | null
          last_login_at?: string | null
          last_name: string
          license_expiry?: string | null
          license_number?: string | null
          middle_name?: string | null
          phone?: string | null
          preferences?: Json | null
          qualification?: string | null
          specialization?: string | null
          staff_category?: Database["public"]["Enums"]["staff_category"] | null
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          display_name?: string | null
          employee_number?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          is_active?: boolean | null
          is_platform_admin?: boolean | null
          is_tenant_admin?: boolean | null
          last_login_at?: string | null
          last_name?: string
          license_expiry?: string | null
          license_number?: string | null
          middle_name?: string | null
          phone?: string | null
          preferences?: Json | null
          qualification?: string | null
          specialization?: string | null
          staff_category?: Database["public"]["Enums"]["staff_category"] | null
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_user_profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_user_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_user_roles: {
        Row: {
          branch_id: string | null
          created_at: string | null
          department_id: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          department_id?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          department_id?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maldives_user_roles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_user_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoshms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "edoshms_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_visits: {
        Row: {
          appointment_id: string | null
          attending_doctor_id: string | null
          billing_status: Database["public"]["Enums"]["payment_status"] | null
          branch_id: string
          check_in_at: string | null
          chief_complaint: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          discharged_at: string | null
          discount_amount: number | null
          id: string
          insurance_scheme_id: string | null
          notes: string | null
          paid_amount: number | null
          patient_id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          priority: string | null
          referral_letter_number: string | null
          referral_source: string | null
          registered_by: string | null
          seen_at: string | null
          sha_visit_id: string | null
          status: Database["public"]["Enums"]["visit_status"] | null
          tenant_id: string
          total_amount: number | null
          triage_at: string | null
          triage_category: string | null
          triage_notes: string | null
          updated_at: string | null
          updated_by: string | null
          visit_date: string
          visit_number: string
          visit_type: Database["public"]["Enums"]["visit_type"]
        }
        Insert: {
          appointment_id?: string | null
          attending_doctor_id?: string | null
          billing_status?: Database["public"]["Enums"]["payment_status"] | null
          branch_id: string
          check_in_at?: string | null
          chief_complaint?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          discharged_at?: string | null
          discount_amount?: number | null
          id?: string
          insurance_scheme_id?: string | null
          notes?: string | null
          paid_amount?: number | null
          patient_id: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          priority?: string | null
          referral_letter_number?: string | null
          referral_source?: string | null
          registered_by?: string | null
          seen_at?: string | null
          sha_visit_id?: string | null
          status?: Database["public"]["Enums"]["visit_status"] | null
          tenant_id: string
          total_amount?: number | null
          triage_at?: string | null
          triage_category?: string | null
          triage_notes?: string | null
          updated_at?: string | null
          updated_by?: string | null
          visit_date?: string
          visit_number: string
          visit_type?: Database["public"]["Enums"]["visit_type"]
        }
        Update: {
          appointment_id?: string | null
          attending_doctor_id?: string | null
          billing_status?: Database["public"]["Enums"]["payment_status"] | null
          branch_id?: string
          check_in_at?: string | null
          chief_complaint?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          discharged_at?: string | null
          discount_amount?: number | null
          id?: string
          insurance_scheme_id?: string | null
          notes?: string | null
          paid_amount?: number | null
          patient_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          priority?: string | null
          referral_letter_number?: string | null
          referral_source?: string | null
          registered_by?: string | null
          seen_at?: string | null
          sha_visit_id?: string | null
          status?: Database["public"]["Enums"]["visit_status"] | null
          tenant_id?: string
          total_amount?: number | null
          triage_at?: string | null
          triage_category?: string | null
          triage_notes?: string | null
          updated_at?: string | null
          updated_by?: string | null
          visit_date?: string
          visit_number?: string
          visit_type?: Database["public"]["Enums"]["visit_type"]
        }
        Relationships: [
          {
            foreignKeyName: "maldives_visits_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "edoshms_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_visits_attending_doctor_id_fkey"
            columns: ["attending_doctor_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_visits_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_visits_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoshms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoshms_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_visits_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoshms_wards: {
        Row: {
          branch_id: string
          code: string
          created_at: string | null
          created_by: string | null
          department_id: string | null
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          tenant_id: string
          total_beds: number | null
          updated_at: string | null
          ward_type: string | null
        }
        Insert: {
          branch_id: string
          code: string
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          tenant_id: string
          total_beds?: number | null
          updated_at?: string | null
          ward_type?: string | null
        }
        Update: {
          branch_id?: string
          code?: string
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          tenant_id?: string
          total_beds?: number | null
          updated_at?: string | null
          ward_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maldives_wards_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_wards_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoshms_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maldives_wards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_audit_logs: {
        Row: {
          action: string
          branch_id: string | null
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          branch_id?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          branch_id?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_audit_logs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_bb_blood_units: {
        Row: {
          blood_group: Database["public"]["Enums"]["edoslmis_blood_group"]
          branch_id: string | null
          collection_date: string
          component: Database["public"]["Enums"]["edoslmis_blood_component"]
          created_at: string
          created_by: string | null
          discard_reason: string | null
          donor_id: string | null
          expiry_date: string
          id: string
          screening_hbsag: Database["public"]["Enums"]["edoslmis_screening_result"]
          screening_hcv: Database["public"]["Enums"]["edoslmis_screening_result"]
          screening_hiv: Database["public"]["Enums"]["edoslmis_screening_result"]
          screening_syphilis: Database["public"]["Enums"]["edoslmis_screening_result"]
          status: Database["public"]["Enums"]["edoslmis_blood_unit_status"]
          storage_location: string | null
          tenant_id: string
          unit_number: string
          updated_at: string
          volume_ml: number
        }
        Insert: {
          blood_group: Database["public"]["Enums"]["edoslmis_blood_group"]
          branch_id?: string | null
          collection_date?: string
          component?: Database["public"]["Enums"]["edoslmis_blood_component"]
          created_at?: string
          created_by?: string | null
          discard_reason?: string | null
          donor_id?: string | null
          expiry_date: string
          id?: string
          screening_hbsag?: Database["public"]["Enums"]["edoslmis_screening_result"]
          screening_hcv?: Database["public"]["Enums"]["edoslmis_screening_result"]
          screening_hiv?: Database["public"]["Enums"]["edoslmis_screening_result"]
          screening_syphilis?: Database["public"]["Enums"]["edoslmis_screening_result"]
          status?: Database["public"]["Enums"]["edoslmis_blood_unit_status"]
          storage_location?: string | null
          tenant_id: string
          unit_number: string
          updated_at?: string
          volume_ml?: number
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["edoslmis_blood_group"]
          branch_id?: string | null
          collection_date?: string
          component?: Database["public"]["Enums"]["edoslmis_blood_component"]
          created_at?: string
          created_by?: string | null
          discard_reason?: string | null
          donor_id?: string | null
          expiry_date?: string
          id?: string
          screening_hbsag?: Database["public"]["Enums"]["edoslmis_screening_result"]
          screening_hcv?: Database["public"]["Enums"]["edoslmis_screening_result"]
          screening_hiv?: Database["public"]["Enums"]["edoslmis_screening_result"]
          screening_syphilis?: Database["public"]["Enums"]["edoslmis_screening_result"]
          status?: Database["public"]["Enums"]["edoslmis_blood_unit_status"]
          storage_location?: string | null
          tenant_id?: string
          unit_number?: string
          updated_at?: string
          volume_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_bb_blood_units_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_blood_units_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_bb_donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_blood_units_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_bb_crossmatch_requests: {
        Row: {
          branch_id: string | null
          component_requested: Database["public"]["Enums"]["edoslmis_blood_component"]
          created_at: string
          id: string
          indication: string | null
          order_id: string | null
          patient_blood_group:
            | Database["public"]["Enums"]["edoslmis_blood_group"]
            | null
          patient_id: string
          requested_at: string
          requested_by: string | null
          status: Database["public"]["Enums"]["edoslmis_crossmatch_status"]
          tenant_id: string
          units_requested: number
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          component_requested?: Database["public"]["Enums"]["edoslmis_blood_component"]
          created_at?: string
          id?: string
          indication?: string | null
          order_id?: string | null
          patient_blood_group?:
            | Database["public"]["Enums"]["edoslmis_blood_group"]
            | null
          patient_id: string
          requested_at?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["edoslmis_crossmatch_status"]
          tenant_id: string
          units_requested?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          component_requested?: Database["public"]["Enums"]["edoslmis_blood_component"]
          created_at?: string
          id?: string
          indication?: string | null
          order_id?: string | null
          patient_blood_group?:
            | Database["public"]["Enums"]["edoslmis_blood_group"]
            | null
          patient_id?: string
          requested_at?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["edoslmis_crossmatch_status"]
          tenant_id?: string
          units_requested?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_bb_crossmatch_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_crossmatch_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_crossmatch_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_crossmatch_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_crossmatch_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_bb_crossmatch_results: {
        Row: {
          blood_unit_id: string
          created_at: string
          crossmatch_request_id: string
          id: string
          method: string
          notes: string | null
          performed_at: string
          performed_by: string | null
          result: Database["public"]["Enums"]["edoslmis_crossmatch_result"]
          tenant_id: string
        }
        Insert: {
          blood_unit_id: string
          created_at?: string
          crossmatch_request_id: string
          id?: string
          method?: string
          notes?: string | null
          performed_at?: string
          performed_by?: string | null
          result: Database["public"]["Enums"]["edoslmis_crossmatch_result"]
          tenant_id: string
        }
        Update: {
          blood_unit_id?: string
          created_at?: string
          crossmatch_request_id?: string
          id?: string
          method?: string
          notes?: string | null
          performed_at?: string
          performed_by?: string | null
          result?: Database["public"]["Enums"]["edoslmis_crossmatch_result"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_bb_crossmatch_results_blood_unit_id_fkey"
            columns: ["blood_unit_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_bb_blood_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_crossmatch_results_crossmatch_request_id_fkey"
            columns: ["crossmatch_request_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_bb_crossmatch_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_crossmatch_results_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_crossmatch_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_bb_donors: {
        Row: {
          blood_group:
            | Database["public"]["Enums"]["edoslmis_blood_group"]
            | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          deferral_reason: string | null
          deferred_until: string | null
          donor_number: string
          donor_type: Database["public"]["Enums"]["edoslmis_donor_type"]
          first_name: string
          gender: Database["public"]["Enums"]["edoslmis_gender"] | null
          id: string
          is_active: boolean
          last_donation_date: string | null
          last_name: string
          national_id: string | null
          phone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          blood_group?:
            | Database["public"]["Enums"]["edoslmis_blood_group"]
            | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deferral_reason?: string | null
          deferred_until?: string | null
          donor_number: string
          donor_type?: Database["public"]["Enums"]["edoslmis_donor_type"]
          first_name: string
          gender?: Database["public"]["Enums"]["edoslmis_gender"] | null
          id?: string
          is_active?: boolean
          last_donation_date?: string | null
          last_name: string
          national_id?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          blood_group?:
            | Database["public"]["Enums"]["edoslmis_blood_group"]
            | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deferral_reason?: string | null
          deferred_until?: string | null
          donor_number?: string
          donor_type?: Database["public"]["Enums"]["edoslmis_donor_type"]
          first_name?: string
          gender?: Database["public"]["Enums"]["edoslmis_gender"] | null
          id?: string
          is_active?: boolean
          last_donation_date?: string | null
          last_name?: string
          national_id?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_bb_donors_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_donors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_bb_transfusion_reactions: {
        Row: {
          action_taken: string | null
          created_at: string
          id: string
          onset_at: string
          reaction_type: string
          reported_by: string | null
          severity: Database["public"]["Enums"]["edoslmis_reaction_severity"]
          symptoms: string | null
          tenant_id: string
          transfusion_id: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          id?: string
          onset_at?: string
          reaction_type: string
          reported_by?: string | null
          severity?: Database["public"]["Enums"]["edoslmis_reaction_severity"]
          symptoms?: string | null
          tenant_id: string
          transfusion_id: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          id?: string
          onset_at?: string
          reaction_type?: string
          reported_by?: string | null
          severity?: Database["public"]["Enums"]["edoslmis_reaction_severity"]
          symptoms?: string | null
          tenant_id?: string
          transfusion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_bb_transfusion_reactions_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_transfusion_reactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_transfusion_reactions_transfusion_id_fkey"
            columns: ["transfusion_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_bb_transfusions"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_bb_transfusions: {
        Row: {
          blood_unit_id: string
          branch_id: string | null
          created_at: string
          crossmatch_result_id: string | null
          ended_at: string | null
          id: string
          issued_at: string
          issued_by: string | null
          patient_id: string
          post_transfusion_vitals: Json
          pre_transfusion_vitals: Json
          started_at: string | null
          status: Database["public"]["Enums"]["edoslmis_transfusion_status"]
          tenant_id: string
          updated_at: string
          ward_location: string | null
        }
        Insert: {
          blood_unit_id: string
          branch_id?: string | null
          created_at?: string
          crossmatch_result_id?: string | null
          ended_at?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          patient_id: string
          post_transfusion_vitals?: Json
          pre_transfusion_vitals?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["edoslmis_transfusion_status"]
          tenant_id: string
          updated_at?: string
          ward_location?: string | null
        }
        Update: {
          blood_unit_id?: string
          branch_id?: string | null
          created_at?: string
          crossmatch_result_id?: string | null
          ended_at?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          patient_id?: string
          post_transfusion_vitals?: Json
          pre_transfusion_vitals?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["edoslmis_transfusion_status"]
          tenant_id?: string
          updated_at?: string
          ward_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_bb_transfusions_blood_unit_id_fkey"
            columns: ["blood_unit_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_bb_blood_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_transfusions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_transfusions_crossmatch_result_id_fkey"
            columns: ["crossmatch_result_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_bb_crossmatch_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_transfusions_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_transfusions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_bb_transfusions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_critical_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          id: string
          notes: string | null
          notified_at: string
          notified_to: string | null
          result_entry_id: string
          tenant_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          notified_at?: string
          notified_to?: string | null
          result_entry_id: string
          tenant_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          notified_at?: string
          notified_to?: string | null
          result_entry_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_critical_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_critical_alerts_notified_to_fkey"
            columns: ["notified_to"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_critical_alerts_result_entry_id_fkey"
            columns: ["result_entry_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_result_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_critical_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_departments: {
        Row: {
          branch_id: string | null
          code: string
          created_at: string
          created_by: string | null
          default_tat_hours: number | null
          deleted_at: string | null
          department_type: Database["public"]["Enums"]["edoslmis_department_type"]
          head_user_id: string | null
          id: string
          is_active: boolean
          name: string
          settings: Json
          sort_order: number
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          branch_id?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          default_tat_hours?: number | null
          deleted_at?: string | null
          department_type?: Database["public"]["Enums"]["edoslmis_department_type"]
          head_user_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          settings?: Json
          sort_order?: number
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          branch_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          default_tat_hours?: number | null
          deleted_at?: string | null
          department_type?: Database["public"]["Enums"]["edoslmis_department_type"]
          head_user_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          settings?: Json
          sort_order?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_departments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_departments_head_user_id_fkey"
            columns: ["head_user_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_equipment: {
        Row: {
          asset_tag: string | null
          branch_id: string | null
          calibration_interval_days: number | null
          code: string
          created_at: string
          created_by: string | null
          department_id: string | null
          equipment_type: string
          id: string
          installation_date: string | null
          is_active: boolean
          last_calibration_date: string | null
          last_maintenance_date: string | null
          location: string | null
          maintenance_interval_days: number | null
          manufacturer: string | null
          model: string | null
          name: string
          next_calibration_due: string | null
          next_maintenance_due: string | null
          notes: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["edoslmis_equipment_status"]
          tenant_id: string
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          asset_tag?: string | null
          branch_id?: string | null
          calibration_interval_days?: number | null
          code: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          equipment_type?: string
          id?: string
          installation_date?: string | null
          is_active?: boolean
          last_calibration_date?: string | null
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_interval_days?: number | null
          manufacturer?: string | null
          model?: string | null
          name: string
          next_calibration_due?: string | null
          next_maintenance_due?: string | null
          notes?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["edoslmis_equipment_status"]
          tenant_id: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          asset_tag?: string | null
          branch_id?: string | null
          calibration_interval_days?: number | null
          code?: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          equipment_type?: string
          id?: string
          installation_date?: string | null
          is_active?: boolean
          last_calibration_date?: string | null
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_interval_days?: number | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          next_calibration_due?: string | null
          next_maintenance_due?: string | null
          notes?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["edoslmis_equipment_status"]
          tenant_id?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_equipment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_equipment_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_equipment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_equipment_downtime_logs: {
        Row: {
          created_at: string
          ended_at: string | null
          equipment_id: string
          id: string
          reason: string
          reported_by: string | null
          resolved_by: string | null
          started_at: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          equipment_id: string
          id?: string
          reason: string
          reported_by?: string | null
          resolved_by?: string | null
          started_at?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          equipment_id?: string
          id?: string
          reason?: string
          reported_by?: string | null
          resolved_by?: string | null
          started_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_equipment_downtime_logs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_equipment_downtime_logs_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_equipment_downtime_logs_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_equipment_downtime_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_equipment_maintenance_logs: {
        Row: {
          cost: number | null
          created_at: string
          created_by: string | null
          description: string | null
          downtime_hours: number
          equipment_id: string
          id: string
          maintenance_type: Database["public"]["Enums"]["edoslmis_maintenance_type"]
          next_due_date: string | null
          performed_at: string
          performed_by: string | null
          tenant_id: string
          vendor_name: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          downtime_hours?: number
          equipment_id: string
          id?: string
          maintenance_type: Database["public"]["Enums"]["edoslmis_maintenance_type"]
          next_due_date?: string | null
          performed_at?: string
          performed_by?: string | null
          tenant_id: string
          vendor_name?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          downtime_hours?: number
          equipment_id?: string
          id?: string
          maintenance_type?: Database["public"]["Enums"]["edoslmis_maintenance_type"]
          next_due_date?: string | null
          performed_at?: string
          performed_by?: string | null
          tenant_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_equipment_maintenance_logs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_equipment_maintenance_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_equipment_maintenance_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_histo_blocks: {
        Row: {
          block_number: string
          case_id: string
          created_at: string
          id: string
          tenant_id: string
          tissue_description: string | null
        }
        Insert: {
          block_number: string
          case_id: string
          created_at?: string
          id?: string
          tenant_id: string
          tissue_description?: string | null
        }
        Update: {
          block_number?: string
          case_id?: string
          created_at?: string
          id?: string
          tenant_id?: string
          tissue_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_histo_blocks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_histo_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_histo_blocks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_histo_cases: {
        Row: {
          branch_id: string | null
          clinical_history: string | null
          created_at: string
          created_by: string | null
          gross_description: string | null
          id: string
          number_of_pieces: number
          order_test_id: string
          specimen_id: string | null
          specimen_type: Database["public"]["Enums"]["edoslmis_histo_specimen_type"]
          status: Database["public"]["Enums"]["edoslmis_histo_case_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          clinical_history?: string | null
          created_at?: string
          created_by?: string | null
          gross_description?: string | null
          id?: string
          number_of_pieces?: number
          order_test_id: string
          specimen_id?: string | null
          specimen_type?: Database["public"]["Enums"]["edoslmis_histo_specimen_type"]
          status?: Database["public"]["Enums"]["edoslmis_histo_case_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          clinical_history?: string | null
          created_at?: string
          created_by?: string | null
          gross_description?: string | null
          id?: string
          number_of_pieces?: number
          order_test_id?: string
          specimen_id?: string | null
          specimen_type?: Database["public"]["Enums"]["edoslmis_histo_specimen_type"]
          status?: Database["public"]["Enums"]["edoslmis_histo_case_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_histo_cases_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_histo_cases_order_test_id_fkey"
            columns: ["order_test_id"]
            isOneToOne: true
            referencedRelation: "edoslmis_order_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_histo_cases_specimen_id_fkey"
            columns: ["specimen_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_specimens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_histo_cases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_histo_diagnoses: {
        Row: {
          case_id: string
          created_at: string
          diagnosis: string
          icd_o_code: string | null
          id: string
          margins_status: string | null
          microscopic_description: string
          signed_at: string
          signed_by: string | null
          tenant_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          diagnosis: string
          icd_o_code?: string | null
          id?: string
          margins_status?: string | null
          microscopic_description: string
          signed_at?: string
          signed_by?: string | null
          tenant_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          diagnosis?: string
          icd_o_code?: string | null
          id?: string
          margins_status?: string | null
          microscopic_description?: string
          signed_at?: string
          signed_by?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_histo_diagnoses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "edoslmis_histo_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_histo_diagnoses_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_histo_diagnoses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_histo_slides: {
        Row: {
          block_id: string
          created_at: string
          id: string
          slide_number: string
          stain_type: string
          tenant_id: string
        }
        Insert: {
          block_id: string
          created_at?: string
          id?: string
          slide_number: string
          stain_type?: string
          tenant_id: string
        }
        Update: {
          block_id?: string
          created_at?: string
          id?: string
          slide_number?: string
          stain_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_histo_slides_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_histo_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_histo_slides_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_insurance_claims: {
        Row: {
          approved_amount: number | null
          claim_number: string | null
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          policy_number: string | null
          rejection_reason: string | null
          scheme_name: string
          status: Database["public"]["Enums"]["edoslmis_claim_status"]
          submitted_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approved_amount?: number | null
          claim_number?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          policy_number?: string | null
          rejection_reason?: string | null
          scheme_name: string
          status?: Database["public"]["Enums"]["edoslmis_claim_status"]
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approved_amount?: number | null
          claim_number?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          policy_number?: string | null
          rejection_reason?: string | null
          scheme_name?: string
          status?: Database["public"]["Enums"]["edoslmis_claim_status"]
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_insurance_claims_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_insurance_claims_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_inventory_items: {
        Row: {
          branch_id: string | null
          category: string
          code: string
          created_at: string
          created_by: string | null
          department_id: string | null
          id: string
          is_active: boolean
          name: string
          reorder_level: number
          tenant_id: string
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          category?: string
          code: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          reorder_level?: number
          tenant_id: string
          unit_of_measure?: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          category?: string
          code?: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          reorder_level?: number
          tenant_id?: string
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_inventory_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_inventory_items_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_invoice_items: {
        Row: {
          created_at: string
          description: string
          discount_amount: number
          id: string
          invoice_id: string
          order_test_id: string | null
          quantity: number
          tenant_id: string
          total_amount: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_amount?: number
          id?: string
          invoice_id: string
          order_test_id?: string | null
          quantity?: number
          tenant_id: string
          total_amount?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_amount?: number
          id?: string
          invoice_id?: string
          order_test_id?: string | null
          quantity?: number
          tenant_id?: string
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_invoice_items_order_test_id_fkey"
            columns: ["order_test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_order_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_invoice_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_invoices: {
        Row: {
          amount_paid: number
          balance_due: number | null
          branch_id: string | null
          cancellation_reason: string | null
          created_at: string
          created_by: string | null
          discount_amount: number
          due_date: string | null
          id: string
          invoice_number: string
          is_vat_exempt: boolean
          issued_at: string | null
          order_id: string | null
          patient_id: string
          payer_name: string | null
          payer_type: Database["public"]["Enums"]["edoslmis_payer_type"]
          status: Database["public"]["Enums"]["edoslmis_invoice_status"]
          subtotal: number
          tax_amount: number
          tenant_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          balance_due?: number | null
          branch_id?: string | null
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number: string
          is_vat_exempt?: boolean
          issued_at?: string | null
          order_id?: string | null
          patient_id: string
          payer_name?: string | null
          payer_type?: Database["public"]["Enums"]["edoslmis_payer_type"]
          status?: Database["public"]["Enums"]["edoslmis_invoice_status"]
          subtotal?: number
          tax_amount?: number
          tenant_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          balance_due?: number | null
          branch_id?: string | null
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          is_vat_exempt?: boolean
          issued_at?: string | null
          order_id?: string | null
          patient_id?: string
          payer_name?: string | null
          payer_type?: Database["public"]["Enums"]["edoslmis_payer_type"]
          status?: Database["public"]["Enums"]["edoslmis_invoice_status"]
          subtotal?: number
          tax_amount?: number
          tenant_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_lab_stock_checks: {
        Row: {
          beginning_balance: number
          branch_id: string | null
          check_date: string
          computed_expected_balance: number
          created_at: string
          expiring_under_6months: number
          id: string
          item_id: string
          losses_wastage: number
          negative_adjustments: number
          notes: string | null
          performed_by: string | null
          physical_count: number
          positive_adjustments: number
          qaqc_repeats: number
          qty_received: number
          qty_received_other_sources: number
          quantity_required_supply: number
          quantity_used: number
          quantity_used_is_manual: boolean
          stocked_out_qty: number
          tenant_id: string
          tests_done: number
          updated_at: string
        }
        Insert: {
          beginning_balance?: number
          branch_id?: string | null
          check_date?: string
          computed_expected_balance?: number
          created_at?: string
          expiring_under_6months?: number
          id?: string
          item_id: string
          losses_wastage?: number
          negative_adjustments?: number
          notes?: string | null
          performed_by?: string | null
          physical_count?: number
          positive_adjustments?: number
          qaqc_repeats?: number
          qty_received?: number
          qty_received_other_sources?: number
          quantity_required_supply?: number
          quantity_used?: number
          quantity_used_is_manual?: boolean
          stocked_out_qty?: number
          tenant_id: string
          tests_done?: number
          updated_at?: string
        }
        Update: {
          beginning_balance?: number
          branch_id?: string | null
          check_date?: string
          computed_expected_balance?: number
          created_at?: string
          expiring_under_6months?: number
          id?: string
          item_id?: string
          losses_wastage?: number
          negative_adjustments?: number
          notes?: string | null
          performed_by?: string | null
          physical_count?: number
          positive_adjustments?: number
          qaqc_repeats?: number
          qty_received?: number
          qty_received_other_sources?: number
          quantity_required_supply?: number
          quantity_used?: number
          quantity_used_is_manual?: boolean
          stocked_out_qty?: number
          tenant_id?: string
          tests_done?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_lab_stock_checks_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_lab_stock_checks_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_lab_stock_checks_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_lab_stock_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_micro_antibiotics: {
        Row: {
          antibiotic_class: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          tenant_id: string
        }
        Insert: {
          antibiotic_class?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
        }
        Update: {
          antibiotic_class?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_micro_antibiotics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_micro_culture_isolates: {
        Row: {
          colony_count: string | null
          created_at: string
          culture_id: string
          id: string
          organism_id: string
          significance: Database["public"]["Enums"]["edoslmis_isolate_significance"]
          tenant_id: string
        }
        Insert: {
          colony_count?: string | null
          created_at?: string
          culture_id: string
          id?: string
          organism_id: string
          significance?: Database["public"]["Enums"]["edoslmis_isolate_significance"]
          tenant_id: string
        }
        Update: {
          colony_count?: string | null
          created_at?: string
          culture_id?: string
          id?: string
          organism_id?: string
          significance?: Database["public"]["Enums"]["edoslmis_isolate_significance"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_micro_culture_isolates_culture_id_fkey"
            columns: ["culture_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_micro_cultures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_micro_culture_isolates_organism_id_fkey"
            columns: ["organism_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_micro_organisms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_micro_culture_isolates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_micro_cultures: {
        Row: {
          branch_id: string | null
          created_at: string
          created_by: string | null
          culture_type: Database["public"]["Enums"]["edoslmis_culture_type"]
          finalized_at: string | null
          finalized_by: string | null
          gram_stain_result: string | null
          id: string
          media_used: string | null
          order_test_id: string
          preliminary_report: string | null
          set_up_at: string
          specimen_id: string | null
          status: Database["public"]["Enums"]["edoslmis_culture_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          culture_type?: Database["public"]["Enums"]["edoslmis_culture_type"]
          finalized_at?: string | null
          finalized_by?: string | null
          gram_stain_result?: string | null
          id?: string
          media_used?: string | null
          order_test_id: string
          preliminary_report?: string | null
          set_up_at?: string
          specimen_id?: string | null
          status?: Database["public"]["Enums"]["edoslmis_culture_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          culture_type?: Database["public"]["Enums"]["edoslmis_culture_type"]
          finalized_at?: string | null
          finalized_by?: string | null
          gram_stain_result?: string | null
          id?: string
          media_used?: string | null
          order_test_id?: string
          preliminary_report?: string | null
          set_up_at?: string
          specimen_id?: string | null
          status?: Database["public"]["Enums"]["edoslmis_culture_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_micro_cultures_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_micro_cultures_finalized_by_fkey"
            columns: ["finalized_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_micro_cultures_order_test_id_fkey"
            columns: ["order_test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_order_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_micro_cultures_specimen_id_fkey"
            columns: ["specimen_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_specimens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_micro_cultures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_micro_organisms: {
        Row: {
          created_at: string
          gram_stain: Database["public"]["Enums"]["edoslmis_gram_stain"]
          id: string
          is_active: boolean
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          gram_stain?: Database["public"]["Enums"]["edoslmis_gram_stain"]
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          gram_stain?: Database["public"]["Enums"]["edoslmis_gram_stain"]
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_micro_organisms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_micro_sensitivity_results: {
        Row: {
          antibiotic_id: string
          created_at: string
          id: string
          interpretation: Database["public"]["Enums"]["edoslmis_sensitivity_interpretation"]
          isolate_id: string
          method: string
          mic_value: number | null
          tenant_id: string
          zone_diameter_mm: number | null
        }
        Insert: {
          antibiotic_id: string
          created_at?: string
          id?: string
          interpretation: Database["public"]["Enums"]["edoslmis_sensitivity_interpretation"]
          isolate_id: string
          method?: string
          mic_value?: number | null
          tenant_id: string
          zone_diameter_mm?: number | null
        }
        Update: {
          antibiotic_id?: string
          created_at?: string
          id?: string
          interpretation?: Database["public"]["Enums"]["edoslmis_sensitivity_interpretation"]
          isolate_id?: string
          method?: string
          mic_value?: number | null
          tenant_id?: string
          zone_diameter_mm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_micro_sensitivity_results_antibiotic_id_fkey"
            columns: ["antibiotic_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_micro_antibiotics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_micro_sensitivity_results_isolate_id_fkey"
            columns: ["isolate_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_micro_culture_isolates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_micro_sensitivity_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_molecular_runs: {
        Row: {
          assay_name: string
          branch_id: string | null
          created_at: string
          created_by: string | null
          equipment_id: string | null
          finalized_at: string | null
          finalized_by: string | null
          id: string
          order_test_id: string
          performed_by: string | null
          run_at: string
          specimen_id: string | null
          status: Database["public"]["Enums"]["edoslmis_molecular_run_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assay_name: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          equipment_id?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          order_test_id: string
          performed_by?: string | null
          run_at?: string
          specimen_id?: string | null
          status?: Database["public"]["Enums"]["edoslmis_molecular_run_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assay_name?: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          equipment_id?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          order_test_id?: string
          performed_by?: string | null
          run_at?: string
          specimen_id?: string | null
          status?: Database["public"]["Enums"]["edoslmis_molecular_run_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_molecular_runs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_molecular_runs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_molecular_runs_finalized_by_fkey"
            columns: ["finalized_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_molecular_runs_order_test_id_fkey"
            columns: ["order_test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_order_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_molecular_runs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_molecular_runs_specimen_id_fkey"
            columns: ["specimen_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_specimens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_molecular_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_molecular_targets: {
        Row: {
          created_at: string
          ct_value: number | null
          id: string
          result: Database["public"]["Enums"]["edoslmis_molecular_result"]
          run_id: string
          target_name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          ct_value?: number | null
          id?: string
          result?: Database["public"]["Enums"]["edoslmis_molecular_result"]
          run_id: string
          target_name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          ct_value?: number | null
          id?: string
          result?: Database["public"]["Enums"]["edoslmis_molecular_result"]
          run_id?: string
          target_name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_molecular_targets_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_molecular_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_molecular_targets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_notifications_log: {
        Row: {
          channel: Database["public"]["Enums"]["edoslmis_notification_channel"]
          created_at: string
          id: string
          message: string
          provider: string
          recipient: string
          related_id: string | null
          related_table: string | null
          status: Database["public"]["Enums"]["edoslmis_notification_status"]
          subject: string | null
          tenant_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["edoslmis_notification_channel"]
          created_at?: string
          id?: string
          message: string
          provider: string
          recipient: string
          related_id?: string | null
          related_table?: string | null
          status: Database["public"]["Enums"]["edoslmis_notification_status"]
          subject?: string | null
          tenant_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["edoslmis_notification_channel"]
          created_at?: string
          id?: string
          message?: string
          provider?: string
          recipient?: string
          related_id?: string | null
          related_table?: string | null
          status?: Database["public"]["Enums"]["edoslmis_notification_status"]
          subject?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_notifications_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_order_tests: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          order_id: string
          panel_id: string | null
          price: number
          specimen_id: string | null
          status: Database["public"]["Enums"]["edoslmis_order_test_status"]
          tenant_id: string
          test_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          order_id: string
          panel_id?: string | null
          price?: number
          specimen_id?: string | null
          status?: Database["public"]["Enums"]["edoslmis_order_test_status"]
          tenant_id: string
          test_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          order_id?: string
          panel_id?: string | null
          price?: number
          specimen_id?: string | null
          status?: Database["public"]["Enums"]["edoslmis_order_test_status"]
          tenant_id?: string
          test_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_order_tests_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_order_tests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_order_tests_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_order_tests_specimen_fkey"
            columns: ["specimen_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_specimens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_order_tests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_order_tests_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_orders: {
        Row: {
          branch_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          clinical_indication: string | null
          created_at: string
          created_by: string | null
          id: string
          order_number: string
          order_source: Database["public"]["Enums"]["edoslmis_order_source"]
          ordered_at: string
          ordering_clinician: string | null
          ordering_user_id: string | null
          patient_id: string
          priority: Database["public"]["Enums"]["edoslmis_order_priority"]
          status: Database["public"]["Enums"]["edoslmis_order_status"]
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          branch_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          clinical_indication?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          order_number: string
          order_source?: Database["public"]["Enums"]["edoslmis_order_source"]
          ordered_at?: string
          ordering_clinician?: string | null
          ordering_user_id?: string | null
          patient_id: string
          priority?: Database["public"]["Enums"]["edoslmis_order_priority"]
          status?: Database["public"]["Enums"]["edoslmis_order_status"]
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          branch_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          clinical_indication?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          order_number?: string
          order_source?: Database["public"]["Enums"]["edoslmis_order_source"]
          ordered_at?: string
          ordering_clinician?: string | null
          ordering_user_id?: string | null
          patient_id?: string
          priority?: Database["public"]["Enums"]["edoslmis_order_priority"]
          status?: Database["public"]["Enums"]["edoslmis_order_status"]
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_orders_ordering_user_id_fkey"
            columns: ["ordering_user_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_panel_tests: {
        Row: {
          id: string
          panel_id: string
          sequence: number
          test_id: string
        }
        Insert: {
          id?: string
          panel_id: string
          sequence?: number
          test_id: string
        }
        Update: {
          id?: string
          panel_id?: string
          sequence?: number
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_panel_tests_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_panel_tests_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_panels: {
        Row: {
          code: string
          created_at: string
          department_id: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_panels_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_panels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_patients: {
        Row: {
          address: string | null
          age_months: number | null
          age_years: number | null
          alien_id: string | null
          branch_id: string | null
          county: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          first_name: string
          gender: Database["public"]["Enums"]["edoslmis_gender"] | null
          id: string
          insurance_info: Json
          last_name: string
          national_id: string | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          nhif_number: string | null
          notes: string | null
          other_names: string | null
          passport_number: string | null
          patient_category: Database["public"]["Enums"]["edoslmis_patient_category"]
          patient_number: string
          phone_primary: string | null
          phone_secondary: string | null
          referring_doctor: string | null
          referring_facility: string | null
          registered_by: string | null
          sha_number: string | null
          sub_county: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
          village: string | null
          ward: string | null
        }
        Insert: {
          address?: string | null
          age_months?: number | null
          age_years?: number | null
          alien_id?: string | null
          branch_id?: string | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["edoslmis_gender"] | null
          id?: string
          insurance_info?: Json
          last_name: string
          national_id?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          nhif_number?: string | null
          notes?: string | null
          other_names?: string | null
          passport_number?: string | null
          patient_category?: Database["public"]["Enums"]["edoslmis_patient_category"]
          patient_number: string
          phone_primary?: string | null
          phone_secondary?: string | null
          referring_doctor?: string | null
          referring_facility?: string | null
          registered_by?: string | null
          sha_number?: string | null
          sub_county?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          village?: string | null
          ward?: string | null
        }
        Update: {
          address?: string | null
          age_months?: number | null
          age_years?: number | null
          alien_id?: string | null
          branch_id?: string | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["edoslmis_gender"] | null
          id?: string
          insurance_info?: Json
          last_name?: string
          national_id?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          nhif_number?: string | null
          notes?: string | null
          other_names?: string | null
          passport_number?: string | null
          patient_category?: Database["public"]["Enums"]["edoslmis_patient_category"]
          patient_number?: string
          phone_primary?: string | null
          phone_secondary?: string | null
          referring_doctor?: string | null
          referring_facility?: string | null
          registered_by?: string | null
          sha_number?: string | null
          sub_county?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          village?: string | null
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_patients_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_patients_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          paid_at: string
          payment_method: string
          received_by: string | null
          reference_number: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          paid_at?: string
          payment_method: string
          received_by?: string | null
          reference_number?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          paid_at?: string
          payment_method?: string
          received_by?: string | null
          reference_number?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_purchase_order_lines: {
        Row: {
          created_at: string
          id: string
          item_id: string
          po_id: string
          quantity_ordered: number
          quantity_received: number
          tenant_id: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          po_id: string
          quantity_ordered: number
          quantity_received?: number
          tenant_id: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          po_id?: string
          quantity_ordered?: number
          quantity_received?: number
          tenant_id?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_purchase_order_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_purchase_order_lines_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_purchase_order_lines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_purchase_orders: {
        Row: {
          branch_id: string | null
          cancelled_reason: string | null
          corrected_at: string | null
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          revision: number
          status: Database["public"]["Enums"]["edoslmis_po_status"]
          supplier_id: string
          supplier_invoice_number: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          cancelled_reason?: string | null
          corrected_at?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          revision?: number
          status?: Database["public"]["Enums"]["edoslmis_po_status"]
          supplier_id: string
          supplier_invoice_number?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          cancelled_reason?: string | null
          corrected_at?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          revision?: number
          status?: Database["public"]["Enums"]["edoslmis_po_status"]
          supplier_id?: string
          supplier_invoice_number?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_purchase_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_qc_materials: {
        Row: {
          branch_id: string | null
          created_at: string
          created_by: string | null
          expiry_date: string | null
          id: string
          is_active: boolean
          level: Database["public"]["Enums"]["edoslmis_qc_level"]
          lot_number: string
          manufacturer: string | null
          target_mean: number
          target_sd: number
          tenant_id: string
          test_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          level: Database["public"]["Enums"]["edoslmis_qc_level"]
          lot_number: string
          manufacturer?: string | null
          target_mean: number
          target_sd: number
          tenant_id: string
          test_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          level?: Database["public"]["Enums"]["edoslmis_qc_level"]
          lot_number?: string
          manufacturer?: string | null
          target_mean?: number
          target_sd?: number
          tenant_id?: string
          test_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_qc_materials_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_qc_materials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_qc_materials_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_qc_runs: {
        Row: {
          branch_id: string | null
          comments: string | null
          created_at: string
          equipment_id: string | null
          id: string
          material_id: string
          performed_by: string | null
          run_at: string
          status: Database["public"]["Enums"]["edoslmis_qc_status"]
          tenant_id: string
          value: number
          violated_rules: Json
          z_score: number | null
        }
        Insert: {
          branch_id?: string | null
          comments?: string | null
          created_at?: string
          equipment_id?: string | null
          id?: string
          material_id: string
          performed_by?: string | null
          run_at?: string
          status?: Database["public"]["Enums"]["edoslmis_qc_status"]
          tenant_id: string
          value: number
          violated_rules?: Json
          z_score?: number | null
        }
        Update: {
          branch_id?: string | null
          comments?: string | null
          created_at?: string
          equipment_id?: string | null
          id?: string
          material_id?: string
          performed_by?: string | null
          run_at?: string
          status?: Database["public"]["Enums"]["edoslmis_qc_status"]
          tenant_id?: string
          value?: number
          violated_rules?: Json
          z_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_qc_runs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_qc_runs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_qc_runs_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_qc_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_qc_runs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_qc_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_quotation_items: {
        Row: {
          created_at: string
          description: string
          id: string
          quantity: number
          quotation_id: string
          sort_order: number
          tenant_id: string
          total_amount: number
          unit_of_measure: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          quantity?: number
          quotation_id: string
          sort_order?: number
          tenant_id: string
          total_amount?: number
          unit_of_measure?: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          quotation_id?: string
          sort_order?: number
          tenant_id?: string
          total_amount?: number
          unit_of_measure?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_quotation_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_quotations: {
        Row: {
          branch_id: string | null
          corrected_at: string | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          is_vat_exempt: boolean
          notes: string | null
          quotation_number: string
          quote_date: string
          revision: number
          status: Database["public"]["Enums"]["edoslmis_quotation_status"]
          subtotal: number
          tax_amount: number
          tenant_id: string
          total_amount: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          branch_id?: string | null
          corrected_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          is_vat_exempt?: boolean
          notes?: string | null
          quotation_number: string
          quote_date?: string
          revision?: number
          status?: Database["public"]["Enums"]["edoslmis_quotation_status"]
          subtotal?: number
          tax_amount?: number
          tenant_id: string
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          branch_id?: string | null
          corrected_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          is_vat_exempt?: boolean
          notes?: string | null
          quotation_number?: string
          quote_date?: string
          revision?: number
          status?: Database["public"]["Enums"]["edoslmis_quotation_status"]
          subtotal?: number
          tax_amount?: number
          tenant_id?: string
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_quotations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_quotations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_reference_ranges: {
        Row: {
          age_max_days: number | null
          age_min_days: number
          component_id: string | null
          condition_notes: string | null
          created_at: string
          critical_high: number | null
          critical_low: number | null
          gender: Database["public"]["Enums"]["edoslmis_gender_applicability"]
          high: number | null
          id: string
          low: number | null
          test_id: string
          text_range: string | null
          updated_at: string
        }
        Insert: {
          age_max_days?: number | null
          age_min_days?: number
          component_id?: string | null
          condition_notes?: string | null
          created_at?: string
          critical_high?: number | null
          critical_low?: number | null
          gender?: Database["public"]["Enums"]["edoslmis_gender_applicability"]
          high?: number | null
          id?: string
          low?: number | null
          test_id: string
          text_range?: string | null
          updated_at?: string
        }
        Update: {
          age_max_days?: number | null
          age_min_days?: number
          component_id?: string | null
          condition_notes?: string | null
          created_at?: string
          critical_high?: number | null
          critical_low?: number | null
          gender?: Database["public"]["Enums"]["edoslmis_gender_applicability"]
          high?: number | null
          id?: string
          low?: number | null
          test_id?: string
          text_range?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_reference_ranges_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_test_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_reference_ranges_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_result_entries: {
        Row: {
          comments: string | null
          component_id: string | null
          created_at: string
          delta_check_flag: boolean
          entered_at: string
          entered_by: string | null
          equipment_id: string | null
          flag: Database["public"]["Enums"]["edoslmis_result_flag"] | null
          id: string
          is_critical: boolean
          order_test_id: string
          previous_result_id: string | null
          result_value_numeric: number | null
          result_value_text: string | null
          tenant_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          comments?: string | null
          component_id?: string | null
          created_at?: string
          delta_check_flag?: boolean
          entered_at?: string
          entered_by?: string | null
          equipment_id?: string | null
          flag?: Database["public"]["Enums"]["edoslmis_result_flag"] | null
          id?: string
          is_critical?: boolean
          order_test_id: string
          previous_result_id?: string | null
          result_value_numeric?: number | null
          result_value_text?: string | null
          tenant_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          comments?: string | null
          component_id?: string | null
          created_at?: string
          delta_check_flag?: boolean
          entered_at?: string
          entered_by?: string | null
          equipment_id?: string | null
          flag?: Database["public"]["Enums"]["edoslmis_result_flag"] | null
          id?: string
          is_critical?: boolean
          order_test_id?: string
          previous_result_id?: string | null
          result_value_numeric?: number | null
          result_value_text?: string | null
          tenant_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_result_entries_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_test_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_result_entries_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_result_entries_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_result_entries_order_test_id_fkey"
            columns: ["order_test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_order_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_result_entries_previous_result_id_fkey"
            columns: ["previous_result_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_result_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_result_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_result_release: {
        Row: {
          created_at: string
          email_sent_at: string | null
          id: string
          order_test_id: string
          portal_published_at: string | null
          printed_at: string | null
          release_channels: Json
          released_at: string
          released_by: string | null
          sms_sent_at: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          email_sent_at?: string | null
          id?: string
          order_test_id: string
          portal_published_at?: string | null
          printed_at?: string | null
          release_channels?: Json
          released_at?: string
          released_by?: string | null
          sms_sent_at?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          email_sent_at?: string | null
          id?: string
          order_test_id?: string
          portal_published_at?: string | null
          printed_at?: string | null
          release_channels?: Json
          released_at?: string
          released_by?: string | null
          sms_sent_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_result_release_order_test_id_fkey"
            columns: ["order_test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_order_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_result_release_released_by_fkey"
            columns: ["released_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_result_release_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_result_verification: {
        Row: {
          comments: string | null
          created_at: string
          id: string
          level: Database["public"]["Enums"]["edoslmis_verification_level"]
          order_test_id: string
          signature_hash: string | null
          status: Database["public"]["Enums"]["edoslmis_verification_status"]
          tenant_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string
          id?: string
          level: Database["public"]["Enums"]["edoslmis_verification_level"]
          order_test_id: string
          signature_hash?: string | null
          status?: Database["public"]["Enums"]["edoslmis_verification_status"]
          tenant_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["edoslmis_verification_level"]
          order_test_id?: string
          signature_hash?: string | null
          status?: Database["public"]["Enums"]["edoslmis_verification_status"]
          tenant_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_result_verification_order_test_id_fkey"
            columns: ["order_test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_order_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_result_verification_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_result_verification_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_rfq_lines: {
        Row: {
          created_at: string
          id: string
          item_id: string
          quantity_requested: number
          rfq_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          quantity_requested: number
          rfq_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          quantity_requested?: number
          rfq_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_rfq_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_rfq_lines_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_rfq_lines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_rfq_suppliers: {
        Row: {
          created_at: string
          id: string
          quoted_total: number | null
          responded_at: string | null
          response_notes: string | null
          rfq_id: string
          sent_at: string | null
          supplier_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quoted_total?: number | null
          responded_at?: string | null
          response_notes?: string | null
          rfq_id: string
          sent_at?: string | null
          supplier_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quoted_total?: number | null
          responded_at?: string | null
          response_notes?: string | null
          rfq_id?: string
          sent_at?: string | null
          supplier_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_rfq_suppliers_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_rfq_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_rfq_suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_rfqs: {
        Row: {
          branch_id: string | null
          corrected_at: string | null
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          revision: number
          rfq_number: string
          status: Database["public"]["Enums"]["edoslmis_rfq_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          corrected_at?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          revision?: number
          rfq_number: string
          status?: Database["public"]["Enums"]["edoslmis_rfq_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          corrected_at?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          revision?: number
          rfq_number?: string
          status?: Database["public"]["Enums"]["edoslmis_rfq_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_rfqs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_rfqs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_settings_lists: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          label: string
          list_key: string
          sort_order: number
          tenant_id: string
          value: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          list_key: string
          sort_order?: number
          tenant_id: string
          value: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          list_key?: string
          sort_order?: number
          tenant_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_settings_lists_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_specimen_tracking: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_at: string
          event_type: Database["public"]["Enums"]["edoslmis_tracking_event"]
          id: string
          location: string | null
          notes: string | null
          specimen_id: string
          tenant_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_at?: string
          event_type: Database["public"]["Enums"]["edoslmis_tracking_event"]
          id?: string
          location?: string | null
          notes?: string | null
          specimen_id: string
          tenant_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_at?: string
          event_type?: Database["public"]["Enums"]["edoslmis_tracking_event"]
          id?: string
          location?: string | null
          notes?: string | null
          specimen_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_specimen_tracking_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_specimen_tracking_specimen_id_fkey"
            columns: ["specimen_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_specimens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_specimen_tracking_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_specimen_types: {
        Row: {
          code: string
          created_at: string
          default_container: string | null
          default_volume: string | null
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          default_container?: string | null
          default_volume?: string | null
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          default_container?: string | null
          default_volume?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_specimen_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_specimens: {
        Row: {
          barcode_symbology: string
          branch_id: string | null
          collected_at: string | null
          collected_by: string | null
          condition_on_receipt: string | null
          created_at: string
          created_by: string | null
          id: string
          order_id: string
          qr_payload: string | null
          received_at: string | null
          received_by: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          specimen_number: string
          specimen_type_id: string | null
          status: Database["public"]["Enums"]["edoslmis_specimen_status"]
          storage_location: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          barcode_symbology?: string
          branch_id?: string | null
          collected_at?: string | null
          collected_by?: string | null
          condition_on_receipt?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          order_id: string
          qr_payload?: string | null
          received_at?: string | null
          received_by?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          specimen_number: string
          specimen_type_id?: string | null
          status?: Database["public"]["Enums"]["edoslmis_specimen_status"]
          storage_location?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          barcode_symbology?: string
          branch_id?: string | null
          collected_at?: string | null
          collected_by?: string | null
          condition_on_receipt?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          order_id?: string
          qr_payload?: string | null
          received_at?: string | null
          received_by?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          specimen_number?: string
          specimen_type_id?: string | null
          status?: Database["public"]["Enums"]["edoslmis_specimen_status"]
          storage_location?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_specimens_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_specimens_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_specimens_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_specimens_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_specimens_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_specimens_specimen_type_id_fkey"
            columns: ["specimen_type_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_specimen_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_specimens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_stock_batches: {
        Row: {
          batch_number: string
          created_at: string
          created_by: string | null
          expiry_date: string | null
          id: string
          is_active: boolean
          item_id: string
          quantity_received: number
          quantity_remaining: number
          received_at: string
          supplier_name: string | null
          tenant_id: string
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          batch_number: string
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          item_id: string
          quantity_received?: number
          quantity_remaining?: number
          received_at?: string
          supplier_name?: string | null
          tenant_id: string
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          batch_number?: string
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          item_id?: string
          quantity_received?: number
          quantity_remaining?: number
          received_at?: string
          supplier_name?: string | null
          tenant_id?: string
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_stock_batches_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_stock_batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_stock_transactions: {
        Row: {
          balance_after: number
          batch_id: string | null
          branch_id: string | null
          created_at: string
          id: string
          item_id: string
          notes: string | null
          performed_at: string
          performed_by: string | null
          quantity_change: number
          reference_order_test_id: string | null
          tenant_id: string
          transaction_type: Database["public"]["Enums"]["edoslmis_stock_transaction_type"]
        }
        Insert: {
          balance_after: number
          batch_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          item_id: string
          notes?: string | null
          performed_at?: string
          performed_by?: string | null
          quantity_change: number
          reference_order_test_id?: string | null
          tenant_id: string
          transaction_type: Database["public"]["Enums"]["edoslmis_stock_transaction_type"]
        }
        Update: {
          balance_after?: number
          batch_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          item_id?: string
          notes?: string | null
          performed_at?: string
          performed_by?: string | null
          quantity_change?: number
          reference_order_test_id?: string | null
          tenant_id?: string
          transaction_type?: Database["public"]["Enums"]["edoslmis_stock_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_stock_transactions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_stock_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_stock_transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_stock_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_stock_transactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_stock_transactions_reference_order_test_id_fkey"
            columns: ["reference_order_test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_order_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_stock_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_supplier_bill_items: {
        Row: {
          bill_id: string
          created_at: string
          description: string
          id: string
          po_line_id: string | null
          quantity: number
          tenant_id: string
          total_amount: number
          unit_cost: number
        }
        Insert: {
          bill_id: string
          created_at?: string
          description: string
          id?: string
          po_line_id?: string | null
          quantity?: number
          tenant_id: string
          total_amount?: number
          unit_cost?: number
        }
        Update: {
          bill_id?: string
          created_at?: string
          description?: string
          id?: string
          po_line_id?: string | null
          quantity?: number
          tenant_id?: string
          total_amount?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_supplier_bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_supplier_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_supplier_bill_items_po_line_id_fkey"
            columns: ["po_line_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_purchase_order_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_supplier_bill_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_supplier_bills: {
        Row: {
          amount_paid: number
          balance_due: number | null
          bill_date: string
          bill_number: string
          branch_id: string | null
          cancellation_reason: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          po_id: string
          status: Database["public"]["Enums"]["edoslmis_supplier_bill_status"]
          subtotal: number
          supplier_id: string
          supplier_invoice_number: string | null
          tenant_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          balance_due?: number | null
          bill_date?: string
          bill_number: string
          branch_id?: string | null
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          po_id: string
          status?: Database["public"]["Enums"]["edoslmis_supplier_bill_status"]
          subtotal?: number
          supplier_id: string
          supplier_invoice_number?: string | null
          tenant_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          balance_due?: number | null
          bill_date?: string
          bill_number?: string
          branch_id?: string | null
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          po_id?: string
          status?: Database["public"]["Enums"]["edoslmis_supplier_bill_status"]
          subtotal?: number
          supplier_id?: string
          supplier_invoice_number?: string | null
          tenant_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_supplier_bills_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "edoshms_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_supplier_bills_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_supplier_bills_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_supplier_bills_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_supplier_payments: {
        Row: {
          amount: number
          bill_id: string
          created_at: string
          id: string
          notes: string | null
          paid_at: string
          payment_method: string
          received_by: string | null
          reference_number: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          bill_id: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string
          payment_method: string
          received_by?: string | null
          reference_number?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string
          payment_method?: string
          received_by?: string | null
          reference_number?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_supplier_payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_supplier_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_supplier_payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "edoshms_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_supplier_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_suppliers: {
        Row: {
          address: string | null
          bank_details: string | null
          contact_person: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          bank_details?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          bank_details?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_tenant_settings: {
        Row: {
          bank_account_number: string | null
          bank_name: string | null
          clinic_address: string | null
          clinic_email: string | null
          clinic_name: string | null
          clinic_phone: string | null
          currency_code: string
          invoice_footer_note: string | null
          kra_pin: string | null
          logo_path: string | null
          mpesa_till: string | null
          quotation_footer_note: string | null
          signature_path: string | null
          tenant_id: string
          theme_color: string
          updated_at: string
          updated_by: string | null
          vat_enabled: boolean
          vat_rate: number
        }
        Insert: {
          bank_account_number?: string | null
          bank_name?: string | null
          clinic_address?: string | null
          clinic_email?: string | null
          clinic_name?: string | null
          clinic_phone?: string | null
          currency_code?: string
          invoice_footer_note?: string | null
          kra_pin?: string | null
          logo_path?: string | null
          mpesa_till?: string | null
          quotation_footer_note?: string | null
          signature_path?: string | null
          tenant_id: string
          theme_color?: string
          updated_at?: string
          updated_by?: string | null
          vat_enabled?: boolean
          vat_rate?: number
        }
        Update: {
          bank_account_number?: string | null
          bank_name?: string | null
          clinic_address?: string | null
          clinic_email?: string | null
          clinic_name?: string | null
          clinic_phone?: string | null
          currency_code?: string
          invoice_footer_note?: string | null
          kra_pin?: string | null
          logo_path?: string | null
          mpesa_till?: string | null
          quotation_footer_note?: string | null
          signature_path?: string | null
          tenant_id?: string
          theme_color?: string
          updated_at?: string
          updated_by?: string | null
          vat_enabled?: boolean
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_test_categories: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_test_categories_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_test_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_test_components: {
        Row: {
          created_at: string
          critical_high: number | null
          critical_low: number | null
          data_type: string
          id: string
          name: string
          select_options: Json | null
          sequence: number
          test_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          critical_high?: number | null
          critical_low?: number | null
          data_type?: string
          id?: string
          name: string
          select_options?: Json | null
          sequence?: number
          test_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          critical_high?: number | null
          critical_low?: number | null
          data_type?: string
          id?: string
          name?: string
          select_options?: Json | null
          sequence?: number
          test_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_test_components_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_test_reagent_usage: {
        Row: {
          created_at: string
          id: string
          item_id: string
          quantity_per_test: number
          tenant_id: string
          test_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          quantity_per_test?: number
          tenant_id: string
          test_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          quantity_per_test?: number
          tenant_id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_test_reagent_usage_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_test_reagent_usage_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_test_reagent_usage_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      edoslmis_tests: {
        Row: {
          category_id: string | null
          code: string
          cpt_code: string | null
          created_at: string
          created_by: string | null
          critical_high: number | null
          critical_low: number | null
          deleted_at: string | null
          department_id: string | null
          gender_applicability: Database["public"]["Enums"]["edoslmis_gender_applicability"]
          icd_codes: Json
          id: string
          is_active: boolean
          is_panel: boolean
          loinc_code: string | null
          max_age_days: number | null
          methodology: string | null
          min_age_days: number | null
          name: string
          preparation_instructions: string | null
          price: number
          short_name: string | null
          snomed_code: string | null
          sort_order: number
          specimen_type_id: string | null
          tenant_id: string
          turnaround_time_hours: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          code: string
          cpt_code?: string | null
          created_at?: string
          created_by?: string | null
          critical_high?: number | null
          critical_low?: number | null
          deleted_at?: string | null
          department_id?: string | null
          gender_applicability?: Database["public"]["Enums"]["edoslmis_gender_applicability"]
          icd_codes?: Json
          id?: string
          is_active?: boolean
          is_panel?: boolean
          loinc_code?: string | null
          max_age_days?: number | null
          methodology?: string | null
          min_age_days?: number | null
          name: string
          preparation_instructions?: string | null
          price?: number
          short_name?: string | null
          snomed_code?: string | null
          sort_order?: number
          specimen_type_id?: string | null
          tenant_id: string
          turnaround_time_hours?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          code?: string
          cpt_code?: string | null
          created_at?: string
          created_by?: string | null
          critical_high?: number | null
          critical_low?: number | null
          deleted_at?: string | null
          department_id?: string | null
          gender_applicability?: Database["public"]["Enums"]["edoslmis_gender_applicability"]
          icd_codes?: Json
          id?: string
          is_active?: boolean
          is_panel?: boolean
          loinc_code?: string | null
          max_age_days?: number | null
          methodology?: string | null
          min_age_days?: number | null
          name?: string
          preparation_instructions?: string | null
          price?: number
          short_name?: string | null
          snomed_code?: string | null
          sort_order?: number
          specimen_type_id?: string | null
          tenant_id?: string
          turnaround_time_hours?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_tests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_test_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_tests_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_tests_specimen_type_id_fkey"
            columns: ["specimen_type_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_specimen_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edoslmis_tests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "edoshms_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      egg_production: {
        Row: {
          afternoon_collection: number
          branch_id: string
          broken_eggs: number
          created_at: string
          egg_weight_avg_g: number | null
          extra_large_count: number
          flock_id: string
          grade_a_count: number
          grade_b_count: number
          grade_c_count: number
          hen_count: number
          hen_day_production: number | null
          house_id: string
          humidity_pct: number | null
          id: string
          large_count: number
          medium_count: number
          morning_collection: number
          notes: string | null
          production_date: string
          recorded_by: string | null
          saleable_eggs: number | null
          small_count: number
          temperature_c: number | null
          tenant_id: string
          total_eggs: number | null
          updated_at: string
        }
        Insert: {
          afternoon_collection?: number
          branch_id: string
          broken_eggs?: number
          created_at?: string
          egg_weight_avg_g?: number | null
          extra_large_count?: number
          flock_id: string
          grade_a_count?: number
          grade_b_count?: number
          grade_c_count?: number
          hen_count?: number
          hen_day_production?: number | null
          house_id: string
          humidity_pct?: number | null
          id?: string
          large_count?: number
          medium_count?: number
          morning_collection?: number
          notes?: string | null
          production_date: string
          recorded_by?: string | null
          saleable_eggs?: number | null
          small_count?: number
          temperature_c?: number | null
          tenant_id: string
          total_eggs?: number | null
          updated_at?: string
        }
        Update: {
          afternoon_collection?: number
          branch_id?: string
          broken_eggs?: number
          created_at?: string
          egg_weight_avg_g?: number | null
          extra_large_count?: number
          flock_id?: string
          grade_a_count?: number
          grade_b_count?: number
          grade_c_count?: number
          hen_count?: number
          hen_day_production?: number | null
          house_id?: string
          humidity_pct?: number | null
          id?: string
          large_count?: number
          medium_count?: number
          morning_collection?: number
          notes?: string | null
          production_date?: string
          recorded_by?: string | null
          saleable_eggs?: number | null
          small_count?: number
          temperature_c?: number | null
          tenant_id?: string
          total_eggs?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "egg_production_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_production_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "egg_production_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_production_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_production_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_production_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_production_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_production_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      eod_closures: {
        Row: {
          branch_id: string
          card_sales: number | null
          cash_in_drawer: number | null
          cash_sales: number | null
          cashier_id: string | null
          closure_date: string
          created_at: string | null
          credit_sales: number | null
          id: string
          mpesa_sales: number | null
          notes: string | null
          tenant_id: string | null
          total_refunds: number | null
          total_sales: number | null
          total_transactions: number | null
        }
        Insert: {
          branch_id: string
          card_sales?: number | null
          cash_in_drawer?: number | null
          cash_sales?: number | null
          cashier_id?: string | null
          closure_date: string
          created_at?: string | null
          credit_sales?: number | null
          id?: string
          mpesa_sales?: number | null
          notes?: string | null
          tenant_id?: string | null
          total_refunds?: number | null
          total_sales?: number | null
          total_transactions?: number | null
        }
        Update: {
          branch_id?: string
          card_sales?: number | null
          cash_in_drawer?: number | null
          cash_sales?: number | null
          cashier_id?: string | null
          closure_date?: string
          created_at?: string | null
          credit_sales?: number | null
          id?: string
          mpesa_sales?: number | null
          notes?: string | null
          tenant_id?: string | null
          total_refunds?: number | null
          total_sales?: number | null
          total_transactions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eod_closures_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eod_closures_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "eod_closures_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eod_closures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eod_closures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      etims_invoices: {
        Row: {
          confirmed_at: string | null
          created_at: string
          etims_invoice_no: number
          id: string
          irn: string | null
          qr_code: string | null
          request_payload: Json | null
          response_payload: Json | null
          result_code: string | null
          result_msg: string | null
          sale_id: string
          status: string
          submitted_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          etims_invoice_no: number
          id?: string
          irn?: string | null
          qr_code?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          result_code?: string | null
          result_msg?: string | null
          sale_id: string
          status?: string
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          etims_invoice_no?: number
          id?: string
          irn?: string | null
          qr_code?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          result_code?: string | null
          result_msg?: string | null
          sale_id?: string
          status?: string
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "etims_invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etims_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etims_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      etims_queue: {
        Row: {
          attempt_count: number
          created_at: string
          id: string
          idempotency_key: string
          last_attempt_at: string | null
          last_error: string | null
          max_attempts: number
          next_attempt_at: string
          sale_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          id?: string
          idempotency_key: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          sale_id: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          id?: string
          idempotency_key?: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          sale_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "etims_queue_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etims_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etims_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          branch_id: string | null
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string
          expense_date: string | null
          id: string
          payment_method: string | null
          recorded_by: string | null
          reference: string | null
          tenant_id: string | null
        }
        Insert: {
          amount: number
          branch_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description: string
          expense_date?: string | null
          id?: string
          payment_method?: string | null
          recorded_by?: string | null
          reference?: string | null
          tenant_id?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string
          expense_date?: string | null
          id?: string
          payment_method?: string | null
          recorded_by?: string | null
          reference?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      farm_attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size_bytes: number | null
          file_type: string
          file_url: string
          id: string
          tenant_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size_bytes?: number | null
          file_type?: string
          file_url: string
          id?: string
          tenant_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          id?: string
          tenant_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farm_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "farm_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_documents: {
        Row: {
          branch_id: string | null
          category: string
          created_at: string
          deleted_at: string | null
          description: string | null
          expiry_date: string | null
          file_name: string
          file_url: string
          id: string
          is_active: boolean
          tenant_id: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          branch_id?: string | null
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          expiry_date?: string | null
          file_name: string
          file_url: string
          id?: string
          is_active?: boolean
          tenant_id: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          branch_id?: string | null
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          expiry_date?: string | null
          file_name?: string
          file_url?: string
          id?: string
          is_active?: boolean
          tenant_id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farm_documents_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_documents_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "farm_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "farm_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_incidents: {
        Row: {
          birds_affected: number | null
          birds_lost: number | null
          branch_id: string
          created_at: string
          description: string | null
          estimated_loss: number | null
          flock_id: string | null
          house_id: string | null
          id: string
          incident_date: string
          incident_type: string
          reported_by: string | null
          resolution: string | null
          resolved_at: string | null
          severity: string
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          birds_affected?: number | null
          birds_lost?: number | null
          branch_id: string
          created_at?: string
          description?: string | null
          estimated_loss?: number | null
          flock_id?: string | null
          house_id?: string | null
          id?: string
          incident_date?: string
          incident_type?: string
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          birds_affected?: number | null
          birds_lost?: number | null
          branch_id?: string
          created_at?: string
          description?: string | null
          estimated_loss?: number | null
          flock_id?: string | null
          house_id?: string | null
          id?: string
          incident_date?: string
          incident_type?: string
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_incidents_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_incidents_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "farm_incidents_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_incidents_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_incidents_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      farm_inspections: {
        Row: {
          branch_id: string
          checklist: Json
          corrective_actions: string | null
          created_at: string
          findings: string | null
          house_id: string | null
          id: string
          inspection_date: string
          inspection_type: string
          inspector_id: string | null
          next_inspection_date: string | null
          pass_fail: string | null
          score: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          checklist?: Json
          corrective_actions?: string | null
          created_at?: string
          findings?: string | null
          house_id?: string | null
          id?: string
          inspection_date: string
          inspection_type?: string
          inspector_id?: string | null
          next_inspection_date?: string | null
          pass_fail?: string | null
          score?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          checklist?: Json
          corrective_actions?: string | null
          created_at?: string
          findings?: string | null
          house_id?: string | null
          id?: string
          inspection_date?: string
          inspection_type?: string
          inspector_id?: string | null
          next_inspection_date?: string | null
          pass_fail?: string | null
          score?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_inspections_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_inspections_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "farm_inspections_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_inspections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_inspections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      farm_task_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assigned_to: string
          completed_at: string | null
          id: string
          notes: string | null
          task_id: string
          tenant_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_to: string
          completed_at?: string | null
          id?: string
          notes?: string | null
          task_id: string
          tenant_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_to?: string
          completed_at?: string | null
          id?: string
          notes?: string | null
          task_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_task_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "farm_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_task_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_task_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      farm_tasks: {
        Row: {
          branch_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          flock_id: string | null
          house_id: string | null
          id: string
          priority: string
          recurrence: string
          recurrence_rule: Json | null
          status: string
          task_type: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          flock_id?: string | null
          house_id?: string | null
          id?: string
          priority?: string
          recurrence?: string
          recurrence_rule?: Json | null
          status?: string
          task_type?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          flock_id?: string | null
          house_id?: string | null
          id?: string
          priority?: string
          recurrence?: string
          recurrence_rule?: Json | null
          status?: string
          task_type?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_tasks_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_tasks_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "farm_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_tasks_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_tasks_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_tasks_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      feed_consumption: {
        Row: {
          afternoon_kg: number
          age_days: number | null
          batch_id: string | null
          bird_count: number | null
          branch_id: string
          consumption_date: string
          created_at: string
          evening_kg: number
          feed_cost: number | null
          feed_per_bird_g: number | null
          flock_id: string
          house_id: string
          id: string
          inventory_movement_id: string | null
          morning_kg: number
          net_consumed_kg: number | null
          product_id: string
          recorded_by: string | null
          tenant_id: string
          total_kg: number | null
          unit_cost: number | null
          updated_at: string
          wasted_kg: number
        }
        Insert: {
          afternoon_kg?: number
          age_days?: number | null
          batch_id?: string | null
          bird_count?: number | null
          branch_id: string
          consumption_date: string
          created_at?: string
          evening_kg?: number
          feed_cost?: number | null
          feed_per_bird_g?: number | null
          flock_id: string
          house_id: string
          id?: string
          inventory_movement_id?: string | null
          morning_kg?: number
          net_consumed_kg?: number | null
          product_id: string
          recorded_by?: string | null
          tenant_id: string
          total_kg?: number | null
          unit_cost?: number | null
          updated_at?: string
          wasted_kg?: number
        }
        Update: {
          afternoon_kg?: number
          age_days?: number | null
          batch_id?: string | null
          bird_count?: number | null
          branch_id?: string
          consumption_date?: string
          created_at?: string
          evening_kg?: number
          feed_cost?: number | null
          feed_per_bird_g?: number | null
          flock_id?: string
          house_id?: string
          id?: string
          inventory_movement_id?: string | null
          morning_kg?: number
          net_consumed_kg?: number | null
          product_id?: string
          recorded_by?: string | null
          tenant_id?: string
          total_kg?: number | null
          unit_cost?: number | null
          updated_at?: string
          wasted_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "feed_consumption_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "feed_consumption_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_inventory_movement_id_fkey"
            columns: ["inventory_movement_id"]
            isOneToOne: false
            referencedRelation: "inventory_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_consumption_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      flock_expenses: {
        Row: {
          amount: number
          created_at: string
          expense_id: string
          expense_type: string
          flock_id: string
          id: string
          notes: string | null
          tenant_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expense_id: string
          expense_type?: string
          flock_id: string
          id?: string
          notes?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expense_id?: string
          expense_type?: string
          flock_id?: string
          id?: string
          notes?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flock_expenses_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flock_expenses_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flock_expenses_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flock_expenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flock_expenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      flocks: {
        Row: {
          actual_depletion_date: string | null
          batch_name: string
          bird_type: string
          branch_id: string
          breed: string | null
          created_at: string
          created_by: string | null
          current_count: number
          deleted_at: string | null
          expected_depletion_date: string | null
          flock_code: string
          house_id: string
          id: string
          initial_count: number
          notes: string | null
          placement_date: string
          purchase_price_per_bird: number | null
          purpose: string
          source: string
          status: string
          supplier_id: string | null
          target_weight_kg: number | null
          tenant_id: string
          total_purchase_cost: number | null
          updated_at: string
        }
        Insert: {
          actual_depletion_date?: string | null
          batch_name: string
          bird_type?: string
          branch_id: string
          breed?: string | null
          created_at?: string
          created_by?: string | null
          current_count?: number
          deleted_at?: string | null
          expected_depletion_date?: string | null
          flock_code: string
          house_id: string
          id?: string
          initial_count: number
          notes?: string | null
          placement_date: string
          purchase_price_per_bird?: number | null
          purpose?: string
          source?: string
          status?: string
          supplier_id?: string | null
          target_weight_kg?: number | null
          tenant_id: string
          total_purchase_cost?: number | null
          updated_at?: string
        }
        Update: {
          actual_depletion_date?: string | null
          batch_name?: string
          bird_type?: string
          branch_id?: string
          breed?: string | null
          created_at?: string
          created_by?: string | null
          current_count?: number
          deleted_at?: string | null
          expected_depletion_date?: string | null
          flock_code?: string
          house_id?: string
          id?: string
          initial_count?: number
          notes?: string | null
          placement_date?: string
          purchase_price_per_bird?: number | null
          purpose?: string
          source?: string
          status?: string
          supplier_id?: string | null
          target_weight_kg?: number | null
          tenant_id?: string
          total_purchase_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flocks_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flocks_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "flocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flocks_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flocks_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flocks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flocks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      goods_received_notes: {
        Row: {
          branch_id: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          grn_number: string
          id: string
          notes: string | null
          purchase_order_id: string | null
          received_by: string | null
          received_date: string
          status: string
          supplier_id: string | null
          supplier_invoice_ref: string | null
          tenant_id: string
          total_cost: number
          updated_at: string
          vat_amount: number
        }
        Insert: {
          branch_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          grn_number: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          received_by?: string | null
          received_date?: string
          status?: string
          supplier_id?: string | null
          supplier_invoice_ref?: string | null
          tenant_id: string
          total_cost?: number
          updated_at?: string
          vat_amount?: number
        }
        Update: {
          branch_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          grn_number?: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          received_by?: string | null
          received_date?: string
          status?: string
          supplier_id?: string | null
          supplier_invoice_ref?: string | null
          tenant_id?: string
          total_cost?: number
          updated_at?: string
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "goods_received_notes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "goods_received_notes_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      grn_items: {
        Row: {
          batch_number: string | null
          created_at: string
          damaged_qty: number
          expiry_date: string | null
          grn_id: string
          id: string
          ordered_qty: number
          po_item_id: string | null
          product_id: string | null
          product_name: string
          received_qty: number
          tenant_id: string
          total_cost: number
          unit_cost: number
          vat_rate: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          damaged_qty?: number
          expiry_date?: string | null
          grn_id: string
          id?: string
          ordered_qty?: number
          po_item_id?: string | null
          product_id?: string | null
          product_name: string
          received_qty?: number
          tenant_id: string
          total_cost?: number
          unit_cost?: number
          vat_rate?: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          damaged_qty?: number
          expiry_date?: string | null
          grn_id?: string
          id?: string
          ordered_qty?: number
          po_item_id?: string | null
          product_id?: string | null
          product_name?: string
          received_qty?: number
          tenant_id?: string
          total_cost?: number
          unit_cost?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "grn_items_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_received_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_po_item_id_fkey"
            columns: ["po_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      hatchery_batches: {
        Row: {
          actual_hatch_date: string | null
          batch_code: string
          batch_name: string
          branch_id: string
          breed: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          egg_source: string
          expected_hatch_date: string | null
          humidity_set: number | null
          id: string
          incubator_id: string | null
          notes: string | null
          set_date: string
          species: string
          status: string
          supplier_id: string | null
          temperature_set: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          actual_hatch_date?: string | null
          batch_code: string
          batch_name: string
          branch_id: string
          breed?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          egg_source?: string
          expected_hatch_date?: string | null
          humidity_set?: number | null
          id?: string
          incubator_id?: string | null
          notes?: string | null
          set_date: string
          species?: string
          status?: string
          supplier_id?: string | null
          temperature_set?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          actual_hatch_date?: string | null
          batch_code?: string
          batch_name?: string
          branch_id?: string
          breed?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          egg_source?: string
          expected_hatch_date?: string | null
          humidity_set?: number | null
          id?: string
          incubator_id?: string | null
          notes?: string | null
          set_date?: string
          species?: string
          status?: string
          supplier_id?: string | null
          temperature_set?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hatchery_batches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_batches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "hatchery_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_batches_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      hatchery_eggs: {
        Row: {
          batch_id: string
          candled_by: string | null
          candling_date: string | null
          cracked_eggs: number
          created_at: string
          dead_in_shell: number
          eggs_candled: number
          eggs_set: number
          eggs_transferred: number
          fertile_eggs: number
          id: string
          infertile_eggs: number
          notes: string | null
          tenant_id: string
        }
        Insert: {
          batch_id: string
          candled_by?: string | null
          candling_date?: string | null
          cracked_eggs?: number
          created_at?: string
          dead_in_shell?: number
          eggs_candled?: number
          eggs_set?: number
          eggs_transferred?: number
          fertile_eggs?: number
          id?: string
          infertile_eggs?: number
          notes?: string | null
          tenant_id: string
        }
        Update: {
          batch_id?: string
          candled_by?: string | null
          candling_date?: string | null
          cracked_eggs?: number
          created_at?: string
          dead_in_shell?: number
          eggs_candled?: number
          eggs_set?: number
          eggs_transferred?: number
          fertile_eggs?: number
          id?: string
          infertile_eggs?: number
          notes?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hatchery_eggs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: true
            referencedRelation: "hatchery_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_eggs_candled_by_fkey"
            columns: ["candled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_eggs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_eggs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      hatchery_hatches: {
        Row: {
          batch_id: string
          chicks_culled: number
          chicks_hatched: number
          chicks_placed: number
          chicks_saleable: number | null
          chicks_sold: number
          created_at: string
          created_by: string | null
          fertility_rate_pct: number | null
          hatch_date: string
          hatch_rate_pct: number | null
          id: string
          notes: string | null
          placed_flock_id: string | null
          sale_id: string | null
          sale_price_per_chick: number | null
          sale_revenue: number | null
          tenant_id: string
        }
        Insert: {
          batch_id: string
          chicks_culled?: number
          chicks_hatched?: number
          chicks_placed?: number
          chicks_saleable?: number | null
          chicks_sold?: number
          created_at?: string
          created_by?: string | null
          fertility_rate_pct?: number | null
          hatch_date: string
          hatch_rate_pct?: number | null
          id?: string
          notes?: string | null
          placed_flock_id?: string | null
          sale_id?: string | null
          sale_price_per_chick?: number | null
          sale_revenue?: number | null
          tenant_id: string
        }
        Update: {
          batch_id?: string
          chicks_culled?: number
          chicks_hatched?: number
          chicks_placed?: number
          chicks_saleable?: number | null
          chicks_sold?: number
          created_at?: string
          created_by?: string | null
          fertility_rate_pct?: number | null
          hatch_date?: string
          hatch_rate_pct?: number | null
          id?: string
          notes?: string | null
          placed_flock_id?: string | null
          sale_id?: string | null
          sale_price_per_chick?: number | null
          sale_revenue?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hatchery_hatches_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "hatchery_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_hatches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_hatches_placed_flock_id_fkey"
            columns: ["placed_flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_hatches_placed_flock_id_fkey"
            columns: ["placed_flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_hatches_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_hatches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hatchery_hatches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      held_sales: {
        Row: {
          branch_id: string | null
          cart_data: Json
          cashier_id: string | null
          created_at: string | null
          id: string
          name: string | null
          tenant_id: string | null
        }
        Insert: {
          branch_id?: string | null
          cart_data: Json
          cashier_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          tenant_id?: string | null
        }
        Update: {
          branch_id?: string | null
          cart_data?: Json
          cashier_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "held_sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "held_sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "held_sales_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "held_sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "held_sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      inventory: {
        Row: {
          branch_id: string
          id: string
          last_updated: string | null
          product_id: string
          quantity: number | null
          reserved_quantity: number | null
          tenant_id: string | null
        }
        Insert: {
          branch_id: string
          id?: string
          last_updated?: string | null
          product_id: string
          quantity?: number | null
          reserved_quantity?: number | null
          tenant_id?: string | null
        }
        Update: {
          branch_id?: string
          id?: string
          last_updated?: string | null
          product_id?: string
          quantity?: number | null
          reserved_quantity?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          batch_id: string | null
          branch_id: string | null
          created_at: string
          id: string
          movement_type: string
          notes: string | null
          performed_by: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          stock_after: number
          stock_before: number
          tenant_id: string
          unit_cost: number | null
          unit_price: number | null
        }
        Insert: {
          batch_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          movement_type: string
          notes?: string | null
          performed_by?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          stock_after?: number
          stock_before?: number
          tenant_id: string
          unit_cost?: number | null
          unit_price?: number | null
        }
        Update: {
          batch_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          movement_type?: string
          notes?: string | null
          performed_by?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          stock_after?: number
          stock_before?: number
          tenant_id?: string
          unit_cost?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "inventory_movements_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          billing_reason: string | null
          created_at: string
          currency: string | null
          id: string
          paid_at: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          stripe_invoice_id: string | null
          subscription_id: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          billing_reason?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          billing_reason?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          completed_at: string | null
          consultation_id: string
          created_at: string | null
          id: string
          notes: string | null
          order_number: string
          ordered_by: string
          patient_id: string
          priority: string
          specimen_collected_at: string | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          consultation_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          order_number: string
          ordered_by: string
          patient_id: string
          priority?: string
          specimen_collected_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          consultation_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          ordered_by?: string
          patient_id?: string
          priority?: string
          specimen_collected_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      lab_results: {
        Row: {
          created_at: string | null
          id: string
          is_abnormal: boolean | null
          lab_order_id: string
          performed_by: string | null
          reference_range: string | null
          remarks: string | null
          result_date: string | null
          result_unit: string | null
          result_value: string | null
          tenant_id: string
          test_code: string | null
          test_name: string
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_abnormal?: boolean | null
          lab_order_id: string
          performed_by?: string | null
          reference_range?: string | null
          remarks?: string | null
          result_date?: string | null
          result_unit?: string | null
          result_value?: string | null
          tenant_id: string
          test_code?: string | null
          test_name: string
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_abnormal?: boolean | null
          lab_order_id?: string
          performed_by?: string | null
          reference_range?: string | null
          remarks?: string | null
          result_date?: string | null
          result_unit?: string | null
          result_value?: string | null
          tenant_id?: string
          test_code?: string | null
          test_name?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "lab_results_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_records: {
        Row: {
          administered_by: string | null
          batch_id: string | null
          birds_treated: number | null
          branch_id: string
          condition_treated: string
          created_at: string
          diagnosis: string | null
          dosage: string | null
          flock_id: string
          house_id: string
          id: string
          inventory_movement_id: string | null
          medicine_unit: string | null
          method: string
          outcome: string | null
          prescribed_by: string | null
          product_id: string
          tenant_id: string
          total_cost: number | null
          total_medicine_used: number | null
          treatment_end_date: string | null
          treatment_start_date: string
          unit_cost: number | null
          updated_at: string
          withdrawal_end_date: string | null
          withdrawal_period_days: number | null
        }
        Insert: {
          administered_by?: string | null
          batch_id?: string | null
          birds_treated?: number | null
          branch_id: string
          condition_treated: string
          created_at?: string
          diagnosis?: string | null
          dosage?: string | null
          flock_id: string
          house_id: string
          id?: string
          inventory_movement_id?: string | null
          medicine_unit?: string | null
          method?: string
          outcome?: string | null
          prescribed_by?: string | null
          product_id: string
          tenant_id: string
          total_cost?: number | null
          total_medicine_used?: number | null
          treatment_end_date?: string | null
          treatment_start_date: string
          unit_cost?: number | null
          updated_at?: string
          withdrawal_end_date?: string | null
          withdrawal_period_days?: number | null
        }
        Update: {
          administered_by?: string | null
          batch_id?: string | null
          birds_treated?: number | null
          branch_id?: string
          condition_treated?: string
          created_at?: string
          diagnosis?: string | null
          dosage?: string | null
          flock_id?: string
          house_id?: string
          id?: string
          inventory_movement_id?: string | null
          medicine_unit?: string | null
          method?: string
          outcome?: string | null
          prescribed_by?: string | null
          product_id?: string
          tenant_id?: string
          total_cost?: number | null
          total_medicine_used?: number | null
          treatment_end_date?: string | null
          treatment_start_date?: string
          unit_cost?: number | null
          updated_at?: string
          withdrawal_end_date?: string | null
          withdrawal_period_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_records_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "medication_records_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_inventory_movement_id_fkey"
            columns: ["inventory_movement_id"]
            isOneToOne: false
            referencedRelation: "inventory_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      modules: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mortality_records: {
        Row: {
          bird_count_at_record: number | null
          branch_id: string
          cause: string
          cause_notes: string | null
          created_at: string
          evening_count: number
          flock_id: string
          house_id: string
          id: string
          morning_count: number
          record_date: string
          recorded_by: string | null
          tenant_id: string
          total_deaths: number | null
        }
        Insert: {
          bird_count_at_record?: number | null
          branch_id: string
          cause?: string
          cause_notes?: string | null
          created_at?: string
          evening_count?: number
          flock_id: string
          house_id: string
          id?: string
          morning_count?: number
          record_date: string
          recorded_by?: string | null
          tenant_id: string
          total_deaths?: number | null
        }
        Update: {
          bird_count_at_record?: number | null
          branch_id?: string
          cause?: string
          cause_notes?: string | null
          created_at?: string
          evening_count?: number
          flock_id?: string
          house_id?: string
          id?: string
          morning_count?: number
          record_date?: string
          recorded_by?: string | null
          tenant_id?: string
          total_deaths?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mortality_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortality_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "mortality_records_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortality_records_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortality_records_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortality_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortality_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortality_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      mpesa_transactions: {
        Row: {
          amount: number
          checkout_request_id: string
          created_at: string | null
          id: string
          merchant_request_id: string
          mpesa_receipt: string | null
          phone_number: string
          result_code: string | null
          result_desc: string | null
          sale_id: string | null
          status: string | null
          tenant_id: string | null
          transaction_date: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          checkout_request_id: string
          created_at?: string | null
          id?: string
          merchant_request_id: string
          mpesa_receipt?: string | null
          phone_number: string
          result_code?: string | null
          result_desc?: string | null
          sale_id?: string | null
          status?: string | null
          tenant_id?: string | null
          transaction_date?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          checkout_request_id?: string
          created_at?: string | null
          id?: string
          merchant_request_id?: string
          mpesa_receipt?: string | null
          phone_number?: string
          result_code?: string | null
          result_desc?: string | null
          sale_id?: string | null
          status?: string | null
          tenant_id?: string | null
          transaction_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mpesa_transactions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      nhif_claims: {
        Row: {
          approval_date: string | null
          approved_amount: number | null
          claim_amount: number
          claim_number: string
          clinical_billing_id: string
          created_at: string | null
          id: string
          member_number: string
          patient_id: string
          rejection_reason: string | null
          scheme_code: string | null
          status: string
          submission_date: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          approval_date?: string | null
          approved_amount?: number | null
          claim_amount: number
          claim_number: string
          clinical_billing_id: string
          created_at?: string | null
          id?: string
          member_number: string
          patient_id: string
          rejection_reason?: string | null
          scheme_code?: string | null
          status?: string
          submission_date?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          approval_date?: string | null
          approved_amount?: number | null
          claim_amount?: number
          claim_number?: string
          clinical_billing_id?: string
          created_at?: string | null
          id?: string
          member_number?: string
          patient_id?: string
          rejection_reason?: string | null
          scheme_code?: string | null
          status?: string
          submission_date?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nhif_claims_clinical_billing_id_fkey"
            columns: ["clinical_billing_id"]
            isOneToOne: false
            referencedRelation: "clinical_billing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nhif_claims_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nhif_claims_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nhif_claims_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      nursing_notes: {
        Row: {
          admission_id: string
          content: string
          created_at: string | null
          id: string
          note_type: string
          nurse_id: string
          patient_id: string
          tenant_id: string
        }
        Insert: {
          admission_id: string
          content: string
          created_at?: string | null
          id?: string
          note_type?: string
          nurse_id: string
          patient_id: string
          tenant_id: string
        }
        Update: {
          admission_id?: string
          content?: string
          created_at?: string | null
          id?: string
          note_type?: string
          nurse_id?: string
          patient_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nursing_notes_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_notes_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      patient_queue: {
        Row: {
          appointment_id: string | null
          called_at: string | null
          completed_at: string | null
          consultation_id: string | null
          created_at: string | null
          id: string
          next_services: Json | null
          notes: string | null
          patient_id: string
          priority: string
          referred_by: string | null
          referred_from: string | null
          service_area: string
          started_at: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          appointment_id?: string | null
          called_at?: string | null
          completed_at?: string | null
          consultation_id?: string | null
          created_at?: string | null
          id?: string
          next_services?: Json | null
          notes?: string | null
          patient_id: string
          priority?: string
          referred_by?: string | null
          referred_from?: string | null
          service_area: string
          started_at?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          appointment_id?: string | null
          called_at?: string | null
          completed_at?: string | null
          consultation_id?: string | null
          created_at?: string | null
          id?: string
          next_services?: Json | null
          notes?: string | null
          patient_id?: string
          priority?: string
          referred_by?: string | null
          referred_from?: string | null
          service_area?: string
          started_at?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_queue_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_queue_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_queue_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_queue_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string[] | null
          blood_group: string | null
          chronic_conditions: string[] | null
          created_at: string | null
          customer_id: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: string | null
          id: string
          id_number: string | null
          insurance_number: string | null
          insurance_provider: string | null
          is_active: boolean | null
          last_name: string
          mrn: string
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          nhif_number: string | null
          nhif_scheme: string | null
          notes: string | null
          phone: string
          registered_by: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          blood_group?: string | null
          chronic_conditions?: string[] | null
          created_at?: string | null
          customer_id?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          gender?: string | null
          id?: string
          id_number?: string | null
          insurance_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name: string
          mrn: string
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          nhif_number?: string | null
          nhif_scheme?: string | null
          notes?: string | null
          phone: string
          registered_by?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          blood_group?: string | null
          chronic_conditions?: string[] | null
          created_at?: string | null
          customer_id?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          id_number?: string | null
          insurance_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name?: string
          mrn?: string
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          nhif_number?: string | null
          nhif_scheme?: string | null
          notes?: string | null
          phone?: string
          registered_by?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: string
          mpesa_transaction_id: string | null
          reference: string | null
          sale_id: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: string
          mpesa_transaction_id?: string | null
          reference?: string | null
          sale_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: string
          mpesa_transaction_id?: string | null
          reference?: string | null
          sale_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_mpesa"
            columns: ["mpesa_transaction_id"]
            isOneToOne: false
            referencedRelation: "mpesa_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_modules: {
        Row: {
          created_at: string | null
          id: string
          module_id: string
          plan_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id: string
          plan_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_modules_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_branches: number
          max_products: number
          max_users: number
          name: string
          price_monthly: number
          price_semiannual: number
          price_yearly: number
          slug: string
          stripe_monthly_price_id: string | null
          stripe_semiannual_price_id: string | null
          stripe_yearly_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_branches?: number
          max_products?: number
          max_users?: number
          name: string
          price_monthly?: number
          price_semiannual?: number
          price_yearly?: number
          slug: string
          stripe_monthly_price_id?: string | null
          stripe_semiannual_price_id?: string | null
          stripe_yearly_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_branches?: number
          max_products?: number
          max_users?: number
          name?: string
          price_monthly?: number
          price_semiannual?: number
          price_yearly?: number
          slug?: string
          stripe_monthly_price_id?: string | null
          stripe_semiannual_price_id?: string | null
          stripe_yearly_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      poultry_houses: {
        Row: {
          area_sqm: number | null
          branch_id: string
          capacity: number
          created_at: string
          current_occupancy: number
          drinking_system: string | null
          feeding_system: string | null
          house_code: string
          house_type: string
          id: string
          is_active: boolean
          length_m: number | null
          name: string
          notes: string | null
          stocking_density: number | null
          tenant_id: string
          updated_at: string
          ventilation_type: string | null
          width_m: number | null
        }
        Insert: {
          area_sqm?: number | null
          branch_id: string
          capacity?: number
          created_at?: string
          current_occupancy?: number
          drinking_system?: string | null
          feeding_system?: string | null
          house_code: string
          house_type?: string
          id?: string
          is_active?: boolean
          length_m?: number | null
          name: string
          notes?: string | null
          stocking_density?: number | null
          tenant_id: string
          updated_at?: string
          ventilation_type?: string | null
          width_m?: number | null
        }
        Update: {
          area_sqm?: number | null
          branch_id?: string
          capacity?: number
          created_at?: string
          current_occupancy?: number
          drinking_system?: string | null
          feeding_system?: string | null
          house_code?: string
          house_type?: string
          id?: string
          is_active?: boolean
          length_m?: number | null
          name?: string
          notes?: string | null
          stocking_density?: number | null
          tenant_id?: string
          updated_at?: string
          ventilation_type?: string | null
          width_m?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poultry_houses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poultry_houses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "poultry_houses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poultry_houses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      prescription_items: {
        Row: {
          created_at: string | null
          dosage: string
          duration: string
          frequency: string
          id: string
          is_dispensed: boolean | null
          medication_name: string
          prescription_id: string
          product_id: string | null
          quantity: number
          route: string | null
          special_instructions: string | null
        }
        Insert: {
          created_at?: string | null
          dosage: string
          duration: string
          frequency: string
          id?: string
          is_dispensed?: boolean | null
          medication_name: string
          prescription_id: string
          product_id?: string | null
          quantity?: number
          route?: string | null
          special_instructions?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          is_dispensed?: boolean | null
          medication_name?: string
          prescription_id?: string
          product_id?: string | null
          quantity?: number
          route?: string | null
          special_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          consultation_id: string
          created_at: string | null
          dispensed_at: string | null
          dispensed_by: string | null
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          prescription_number: string
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          consultation_id: string
          created_at?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          prescription_number: string
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          consultation_id?: string
          created_at?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          prescription_number?: string
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_dispensed_by_fkey"
            columns: ["dispensed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      product_batches: {
        Row: {
          batch_number: string
          branch_id: string | null
          cost_price: number
          created_at: string
          expiry_date: string | null
          id: string
          initial_quantity: number
          notes: string | null
          product_id: string
          received_at: string
          remaining_qty: number
          selling_price: number | null
          supplier_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          batch_number: string
          branch_id?: string | null
          cost_price?: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          initial_quantity?: number
          notes?: string | null
          product_id: string
          received_at?: string
          remaining_qty?: number
          selling_price?: number | null
          supplier_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          batch_number?: string
          branch_id?: string | null
          cost_price?: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          initial_quantity?: number
          notes?: string | null
          product_id?: string
          received_at?: string
          remaining_qty?: number
          selling_price?: number | null
          supplier_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_batches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      production_forecasts: {
        Row: {
          actual_value: number | null
          branch_id: string | null
          confidence_pct: number | null
          created_at: string
          created_by: string | null
          flock_id: string | null
          forecast_date: string
          forecast_period_end: string
          forecast_period_start: string
          forecast_type: string
          forecast_value: number
          id: string
          model_used: string
          notes: string | null
          tenant_id: string
          variance_pct: number | null
        }
        Insert: {
          actual_value?: number | null
          branch_id?: string | null
          confidence_pct?: number | null
          created_at?: string
          created_by?: string | null
          flock_id?: string | null
          forecast_date?: string
          forecast_period_end: string
          forecast_period_start: string
          forecast_type: string
          forecast_value: number
          id?: string
          model_used?: string
          notes?: string | null
          tenant_id: string
          variance_pct?: number | null
        }
        Update: {
          actual_value?: number | null
          branch_id?: string | null
          confidence_pct?: number | null
          created_at?: string
          created_by?: string | null
          flock_id?: string | null
          forecast_date?: string
          forecast_period_end?: string
          forecast_period_start?: string
          forecast_type?: string
          forecast_value?: number
          id?: string
          model_used?: string
          notes?: string | null
          tenant_id?: string
          variance_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "production_forecasts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_forecasts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "production_forecasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_forecasts_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_forecasts_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_forecasts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_forecasts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      production_targets: {
        Row: {
          branch_id: string | null
          created_at: string
          flock_id: string | null
          house_id: string | null
          id: string
          notes: string | null
          period_end: string | null
          period_start: string
          set_by: string | null
          target_period: string
          target_type: string
          target_unit: string
          target_value: number
          tenant_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          flock_id?: string | null
          house_id?: string | null
          id?: string
          notes?: string | null
          period_end?: string | null
          period_start: string
          set_by?: string | null
          target_period?: string
          target_type: string
          target_unit?: string
          target_value: number
          tenant_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          flock_id?: string | null
          house_id?: string | null
          id?: string
          notes?: string | null
          period_end?: string | null
          period_start?: string
          set_by?: string | null
          target_period?: string
          target_type?: string
          target_unit?: string
          target_value?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_targets_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_targets_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "production_targets_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_targets_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_targets_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_targets_set_by_fkey"
            columns: ["set_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_targets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_targets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          branch_id: string | null
          category_id: string | null
          cost_price: number
          created_at: string | null
          description: string | null
          etims_item_cls_cd: string | null
          etims_tax_type_cd: string
          first_sale_at: string | null
          has_serial: boolean | null
          has_warranty: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          last_sale_at: string | null
          low_stock_threshold: number | null
          max_stock_level: number | null
          name: string
          quantity: number | null
          reorder_level: number | null
          reorder_quantity: number
          selling_price: number
          sku: string
          stock_classification: string
          stocked_at: string | null
          supplier_id: string | null
          tenant_id: string | null
          total_sold: number
          track_inventory: boolean | null
          unit: string
          updated_at: string | null
          vat_rate: number | null
          warranty_months: number | null
          wholesale_price: number | null
        }
        Insert: {
          barcode?: string | null
          branch_id?: string | null
          category_id?: string | null
          cost_price?: number
          created_at?: string | null
          description?: string | null
          etims_item_cls_cd?: string | null
          etims_tax_type_cd?: string
          first_sale_at?: string | null
          has_serial?: boolean | null
          has_warranty?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_sale_at?: string | null
          low_stock_threshold?: number | null
          max_stock_level?: number | null
          name: string
          quantity?: number | null
          reorder_level?: number | null
          reorder_quantity?: number
          selling_price?: number
          sku: string
          stock_classification?: string
          stocked_at?: string | null
          supplier_id?: string | null
          tenant_id?: string | null
          total_sold?: number
          track_inventory?: boolean | null
          unit?: string
          updated_at?: string | null
          vat_rate?: number | null
          warranty_months?: number | null
          wholesale_price?: number | null
        }
        Update: {
          barcode?: string | null
          branch_id?: string | null
          category_id?: string | null
          cost_price?: number
          created_at?: string | null
          description?: string | null
          etims_item_cls_cd?: string | null
          etims_tax_type_cd?: string
          first_sale_at?: string | null
          has_serial?: boolean | null
          has_warranty?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_sale_at?: string | null
          low_stock_threshold?: number | null
          max_stock_level?: number | null
          name?: string
          quantity?: number | null
          reorder_level?: number | null
          reorder_quantity?: number
          selling_price?: number
          sku?: string
          stock_classification?: string
          stocked_at?: string | null
          supplier_id?: string | null
          tenant_id?: string | null
          total_sold?: number
          track_inventory?: boolean | null
          unit?: string
          updated_at?: string | null
          vat_rate?: number | null
          warranty_months?: number | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: string
          subdomain: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          subdomain?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          subdomain?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          catalog_item_id: string | null
          created_at: string
          id: string
          notes: string | null
          ordered_qty: number
          po_id: string
          product_id: string
          product_name: string | null
          product_sku: string | null
          purchase_order_id: string | null
          quantity: number
          received_qty: number | null
          received_quantity: number
          tenant_id: string | null
          total: number
          total_price: number
          unit: string
          unit_price: number
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          ordered_qty: number
          po_id: string
          product_id: string
          product_name?: string | null
          product_sku?: string | null
          purchase_order_id?: string | null
          quantity?: number
          received_qty?: number | null
          received_quantity?: number
          tenant_id?: string | null
          total?: number
          total_price: number
          unit?: string
          unit_price: number
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          ordered_qty?: number
          po_id?: string
          product_id?: string
          product_name?: string | null
          product_sku?: string | null
          purchase_order_id?: string | null
          quantity?: number
          received_qty?: number | null
          received_quantity?: number
          tenant_id?: string | null
          total?: number
          total_price?: number
          unit?: string
          unit_price?: number
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "supplier_catalogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          amount_paid: number
          approved_at: string | null
          approved_by: string | null
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          discount_amount: number
          email_sent_at: string | null
          expected_date: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          paid_amount: number | null
          payment_status: string
          po_number: string
          po_type: string
          received_date: string | null
          status: string | null
          subtotal: number | null
          supplier_id: string
          tax_amount: number | null
          tenant_id: string | null
          total_amount: number | null
          updated_at: string | null
          vat_amount: number
        }
        Insert: {
          amount_paid?: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number
          email_sent_at?: string | null
          expected_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          payment_status?: string
          po_number: string
          po_type?: string
          received_date?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id: string
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number
        }
        Update: {
          amount_paid?: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number
          email_sent_at?: string | null
          expected_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          payment_status?: string
          po_number?: string
          po_type?: string
          received_date?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          discount_amount: number | null
          id: string
          item_name: string | null
          item_sku: string | null
          product_id: string | null
          quantity: number
          quotation_id: string
          tax_amount: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          discount_amount?: number | null
          id?: string
          item_name?: string | null
          item_sku?: string | null
          product_id?: string | null
          quantity: number
          quotation_id: string
          tax_amount?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          discount_amount?: number | null
          id?: string
          item_name?: string | null
          item_sku?: string | null
          product_id?: string | null
          quantity?: number
          quotation_id?: string
          tax_amount?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          branch_id: string
          converted_sale_id: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          quote_number: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tenant_id: string | null
          total_amount: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          branch_id: string
          converted_sale_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          quote_number: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          branch_id?: string
          converted_sale_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          quote_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "quotations_converted_sale_id_fkey"
            columns: ["converted_sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      referrals: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          id: string
          patient_id: string
          reason: string
          referral_notes: string | null
          referral_type: string
          referred_to_doctor_id: string | null
          referred_to_facility: string | null
          referring_doctor_id: string
          response_notes: string | null
          specialty: string
          status: string
          tenant_id: string
          updated_at: string | null
          urgency: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          id?: string
          patient_id: string
          reason: string
          referral_notes?: string | null
          referral_type?: string
          referred_to_doctor_id?: string | null
          referred_to_facility?: string | null
          referring_doctor_id: string
          response_notes?: string | null
          specialty: string
          status?: string
          tenant_id: string
          updated_at?: string | null
          urgency?: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string
          reason?: string
          referral_notes?: string | null
          referral_type?: string
          referred_to_doctor_id?: string | null
          referred_to_facility?: string | null
          referring_doctor_id?: string
          response_notes?: string | null
          specialty?: string
          status?: string
          tenant_id?: string
          updated_at?: string | null
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_to_doctor_id_fkey"
            columns: ["referred_to_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referring_doctor_id_fkey"
            columns: ["referring_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      sale_items: {
        Row: {
          discount_amount: number | null
          id: string
          product_id: string | null
          product_name: string | null
          product_sku: string | null
          quantity: number
          sale_id: string
          serial_number: string | null
          tax_amount: number | null
          total_price: number
          unit_price: number
          warranty_expires: string | null
        }
        Insert: {
          discount_amount?: number | null
          id?: string
          product_id?: string | null
          product_name?: string | null
          product_sku?: string | null
          quantity: number
          sale_id: string
          serial_number?: string | null
          tax_amount?: number | null
          total_price: number
          unit_price: number
          warranty_expires?: string | null
        }
        Update: {
          discount_amount?: number | null
          id?: string
          product_id?: string | null
          product_name?: string | null
          product_sku?: string | null
          quantity?: number
          sale_id?: string
          serial_number?: string | null
          tax_amount?: number | null
          total_price?: number
          unit_price?: number
          warranty_expires?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          branch_id: string
          cashier_id: string | null
          change_amount: number | null
          created_at: string | null
          customer_id: string | null
          discount_amount: number | null
          id: string
          mpesa_phone: string | null
          notes: string | null
          paid_amount: number | null
          payment_method: string | null
          payment_status: string | null
          price_mode: string
          receipt_number: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tenant_id: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          cashier_id?: string | null
          change_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          mpesa_phone?: string | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          price_mode?: string
          receipt_number: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          cashier_id?: string | null
          change_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          mpesa_phone?: string | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          price_mode?: string
          receipt_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "sales_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          notification_email: string | null
          product_id: string | null
          tenant_id: string
          threshold_days: number | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          notification_email?: string | null
          product_id?: string | null
          tenant_id: string
          threshold_days?: number | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          notification_email?: string | null
          product_id?: string | null
          tenant_id?: string
          threshold_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          branch_id: string
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          tenant_id: string | null
          type: string
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          tenant_id?: string | null
          type: string
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          tenant_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          billing_cycle?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          billing_cycle?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      supplier_catalogs: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          moq: number
          notes: string | null
          product_id: string | null
          product_name: string
          supplier_id: string
          supplier_sku: string | null
          tenant_id: string
          unit: string
          unit_price: number
          updated_at: string
          vat_applicable: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          moq?: number
          notes?: string | null
          product_id?: string | null
          product_name: string
          supplier_id: string
          supplier_sku?: string | null
          tenant_id: string
          unit?: string
          unit_price?: number
          updated_at?: string
          vat_applicable?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          moq?: number
          notes?: string | null
          product_id?: string | null
          product_name?: string
          supplier_id?: string
          supplier_sku?: string | null
          tenant_id?: string
          unit?: string
          unit_price?: number
          updated_at?: string
          vat_applicable?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "supplier_catalogs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_catalogs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_catalogs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_catalogs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_catalogs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_catalogs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_catalogs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          balance: number | null
          city: string | null
          contact_name: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_preferred: boolean
          lead_time_days: number
          name: string
          notes: string | null
          outstanding_balance: number | null
          payment_terms: string | null
          phone: string | null
          product_categories: string[]
          rating: number | null
          tax_pin: string | null
          tenant_id: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          balance?: number | null
          city?: string | null
          contact_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean
          lead_time_days?: number
          name: string
          notes?: string | null
          outstanding_balance?: number | null
          payment_terms?: string | null
          phone?: string | null
          product_categories?: string[]
          rating?: number | null
          tax_pin?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          balance?: number | null
          city?: string | null
          contact_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean
          lead_time_days?: number
          name?: string
          notes?: string | null
          outstanding_balance?: number | null
          payment_terms?: string | null
          phone?: string | null
          product_categories?: string[]
          rating?: number | null
          tax_pin?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenant_modules: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          expires_at: string | null
          id: string
          is_enabled: boolean | null
          module_id: string
          notes: string | null
          tenant_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string
          expires_at?: string | null
          id?: string
          is_enabled?: boolean | null
          module_id: string
          notes?: string | null
          tenant_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          expires_at?: string | null
          id?: string
          is_enabled?: boolean | null
          module_id?: string
          notes?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_modules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_modules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenant_mpesa_settings: {
        Row: {
          consumer_key: string
          consumer_secret: string
          created_at: string
          environment: string
          id: string
          initiator_name: string | null
          is_active: boolean
          passkey: string
          security_credential: string | null
          shortcode: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          consumer_key?: string
          consumer_secret?: string
          created_at?: string
          environment?: string
          id?: string
          initiator_name?: string | null
          is_active?: boolean
          passkey?: string
          security_credential?: string | null
          shortcode?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          consumer_key?: string
          consumer_secret?: string
          created_at?: string
          environment?: string
          id?: string
          initiator_name?: string | null
          is_active?: boolean
          passkey?: string
          security_credential?: string | null
          shortcode?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_mpesa_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_mpesa_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenants: {
        Row: {
          country: string
          created_at: string
          currency: string
          custom_domain: string | null
          grace_period_ends_at: string | null
          id: string
          logo_url: string | null
          metadata: Json
          name: string
          owner_email: string
          owner_name: string
          payment_failure_count: number
          phone: string | null
          plan_id: string | null
          primary_color: string
          receipt_footer: string | null
          receipt_header: string | null
          receipt_prefix: string
          status: string
          stripe_customer_id: string | null
          subdomain: string
          tax_enabled: boolean
          tax_name: string | null
          tax_rate: number | null
          timezone: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          currency?: string
          custom_domain?: string | null
          grace_period_ends_at?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name: string
          owner_email?: string
          owner_name?: string
          payment_failure_count?: number
          phone?: string | null
          plan_id?: string | null
          primary_color?: string
          receipt_footer?: string | null
          receipt_header?: string | null
          receipt_prefix?: string
          status?: string
          stripe_customer_id?: string | null
          subdomain: string
          tax_enabled?: boolean
          tax_name?: string | null
          tax_rate?: number | null
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          currency?: string
          custom_domain?: string | null
          grace_period_ends_at?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name?: string
          owner_email?: string
          owner_name?: string
          payment_failure_count?: number
          phone?: string | null
          plan_id?: string | null
          primary_color?: string
          receipt_footer?: string | null
          receipt_header?: string | null
          receipt_prefix?: string
          status?: string
          stripe_customer_id?: string | null
          subdomain?: string
          tax_enabled?: boolean
          tax_name?: string | null
          tax_rate?: number | null
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants_etims_settings: {
        Row: {
          branch_id: string
          created_at: string
          device_serial: string
          environment: string
          id: string
          init_response: Json | null
          initialized_at: string | null
          is_enabled: boolean
          kra_pin: string | null
          next_invoice_no: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id?: string
          created_at?: string
          device_serial?: string
          environment?: string
          id?: string
          init_response?: Json | null
          initialized_at?: string | null
          is_enabled?: boolean
          kra_pin?: string | null
          next_invoice_no?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          device_serial?: string
          environment?: string
          id?: string
          init_response?: Json | null
          initialized_at?: string | null
          is_enabled?: boolean
          kra_pin?: string | null
          next_invoice_no?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_etims_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_etims_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      vaccination_records: {
        Row: {
          administered_by: string | null
          age_days: number | null
          batch_id: string | null
          birds_vaccinated: number
          branch_id: string
          created_at: string
          disease_target: string
          dose_per_bird: number | null
          dose_unit: string | null
          flock_id: string
          house_id: string
          id: string
          inventory_movement_id: string | null
          method: string
          next_vaccination_date: string | null
          product_id: string
          tenant_id: string
          total_cost: number | null
          total_dose_used: number | null
          unit_cost: number | null
          updated_at: string
          vaccination_date: string
          vaccine_name: string
          veterinarian_notes: string | null
        }
        Insert: {
          administered_by?: string | null
          age_days?: number | null
          batch_id?: string | null
          birds_vaccinated?: number
          branch_id: string
          created_at?: string
          disease_target: string
          dose_per_bird?: number | null
          dose_unit?: string | null
          flock_id: string
          house_id: string
          id?: string
          inventory_movement_id?: string | null
          method?: string
          next_vaccination_date?: string | null
          product_id: string
          tenant_id: string
          total_cost?: number | null
          total_dose_used?: number | null
          unit_cost?: number | null
          updated_at?: string
          vaccination_date: string
          vaccine_name: string
          veterinarian_notes?: string | null
        }
        Update: {
          administered_by?: string | null
          age_days?: number | null
          batch_id?: string | null
          birds_vaccinated?: number
          branch_id?: string
          created_at?: string
          disease_target?: string
          dose_per_bird?: number | null
          dose_unit?: string | null
          flock_id?: string
          house_id?: string
          id?: string
          inventory_movement_id?: string | null
          method?: string
          next_vaccination_date?: string | null
          product_id?: string
          tenant_id?: string
          total_cost?: number | null
          total_dose_used?: number | null
          unit_cost?: number | null
          updated_at?: string
          vaccination_date?: string
          vaccine_name?: string
          veterinarian_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_records_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "vaccination_records_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "vw_active_flock_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_inventory_movement_id_fkey"
            columns: ["inventory_movement_id"]
            isOneToOne: false
            referencedRelation: "inventory_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      vat_configurations: {
        Row: {
          apply_vat_to_services: boolean
          created_at: string
          default_vat_rate: number
          id: string
          invoice_footer_note: string | null
          is_vat_registered: boolean
          tenant_id: string
          updated_at: string
          vat_inclusive: boolean
          vat_registration_number: string | null
          zero_rate_exports: boolean
        }
        Insert: {
          apply_vat_to_services?: boolean
          created_at?: string
          default_vat_rate?: number
          id?: string
          invoice_footer_note?: string | null
          is_vat_registered?: boolean
          tenant_id: string
          updated_at?: string
          vat_inclusive?: boolean
          vat_registration_number?: string | null
          zero_rate_exports?: boolean
        }
        Update: {
          apply_vat_to_services?: boolean
          created_at?: string
          default_vat_rate?: number
          id?: string
          invoice_footer_note?: string | null
          is_vat_registered?: boolean
          tenant_id?: string
          updated_at?: string
          vat_inclusive?: boolean
          vat_registration_number?: string | null
          zero_rate_exports?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "vat_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vat_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      visit_notes: {
        Row: {
          assessment: string | null
          consultation_id: string
          created_at: string | null
          doctor_id: string
          id: string
          objective: string | null
          plan: string | null
          subjective: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          assessment?: string | null
          consultation_id: string
          created_at?: string | null
          doctor_id: string
          id?: string
          objective?: string | null
          plan?: string | null
          subjective?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          assessment?: string | null
          consultation_id?: string
          created_at?: string | null
          doctor_id?: string
          id?: string
          objective?: string | null
          plan?: string | null
          subjective?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_notes_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_notes_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      vitals: {
        Row: {
          admission_id: string | null
          blood_glucose: number | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          bmi: number | null
          consultation_id: string | null
          height: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          patient_id: string
          pulse_rate: number | null
          recorded_at: string
          recorded_by: string | null
          respiratory_rate: number | null
          temperature: number | null
          tenant_id: string
          weight: number | null
        }
        Insert: {
          admission_id?: string | null
          blood_glucose?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          consultation_id?: string | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id: string
          pulse_rate?: number | null
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
          tenant_id: string
          weight?: number | null
        }
        Update: {
          admission_id?: string | null
          blood_glucose?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          consultation_id?: string | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id?: string
          pulse_rate?: number | null
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
          tenant_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      wards: {
        Row: {
          branch_id: string | null
          building: string | null
          capacity: number
          created_at: string | null
          current_occupancy: number
          floor: string | null
          head_nurse_id: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string | null
          ward_type: string
        }
        Insert: {
          branch_id?: string | null
          building?: string | null
          capacity?: number
          created_at?: string | null
          current_occupancy?: number
          floor?: string | null
          head_nurse_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string | null
          ward_type?: string
        }
        Update: {
          branch_id?: string | null
          building?: string | null
          capacity?: number
          created_at?: string | null
          current_occupancy?: number
          floor?: string | null
          head_nurse_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
          ward_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wards_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wards_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "wards_head_nurse_id_fkey"
            columns: ["head_nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      warranty_records: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          notes: string | null
          product_id: string
          sale_id: string
          serial_number: string | null
          warranty_end: string
          warranty_start: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          product_id: string
          sale_id: string
          serial_number?: string | null
          warranty_end: string
          warranty_start: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          product_id?: string
          sale_id?: string
          serial_number?: string | null
          warranty_end?: string
          warranty_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranty_records_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      daily_sales_summary: {
        Row: {
          branch_id: string | null
          card_revenue: number | null
          cash_revenue: number | null
          credit_revenue: number | null
          mpesa_revenue: number | null
          sale_date: string | null
          total_discounts: number | null
          total_revenue: number | null
          total_tax: number | null
          total_transactions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      edoslmis_inventory_balances: {
        Row: {
          current_balance: number | null
          item_id: string | null
          last_transaction_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edoslmis_stock_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edoslmis_inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_aging: {
        Row: {
          age_bucket: string | null
          branch_id: string | null
          category_id: string | null
          category_name: string | null
          computed_classification: string | null
          cost_price: number | null
          days_in_inventory: number | null
          days_since_last_sale: number | null
          first_sale_at: string | null
          id: string | null
          last_sale_at: string | null
          low_stock_threshold: number | null
          name: string | null
          quantity: number | null
          reorder_quantity: number | null
          selling_price: number | null
          sku: string | null
          stock_classification: string | null
          stock_value: number | null
          stocked_at: string | null
          supplier_id: string | null
          supplier_name: string | null
          tenant_id: string | null
          total_sold: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      low_stock_alerts: {
        Row: {
          category_name: string | null
          current_stock: number | null
          id: string | null
          name: string | null
          reorder_level: number | null
          sku: string | null
          supplier_name: string | null
          supplier_phone: string | null
        }
        Relationships: []
      }
      product_stock: {
        Row: {
          available_quantity: number | null
          barcode: string | null
          category_id: string | null
          category_name: string | null
          cost_price: number | null
          has_serial: boolean | null
          has_warranty: boolean | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          is_low_stock: boolean | null
          is_out_of_stock: boolean | null
          name: string | null
          reorder_level: number | null
          reserved_quantity: number | null
          selling_price: number | null
          sku: string | null
          stock_quantity: number | null
          tenant_id: string | null
          unit: string | null
          vat_rate: number | null
          warranty_months: number | null
          wholesale_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      vw_active_flock_summary: {
        Row: {
          age_days: number | null
          age_weeks: number | null
          batch_name: string | null
          bird_type: string | null
          branch_id: string | null
          breed: string | null
          current_count: number | null
          deaths_last_7_days: number | null
          eggs_today: number | null
          farm_name: string | null
          flock_code: string | null
          hdp_today: number | null
          house_id: string | null
          house_name: string | null
          id: string | null
          initial_count: number | null
          latest_avg_weight_kg: number | null
          latest_fcr: number | null
          mortality_rate_7d_pct: number | null
          placement_date: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flocks_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flocks_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "flocks_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "poultry_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flocks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flocks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_farm_daily_dashboard"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      vw_farm_daily_dashboard: {
        Row: {
          active_flocks: number | null
          branch_id: string | null
          farm_name: string | null
          feed_consumed_today_kg: number | null
          report_date: string | null
          saleable_eggs_today: number | null
          tenant_id: string | null
          tenant_name: string | null
          total_deaths_today: number | null
          total_eggs_today: number | null
          total_live_birds: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      auth_role: { Args: never; Returns: string }
      auth_tenant_id: { Args: never; Returns: string }
      calculate_revenue: { Args: { floors: number }; Returns: number }
      claim_etims_invoice_no: { Args: { p_tenant_id: string }; Returns: number }
      confirm_grn: { Args: { p_grn_id: string }; Returns: undefined }
      current_tenant_id: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      decrement_stock: {
        Args: { p_branch_id: string; p_product_id: string; p_quantity: number }
        Returns: undefined
      }
      edoshms_get_branch_id: { Args: never; Returns: string }
      edoshms_get_tenant_id: { Args: never; Returns: string }
      edoshms_is_platform_admin: { Args: never; Returns: boolean }
      edoshms_is_tenant_admin: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      edoslmis_assign_staff_role: {
        Args: { p_branch_id?: string; p_role_id: string; p_user_id: string }
        Returns: undefined
      }
      edoslmis_create_staff_profile: {
        Args: {
          p_branch_id?: string
          p_first_name: string
          p_is_tenant_admin?: boolean
          p_last_name: string
          p_phone?: string
          p_staff_category?: string
          p_user_id: string
        }
        Returns: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          deleted_at: string | null
          display_name: string | null
          employee_number: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          is_active: boolean | null
          is_platform_admin: boolean | null
          is_tenant_admin: boolean | null
          last_login_at: string | null
          last_name: string
          license_expiry: string | null
          license_number: string | null
          middle_name: string | null
          phone: string | null
          preferences: Json | null
          qualification: string | null
          specialization: string | null
          staff_category: Database["public"]["Enums"]["staff_category"] | null
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "edoshms_user_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      edoslmis_create_tenant: {
        Args: {
          p_admin_first_name: string
          p_admin_last_name: string
          p_admin_phone?: string
          p_admin_user_id: string
          p_branch_code: string
          p_branch_name: string
          p_legal_name: string
          p_name: string
        }
        Returns: {
          branch_id: string
          tenant_id: string
        }[]
      }
      edoslmis_delete_stock_transaction: {
        Args: { p_transaction_id: string }
        Returns: undefined
      }
      edoslmis_delete_tenant: {
        Args: { p_tenant_id: string }
        Returns: undefined
      }
      edoslmis_delete_tenant_admin: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: undefined
      }
      edoslmis_generate_blood_unit_number: { Args: never; Returns: string }
      edoslmis_generate_donor_number: { Args: never; Returns: string }
      edoslmis_generate_invoice_for_order: {
        Args: { p_is_vat_exempt?: boolean; p_order_id: string }
        Returns: {
          amount_paid: number
          balance_due: number | null
          branch_id: string | null
          cancellation_reason: string | null
          created_at: string
          created_by: string | null
          discount_amount: number
          due_date: string | null
          id: string
          invoice_number: string
          is_vat_exempt: boolean
          issued_at: string | null
          order_id: string | null
          patient_id: string
          payer_name: string | null
          payer_type: Database["public"]["Enums"]["edoslmis_payer_type"]
          status: Database["public"]["Enums"]["edoslmis_invoice_status"]
          subtotal: number
          tax_amount: number
          tenant_id: string
          total_amount: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "edoslmis_invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      edoslmis_generate_invoice_number: { Args: never; Returns: string }
      edoslmis_generate_order_number: { Args: never; Returns: string }
      edoslmis_generate_patient_number: { Args: never; Returns: string }
      edoslmis_generate_po_number: { Args: never; Returns: string }
      edoslmis_generate_quotation_number: { Args: never; Returns: string }
      edoslmis_generate_rfq_number: { Args: never; Returns: string }
      edoslmis_generate_specimen_number: { Args: never; Returns: string }
      edoslmis_generate_supplier_bill_from_po: {
        Args: { p_po_id: string }
        Returns: {
          amount_paid: number
          balance_due: number | null
          bill_date: string
          bill_number: string
          branch_id: string | null
          cancellation_reason: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          po_id: string
          status: Database["public"]["Enums"]["edoslmis_supplier_bill_status"]
          subtotal: number
          supplier_id: string
          supplier_invoice_number: string | null
          tenant_id: string
          total_amount: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "edoslmis_supplier_bills"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      edoslmis_generate_supplier_bill_number: { Args: never; Returns: string }
      edoslmis_get_current_staff: {
        Args: never
        Returns: {
          branch_id: string
          branch_name: string
          first_name: string
          is_platform_admin: boolean
          is_tenant_admin: boolean
          last_name: string
          permissions: Json
          staff_category: string
          tenant_id: string
          user_id: string
        }[]
      }
      edoslmis_get_staff_display_names: {
        Args: { p_user_ids: string[] }
        Returns: {
          display_name: string
          user_id: string
        }[]
      }
      edoslmis_has_permission: {
        Args: { p_permission: string }
        Returns: boolean
      }
      edoslmis_is_admin_for: { Args: { p_tenant_id: string }; Returns: boolean }
      edoslmis_list_staff_with_roles: {
        Args: never
        Returns: {
          first_name: string
          is_active: boolean
          last_name: string
          roles: Json
          staff_category: string
          user_id: string
        }[]
      }
      edoslmis_list_tenant_admins: {
        Args: { p_tenant_id: string }
        Returns: {
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          phone: string
        }[]
      }
      edoslmis_list_tenant_roles: {
        Args: never
        Returns: {
          code: string
          description: string
          id: string
          name: string
          permissions: Json
        }[]
      }
      edoslmis_list_tenants: {
        Args: never
        Returns: {
          clinic_name: string
          code: string
          created_at: string
          deleted_at: string
          facility_type: string
          id: string
          legal_name: string
          logo_path: string
          name: string
          settings_updated_at: string
          status: string
          theme_color: string
        }[]
      }
      edoslmis_receive_purchase_order_line: {
        Args: {
          p_batch_number?: string
          p_expiry_date?: string
          p_line_id: string
          p_notes?: string
          p_quantity: number
        }
        Returns: {
          created_at: string
          id: string
          item_id: string
          po_id: string
          quantity_ordered: number
          quantity_received: number
          tenant_id: string
          unit_cost: number | null
        }
        SetofOptions: {
          from: "*"
          to: "edoslmis_purchase_order_lines"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      edoslmis_record_payment: {
        Args: {
          p_amount: number
          p_invoice_id: string
          p_notes?: string
          p_payment_method: Database["public"]["Enums"]["edoslmis_payment_method"]
          p_reference_number?: string
        }
        Returns: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          paid_at: string
          payment_method: string
          received_by: string | null
          reference_number: string | null
          tenant_id: string
        }
        SetofOptions: {
          from: "*"
          to: "edoslmis_payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      edoslmis_record_stock_transaction: {
        Args: {
          p_batch_id?: string
          p_item_id: string
          p_notes?: string
          p_quantity_change: number
          p_reference_order_test_id?: string
          p_transaction_type: Database["public"]["Enums"]["edoslmis_stock_transaction_type"]
        }
        Returns: {
          balance_after: number
          batch_id: string | null
          branch_id: string | null
          created_at: string
          id: string
          item_id: string
          notes: string | null
          performed_at: string
          performed_by: string | null
          quantity_change: number
          reference_order_test_id: string | null
          tenant_id: string
          transaction_type: Database["public"]["Enums"]["edoslmis_stock_transaction_type"]
        }
        SetofOptions: {
          from: "*"
          to: "edoslmis_stock_transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      edoslmis_record_supplier_payment: {
        Args: {
          p_amount: number
          p_bill_id: string
          p_notes?: string
          p_payment_method: string
          p_reference_number?: string
        }
        Returns: {
          amount: number
          bill_id: string
          created_at: string
          id: string
          notes: string | null
          paid_at: string
          payment_method: string
          received_by: string | null
          reference_number: string | null
          tenant_id: string
        }
        SetofOptions: {
          from: "*"
          to: "edoslmis_supplier_payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      edoslmis_set_staff_active: {
        Args: { p_is_active: boolean; p_user_id: string }
        Returns: undefined
      }
      edoslmis_set_staff_role_active: {
        Args: { p_is_active: boolean; p_user_role_id: string }
        Returns: undefined
      }
      edoslmis_set_tenant_active: {
        Args: { p_is_active: boolean; p_tenant_id: string }
        Returns: undefined
      }
      edoslmis_update_stock_transaction: {
        Args: {
          p_notes?: string
          p_quantity_change: number
          p_transaction_id: string
          p_transaction_type: Database["public"]["Enums"]["edoslmis_stock_transaction_type"]
        }
        Returns: {
          balance_after: number
          batch_id: string | null
          branch_id: string | null
          created_at: string
          id: string
          item_id: string
          notes: string | null
          performed_at: string
          performed_by: string | null
          quantity_change: number
          reference_order_test_id: string | null
          tenant_id: string
          transaction_type: Database["public"]["Enums"]["edoslmis_stock_transaction_type"]
        }
        SetofOptions: {
          from: "*"
          to: "edoslmis_stock_transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      edoslmis_update_tenant: {
        Args: {
          p_code: string
          p_legal_name: string
          p_name: string
          p_tenant_id: string
        }
        Returns: undefined
      }
      edoslmis_update_tenant_admin: {
        Args: {
          p_first_name: string
          p_last_name: string
          p_phone: string
          p_tenant_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      fn_current_branch_id: { Args: never; Returns: string }
      fn_current_role: { Args: never; Returns: string }
      fn_current_tenant_id: { Args: never; Returns: string }
      fn_has_tenant_access: {
        Args: { record_tenant_id: string }
        Returns: boolean
      }
      fn_is_elevated: { Args: never; Returns: boolean }
      fn_is_farm_manager_or_above: { Args: never; Returns: boolean }
      generate_grn_number: { Args: { p_tenant_id: string }; Returns: string }
      generate_po_number: { Args: { p_tenant_id: string }; Returns: string }
      generate_receipt_number: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      get_appointment_stats: {
        Args: { p_end_date: string; p_start_date: string; p_tenant_id: string }
        Returns: {
          average_lead_time_days: number
          cancelled_appointments: number
          completed_appointments: number
          completion_rate: number
          no_show_appointments: number
          total_appointments: number
        }[]
      }
      get_available_slots: {
        Args: {
          p_appointment_date: string
          p_doctor_id: string
          p_slot_duration_minutes?: number
        }
        Returns: {
          is_available: boolean
          slot_end: string
          slot_start: string
        }[]
      }
      get_sales_summary: {
        Args: { p_branch_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          card_revenue: number
          cash_revenue: number
          credit_revenue: number
          mpesa_revenue: number
          sale_date: string
          total_discounts: number
          total_revenue: number
          total_tax: number
          total_txns: number
        }[]
      }
      is_super_admin: { Args: never; Returns: boolean }
      maldives_belongs_to_tenant: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      maldives_has_permission: {
        Args: { p_permission: string }
        Returns: boolean
      }
      onboard_new_tenant: {
        Args: {
          p_auth_user_id?: string
          p_country?: string
          p_currency?: string
          p_name: string
          p_owner_email: string
          p_owner_name: string
          p_owner_phone: string
          p_plan_id: string
          p_subdomain: string
          p_timezone?: string
        }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      account_type: "asset" | "liability" | "equity" | "revenue" | "expense"
      admission_status:
        | "active"
        | "discharged"
        | "transferred"
        | "absconded"
        | "deceased"
      alert_severity: "green" | "orange" | "red"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "arrived"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
        | "rescheduled"
      bed_status:
        | "available"
        | "occupied"
        | "reserved"
        | "maintenance"
        | "blocked"
      blood_group:
        | "A+"
        | "A-"
        | "B+"
        | "B-"
        | "AB+"
        | "AB-"
        | "O+"
        | "O-"
        | "unknown"
      breakdown_severity: "critical" | "high" | "medium" | "low"
      breakdown_status:
        | "open"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "closed"
      claim_status:
        | "draft"
        | "submitted"
        | "acknowledged"
        | "under_review"
        | "approved"
        | "partial_approved"
        | "rejected"
        | "resubmitted"
        | "paid"
        | "reconciled"
        | "appealed"
      component_status:
        | "healthy"
        | "service_due"
        | "replace_soon"
        | "critical"
        | "replaced"
        | "retired"
      crane_status:
        | "active"
        | "breakdown"
        | "maintenance"
        | "idle"
        | "out_of_service"
      edoslmis_blood_component:
        | "whole_blood"
        | "packed_red_cells"
        | "fresh_frozen_plasma"
        | "platelet_concentrate"
        | "cryoprecipitate"
      edoslmis_blood_group:
        | "A_pos"
        | "A_neg"
        | "B_pos"
        | "B_neg"
        | "AB_pos"
        | "AB_neg"
        | "O_pos"
        | "O_neg"
      edoslmis_blood_unit_status:
        | "quarantine"
        | "available"
        | "reserved"
        | "issued"
        | "discarded"
        | "expired"
      edoslmis_claim_status:
        | "pending"
        | "submitted"
        | "approved"
        | "rejected"
        | "paid"
      edoslmis_crossmatch_result: "compatible" | "incompatible"
      edoslmis_crossmatch_status: "pending" | "completed" | "cancelled"
      edoslmis_culture_status:
        | "pending"
        | "growth"
        | "no_growth"
        | "contaminated"
        | "finalized"
      edoslmis_culture_type:
        | "aerobic"
        | "anaerobic"
        | "fungal"
        | "afb"
        | "blood_culture"
      edoslmis_department_type:
        | "clinical_chemistry"
        | "haematology"
        | "microbiology"
        | "virology"
        | "parasitology"
        | "immunology"
        | "histopathology"
        | "cytology"
        | "molecular_biology"
        | "pcr"
        | "blood_bank"
        | "urinalysis"
        | "toxicology"
        | "serology"
        | "tb_laboratory"
        | "hiv_laboratory"
        | "covid"
        | "research"
        | "other"
      edoslmis_donor_type: "voluntary" | "replacement" | "autologous"
      edoslmis_equipment_status:
        | "operational"
        | "under_maintenance"
        | "out_of_service"
        | "decommissioned"
      edoslmis_equipment_type:
        | "analyzer"
        | "microscope"
        | "centrifuge"
        | "incubator"
        | "refrigerator"
        | "freezer"
        | "autoclave"
        | "water_bath"
        | "pipette"
        | "balance"
        | "pcr_machine"
        | "blood_bank_fridge"
        | "other"
      edoslmis_gender: "male" | "female" | "other" | "unknown"
      edoslmis_gender_applicability: "all" | "male" | "female"
      edoslmis_gram_stain:
        | "positive"
        | "negative"
        | "variable"
        | "not_applicable"
      edoslmis_histo_case_status:
        | "received"
        | "grossed"
        | "processing"
        | "microscopy"
        | "finalized"
      edoslmis_histo_specimen_type:
        | "biopsy"
        | "resection"
        | "cytology"
        | "frozen_section"
      edoslmis_inventory_category:
        | "reagent"
        | "consumable"
        | "glassware"
        | "chemical"
        | "kit"
        | "calibrator"
        | "control"
        | "other"
      edoslmis_invoice_status:
        | "draft"
        | "issued"
        | "partially_paid"
        | "paid"
        | "cancelled"
        | "written_off"
      edoslmis_isolate_significance: "pathogen" | "contaminant" | "normal_flora"
      edoslmis_maintenance_type:
        | "preventive"
        | "corrective"
        | "calibration"
        | "validation"
        | "installation"
      edoslmis_molecular_result: "detected" | "not_detected" | "indeterminate"
      edoslmis_molecular_run_status:
        | "pending"
        | "completed"
        | "invalid"
        | "repeat_required"
      edoslmis_notification_channel: "sms" | "whatsapp" | "email"
      edoslmis_notification_status: "sent" | "failed" | "skipped"
      edoslmis_order_priority: "routine" | "urgent" | "stat"
      edoslmis_order_source:
        | "manual"
        | "emr"
        | "api"
        | "hl7"
        | "fhir"
        | "referral"
        | "bulk_import"
      edoslmis_order_status:
        | "pending"
        | "accessioned"
        | "in_progress"
        | "partially_completed"
        | "completed"
        | "cancelled"
      edoslmis_order_test_status:
        | "pending"
        | "specimen_collected"
        | "received"
        | "in_analysis"
        | "resulted"
        | "verified"
        | "released"
        | "cancelled"
        | "rejected"
      edoslmis_patient_category:
        | "walk_in"
        | "inpatient"
        | "outpatient"
        | "corporate"
        | "insurance"
        | "referral"
        | "research"
      edoslmis_payer_type:
        | "self_pay"
        | "insurance"
        | "corporate"
        | "nhif"
        | "sha"
        | "referral"
      edoslmis_payment_method:
        | "cash"
        | "mpesa"
        | "card"
        | "bank_transfer"
        | "cheque"
        | "insurance"
        | "nhif"
        | "sha"
      edoslmis_po_status:
        | "draft"
        | "sent"
        | "confirmed"
        | "partially_received"
        | "received"
        | "cancelled"
      edoslmis_qc_level: "level1" | "level2" | "level3"
      edoslmis_qc_status: "accepted" | "warning" | "rejected"
      edoslmis_quotation_status:
        | "draft"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
      edoslmis_reaction_severity: "mild" | "moderate" | "severe"
      edoslmis_result_flag:
        | "normal"
        | "low"
        | "high"
        | "critical_low"
        | "critical_high"
        | "abnormal"
      edoslmis_rfq_status:
        | "draft"
        | "sent"
        | "closed"
        | "converted"
        | "cancelled"
      edoslmis_screening_result: "pending" | "non_reactive" | "reactive"
      edoslmis_sensitivity_interpretation:
        | "susceptible"
        | "intermediate"
        | "resistant"
      edoslmis_specimen_status:
        | "pending_collection"
        | "collected"
        | "in_transit"
        | "received"
        | "accessioned"
        | "rejected"
        | "in_analysis"
        | "analyzed"
        | "disposed"
      edoslmis_stock_transaction_type:
        | "opening_balance"
        | "receipt"
        | "test_usage"
        | "positive_adjustment"
        | "negative_adjustment"
        | "wastage"
        | "expiry"
        | "transfer_in"
        | "transfer_out"
        | "stock_count_correction"
      edoslmis_supplier_bill_status:
        | "issued"
        | "partially_paid"
        | "paid"
        | "cancelled"
      edoslmis_tracking_event:
        | "ordered"
        | "collected"
        | "received"
        | "rejected"
        | "accessioned"
        | "routed"
        | "analysis_started"
        | "analysis_completed"
        | "verified"
        | "released"
        | "disposed"
      edoslmis_transfusion_status:
        | "issued"
        | "in_progress"
        | "completed"
        | "discontinued"
      edoslmis_verification_level: "technologist" | "scientist" | "pathologist"
      edoslmis_verification_status:
        | "pending"
        | "verified"
        | "rejected_back_for_recollection"
      expense_category:
        | "fuel"
        | "repairs"
        | "hydraulic_oil"
        | "engine_oil"
        | "cable_replacement"
        | "spare_parts"
        | "insurance"
        | "inspection"
        | "transport"
        | "technician_fees"
        | "other"
      facility_type:
        | "clinic"
        | "medical_centre"
        | "diagnostic_centre"
        | "specialist_clinic"
        | "county_hospital"
        | "faith_based_hospital"
        | "level_4_hospital"
        | "level_5_hospital"
        | "level_6_hospital"
        | "private_hospital"
        | "hospital_group"
        | "nursing_home"
        | "dispensary"
      gender: "male" | "female" | "other" | "unknown"
      insurance_type: "sha" | "private" | "corporate" | "nhif_legacy"
      invoice_status:
        | "draft"
        | "pending"
        | "partial"
        | "paid"
        | "overdue"
        | "cancelled"
        | "written_off"
      journal_entry_status: "draft" | "posted" | "reversed"
      lab_order_status:
        | "ordered"
        | "collected"
        | "processing"
        | "resulted"
        | "verified"
        | "released"
        | "cancelled"
      marital_status:
        | "single"
        | "married"
        | "divorced"
        | "widowed"
        | "separated"
        | "unknown"
      notification_type:
        | "queue_call"
        | "appointment"
        | "result_ready"
        | "payment"
        | "sms"
        | "email"
        | "system"
      patient_status: "active" | "inactive" | "deceased" | "transferred"
      payment_method:
        | "cash"
        | "card"
        | "bank_transfer"
        | "eft"
        | "rtgs"
        | "cheque"
        | "mpesa"
        | "airtel_money"
        | "equitel"
        | "paybill"
        | "till"
        | "qr"
        | "insurance"
        | "sha"
        | "corporate"
        | "waiver"
        | "bursary"
      payment_status:
        | "pending"
        | "partial"
        | "paid"
        | "overpaid"
        | "refunded"
        | "cancelled"
        | "written_off"
      prescription_status:
        | "pending"
        | "dispensing"
        | "dispensed"
        | "partial"
        | "cancelled"
        | "returned"
      procurement_status:
        | "draft"
        | "submitted"
        | "approved"
        | "ordered"
        | "partial"
        | "received"
        | "cancelled"
      project_status: "active" | "completed" | "paused" | "cancelled"
      queue_status:
        | "waiting"
        | "called"
        | "serving"
        | "served"
        | "skipped"
        | "cancelled"
      radiology_status:
        | "ordered"
        | "scheduled"
        | "in_progress"
        | "images_acquired"
        | "reporting"
        | "reported"
        | "verified"
        | "released"
        | "cancelled"
      staff_category:
        | "doctor"
        | "nurse"
        | "clinical_officer"
        | "pharmacist"
        | "lab_technician"
        | "radiographer"
        | "physiotherapist"
        | "nutritionist"
        | "social_worker"
        | "counsellor"
        | "anaesthetist"
        | "surgeon"
        | "dentist"
        | "optician"
        | "admin"
        | "cashier"
        | "receptionist"
        | "it"
        | "housekeeper"
        | "security"
        | "other"
      stock_transaction_type:
        | "opening"
        | "purchase"
        | "transfer_in"
        | "transfer_out"
        | "issue"
        | "return"
        | "adjustment"
        | "wastage"
        | "expiry"
        | "stockcount"
      tenant_status: "active" | "inactive" | "suspended" | "trial"
      user_role:
        | "super_admin"
        | "administrator"
        | "operator"
        | "maintenance_technician"
        | "accountant"
        | "site_manager"
      visit_status:
        | "registered"
        | "triaged"
        | "waiting"
        | "with_doctor"
        | "investigations"
        | "billing"
        | "pharmacy"
        | "completed"
        | "admitted"
        | "discharged"
        | "transferred"
        | "absconded"
        | "cancelled"
      visit_type:
        | "opd"
        | "ipd"
        | "emergency"
        | "procedure"
        | "day_case"
        | "referral"
      work_order_status:
        | "open"
        | "assigned"
        | "waiting_for_parts"
        | "in_progress"
        | "inspection"
        | "completed"
        | "closed"
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
      account_type: ["asset", "liability", "equity", "revenue", "expense"],
      admission_status: [
        "active",
        "discharged",
        "transferred",
        "absconded",
        "deceased",
      ],
      alert_severity: ["green", "orange", "red"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "arrived",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
        "rescheduled",
      ],
      bed_status: [
        "available",
        "occupied",
        "reserved",
        "maintenance",
        "blocked",
      ],
      blood_group: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
        "unknown",
      ],
      breakdown_severity: ["critical", "high", "medium", "low"],
      breakdown_status: [
        "open",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
      ],
      claim_status: [
        "draft",
        "submitted",
        "acknowledged",
        "under_review",
        "approved",
        "partial_approved",
        "rejected",
        "resubmitted",
        "paid",
        "reconciled",
        "appealed",
      ],
      component_status: [
        "healthy",
        "service_due",
        "replace_soon",
        "critical",
        "replaced",
        "retired",
      ],
      crane_status: [
        "active",
        "breakdown",
        "maintenance",
        "idle",
        "out_of_service",
      ],
      edoslmis_blood_component: [
        "whole_blood",
        "packed_red_cells",
        "fresh_frozen_plasma",
        "platelet_concentrate",
        "cryoprecipitate",
      ],
      edoslmis_blood_group: [
        "A_pos",
        "A_neg",
        "B_pos",
        "B_neg",
        "AB_pos",
        "AB_neg",
        "O_pos",
        "O_neg",
      ],
      edoslmis_blood_unit_status: [
        "quarantine",
        "available",
        "reserved",
        "issued",
        "discarded",
        "expired",
      ],
      edoslmis_claim_status: [
        "pending",
        "submitted",
        "approved",
        "rejected",
        "paid",
      ],
      edoslmis_crossmatch_result: ["compatible", "incompatible"],
      edoslmis_crossmatch_status: ["pending", "completed", "cancelled"],
      edoslmis_culture_status: [
        "pending",
        "growth",
        "no_growth",
        "contaminated",
        "finalized",
      ],
      edoslmis_culture_type: [
        "aerobic",
        "anaerobic",
        "fungal",
        "afb",
        "blood_culture",
      ],
      edoslmis_department_type: [
        "clinical_chemistry",
        "haematology",
        "microbiology",
        "virology",
        "parasitology",
        "immunology",
        "histopathology",
        "cytology",
        "molecular_biology",
        "pcr",
        "blood_bank",
        "urinalysis",
        "toxicology",
        "serology",
        "tb_laboratory",
        "hiv_laboratory",
        "covid",
        "research",
        "other",
      ],
      edoslmis_donor_type: ["voluntary", "replacement", "autologous"],
      edoslmis_equipment_status: [
        "operational",
        "under_maintenance",
        "out_of_service",
        "decommissioned",
      ],
      edoslmis_equipment_type: [
        "analyzer",
        "microscope",
        "centrifuge",
        "incubator",
        "refrigerator",
        "freezer",
        "autoclave",
        "water_bath",
        "pipette",
        "balance",
        "pcr_machine",
        "blood_bank_fridge",
        "other",
      ],
      edoslmis_gender: ["male", "female", "other", "unknown"],
      edoslmis_gender_applicability: ["all", "male", "female"],
      edoslmis_gram_stain: [
        "positive",
        "negative",
        "variable",
        "not_applicable",
      ],
      edoslmis_histo_case_status: [
        "received",
        "grossed",
        "processing",
        "microscopy",
        "finalized",
      ],
      edoslmis_histo_specimen_type: [
        "biopsy",
        "resection",
        "cytology",
        "frozen_section",
      ],
      edoslmis_inventory_category: [
        "reagent",
        "consumable",
        "glassware",
        "chemical",
        "kit",
        "calibrator",
        "control",
        "other",
      ],
      edoslmis_invoice_status: [
        "draft",
        "issued",
        "partially_paid",
        "paid",
        "cancelled",
        "written_off",
      ],
      edoslmis_isolate_significance: [
        "pathogen",
        "contaminant",
        "normal_flora",
      ],
      edoslmis_maintenance_type: [
        "preventive",
        "corrective",
        "calibration",
        "validation",
        "installation",
      ],
      edoslmis_molecular_result: ["detected", "not_detected", "indeterminate"],
      edoslmis_molecular_run_status: [
        "pending",
        "completed",
        "invalid",
        "repeat_required",
      ],
      edoslmis_notification_channel: ["sms", "whatsapp", "email"],
      edoslmis_notification_status: ["sent", "failed", "skipped"],
      edoslmis_order_priority: ["routine", "urgent", "stat"],
      edoslmis_order_source: [
        "manual",
        "emr",
        "api",
        "hl7",
        "fhir",
        "referral",
        "bulk_import",
      ],
      edoslmis_order_status: [
        "pending",
        "accessioned",
        "in_progress",
        "partially_completed",
        "completed",
        "cancelled",
      ],
      edoslmis_order_test_status: [
        "pending",
        "specimen_collected",
        "received",
        "in_analysis",
        "resulted",
        "verified",
        "released",
        "cancelled",
        "rejected",
      ],
      edoslmis_patient_category: [
        "walk_in",
        "inpatient",
        "outpatient",
        "corporate",
        "insurance",
        "referral",
        "research",
      ],
      edoslmis_payer_type: [
        "self_pay",
        "insurance",
        "corporate",
        "nhif",
        "sha",
        "referral",
      ],
      edoslmis_payment_method: [
        "cash",
        "mpesa",
        "card",
        "bank_transfer",
        "cheque",
        "insurance",
        "nhif",
        "sha",
      ],
      edoslmis_po_status: [
        "draft",
        "sent",
        "confirmed",
        "partially_received",
        "received",
        "cancelled",
      ],
      edoslmis_qc_level: ["level1", "level2", "level3"],
      edoslmis_qc_status: ["accepted", "warning", "rejected"],
      edoslmis_quotation_status: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired",
      ],
      edoslmis_reaction_severity: ["mild", "moderate", "severe"],
      edoslmis_result_flag: [
        "normal",
        "low",
        "high",
        "critical_low",
        "critical_high",
        "abnormal",
      ],
      edoslmis_rfq_status: [
        "draft",
        "sent",
        "closed",
        "converted",
        "cancelled",
      ],
      edoslmis_screening_result: ["pending", "non_reactive", "reactive"],
      edoslmis_sensitivity_interpretation: [
        "susceptible",
        "intermediate",
        "resistant",
      ],
      edoslmis_specimen_status: [
        "pending_collection",
        "collected",
        "in_transit",
        "received",
        "accessioned",
        "rejected",
        "in_analysis",
        "analyzed",
        "disposed",
      ],
      edoslmis_stock_transaction_type: [
        "opening_balance",
        "receipt",
        "test_usage",
        "positive_adjustment",
        "negative_adjustment",
        "wastage",
        "expiry",
        "transfer_in",
        "transfer_out",
        "stock_count_correction",
      ],
      edoslmis_supplier_bill_status: [
        "issued",
        "partially_paid",
        "paid",
        "cancelled",
      ],
      edoslmis_tracking_event: [
        "ordered",
        "collected",
        "received",
        "rejected",
        "accessioned",
        "routed",
        "analysis_started",
        "analysis_completed",
        "verified",
        "released",
        "disposed",
      ],
      edoslmis_transfusion_status: [
        "issued",
        "in_progress",
        "completed",
        "discontinued",
      ],
      edoslmis_verification_level: ["technologist", "scientist", "pathologist"],
      edoslmis_verification_status: [
        "pending",
        "verified",
        "rejected_back_for_recollection",
      ],
      expense_category: [
        "fuel",
        "repairs",
        "hydraulic_oil",
        "engine_oil",
        "cable_replacement",
        "spare_parts",
        "insurance",
        "inspection",
        "transport",
        "technician_fees",
        "other",
      ],
      facility_type: [
        "clinic",
        "medical_centre",
        "diagnostic_centre",
        "specialist_clinic",
        "county_hospital",
        "faith_based_hospital",
        "level_4_hospital",
        "level_5_hospital",
        "level_6_hospital",
        "private_hospital",
        "hospital_group",
        "nursing_home",
        "dispensary",
      ],
      gender: ["male", "female", "other", "unknown"],
      insurance_type: ["sha", "private", "corporate", "nhif_legacy"],
      invoice_status: [
        "draft",
        "pending",
        "partial",
        "paid",
        "overdue",
        "cancelled",
        "written_off",
      ],
      journal_entry_status: ["draft", "posted", "reversed"],
      lab_order_status: [
        "ordered",
        "collected",
        "processing",
        "resulted",
        "verified",
        "released",
        "cancelled",
      ],
      marital_status: [
        "single",
        "married",
        "divorced",
        "widowed",
        "separated",
        "unknown",
      ],
      notification_type: [
        "queue_call",
        "appointment",
        "result_ready",
        "payment",
        "sms",
        "email",
        "system",
      ],
      patient_status: ["active", "inactive", "deceased", "transferred"],
      payment_method: [
        "cash",
        "card",
        "bank_transfer",
        "eft",
        "rtgs",
        "cheque",
        "mpesa",
        "airtel_money",
        "equitel",
        "paybill",
        "till",
        "qr",
        "insurance",
        "sha",
        "corporate",
        "waiver",
        "bursary",
      ],
      payment_status: [
        "pending",
        "partial",
        "paid",
        "overpaid",
        "refunded",
        "cancelled",
        "written_off",
      ],
      prescription_status: [
        "pending",
        "dispensing",
        "dispensed",
        "partial",
        "cancelled",
        "returned",
      ],
      procurement_status: [
        "draft",
        "submitted",
        "approved",
        "ordered",
        "partial",
        "received",
        "cancelled",
      ],
      project_status: ["active", "completed", "paused", "cancelled"],
      queue_status: [
        "waiting",
        "called",
        "serving",
        "served",
        "skipped",
        "cancelled",
      ],
      radiology_status: [
        "ordered",
        "scheduled",
        "in_progress",
        "images_acquired",
        "reporting",
        "reported",
        "verified",
        "released",
        "cancelled",
      ],
      staff_category: [
        "doctor",
        "nurse",
        "clinical_officer",
        "pharmacist",
        "lab_technician",
        "radiographer",
        "physiotherapist",
        "nutritionist",
        "social_worker",
        "counsellor",
        "anaesthetist",
        "surgeon",
        "dentist",
        "optician",
        "admin",
        "cashier",
        "receptionist",
        "it",
        "housekeeper",
        "security",
        "other",
      ],
      stock_transaction_type: [
        "opening",
        "purchase",
        "transfer_in",
        "transfer_out",
        "issue",
        "return",
        "adjustment",
        "wastage",
        "expiry",
        "stockcount",
      ],
      tenant_status: ["active", "inactive", "suspended", "trial"],
      user_role: [
        "super_admin",
        "administrator",
        "operator",
        "maintenance_technician",
        "accountant",
        "site_manager",
      ],
      visit_status: [
        "registered",
        "triaged",
        "waiting",
        "with_doctor",
        "investigations",
        "billing",
        "pharmacy",
        "completed",
        "admitted",
        "discharged",
        "transferred",
        "absconded",
        "cancelled",
      ],
      visit_type: [
        "opd",
        "ipd",
        "emergency",
        "procedure",
        "day_case",
        "referral",
      ],
      work_order_status: [
        "open",
        "assigned",
        "waiting_for_parts",
        "in_progress",
        "inspection",
        "completed",
        "closed",
      ],
    },
  },
} as const
