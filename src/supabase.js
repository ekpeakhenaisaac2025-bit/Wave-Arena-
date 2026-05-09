import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bqwsosjmyhrxujtjcmqi.supabase.co'
const supabaseKey = 'sb_publishable_zi6P_Swt8plSOISQSdc9RA_GINGDCfv'

export const supabase = createClient(supabaseUrl, supabaseKey)