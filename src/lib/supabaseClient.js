import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fostikqbqhrcklwlgqnb.supabase.co'
const supabaseKey = 'sb_publishable_GQ2vGY32knshGT3jNTYe2A_JkvOhqiM'

export const supabase = createClient(supabaseUrl, supabaseKey)
