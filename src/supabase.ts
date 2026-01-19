import { createClient } from '@supabase/supabase-js';

// User provided credentials
const SUPABASE_URL = 'https://ymmfunholuqbguplzcwv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-iDnPMN7oIJL0Tt6j-oanw_k59RV1HM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
