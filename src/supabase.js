import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://khdrhpagplnwnraaxiqu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZHJocGFncGxud25yYWF4aXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM2MTI5MiwiZXhwIjoyMDkzOTM3MjkyfQ.h1dqwATXgsFlnWHFed0WeQ2D0Y-iIgDJHoYaQlBi0L0'

export const supabase = createClient(supabaseUrl, supabaseKey)