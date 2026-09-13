import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqwgfhrwbvpkggliuuak.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxd2dmaHJ3YnZwa2dnbGl1dWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNzgyNDgsImV4cCI6MjEwNDY1NDI0OH0.s86re0aTzRBhiWRLNRl6w0ok9SMNmO6bLm0HDsbzbWE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
