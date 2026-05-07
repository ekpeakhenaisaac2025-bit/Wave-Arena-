import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bqwsosjmyhrxujtjcmqi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxd3Nvc2pteWhyeHVqdGpjbXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzMwNDcsImV4cCI6MjA5MzE0OTA0N30.DbKVABF5PnQkVP7r1eg7vs2L1R-DdJJ_B-_0bhwguSg'

export const supabase = createClient(supabaseUrl, supabaseKey)