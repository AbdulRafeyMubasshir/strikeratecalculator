import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dpmkkqfphgxggdvzvdss.supabase.co'; // replace with your project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbWtrcWZwaGd4Z2dkdnp2ZHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTQ0MDMsImV4cCI6MjA2NTU5MDQwM30.x3YQbl5kf-W_q6bpFcLyff8DQo1om5-nc7yIw0VeMNI'; // replace with your anon/public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
