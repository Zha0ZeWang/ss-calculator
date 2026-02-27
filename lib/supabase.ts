// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 👇 请确保这一行最前面有 export 关键字！
export const supabase = createClient(supabaseUrl, supabaseAnonKey)