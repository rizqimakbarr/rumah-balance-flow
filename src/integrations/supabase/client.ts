
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://arwrwtbgcmfdjuxhlvsd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyd3J3dGJnY21mZGp1eGhsdnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTA2NjAsImV4cCI6MjA2MDgyNjY2MH0.3wNDEzhQV30XOlgig6H1CAtsg2ptgC9z1qO2PZ9UZq4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  },
});
