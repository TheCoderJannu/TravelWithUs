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
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string | null
          default_budget: number
          preferred_transport: string
          travel_style: string
          current_location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone?: string | null
          default_budget?: number
          preferred_transport?: string
          travel_style?: string
          current_location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string | null
          default_budget?: number
          preferred_transport?: string
          travel_style?: string
          current_location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          destination: string
          trip_type: string
          start_date: string
          end_date: string
          budget: number
          group_size: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          destination: string
          trip_type: string
          start_date: string
          end_date: string
          budget: number
          group_size?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          destination?: string
          trip_type?: string
          start_date?: string
          end_date?: string
          budget?: number
          group_size?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      hotels: {
        Row: {
          id: string
          name: string
          location: string
          price_per_night: number
          rating: number
          amenities: string[]
          image_url: string | null
          description: string | null
          created_at: string
        }
      }
      transports: {
        Row: {
          id: string
          type: string
          origin: string
          destination: string
          departure_time: string
          arrival_time: string
          price: number
          provider: string
          seats_available: number
          created_at: string
        }
      }
      activities: {
        Row: {
          id: string
          destination: string
          name: string
          description: string | null
          price: number
          duration: string | null
          category: string | null
          image_url: string | null
          created_at: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          booking_type: string
          item_id: string
          amount: number
          payment_status: string
          booking_date: string
          booking_details: Json
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          booking_type: string
          item_id: string
          amount: number
          payment_status?: string
          booking_date?: string
          booking_details?: Json
        }
      }
      photos: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          storage_path: string
          caption: string | null
          upload_date: string
          total_likes: number
          avg_rating: number
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          storage_path: string
          caption?: string | null
          upload_date?: string
          total_likes?: number
          avg_rating?: number
        }
      }
      photo_ratings: {
        Row: {
          id: string
          photo_id: string
          user_id: string
          rating: number
          created_at: string
        }
        Insert: {
          id?: string
          photo_id: string
          user_id: string
          rating: number
          created_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          voucher_code: string
          amount: number
          reason: string | null
          earned_date: string
          expiry_date: string | null
          is_redeemed: boolean
        }
      }
      trip_suggestions: {
        Row: {
          id: string
          user_id: string
          destination: string
          trip_type: string
          estimated_cost: number
          highlights: string[]
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          destination: string
          trip_type: string
          estimated_cost: number
          highlights?: string[]
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
