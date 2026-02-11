import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hxdlhixvsevfvkmpgaui.supabase.co'; // replace with your project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGxoaXh2c2V2ZnZrbXBnYXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTc5NDcsImV4cCI6MjA4NjMzMzk0N30.1yJQHr0mM_pQNm8Nxgfk3JnpdLR-LDckBC7ET14INWk'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
