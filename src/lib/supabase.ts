import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wjqxuwsifsaywruqtukz.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXh1d3NpZnNheXdydXF0dWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NzUzMzgsImV4cCI6MjA3MTM1MTMzOH0.gnjsDzFiRlRQJs3dW5Ow_rgPZ6__8t4THR_fKPxFSdg'

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration missing:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey })
}

export const supabase = createClient(supabaseUrl, supabaseKey)