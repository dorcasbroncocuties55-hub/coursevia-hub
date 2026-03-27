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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string | null
          account_number: string | null
          bank_name: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          id: string
          is_default: boolean | null
          swift_code: string | null
          user_id: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_default?: boolean | null
          swift_code?: string | null
          user_id: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_default?: boolean | null
          swift_code?: string | null
          user_id?: string
        }
        Relationships: []
      }
      billing_plans: {
        Row: {
          active: boolean
          amount: number
          created_at: string
          currency: string
          id: string
          interval: string
          metadata: Json
          name: string
          plan_key: string
          provider: string
          provider_plan_code: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          interval?: string
          metadata?: Json
          name: string
          plan_key: string
          provider?: string
          provider_plan_code?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          interval?: string
          metadata?: Json
          name?: string
          plan_key?: string
          provider?: string
          provider_plan_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_type: string | null
          coach_id: string
          created_at: string
          duration_minutes: number
          id: string
          learner_id: string
          meeting_link: string | null
          meeting_url: string | null
          notes: string | null
          paid_at: string | null
          payment_reference: string | null
          payment_status: string | null
          price: number | null
          provider_id: string | null
          provider_type: string | null
          scheduled_at: string
          service_id: string | null
          session_ends_at: string | null
          session_opens_at: string | null
          session_room_url: string | null
          session_starts_at: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          booking_type?: string | null
          coach_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          learner_id: string
          meeting_link?: string | null
          meeting_url?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          price?: number | null
          provider_id?: string | null
          provider_type?: string | null
          scheduled_at: string
          service_id?: string | null
          session_ends_at?: string | null
          session_opens_at?: string | null
          session_room_url?: string | null
          session_starts_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          booking_type?: string | null
          coach_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          learner_id?: string
          meeting_link?: string | null
          meeting_url?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          price?: number | null
          provider_id?: string | null
          provider_type?: string | null
          scheduled_at?: string
          service_id?: string | null
          session_ends_at?: string | null
          session_opens_at?: string | null
          session_room_url?: string | null
          session_starts_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "coach_services"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          role_type: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          role_type?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          role_type?: string | null
          slug?: string
        }
        Relationships: []
      }
      category_requests: {
        Row: {
          created_at: string
          id: string
          name: string
          reason: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          reason?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          reason?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coach_availability: {
        Row: {
          coach_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_availability_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_profiles: {
        Row: {
          created_at: string
          headline: string | null
          hourly_rate: number | null
          id: string
          intro_video_url: string | null
          is_active: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          rating: number | null
          skills: string[] | null
          total_reviews: number | null
          total_students: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          intro_video_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          rating?: number | null
          skills?: string[] | null
          total_reviews?: number | null
          total_students?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          intro_video_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          rating?: number | null
          skills?: string[] | null
          total_reviews?: number | null
          total_students?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_services: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          price: number
          title: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          price: number
          title: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          price?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_services_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_access: {
        Row: {
          content_id: string
          content_type: string
          granted_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          granted_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          granted_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      content_episodes: {
        Row: {
          content_id: string
          created_at: string
          description: string | null
          duration_seconds: number
          episode_number: number
          id: string
          is_preview: boolean
          title: string
          video_storage_path: string | null
          video_url: string | null
        }
        Insert: {
          content_id: string
          created_at?: string
          description?: string | null
          duration_seconds?: number
          episode_number?: number
          id?: string
          is_preview?: boolean
          title: string
          video_storage_path?: string | null
          video_url?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number
          episode_number?: number
          id?: string
          is_preview?: boolean
          title?: string
          video_storage_path?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_episodes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_feedback_requests: {
        Row: {
          content_id: string
          created_at: string
          id: string
          learner_id: string
          message: string
          owner_id: string
          status: string
          subject: string | null
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          learner_id: string
          message: string
          owner_id: string
          status?: string
          subject?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          learner_id?: string
          message?: string
          owner_id?: string
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_feedback_requests_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          category_id: string | null
          content_type: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          owner_id: string
          owner_role: string | null
          preview_seconds: number
          price: number
          slug: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_storage_path: string | null
        }
        Insert: {
          category_id?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          owner_id: string
          owner_role?: string | null
          preview_seconds?: number
          price?: number
          slug?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_storage_path?: string | null
        }
        Update: {
          category_id?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          owner_id?: string
          owner_role?: string | null
          preview_seconds?: number
          price?: number
          slug?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_storage_path?: string | null
        }
        Relationships: []
      }
      content_purchases: {
        Row: {
          amount: number
          content_id: string
          created_at: string
          id: string
          owner_amount: number
          platform_fee: number
          user_id: string
        }
        Insert: {
          amount?: number
          content_id: string
          created_at?: string
          id?: string
          owner_amount?: number
          platform_fee?: number
          user_id: string
        }
        Update: {
          amount?: number
          content_id?: string
          created_at?: string
          id?: string
          owner_amount?: number
          platform_fee?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_purchases_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_preview: boolean | null
          section_id: string
          sort_order: number | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_preview?: boolean | null
          section_id: string
          sort_order?: number | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_preview?: boolean | null
          section_id?: string
          sort_order?: number | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          completed: boolean | null
          course_id: string
          created_at: string | null
          id: string
          lesson_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          course_id: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          course_id?: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          course_id: string
          created_at: string
          id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          sort_order?: number | null
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category_id: string | null
          created_at: string
          creator_id: string
          currency: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          level: string | null
          preview_video_url: string | null
          price: number
          rating: number | null
          short_description: string | null
          slug: string
          status: string | null
          thumbnail_url: string | null
          title: string
          total_reviews: number | null
          total_students: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          creator_id: string
          currency?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          level?: string | null
          preview_video_url?: string | null
          price?: number
          rating?: number | null
          short_description?: string | null
          slug: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          total_reviews?: number | null
          total_students?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          creator_id?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          level?: string | null
          preview_video_url?: string | null
          price?: number
          rating?: number | null
          short_description?: string | null
          slug?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          total_reviews?: number | null
          total_students?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_offers: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          receiver_id: string
          sender_id: string
          status: string
          title: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          title?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          title?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_flagged: boolean | null
          is_read: boolean | null
          offer_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          offer_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          offer_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_confirmations: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          id: string
          invoice_file_url: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          invoice_file_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          invoice_file_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_confirmations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          currency: string | null
          id: string
          invoice_url: string | null
          metadata: Json | null
          payer_id: string
          payment_method: string | null
          payment_type: string
          provider: string | null
          provider_customer_code: string | null
          provider_email_token: string | null
          provider_plan_code: string | null
          provider_subscription_code: string | null
          reference: string | null
          reference_id: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          invoice_url?: string | null
          metadata?: Json | null
          payer_id: string
          payment_method?: string | null
          payment_type: string
          provider?: string | null
          provider_customer_code?: string | null
          provider_email_token?: string | null
          provider_plan_code?: string | null
          provider_subscription_code?: string | null
          reference?: string | null
          reference_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          invoice_url?: string | null
          metadata?: Json | null
          payer_id?: string
          payment_method?: string | null
          payment_type?: string
          provider?: string | null
          provider_customer_code?: string | null
          provider_email_token?: string | null
          provider_plan_code?: string | null
          provider_subscription_code?: string | null
          reference?: string | null
          reference_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          booking_price: number | null
          certification: string | null
          country: string | null
          created_at: string
          email: string | null
          experience: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          phone: string | null
          primary_category_id: string | null
          profession: string | null
          profile_slug: string | null
          role: string | null
          specialization_slug: string | null
          specialization_type: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          booking_price?: number | null
          certification?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          experience?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          primary_category_id?: string | null
          profession?: string | null
          profile_slug?: string | null
          role?: string | null
          specialization_slug?: string | null
          specialization_type?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          booking_price?: number | null
          certification?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          experience?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          primary_category_id?: string | null
          profession?: string | null
          profile_slug?: string | null
          role?: string | null
          specialization_slug?: string | null
          specialization_type?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          owner_amount: number
          platform_fee: number
          user_id: string
          video_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          owner_amount?: number
          platform_fee?: number
          user_id: string
          video_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          owner_amount?: number
          platform_fee?: number
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          reportable_id: string | null
          reportable_type: string | null
          reported_user_id: string | null
          reporter_id: string
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reportable_id?: string | null
          reportable_type?: string | null
          reported_user_id?: string | null
          reporter_id: string
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reportable_id?: string | null
          reportable_type?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          status?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewable_id: string
          reviewable_type: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewable_id: string
          reviewable_type: string
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewable_id?: string
          reviewable_type?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_reminders: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          remind_at: string
          sent: boolean
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          remind_at: string
          sent?: boolean
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          remind_at?: string
          sent?: boolean
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          cancel_at_period_end: boolean | null
          created_at: string
          ends_at: string
          expires_at: string | null
          id: string
          last_payment_reference: string | null
          metadata: Json | null
          payment_provider: string | null
          paystack_customer_code: string | null
          paystack_email_token: string | null
          paystack_plan_code: string | null
          paystack_subscription_code: string | null
          plan: string
          started_at: string | null
          starts_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          ends_at: string
          expires_at?: string | null
          id?: string
          last_payment_reference?: string | null
          metadata?: Json | null
          payment_provider?: string | null
          paystack_customer_code?: string | null
          paystack_email_token?: string | null
          paystack_plan_code?: string | null
          paystack_subscription_code?: string | null
          plan: string
          started_at?: string | null
          starts_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          ends_at?: string
          expires_at?: string | null
          id?: string
          last_payment_reference?: string | null
          metadata?: Json | null
          payment_provider?: string | null
          paystack_customer_code?: string | null
          paystack_email_token?: string | null
          paystack_plan_code?: string | null
          paystack_subscription_code?: string | null
          plan?: string
          started_at?: string | null
          starts_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          from_wallet_id: string | null
          id: string
          payment_id: string | null
          status: string | null
          to_wallet_id: string | null
          type: string
        }
        Insert: {
          amount: number
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          from_wallet_id?: string | null
          id?: string
          payment_id?: string | null
          status?: string | null
          to_wallet_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          from_wallet_id?: string | null
          id?: string
          payment_id?: string | null
          status?: string | null
          to_wallet_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_from_wallet_id_fkey"
            columns: ["from_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_wallet_id_fkey"
            columns: ["to_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_type: string
          earned_at: string
          id: string
          label: string
          user_id: string
        }
        Insert: {
          badge_type: string
          earned_at?: string
          id?: string
          label: string
          user_id: string
        }
        Update: {
          badge_type?: string
          earned_at?: string
          id?: string
          label?: string
          user_id?: string
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
      verification_documents: {
        Row: {
          created_at: string
          document_type: string
          document_url: string
          id: string
          verification_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url: string
          id?: string
          verification_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string
          id?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          country: string | null
          created_at: string
          id: string
          id_document_url: string | null
          phone: string | null
          reviewed_by: string | null
          selfie_url: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          country?: string | null
          created_at?: string
          id?: string
          id_document_url?: string | null
          phone?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          country?: string | null
          created_at?: string
          id?: string
          id_document_url?: string | null
          phone?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_progress: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          video_id: string
          watched_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          video_id: string
          watched_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          video_id?: string
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_purchases: {
        Row: {
          amount: number
          created_at: string
          id: string
          owner_amount: number
          platform_fee: number
          user_id: string
          video_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          owner_amount?: number
          platform_fee?: number
          user_id: string
          video_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          owner_amount?: number
          platform_fee?: number
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category_id: string | null
          created_at: string
          creator_id: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_paid: boolean | null
          is_published: boolean | null
          owner_role: string | null
          preview_seconds: number | null
          price: number
          slug: string
          status: string | null
          storage_path: string | null
          thumbnail_url: string | null
          title: string
          total_views: number | null
          updated_at: string
          video_url: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_paid?: boolean | null
          is_published?: boolean | null
          owner_role?: string | null
          preview_seconds?: number | null
          price?: number
          slug: string
          status?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          title: string
          total_views?: number | null
          updated_at?: string
          video_url: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_paid?: boolean | null
          is_published?: boolean | null
          owner_role?: string | null
          preview_seconds?: number | null
          price?: number
          slug?: string
          status?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          title?: string
          total_views?: number | null
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_ledger: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_ledger_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number | null
          balance: number
          created_at: string
          currency: string | null
          id: string
          pending_balance: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number | null
          balance?: number
          created_at?: string
          currency?: string | null
          id?: string
          pending_balance?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number | null
          balance?: number
          created_at?: string
          currency?: string | null
          id?: string
          pending_balance?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          account_name: string | null
          account_number: string | null
          admin_notes: string | null
          amount: number
          bank_name: string | null
          created_at: string
          id: string
          processed_at: string | null
          status: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          admin_notes?: string | null
          amount: number
          bank_name?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          admin_notes?: string | null
          amount?: number
          bank_name?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_booking_completion: {
        Args: { _booking_id: string }
        Returns: undefined
      }
      check_user_exists_by_email: {
        Args: { user_email: string }
        Returns: boolean
      }
      complete_onboarding: {
        Args: {
          _primary_category_id?: string
          _role?: string
          _specialization_slug?: string
          _specialization_type?: string
        }
        Returns: undefined
      }
      create_notification: {
        Args: {
          _link?: string
          _message: string
          _title: string
          _type?: string
          _user_id: string
        }
        Returns: undefined
      }
      ensure_my_profile_and_role: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_bootstrap_open: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "learner" | "coach" | "creator" | "admin" | "therapist"
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
      app_role: ["learner", "coach", "creator", "admin", "therapist"],
    },
  },
} as const
