import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Member = {
  id: string
  name: string
  color: string
  created_at: string
}

export type Meal = {
  id: string
  member_name: string
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
  description: string | null
  photo_urls: string[]
  date: string
  created_at: string
}

export type MealComment = {
  id: string
  meal_id: string
  member_name: string
  text: string
  created_at: string
}

export type WeightEntry = {
  id: string
  member_name: string
  weight: number
  date: string
  created_at: string
}

export type Workout = {
  id: string
  member_name: string
  type: string
  duration: number | null
  notes: string | null
  photo_url: string | null
  date: string
  created_at: string
}
