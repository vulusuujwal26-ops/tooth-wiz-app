-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule the reminder processing function to run every 15 minutes
SELECT cron.schedule(
  'process-appointment-reminders',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://dyvneeqghjzbidlszait.supabase.co/functions/v1/process-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dm5lZXFnaGp6YmlkbHN6YWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxODY2MDMsImV4cCI6MjA3NTc2MjYwM30.ovgxhrQCgVHfJ0i7Kt5AKG9N93x0WyLEv_vUDVNya4w"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);