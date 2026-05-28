import { createClient } from '@supabase/supabase-js';

// Apne Supabase project ki URL aur Anon Key yahan lagayein
const supabaseUrl = 'https://zzftxprkmfdrvppbyugx.supabase.co';
const supabaseKey = 'sb_publishable_eQuXAeT4xOtJI12evzU8Iw_afOhpygj';

export const supabase = createClient(supabaseUrl, supabaseKey);