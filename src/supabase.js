import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://khdrhpagplnwnraaxiqu.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
                    eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZHJocGFn
                    cGxud25yYWF4aXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOj
                    E3NzgzNjEyOTIsImV4cCI6MjA5MzkzNzI5Mn0.
                    v-9FKAzjzuKWvWAdSdLLjGvVNHtQ7GLNiUeyagGqa8A'
                    
const supabase = createClient(supabaseUrl, supabaseKey)